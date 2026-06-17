import test from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from '../src/config.js';
import { chooseAiSpellIndex, updateAi } from '../src/ai/aiController.js';
import { createInitialGameState, resetGameState } from '../src/core/gameState.js';
import { updateMatchState } from '../src/states/matchState.js';

function activeState() {
  const state = createInitialGameState(CONFIG);
  state.phase = CONFIG.match.activePhase;
  state.countdownRemaining = CONFIG.match.minHp;
  return state;
}

test('countdown transitions to active phase and displays fight banner', () => {
  const state = createInitialGameState(CONFIG);
  state.phase = CONFIG.match.countdownPhase;
  updateMatchState(state, CONFIG.match.countdownSeconds, () => CONFIG.match.minHp, null, CONFIG);
  assert.equal(state.phase, CONFIG.match.activePhase);
  assert.equal(state.fightBannerRemaining, CONFIG.match.fightBannerSeconds);
});

test('AI chooses a ready affordable prepared spell', () => {
  const state = activeState();
  state.sides[CONFIG.match.aiId].spellLoadout.forEach((spell) => {
    spell.filled = true;
    spell.energyCost = CONFIG.match.minEnergy;
  });
  const spellIndex = chooseAiSpellIndex(state, () => CONFIG.match.minHp, CONFIG);
  assert.equal(spellIndex, CONFIG.match.minHp);
});

test('AI cannot act after defeat', () => {
  const state = activeState();
  state.sides[CONFIG.match.aiId].defeated = true;
  const spellIndex = chooseAiSpellIndex(state, () => CONFIG.match.minHp, CONFIG);
  assert.equal(spellIndex, null);
  const result = updateAi(state, CONFIG.ai.actionIntervalSeconds, () => CONFIG.match.minHp, null, CONFIG);
  assert.equal(result, null);
});

test('match timer ending chooses result phase', () => {
  const state = activeState();
  state.matchRemaining = CONFIG.match.minHp;
  state.sides[CONFIG.match.playerId].hp = CONFIG.match.startingHp;
  state.sides[CONFIG.match.aiId].hp = CONFIG.match.startingHp - 10;
  updateMatchState(state, CONFIG.match.minHp, () => CONFIG.match.minHp, null, CONFIG);
  assert.equal(state.phase, CONFIG.match.resultPhase);
  assert.equal(state.result, CONFIG.match.drawLabel);
});

test('active match loop leaves AI as a stationary dummy in milestone 2', () => {
  const state = activeState();
  const ai = state.sides[CONFIG.match.aiId];
  ai.spellLoadout.forEach((spell) => {
    spell.filled = true;
    spell.energyCost = CONFIG.match.minEnergy;
  });

  updateMatchState(state, CONFIG.ai.actionIntervalSeconds, () => CONFIG.match.minHp, null, CONFIG);

  assert.equal(ai.latestCommand, CONFIG.text.noAiCommand);
  assert.equal(ai.spellLoadout.every((spell) => spell.cooldownRemaining === CONFIG.match.minHp), true);
});

test('active match regenerates one energy per second', () => {
  const state = activeState();
  const player = state.sides[CONFIG.match.playerId];
  const ai = state.sides[CONFIG.match.aiId];
  player.energy = CONFIG.match.minEnergy;
  ai.energy = CONFIG.match.minEnergy;

  updateMatchState(state, 1, () => CONFIG.match.minHp, null, CONFIG);

  assert.equal(player.energy, CONFIG.match.energyRegenPerSecond);
  assert.equal(ai.energy, CONFIG.match.energyRegenPerSecond);
});

test('restart reset restores countdown, HP, spell cooldowns, labels, and result state', () => {
  const state = activeState();
  state.result = CONFIG.match.loseLabel;
  state.phase = CONFIG.match.resultPhase;
  state.sides[CONFIG.match.playerId].hp = CONFIG.match.minHp;
  state.sides[CONFIG.match.playerId].spellLoadout[CONFIG.match.minHp].cooldownRemaining = 2;
  resetGameState(state, CONFIG);
  assert.equal(state.phase, CONFIG.states.preparation);
  assert.equal(state.result, null);
  assert.equal(state.sides[CONFIG.match.playerId].hp, CONFIG.match.startingHp);
  assert.equal(state.sides[CONFIG.match.playerId].spellLoadout[CONFIG.match.minHp].cooldownRemaining, CONFIG.match.minHp);
});
