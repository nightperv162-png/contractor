import { CONFIG } from '../config.js';
import { applyCast } from '../combat/casting.js';
import { resetGameState } from '../core/gameState.js';
import { showPreparation } from '../core/stateMachine.js';
import { normalizeSpellName } from '../spells/spellFactory.js';
import { addPatternPoint, clearDraftPattern, confirmLoadout, cycleDraftName, deletePreparedSpell, editDraftName, randomizeDraftPattern, saveDraftSpell, selectPreparedSpellSlot, selectSpellType, randomizeSpellType, prepareAllSpells } from '../states/preparationState.js';
import { getEggGridPoints, getPreparationRects } from '../ui/layout.js';

function mapPointerToCanvas(event, canvas, config) {
  const rect = canvas.getBoundingClientRect();
  const clientX = event.clientX ?? event.changedTouches?.[config.match.minHp]?.clientX;
  const clientY = event.clientY ?? event.changedTouches?.[config.match.minHp]?.clientY;
  return {
    x: ((clientX - rect.left) / rect.width) * config.canvas.width,
    y: ((clientY - rect.top) / rect.height) * config.canvas.height
  };
}

function pointInRect(point, rect) {
  return point.x >= rect.x && point.x <= rect.x + rect.width && point.y >= rect.y && point.y <= rect.y + rect.height;
}

function findButtonAtPoint(state, point) {
  return state.uiButtons.find((button) => pointInRect(point, button.rect)) ?? null;
}

function findGridPointAtPoint(point, config) {
  return getEggGridPoints(config).find((gridPoint) => {
    const dx = point.x - gridPoint.x;
    const dy = point.y - gridPoint.y;
    return Math.hypot(dx, dy) <= gridPoint.radius * config.match.sideCount;
  }) ?? null;
}

function getSpeechRecognitionConstructor(windowRef) {
  return windowRef.SpeechRecognition ?? windowRef.webkitSpeechRecognition ?? null;
}

function truncateTranscript(text, config = CONFIG) {
  const value = String(text || '').trim();
  if (value.length <= config.input.maxTranscriptCharacters) return value;
  return `${value.slice(config.match.minHp, config.input.maxTranscriptCharacters)}...`;
}

export function createInputController({ canvas, state, logger, random = Math.random, config = CONFIG, windowRef = window }) {
  const SpeechRecognition = getSpeechRecognitionConstructor(windowRef);
  let recognizer = null;

  function submitSpell(slotIndex, source) {
    const actor = state.sides[config.match.playerId];
    const spell = actor.spellLoadout[slotIndex] ?? null;
    const cooldownMultiplier = source === 'voice' ? config.spellCasting.voiceCooldownMultiplier : config.spellCasting.buttonCooldownMultiplier;
    const result = applyCast(actor, spell, state, cooldownMultiplier, config);
    actor.latestCommand = result.success ? result.feedbackMessage : result.reason;
    actor.latestReason = result.success ? config.combat.successReason : result.reason;
    actor.actionLabel = result.success ? spell.name : result.reason;
    actor.actionLabelSeconds = config.combat.failedFeedbackSeconds;
    actor.failedLabelSeconds = result.success ? config.match.minHp : config.combat.failedFeedbackSeconds;
    actor.latestFeedback = result.success ? result.feedbackMessage : result.reason;
    actor.latestFeedbackTime = config.animation.hitTextSeconds;
    logger?.info('Spell input received', { source, slotIndex, spell: spell?.name, result });
    return result;
  }

  function submitVoiceSpell(transcript) {
    const actor = state.sides[config.match.playerId];
    if (state.voiceLockoutRemaining > config.match.minHp) {
      actor.latestCommand = config.combat.voiceLockoutReason;
      actor.latestReason = config.combat.voiceLockoutReason;
      actor.actionLabel = actor.latestReason;
      actor.failedLabelSeconds = config.combat.failedFeedbackSeconds;
      logger?.warn('Voice spell blocked by global lockout', { transcript, remaining: state.voiceLockoutRemaining });
      return { success: false, reason: config.combat.voiceLockoutReason };
    }
    if (state.voiceRetryRemaining > config.match.minHp) {
      actor.latestCommand = config.combat.voiceRetryReason;
      actor.latestReason = config.combat.voiceRetryReason;
      actor.actionLabel = actor.latestReason;
      actor.failedLabelSeconds = config.combat.failedFeedbackSeconds;
      logger?.warn('Voice spell blocked by retry delay', { transcript, remaining: state.voiceRetryRemaining });
      return { success: false, reason: config.combat.voiceRetryReason };
    }

    const heardName = normalizeSpellName(transcript).toLowerCase();
    const slotIndex = actor.spellLoadout.findIndex((spell) => normalizeSpellName(spell.name).toLowerCase() === heardName);
    if (slotIndex < config.match.minHp) {
      actor.latestCommand = config.combat.unknownCommandReason;
      actor.latestReason = config.combat.unknownCommandReason;
      actor.actionLabel = config.combat.unknownCommandReason;
      actor.failedLabelSeconds = config.combat.failedFeedbackSeconds;
      state.voiceRetryRemaining = config.spellCasting.voiceRetryDelaySeconds;
      logger?.warn('Voice spell not found', { transcript });
      return { success: false, reason: config.combat.unknownCommandReason };
    }
    const result = submitSpell(slotIndex, 'voice');
    if (result.success) state.voiceLockoutRemaining = config.spellCasting.voiceGlobalLockoutSeconds;
    else state.voiceRetryRemaining = config.spellCasting.voiceRetryDelaySeconds;
    return result;
  }

  function restartMatch(source) {
    resetGameState(state, config);
    logger?.info('Match restarted', { source });
  }

  function startVoiceRecognition() {
    if (!config.input.voiceEnabled || !SpeechRecognition) {
      state.voiceStatus = config.input.voiceUnavailableText;
      logger?.warn('Voice recognition unavailable');
      return;
    }

    if (!recognizer) {
      recognizer = new SpeechRecognition();
      recognizer.lang = config.input.speechLanguage;
      recognizer.continuous = false;
      recognizer.interimResults = false;
      recognizer.onstart = () => {
        state.voiceListening = true;
        state.voiceStatus = config.input.voiceListeningText;
        logger?.info('Voice recognition started');
      };
      recognizer.onend = () => {
        state.voiceListening = false;
        if (state.voiceStatus === config.input.voiceListeningText) state.voiceStatus = config.input.voiceReadyText;
        logger?.info('Voice recognition ended');
      };
      recognizer.onerror = (event) => {
        state.voiceListening = false;
        state.voiceStatus = `${config.input.voiceUnavailableText}: ${event.error}`;
        logger?.warn('Voice recognition error', event.error);
      };
      recognizer.onresult = (event) => {
        const transcript = event.results?.[config.match.minHp]?.[config.match.minHp]?.transcript ?? '';
        const clipped = truncateTranscript(transcript, config);
        state.voiceStatus = `Heard: ${clipped}`;
        submitVoiceSpell(transcript);
      };
    }

    try {
      recognizer.start();
    } catch (error) {
      state.voiceStatus = config.input.voiceUnavailableText;
      logger?.warn('Voice recognition could not start', error.message);
    }
  }

  function handleCanvasPointer(event) {
    event.preventDefault();
    const point = mapPointerToCanvas(event, canvas, config);
    const prepRects = getPreparationRects(config);
    if (state.phase === config.states.preparation) {
      state.preparation.nameFieldFocused = pointInRect(point, prepRects.nameField);
      const gridPoint = findGridPointAtPoint(point, config);
      if (gridPoint) {
        addPatternPoint(state, gridPoint.id, logger, config);
        return;
      }
    }

    const button = findButtonAtPoint(state, point);
    if (!button) return;

    if (button.kind === 'spell-type') {
      selectSpellType(state, button.spellType, logger, config);
      return;
    }

    if (button.kind === 'random-spell-type') {
      randomizeSpellType(state, random, logger, config);
      return;
    }

    if (button.kind === 'random-pattern') {
      randomizeDraftPattern(state, random, logger, config);
      return;
    }

    if (button.kind === 'clear-pattern') {
      clearDraftPattern(state, logger, config);
      return;
    }

    if (button.kind === 'cycle-name') {
      cycleDraftName(state, logger, config);
      return;
    }

    if (button.kind === 'save-spell') {
      saveDraftSpell(state, logger, config);
      return;
    }

    if (button.kind === 'delete-spell') {
      deletePreparedSpell(state, logger, config);
      return;
    }

    if (button.kind === 'prepare-all-spells') {
      prepareAllSpells(state, logger, config);
      return;
    }

    if (button.kind === 'preparation-spell-slot') {
      selectPreparedSpellSlot(state, button.spellIndex, logger, config);
      return;
    }

    if (button.kind === 'prepared-spell') {
      submitSpell(button.spellIndex, 'canvas-button');
      return;
    }

    if (button.kind === 'voice') {
      startVoiceRecognition();
      return;
    }

    if (button.kind === 'restart') {
      restartMatch('canvas-button');
      return;
    }

    if (button.kind === 'preview-match') {
      confirmLoadout(state, logger, config);
      return;
    }

    if (button.kind === 'back-to-forge') {
      showPreparation(state, logger, config);
    }
  }

  function handleKeyboard(event) {
    if (state.phase === config.states.preparation && state.preparation.nameFieldFocused) {
      editDraftName(state, event.key, logger, config);
      event.preventDefault();
      return;
    }

    const key = String(event.key).toLowerCase();
    const slotIndex = Number.parseInt(key, 10) - config.patterns.firstPointId;
    if (Number.isInteger(slotIndex) && slotIndex >= config.match.minHp && slotIndex < config.spells.perLoadout) {
      event.preventDefault();
      submitSpell(slotIndex, 'keyboard');
      return;
    }

    if (key === config.input.restartKey) {
      event.preventDefault();
      restartMatch('keyboard');
      return;
    }

    if (key === config.input.voiceKey) {
      event.preventDefault();
      startVoiceRecognition();
      return;
    }
  }

  return {
    attach() {
      canvas.addEventListener('pointerdown', handleCanvasPointer);
      canvas.addEventListener('touchstart', handleCanvasPointer, { passive: false });
      windowRef.addEventListener('keydown', handleKeyboard);
      state.voiceStatus = SpeechRecognition ? config.input.voiceReadyText : config.input.voiceUnavailableText;
      logger?.info('Input handlers attached');
    },
    detach() {
      canvas.removeEventListener('pointerdown', handleCanvasPointer);
      canvas.removeEventListener('touchstart', handleCanvasPointer);
      windowRef.removeEventListener('keydown', handleKeyboard);
      logger?.info('Input handlers detached');
    },
    submitSpell,
    submitVoiceSpell,
    startVoiceRecognition,
    restartMatch
  };
}
