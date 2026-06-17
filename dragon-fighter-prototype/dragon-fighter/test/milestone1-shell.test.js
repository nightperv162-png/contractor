import test from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from '../src/config.js';
import { createInitialGameState } from '../src/core/gameState.js';
import { showMatchPreview, showPreparation, startMatchCountdown, transitionTo } from '../src/core/stateMachine.js';
import { getPreparationRects, getPreparationSpellSlotRects, getSpellButtonRects } from '../src/ui/layout.js';

test('Milestone 1 config exposes preparation, match preview, and five spell placeholders', () => {
  assert.equal(CONFIG.states.preparation, 'preparation');
  assert.equal(CONFIG.states.matchPreview, 'match-preview');
  assert.equal(CONFIG.spells.perLoadout, 5);
  assert.deepEqual(CONFIG.spells.types, ['Attack', 'Defense', 'Support', 'Control', 'Utility']);
  assert.equal(CONFIG.match.startingEnergy, 20);
  assert.equal(CONFIG.match.maxEnergy, 30);
});

test('initial game state starts in preparation with five player and AI spell slots', () => {
  const state = createInitialGameState(CONFIG);
  assert.equal(state.phase, CONFIG.states.preparation);
  assert.equal(state.preparation.selectedSpellType, CONFIG.spells.types[CONFIG.match.minHp]);
  assert.equal(state.sides[CONFIG.match.playerId].energy, CONFIG.match.startingEnergy);
  assert.equal(state.sides[CONFIG.match.aiId].energy, CONFIG.match.startingEnergy);
  assert.equal(state.sides[CONFIG.match.playerId].spellLoadout.length, CONFIG.spells.perLoadout);
  assert.equal(state.sides[CONFIG.match.aiId].spellLoadout.length, CONFIG.spells.perLoadout);
});

test('state machine switches between preparation and static match preview', () => {
  const state = createInitialGameState(CONFIG);
  assert.equal(showMatchPreview(state, null, CONFIG), true);
  assert.equal(state.previousPhase, CONFIG.states.preparation);
  assert.equal(state.phase, CONFIG.states.matchPreview);

  assert.equal(showPreparation(state, null, CONFIG), true);
  assert.equal(state.previousPhase, CONFIG.states.matchPreview);
  assert.equal(state.phase, CONFIG.states.preparation);

  assert.equal(transitionTo(state, 'not-a-state', null, CONFIG), false);
  assert.equal(state.phase, CONFIG.states.preparation);
});

test('state machine starts playable match through countdown', () => {
  const state = createInitialGameState(CONFIG);
  assert.equal(startMatchCountdown(state, null, CONFIG), true);
  assert.equal(state.previousPhase, CONFIG.states.preparation);
  assert.equal(state.phase, CONFIG.match.countdownPhase);
  assert.equal(state.countdownRemaining, CONFIG.match.countdownSeconds);
  assert.equal(state.matchRemaining, CONFIG.match.durationSeconds);
});

test('layout helpers expose Canvas button regions for preparation and match previews', () => {
  const prepRects = getPreparationRects(CONFIG);
  assert.equal(prepRects.eggDrawing.width, CONFIG.layout.eggDrawingWidth);
  assert.equal(prepRects.confirmLoadoutButton.width, CONFIG.layout.prepButtonWidth);
  assert.equal(prepRects.nameField.width, CONFIG.layout.spellNameFieldWidth);
  assert.equal(prepRects.nameField.height, CONFIG.layout.spellNameFieldHeight);
  assert.equal(prepRects.cycleNameButton.width, CONFIG.layout.cycleNameButtonWidth);
  assert.equal(prepRects.cycleNameButton.y, prepRects.nameField.y);
  assert.equal(prepRects.deleteSpellButton.width, CONFIG.layout.deleteSpellButtonWidth);
  assert.equal(prepRects.effectPreviewPanel.height, CONFIG.layout.effectPreviewPanelHeight);
  assert.equal(prepRects.effectPreviewPanel.y > prepRects.nameField.y + prepRects.nameField.height, true);
  const prepSpellSlots = getPreparationSpellSlotRects(CONFIG);
  assert.equal(prepSpellSlots.length, CONFIG.spells.perLoadout);
  assert.equal(prepSpellSlots[CONFIG.match.minHp].kind, 'preparation-spell-slot');

  const spellButtons = getSpellButtonRects(CONFIG);
  assert.equal(spellButtons.length, CONFIG.spells.perLoadout);
  assert.equal(spellButtons[CONFIG.match.minHp].kind, 'prepared-spell');
});
