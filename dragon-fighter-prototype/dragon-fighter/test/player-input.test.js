import test from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from '../src/config.js';
import { createInitialGameState } from '../src/core/gameState.js';
import { createInputController } from '../src/input/inputController.js';
import { updateMatchState } from '../src/states/matchState.js';

function activeInput() {
  const state = createInitialGameState(CONFIG);
  state.phase = CONFIG.match.activePhase;
  const input = createInputController({
    canvas: { addEventListener() {}, removeEventListener() {} },
    state,
    logger: null,
    windowRef: { addEventListener() {}, removeEventListener() {} },
    config: CONFIG
  });
  return { state, input };
}

test('voice dragon names map to contracts and enforce retry and lockout timers', () => {
  const { state, input } = activeInput();
  const player = state.sides[CONFIG.match.playerId];
  const ai = state.sides[CONFIG.match.aiId];

  const unknown = input.submitVoiceSpell('Not A Dragon');
  assert.equal(unknown.success, false);
  assert.equal(unknown.reason, CONFIG.combat.unknownCommandReason);
  assert.equal(state.voiceRetryRemaining, CONFIG.spellCasting.voiceRetryDelaySeconds);

  const blockedRetry = input.submitVoiceSpell('Ignivar');
  assert.equal(blockedRetry.success, false);
  assert.equal(blockedRetry.reason, CONFIG.combat.voiceRetryReason);

  updateMatchState(state, CONFIG.spellCasting.voiceRetryDelaySeconds, () => CONFIG.match.minHp, null, CONFIG);
  const success = input.submitVoiceSpell('Ignivar');
  assert.equal(success.success, true);
  assert.equal(ai.hp < CONFIG.match.startingHp, true);
  assert.equal(player.latestCommand, 'Ignivar');
  assert.equal(state.voiceLockoutRemaining, CONFIG.spellCasting.voiceGlobalLockoutSeconds);

  const blockedLockout = input.submitVoiceSpell('Ignivar');
  assert.equal(blockedLockout.success, false);
  assert.equal(blockedLockout.reason, CONFIG.combat.voiceLockoutReason);
});
