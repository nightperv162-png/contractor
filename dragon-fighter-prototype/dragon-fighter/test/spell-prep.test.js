import test from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from '../src/config.js';
import { createInitialGameState } from '../src/core/gameState.js';
import { createInputController } from '../src/input/inputController.js';
import { analyzePattern, generateRandomPattern, getPiercePercent, getWeightBand } from '../src/spells/patternAnalyzer.js';
import { createSpell } from '../src/spells/spellFactory.js';
import { getNameSimilarity, validateLoadout, validateSpellName } from '../src/spells/spellLoadout.js';
import { getSpellEffectPreview } from '../src/spells/spellRules.js';
import { addPatternPoint, confirmLoadout, randomizeDraftPattern, saveDraftSpell, selectSpellType, setDraftName } from '../src/states/preparationState.js';

test('pattern analysis counts connections, weight bands, cost, secondary effect, and pierce', () => {
  assert.equal(getWeightBand(1, CONFIG), CONFIG.patterns.lightLabel);
  assert.equal(getWeightBand(3, CONFIG), CONFIG.patterns.standardLabel);
  assert.equal(getWeightBand(5, CONFIG), CONFIG.patterns.heavyLabel);
  assert.equal(getWeightBand(7, CONFIG), CONFIG.patterns.grandLabel);
  assert.equal(getPiercePercent(0, CONFIG), CONFIG.match.minHp);
  assert.equal(getPiercePercent(2, CONFIG), CONFIG.patterns.lowPiercePercent);
  assert.equal(getPiercePercent(4, CONFIG), CONFIG.patterns.highPiercePercent);

  const analysis = analyzePattern([1, 2, 5, 8, 9], CONFIG);
  assert.equal(analysis.connectionCount, 4);
  assert.equal(analysis.weightBand, CONFIG.patterns.standardLabel);
  assert.equal(analysis.energyCost, CONFIG.spellCosts.Standard);
  assert.equal(analysis.hasSecondaryEffect, true);
});

test('crossed and closed patterns expose penalties, bonuses, and instability', () => {
  const crossed = analyzePattern([1, 9, 3, 7], CONFIG);
  assert.equal(crossed.crossedLineCount, 1);
  assert.equal(crossed.unstable, true);
  assert.equal(crossed.misfireChance, CONFIG.patterns.unstableMisfireChance);
  assert.equal(crossed.energyCost, CONFIG.spellCosts.Standard + CONFIG.patterns.crossedLineEnergyPenalty);

  const closed = analyzePattern([1, 2, 5, 1], CONFIG);
  assert.equal(closed.hasClosedBonus, true);
  assert.match(getSpellEffectPreview('Attack', closed, CONFIG), /damage/);
});

test('spell creation derives type preview and energy cost from pattern analysis', () => {
  const spell = createSpell({ name: 'Long Fire', type: 'Attack', patternPoints: [1, 2, 3] }, CONFIG);
  assert.equal(spell.name, 'Long Fire');
  assert.equal(spell.type, 'Attack');
  assert.equal(spell.weightBand, CONFIG.patterns.lightLabel);
  assert.equal(spell.energyCost, CONFIG.spellCosts.Light);
  assert.match(spell.effectPreview, /damage/);
});

test('loadout validation rejects duplicate and too-similar spell names', () => {
  const existing = [
    { name: 'Long Fire', filled: true },
    { name: 'Son Guard', filled: true }
  ];
  assert.equal(validateSpellName('Long Fire', existing, CONFIG).ok, false);
  assert.equal(getNameSimilarity('Long Fire', 'Long Fyre') >= CONFIG.spells.similarNameThreshold, true);
  assert.equal(validateSpellName('Long Fyre', existing, CONFIG).ok, false);
  assert.equal(validateSpellName('Thuy Heal', existing, CONFIG).ok, true);
});

test('preparation flow draws, randomizes, saves five spells, and confirms loadout', () => {
  const state = createInitialGameState(CONFIG);
  addPatternPoint(state, 1, null, CONFIG);
  addPatternPoint(state, 2, null, CONFIG);
  assert.equal(state.preparation.draftAnalysis.connectionCount, 1);

  randomizeDraftPattern(state, () => 0.2, null, CONFIG);
  assert.equal(state.preparation.draftAnalysis.connectionCount >= CONFIG.patterns.randomMinConnections, true);
  assert.equal(state.preparation.draftAnalysis.connectionCount <= CONFIG.patterns.randomMaxConnections, true);

  CONFIG.spells.types.forEach((type, index) => {
    selectSpellType(state, type, null, CONFIG);
    setDraftName(state, CONFIG.spells.nameCycle[index], null, CONFIG);
    state.preparation.draftPatternPoints = generateRandomPattern(() => 0.31 + index * 0.01, CONFIG);
    const result = saveDraftSpell(state, null, CONFIG);
    assert.equal(result.ok, true);
  });

  assert.equal(validateLoadout(state.sides[CONFIG.match.playerId].spellLoadout, CONFIG).ok, true);
  assert.equal(confirmLoadout(state, null, CONFIG).ok, true);
  assert.equal(state.phase, CONFIG.states.matchPreview);
});

test('spell name editing is separate from basic action shortcuts', () => {
  const state = createInitialGameState(CONFIG);
  const handlers = {};
  const fakeCanvas = {
    addEventListener() {},
    removeEventListener() {}
  };
  const fakeWindow = {
    addEventListener(type, handler) {
      handlers[type] = handler;
    },
    removeEventListener() {}
  };

  const input = createInputController({ canvas: fakeCanvas, state, logger: null, config: CONFIG, windowRef: fakeWindow });
  input.attach();
  state.preparation.nameFieldFocused = true;
  state.preparation.draftSpellName = '';
  let prevented = false;
  handlers.keydown({
    key: CONFIG.actions.attack.key,
    preventDefault() {
      prevented = true;
    }
  });

  assert.equal(prevented, true);
  assert.equal(state.preparation.draftSpellName, CONFIG.actions.attack.key);
  assert.equal(state.sides[CONFIG.match.playerId].latestReason, '');
});
