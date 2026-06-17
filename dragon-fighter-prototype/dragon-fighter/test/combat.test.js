import test from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from '../src/config.js';
import { chooseResult } from '../src/combat/matchRules.js';
import { createInitialGameState, regenEnergy, updateActorEffects } from '../src/core/gameState.js';
import { validateSpellCast, applyCast } from '../src/combat/casting.js';
import { applyDamage, applyShield, applyHeal, applySlow, updateEffectDurations } from '../src/combat/damageResolver.js';
import { isSpellReady, startSpellCooldown, updateSpellCooldowns } from '../src/combat/cooldowns.js';

function activeState() {
  const state = createInitialGameState(CONFIG);
  state.phase = CONFIG.match.activePhase;
  return state;
}

test('result rules handle win, lose, draw, and timer resolution', () => {
  const winState = activeState();
  winState.sides[CONFIG.match.aiId].hp = CONFIG.match.minHp;
  assert.equal(chooseResult(winState).label, CONFIG.match.winLabel);

  const loseState = activeState();
  loseState.sides[CONFIG.match.playerId].hp = CONFIG.match.minHp;
  assert.equal(chooseResult(loseState).label, CONFIG.match.loseLabel);

  const drawState = activeState();
  drawState.sides[CONFIG.match.playerId].hp = CONFIG.match.minHp;
  drawState.sides[CONFIG.match.aiId].hp = CONFIG.match.minHp;
  assert.equal(chooseResult(drawState).label, CONFIG.match.drawLabel);

  const timerDrawState = activeState();
  timerDrawState.matchRemaining = CONFIG.match.minHp;
  timerDrawState.sides[CONFIG.match.playerId].hp = CONFIG.match.startingHp;
  timerDrawState.sides[CONFIG.match.aiId].hp = CONFIG.match.startingHp - 10;
  assert.equal(chooseResult(timerDrawState).label, CONFIG.match.drawLabel);
});

// ============ Spell combat tests (Milestone 1) ============

test('energy regenerates each frame and clamps to max', () => {
  const state = activeState();
  const actor = state.sides[CONFIG.match.playerId];
  
  // Drain energy to minimum
  actor.energy = CONFIG.match.minEnergy;
  
  // Regen for 1 second
  regenEnergy(actor, 1.0, CONFIG);
  const regenAmount = CONFIG.match.energyRegenPerSecond;
  assert.equal(actor.energy, CONFIG.match.minEnergy + regenAmount);
  
  // Regen until maxed
  actor.energy = CONFIG.match.maxEnergy - 0.5;
  regenEnergy(actor, 1.0, CONFIG);
  assert.equal(actor.energy, CONFIG.match.maxEnergy);
});

test('energy regen works with zero delta (no crash)', () => {
  const state = activeState();
  const actor = state.sides[CONFIG.match.playerId];
  const energyBefore = actor.energy;
  regenEnergy(actor, 0, CONFIG);
  assert.equal(actor.energy, energyBefore);
});

test('spell cooldown ready check works', () => {
  const spell = { cooldownRemaining: 0 };
  assert.equal(isSpellReady(spell, CONFIG), true);
  
  spell.cooldownRemaining = 0.5;
  assert.equal(isSpellReady(spell, CONFIG), false);
});

test('spell cooldown starts and respects multiplier', () => {
  const spell = {};
  
  // Voice cast: 1.0x multiplier
  startSpellCooldown(spell, 2, CONFIG.spellCasting.voiceCooldownMultiplier, CONFIG);
  assert.equal(spell.cooldownRemaining, 2.0);
  
  // Button cast: 1.5x multiplier
  startSpellCooldown(spell, 2, CONFIG.spellCasting.buttonCooldownMultiplier, CONFIG);
  assert.equal(spell.cooldownRemaining, 3.0);
});

test('spell cooldowns tick down each frame', () => {
  const state = activeState();
  const actor = state.sides[CONFIG.match.playerId];
  
  // Set up a spell with cooldown
  actor.spellLoadout[0].cooldownRemaining = 2;
  
  // Tick down 0.5 seconds
  updateSpellCooldowns(actor, 0.5, CONFIG);
  assert.equal(actor.spellLoadout[0].cooldownRemaining, 1.5);
  
  // Tick down past zero (should clamp)
  updateSpellCooldowns(actor, 2, CONFIG);
  assert.equal(actor.spellLoadout[0].cooldownRemaining, CONFIG.match.minHp);
});

test('damage with no shield applies full damage to HP', () => {
  const target = { hp: CONFIG.match.startingHp, shield: 0 };
  const result = applyDamage(target, 10, 0, CONFIG);
  
  assert.equal(result.damageApplied, 10);
  assert.equal(result.shieldAbsorbed, 0);
  assert.equal(target.hp, CONFIG.match.startingHp - 10);
});

test('shield blocks damage completely', () => {
  const target = { hp: CONFIG.match.startingHp, shield: 20 };
  const result = applyDamage(target, 10, 0, CONFIG);
  
  assert.equal(result.damageApplied, 0);
  assert.equal(result.shieldAbsorbed, 10);
  assert.equal(target.shield, 10);
  assert.equal(target.hp, CONFIG.match.startingHp);
});

test('piercing bypasses shield partially', () => {
  const target = { hp: CONFIG.match.startingHp, shield: 20 };
  // 50% piercing
  const result = applyDamage(target, 10, 0.5, CONFIG);
  
  assert.equal(result.damageApplied, 5);
  assert.equal(result.shieldAbsorbed, 5);
  assert.equal(target.shield, 15);
  assert.equal(target.hp, CONFIG.match.startingHp - 5);
});

test('shield breaks when overwhelmed', () => {
  const target = { hp: CONFIG.match.startingHp, shield: 5 };
  const result = applyDamage(target, 10, 0, CONFIG);
  
  assert.equal(result.damageApplied, 5);
  assert.equal(result.shieldAbsorbed, 5);
  assert.equal(target.shield, 0);
  assert.equal(target.hp, CONFIG.match.startingHp - 5);
});

test('HP is clamped at minimum', () => {
  const target = { hp: 5, shield: 0 };
  applyDamage(target, 100, 0, CONFIG);
  
  assert.equal(target.hp, CONFIG.match.minHp);
});

test('shield is applied and expires', () => {
  const actor = { shield: 0, shieldExpiryTime: 0 };
  const result = applyShield(actor, 25, CONFIG);
  
  assert.equal(result.shieldAdded, 25);
  assert.equal(actor.shield, 25);
  assert.ok(actor.shieldExpiryTime > 0);
});

test('healing restores HP and clamps at max', () => {
  const actor = { hp: 50 };
  const result = applyHeal(actor, 30, CONFIG);
  
  assert.equal(result.healApplied, 30);
  assert.equal(actor.hp, 80);
  
  // Heal beyond max
  const result2 = applyHeal(actor, 100, CONFIG);
  assert.equal(result2.healApplied, CONFIG.match.startingHp - 80);
  assert.equal(actor.hp, CONFIG.match.startingHp);
});

test('slow duration is applied', () => {
  const target = { slowActive: 0 };
  const result = applySlow(target, 3, CONFIG);
  
  assert.equal(result.slowDuration, 3);
  assert.equal(target.slowActive, 3);
});

test('effect durations tick down and expire', () => {
  const actor = {
    shieldExpiryTime: 2,
    shield: 25,
    slowActive: 3,
    utilityBonusActive: 4
  };
  
  updateEffectDurations(actor, 1, CONFIG);
  
  assert.equal(actor.shieldExpiryTime, 1);
  assert.equal(actor.slowActive, 2);
  assert.equal(actor.utilityBonusActive, 3);
  
  // Tick more
  updateEffectDurations(actor, 3, CONFIG);
  
  // All should be at or below 0
  assert.equal(actor.shieldExpiryTime, 0);
  assert.equal(actor.slowActive, 0);
  assert.equal(actor.utilityBonusActive, 0);
  assert.equal(actor.shield, 0); // Shield cleared when expiry hits 0
});

test('spell cast validation checks actor, match phase, energy, cooldown', () => {
  const state = activeState();
  const actor = state.sides[CONFIG.match.playerId];
  const spell = { energyCost: 10, cooldownRemaining: 0 };
  
  // Valid cast
  let result = validateSpellCast(actor, spell, state, CONFIG);
  assert.equal(result.success, true);
  
  // Not enough energy
  actor.energy = 5;
  result = validateSpellCast(actor, spell, state, CONFIG);
  assert.equal(result.success, false);
  assert.equal(result.reason, 'not_enough_energy');
  
  // Cooldown active
  actor.energy = 20;
  spell.cooldownRemaining = 1;
  result = validateSpellCast(actor, spell, state, CONFIG);
  assert.equal(result.success, false);
  assert.equal(result.reason, 'cooldown_active');
  
  // Match inactive
  state.phase = CONFIG.states.preparation;
  spell.cooldownRemaining = 0;
  result = validateSpellCast(actor, spell, state, CONFIG);
  assert.equal(result.success, false);
  assert.equal(result.reason, 'match_inactive');
});

test('spell cast applies effect and deducts resources', () => {
  const state = activeState();
  const actor = state.sides[CONFIG.match.playerId];
  const spell = { name: 'Test Spell', energyCost: 8, baseCooldown: 2, cooldownRemaining: 0 };
  
  const energyBefore = actor.energy;
  const result = applyCast(actor, spell, state, 1.0, CONFIG);
  
  assert.equal(result.success, true);
  assert.equal(result.energySpent, 8);
  assert.equal(actor.energy, energyBefore - 8);
  assert.equal(spell.cooldownRemaining, 2);
});

test('spell cast with button multiplier increases cooldown', () => {
  const state = activeState();
  const actor = state.sides[CONFIG.match.playerId];
  const spell = { name: 'Test Spell', energyCost: 5, baseCooldown: 2, cooldownRemaining: 0 };
  
  applyCast(actor, spell, state, CONFIG.spellCasting.buttonCooldownMultiplier, CONFIG);
  
  // 2 * 1.5 = 3
  assert.equal(spell.cooldownRemaining, 3);
});

test('attack spell cast damages AI, spends energy, starts cooldown, and creates feedback', () => {
  const state = activeState();
  const player = state.sides[CONFIG.match.playerId];
  const ai = state.sides[CONFIG.match.aiId];
  const spell = {
    name: 'Light Slash',
    type: 'Attack',
    weightBand: CONFIG.patterns.lightLabel,
    energyCost: CONFIG.spellCosts.Light,
    baseCooldown: CONFIG.spellCasting.baseCooldownSeconds,
    cooldownRemaining: CONFIG.match.minHp,
    pattern: { piercePercent: CONFIG.match.minHp, hasClosedBonus: false }
  };

  const result = applyCast(player, spell, state, CONFIG.spellCasting.voiceCooldownMultiplier, CONFIG);

  assert.equal(result.success, true);
  assert.equal(ai.hp, CONFIG.match.startingHp - CONFIG.spellEffects.attackDamageByWeight.Light);
  assert.equal(player.energy, CONFIG.match.startingEnergy - CONFIG.spellCosts.Light);
  assert.equal(spell.cooldownRemaining, CONFIG.spellCasting.baseCooldownSeconds);
  assert.match(result.feedbackMessage, /hit/);
  assert.equal(state.projectileEffects.length, 1);
  assert.equal(state.hitEffects.length, 1);
});

test('defense, support, control, and utility spell effects update actors', () => {
  const state = activeState();
  const player = state.sides[CONFIG.match.playerId];
  const ai = state.sides[CONFIG.match.aiId];
  player.hp = CONFIG.match.startingHp - 20;

  const common = {
    weightBand: CONFIG.patterns.lightLabel,
    energyCost: CONFIG.match.minEnergy,
    baseCooldown: CONFIG.spellCasting.baseCooldownSeconds,
    cooldownRemaining: CONFIG.match.minHp,
    pattern: { piercePercent: CONFIG.match.minHp, hasClosedBonus: false }
  };

  applyCast(player, { ...common, name: 'Fire Guard', type: 'Defense' }, state, CONFIG.spellCasting.voiceCooldownMultiplier, CONFIG);
  assert.equal(player.shield, CONFIG.spellEffects.defenseShieldByWeight.Light);

  applyCast(player, { ...common, name: 'Water Heal', type: 'Support' }, state, CONFIG.spellCasting.voiceCooldownMultiplier, CONFIG);
  assert.equal(player.hp, CONFIG.match.startingHp - 20 + CONFIG.spellEffects.supportHealByWeight.Light);

  applyCast(player, { ...common, name: 'Earth Snare', type: 'Control' }, state, CONFIG.spellCasting.voiceCooldownMultiplier, CONFIG);
  assert.equal(ai.slowActive, CONFIG.spellEffects.controlSlowSecondsByWeight.Light);

  applyCast(player, { ...common, name: 'Wind Dash', type: 'Utility' }, state, CONFIG.spellCasting.voiceCooldownMultiplier, CONFIG);
  assert.equal(player.utilityBonusActive, CONFIG.spellEffects.utilityBonusSecondsByWeight.Light);
});

test('slow effect extends caster cooldown through config multiplier', () => {
  const state = activeState();
  const player = state.sides[CONFIG.match.playerId];
  player.slowActive = 1;
  const spell = {
    name: 'Light Slash',
    type: 'Attack',
    weightBand: CONFIG.patterns.lightLabel,
    energyCost: CONFIG.spellCosts.Light,
    baseCooldown: CONFIG.spellCasting.baseCooldownSeconds,
    cooldownRemaining: CONFIG.match.minHp,
    pattern: { piercePercent: CONFIG.match.minHp, hasClosedBonus: false }
  };

  applyCast(player, spell, state, CONFIG.spellCasting.voiceCooldownMultiplier, CONFIG);

  assert.equal(spell.cooldownRemaining, CONFIG.spellCasting.baseCooldownSeconds * CONFIG.spellCasting.slowCooldownMultiplier);
});

test('utility bonus increases energy regen and expires through actor effects', () => {
  const state = activeState();
  const player = state.sides[CONFIG.match.playerId];
  player.energy = CONFIG.match.minEnergy;
  player.utilityBonusActive = 2;

  regenEnergy(player, 1, CONFIG);
  assert.equal(player.energy, CONFIG.match.energyRegenPerSecond + CONFIG.shieldAndDamage.utilityBonusRegenPerSecond);

  updateActorEffects(player, 2, CONFIG);
  assert.equal(player.utilityBonusActive, CONFIG.match.minHp);
});
