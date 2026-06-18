import test from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from '../src/config.js';
import { createInitialGameState } from '../src/core/gameState.js';
import { createLayout } from '../src/ui/layout.js';

test('config exposes the required Milestone 1 command words', () => {
  assert.deepEqual(CONFIG.input.validCommands, ['Attack', 'Defence', 'Block', 'Skill']);
});

test('initial state starts both dragons idle with full HP', () => {
  const state = createInitialGameState(CONFIG);

  assert.equal(state.phase, CONFIG.match.initialPhase);
  assert.equal(state.players.player1.hp, CONFIG.match.startingHp);
  assert.equal(state.players.player2.hp, CONFIG.match.startingHp);
  assert.equal(state.players.player1.stateLabel, CONFIG.labels.idleState);
  assert.equal(state.players.player2.stateLabel, CONFIG.labels.idleState);
});

test('initial latest command labels are empty placeholders', () => {
  const state = createInitialGameState(CONFIG);

  assert.equal(state.latestPlayerCommand, CONFIG.labels.noPlayerCommand);
  assert.equal(state.latestAiCommand, CONFIG.labels.noAiCommand);
});

test('layout places HUD in required screen regions', () => {
  const layout = createLayout(CONFIG);

  assert.equal(layout.player1PanelRect.x, CONFIG.layout.safeAreaPadding);
  assert.equal(layout.player1PanelRect.y, CONFIG.layout.safeAreaPadding);
  assert.equal(layout.player2PanelRect.x, CONFIG.canvas.width - CONFIG.layout.safeAreaPadding - CONFIG.layout.statusPanelWidth);
  assert.equal(layout.player2PanelRect.y, CONFIG.layout.safeAreaPadding);
  assert.equal(layout.timerRect.x, CONFIG.canvas.width * CONFIG.math.half - CONFIG.layout.timerPanelWidth * CONFIG.math.half);
  assert.equal(layout.commandReferenceRect.x, CONFIG.canvas.width * CONFIG.math.half - CONFIG.layout.commandReferenceWidth * CONFIG.math.half);
});

test('layout creates a behind-right Player 1 arena composition', () => {
  const layout = createLayout(CONFIG);

  assert.ok(layout.player1Position.x > layout.player2Position.x);
  assert.ok(layout.player1Position.y > layout.player2Position.y);
  assert.ok(layout.player1DragonPosition.y > layout.player2DragonPosition.y);
  assert.ok(layout.player1DragonPosition.x > layout.player2Position.x);
});
