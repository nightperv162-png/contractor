import test from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from '../src/config.js';
import { createInitialGameState } from '../src/core/gameState.js';
import { createInputController } from '../src/input/inputController.js';
import { createSpell } from '../src/spells/spellFactory.js';
import { updateMatchState } from '../src/states/matchState.js';

function activeInput() {
  const state = createInitialGameState(CONFIG);
  state.phase = CONFIG.match.activePhase;
  state.sides[CONFIG.match.playerId].spellLoadout[CONFIG.match.minHp] = createSpell({
    name: 'Light Slash',
    type: 'Attack',
    patternPoints: [1, 2]
  }, CONFIG);
  const input = createInputController({
    canvas: { addEventListener() {}, removeEventListener() {} },
    state,
    logger: null,
    windowRef: { addEventListener() {}, removeEventListener() {} },
    config: CONFIG
  });
  return { state, input };
}

test('voice spell names map to prepared spells and enforce retry and lockout timers', () => {
  const { state, input } = activeInput();
  const player = state.sides[CONFIG.match.playerId];
  const ai = state.sides[CONFIG.match.aiId];

  const unknown = input.submitVoiceSpell('Not A Spell');
  assert.equal(unknown.success, false);
  assert.equal(unknown.reason, CONFIG.combat.unknownCommandReason);
  assert.equal(state.voiceRetryRemaining, CONFIG.spellCasting.voiceRetryDelaySeconds);

  const blockedRetry = input.submitVoiceSpell('Light Slash');
  assert.equal(blockedRetry.success, false);
  assert.equal(blockedRetry.reason, CONFIG.combat.voiceRetryReason);

  updateMatchState(state, CONFIG.spellCasting.voiceRetryDelaySeconds, () => CONFIG.match.minHp, null, CONFIG);
  const success = input.submitVoiceSpell('Light Slash');
  assert.equal(success.success, true);
  assert.equal(ai.hp < CONFIG.match.startingHp, true);
  assert.equal(player.latestCommand, success.feedbackMessage);
  assert.equal(state.voiceLockoutRemaining, CONFIG.spellCasting.voiceGlobalLockoutSeconds);

  const blockedLockout = input.submitVoiceSpell('Light Slash');
  assert.equal(blockedLockout.success, false);
  assert.equal(blockedLockout.reason, CONFIG.combat.voiceLockoutReason);
});
