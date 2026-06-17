import { CONFIG } from '../config.js';
import { normalizeSpellName } from './spellFactory.js';

function levenshteinDistance(left, right) {
  const rows = left.length + 1;
  const columns = right.length + 1;
  const distances = Array.from({ length: rows }, () => Array(columns).fill(0));

  for (let row = 0; row < rows; row += 1) distances[row][0] = row;
  for (let column = 0; column < columns; column += 1) distances[0][column] = column;

  for (let row = 1; row < rows; row += 1) {
    for (let column = 1; column < columns; column += 1) {
      const substitutionCost = left[row - 1] === right[column - 1] ? 0 : 1;
      distances[row][column] = Math.min(
        distances[row - 1][column] + 1,
        distances[row][column - 1] + 1,
        distances[row - 1][column - 1] + substitutionCost
      );
    }
  }

  return distances[left.length][right.length];
}

export function getNameSimilarity(leftName, rightName) {
  const left = normalizeSpellName(leftName).toLowerCase();
  const right = normalizeSpellName(rightName).toLowerCase();
  if (!left && !right) return 1;
  const maxLength = Math.max(left.length, right.length);
  return 1 - levenshteinDistance(left, right) / maxLength;
}

export function validateSpellName(name, existingSpells, config = CONFIG) {
  const normalized = normalizeSpellName(name);
  if (normalized.length < config.spells.minimumNameLength) {
    return { ok: false, reason: config.text.spellNameRejectedFeedback };
  }

  const filledSpells = existingSpells.filter((spell) => spell.filled);
  const exactMatch = filledSpells.some((spell) => normalizeSpellName(spell.name).toLowerCase() === normalized.toLowerCase());
  if (exactMatch) return { ok: false, reason: config.text.spellNameRejectedFeedback };

  const similarMatch = filledSpells.some((spell) => getNameSimilarity(spell.name, normalized) >= config.spells.similarNameThreshold);
  if (similarMatch) return { ok: false, reason: config.text.spellNameRejectedFeedback };

  return { ok: true, reason: config.combat.successReason };
}

export function createEmptySpellSlot(index, config = CONFIG) {
  return {
    id: `empty-contract-${index + config.patterns.firstPointId}`,
    contractId: null,
    dragonName: `Contract Slot ${index + config.patterns.firstPointId}`,
    name: `Contract Slot ${index + config.patterns.firstPointId}`,
    family: config.spells.defaultFamilies[index],
    powerType: config.spells.types[index],
    powerName: config.spells.moveNamesByType[config.spells.types[index]] ?? config.spells.types[index],
    type: config.spells.types[index],
    status: config.spells.placeholderStatus,
    cooldownRemaining: config.match.minHp,
    energyCost: config.match.minEnergy,
    filled: false,
    patternPoints: []
  };
}

export function validateLoadout(spells, config = CONFIG) {
  if (spells.length !== config.spells.perLoadout) return { ok: false, reason: config.text.loadoutBlockedFeedback };
  const filled = spells.every((spell) => spell.filled);
  if (!filled) return { ok: false, reason: config.text.loadoutBlockedFeedback };
  return { ok: true, reason: config.text.loadoutReadyFeedback };
}

export function nextOpenSlotIndex(spells) {
  const index = spells.findIndex((spell) => !spell.filled);
  return index < 0 ? null : index;
}
