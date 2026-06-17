import { CONFIG } from '../config.js';
import { applyCast } from '../combat/casting.js';

export function chooseAiSpellIndex(state, random = Math.random, config = CONFIG) {
  const ai = state.sides[config.match.aiId];

  if (state.phase !== config.match.activePhase || ai.defeated) return null;

  const readySpells = ai.spellLoadout
    .map((spell, index) => ({ spell, index }))
    .filter(({ spell }) => spell && spell.filled !== false && (spell.cooldownRemaining ?? config.match.minHp) <= config.match.minHp && ai.energy >= (spell.energyCost ?? config.match.minEnergy));

  if (readySpells.length === config.match.minHp) return null;
  return readySpells[Math.floor(random() * readySpells.length)].index;
}

export function updateAi(state, deltaSeconds, random, logger, config = CONFIG) {
  if (state.phase !== config.match.activePhase) return null;
  const ai = state.sides[config.match.aiId];
  if (ai.defeated) return null;

  state.aiActionTimer -= deltaSeconds;
  if (state.aiActionTimer > config.match.minHp) return null;

  state.aiActionTimer = config.ai.actionIntervalSeconds;
  const spellIndex = chooseAiSpellIndex(state, random, config);
  if (spellIndex === null) {
    ai.latestCommand = config.ai.waitingLabel;
    logger?.info('AI skipped spell because no spell was available');
    return null;
  }

  const spell = ai.spellLoadout[spellIndex];
  const result = applyCast(ai, spell, state, config.spellCasting.buttonCooldownMultiplier, config);
  ai.latestCommand = spell.name;
  ai.latestReason = result.success ? config.combat.successReason : result.reason;
  ai.actionLabel = result.success ? spell.name : result.reason;
  ai.actionLabelSeconds = config.combat.failedFeedbackSeconds;
  ai.failedLabelSeconds = result.success ? config.match.minHp : config.combat.failedFeedbackSeconds;
  logger?.info('AI selected spell', { spellIndex, spell: spell.name, result });
  return result;
}
