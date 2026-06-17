import { CONFIG } from '../config.js';
import { startMatchCountdown } from '../core/stateMachine.js';
import { addPointToPattern, analyzePattern, generateRandomPattern } from '../spells/patternAnalyzer.js';
import { createSpell, normalizeSpellName } from '../spells/spellFactory.js';
import { createEmptySpellSlot, nextOpenSlotIndex, validateLoadout, validateSpellName } from '../spells/spellLoadout.js';
import { getSpellEffectPreview } from '../spells/spellRules.js';
import { createSeededRandom } from '../core/random.js';

function moveNames(config) {
  return Object.values(config.spells.moveNamesByType);
}

function elementFromName(name, config) {
  const [element] = normalizeSpellName(name).split(' ');
  return config.spells.elements.includes(element) ? element : config.spells.elements[config.match.minHp];
}

function generatedSpellName(element, spellType, config) {
  return `${element} ${config.spells.moveNamesByType[spellType] ?? config.spells.moveNamesByType.Attack}`;
}

function isGeneratedSpellName(name, config) {
  const [element, move] = normalizeSpellName(name).split(' ');
  const contractNames = config.dragonContracts.definitions.map((contract) => contract.dragonName);
  return contractNames.includes(normalizeSpellName(name)) || (config.spells.elements.includes(element) && moveNames(config).includes(move));
}

export function refreshPreparationPreview(state, logger, config = CONFIG) {
  const analysis = analyzePattern(state.preparation.draftPatternPoints, config);
  state.preparation.draftAnalysis = analysis;
  state.preparation.effectPreview = getSpellEffectPreview(state.preparation.selectedSpellType, analysis, config);
  logger?.info('Pattern analyzed', analysis);
  return analysis;
}

export function addPatternPoint(state, pointId, logger, config = CONFIG) {
  const nextPoints = addPointToPattern(state.preparation.draftPatternPoints, pointId, config);
  state.preparation.draftPatternPoints = nextPoints;
  logger?.info('Pattern point added', { pointId, points: nextPoints });
  return refreshPreparationPreview(state, logger, config);
}

export function clearDraftPattern(state, logger, config = CONFIG) {
  state.preparation.draftPatternPoints = [];
  state.preparation.feedback = config.text.prepReadyFeedback;
  logger?.info('Pattern cleared');
  return refreshPreparationPreview(state, logger, config);
}

export function randomizeDraftPattern(state, random, logger, config = CONFIG) {
  state.preparation.draftPatternPoints = generateRandomPattern(random, config);
  state.preparation.feedback = config.text.prepReadyFeedback;
  logger?.info('Pattern generated', { points: state.preparation.draftPatternPoints });
  return refreshPreparationPreview(state, logger, config);
}

export function selectSpellType(state, spellType, logger, config = CONFIG) {
  if (!config.spells.types.includes(spellType)) return false;
  const contractNames = config.dragonContracts.definitions.map((contract) => contract.dragonName);
  const shouldSyncName = isGeneratedSpellName(state.preparation.draftSpellName, config);
  const element = elementFromName(state.preparation.draftSpellName, config);
  state.preparation.selectedSpellType = spellType;
  if (shouldSyncName && !contractNames.includes(state.preparation.draftSpellName)) state.preparation.draftSpellName = generatedSpellName(element, spellType, config);
  logger?.info('Dragon power selected', { spellType });
  refreshPreparationPreview(state, logger, config);
  return true;
}

export function cycleDraftName(state, logger, config = CONFIG) {
  state.preparation.nameCycleIndex = (state.preparation.nameCycleIndex + config.patterns.firstPointId) % config.dragonContracts.definitions.length;
  state.preparation.draftSpellName = config.dragonContracts.definitions[state.preparation.nameCycleIndex].dragonName;
  state.preparation.feedback = config.text.prepReadyFeedback;
  logger?.info('Dragon name cycled', { name: state.preparation.draftSpellName });
  return state.preparation.draftSpellName;
}

export function setDraftName(state, name, logger, config = CONFIG) {
  state.preparation.draftSpellName = normalizeSpellName(name);
  state.preparation.feedback = config.text.prepReadyFeedback;
  logger?.info('Spell renamed', { name: state.preparation.draftSpellName });
}

export function editDraftName(state, key, logger, config = CONFIG) {
  if (!state.preparation.nameFieldFocused) return false;
  if (key === 'Backspace') {
    setDraftName(state, state.preparation.draftSpellName.slice(config.match.minHp, -config.patterns.firstPointId), logger, config);
    return true;
  }
  if (key === ' ') {
    setDraftName(state, `${state.preparation.draftSpellName} `, logger, config);
    return true;
  }
  if (/^[a-z]$/i.test(key)) {
    setDraftName(state, `${state.preparation.draftSpellName}${key}`, logger, config);
    return true;
  }
  return false;
}

export function saveDraftSpell(state, logger, config = CONFIG) {
  const analysis = refreshPreparationPreview(state, logger, config);
  if (analysis.connectionCount < config.patterns.lightMinConnections) {
    state.preparation.feedback = config.text.patternRejectedFeedback;
    logger?.warn('Contract rejected', { reason: state.preparation.feedback });
    return { ok: false, reason: state.preparation.feedback };
  }

  const validation = validateSpellName(state.preparation.draftSpellName, state.sides[config.match.playerId].spellLoadout, config);
  if (!validation.ok) {
    state.preparation.feedback = validation.reason;
    logger?.warn('Contract rejected', { reason: validation.reason });
    return validation;
  }

  const slotIndex = nextOpenSlotIndex(state.sides[config.match.playerId].spellLoadout);
  if (slotIndex === null) {
    state.preparation.feedback = config.text.loadoutReadyFeedback;
    return { ok: false, reason: state.preparation.feedback };
  }

  const spell = createSpell({
    name: state.preparation.draftSpellName,
    type: state.preparation.selectedSpellType,
    patternPoints: state.preparation.draftPatternPoints
  }, config);
  spell.filled = true;
  state.sides[config.match.playerId].spellLoadout[slotIndex] = spell;
  state.preparation.selectedSlotIndex = Math.min(slotIndex + config.patterns.firstPointId, config.spells.perLoadout - config.patterns.firstPointId);
  state.preparation.feedback = `${config.text.spellSavedFeedback} ${spell.dragonName}`;
  logger?.info('Contract created', { slotIndex, spell });
  return { ok: true, reason: config.combat.successReason, spell, slotIndex };
}

export function selectPreparedSpellSlot(state, slotIndex, logger, config = CONFIG) {
  if (slotIndex < config.match.minHp || slotIndex >= config.spells.perLoadout) return false;
  state.preparation.selectedSlotIndex = slotIndex;
  const spell = state.sides[config.match.playerId].spellLoadout[slotIndex];
  state.preparation.feedback = spell.filled ? `${config.text.spellSelectedFeedback} ${spell.name}` : config.text.prepReadyFeedback;
  logger?.info('Prepared contract slot selected', { slotIndex, dragonName: spell.dragonName ?? spell.name, filled: spell.filled });
  return true;
}

export function deletePreparedSpell(state, logger, config = CONFIG) {
  const slotIndex = state.preparation.selectedSlotIndex;
  if (slotIndex < config.match.minHp || slotIndex >= config.spells.perLoadout) return { ok: false, reason: config.text.loadoutBlockedFeedback };
  const spell = state.sides[config.match.playerId].spellLoadout[slotIndex];
  if (!spell?.filled) {
    state.preparation.feedback = config.text.loadoutBlockedFeedback;
    logger?.warn('Prepared contract delete blocked', { slotIndex, reason: state.preparation.feedback });
    return { ok: false, reason: state.preparation.feedback };
  }

  state.sides[config.match.playerId].spellLoadout[slotIndex] = createEmptySpellSlot(slotIndex, config);
  state.preparation.loadoutConfirmed = false;
  state.preparation.feedback = config.text.spellDeletedFeedback;
  logger?.info('Prepared contract voided', { slotIndex, deletedDragon: spell.dragonName ?? spell.name });
  return { ok: true, reason: config.combat.successReason, slotIndex };
}

export function confirmLoadout(state, logger, config = CONFIG) {
  const validation = validateLoadout(state.sides[config.match.playerId].spellLoadout, config);
  state.preparation.feedback = validation.reason;
  if (!validation.ok) {
    logger?.warn('Loadout confirmation blocked', validation);
    return validation;
  }

  state.preparation.loadoutConfirmed = true;
  logger?.info('Contract loadout confirmed');
  startMatchCountdown(state, logger, config);
  return validation;
}

/**
 * Selects a random spell type from the available types.
 * @param {Object} state - Game state
 * @param {Function} random - Random number generator (0 to 1)
 * @param {Function} logger - Logger instance
 * @param {Object} config - Configuration
 * @returns {string} The selected spell type
 */
export function randomizeSpellType(state, random, logger, config = CONFIG) {
  const randomIndex = Math.floor(random() * config.spells.types.length);
  const spellType = config.spells.types[randomIndex];
  selectSpellType(state, spellType, logger, config);
  logger?.info('Random spell type selected', { spellType, index: randomIndex });
  return spellType;
}

/**
 * Auto-generates and saves all 5 spells with random patterns, types, and names.
 * Used for rapid testing—equivalent to 5x (randomize pattern + random type + cycle name + save).
 * @param {Object} state - Game state
 * @param {Function} logger - Logger instance
 * @param {Object} config - Configuration
 * @returns {Object} { ok: boolean, count: number }
 */
export function prepareAllSpells(state, logger, config = CONFIG) {
  const random = createSeededRandom(config.ai.defaultSeed);
  const loadout = state.sides[config.match.playerId].spellLoadout;
  let savedCount = 0;

  for (let i = 0; i < config.spells.perLoadout; i++) {
    // Reset draft for each spell
    state.preparation.draftPatternPoints = [];

    // Randomize pattern
    randomizeDraftPattern(state, random, logger, config);

    // Pick random spell type
    randomizeSpellType(state, random, logger, config);

    // Cycle name to next one
    cycleDraftName(state, logger, config);

    // Save the spell
    const result = saveDraftSpell(state, logger, config);
    if (result.ok) {
      savedCount++;
      logger?.info(`Auto-contract ${i + 1}/${config.spells.perLoadout} saved`, result.spell);
    } else {
      logger?.warn(`Auto-contract ${i + 1} failed`, { reason: result.reason });
    }
  }

  state.preparation.feedback = `All dragon contracts are ready!`;
  logger?.info('Prepare all contracts complete', { savedCount });
  return { ok: savedCount === config.spells.perLoadout, count: savedCount };
}
