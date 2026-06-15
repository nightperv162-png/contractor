import { CONFIG } from '../config.js';

function addClosedBonus(baseValue, spellType, analysis, config) {
  if (!analysis.hasClosedBonus) return baseValue;
  if (spellType === 'Attack') return baseValue + config.spellEffects.closedAttackBonusDamage;
  if (spellType === 'Defense') return baseValue + config.spellEffects.closedDefenseBonusShield;
  if (spellType === 'Support') return baseValue + config.spellEffects.closedSupportBonusHeal;
  if (spellType === 'Control') return baseValue + config.spellEffects.closedControlBonusSeconds;
  if (spellType === 'Utility') return baseValue + config.spellEffects.closedUtilityBonusSeconds;
  return baseValue;
}

export function getSpellEffectPreview(spellType, analysis, config = CONFIG) {
  const weight = analysis.weightBand;
  if (spellType === 'Attack') {
    const damage = addClosedBonus(config.spellEffects.attackDamageByWeight[weight], spellType, analysis, config);
    return `Deals ${damage} damage`;
  }
  if (spellType === 'Defense') {
    const shield = addClosedBonus(config.spellEffects.defenseShieldByWeight[weight], spellType, analysis, config);
    return `Shield blocks ${shield} damage`;
  }
  if (spellType === 'Support') {
    const heal = addClosedBonus(config.spellEffects.supportHealByWeight[weight], spellType, analysis, config);
    return `Restores ${heal} HP`;
  }
  if (spellType === 'Control') {
    const seconds = addClosedBonus(config.spellEffects.controlSlowSecondsByWeight[weight], spellType, analysis, config);
    return `Slows for ${seconds}s`;
  }
  if (spellType === 'Utility') {
    const seconds = addClosedBonus(config.spellEffects.utilityBonusSecondsByWeight[weight], spellType, analysis, config);
    return `Boosts energy for ${seconds}s`;
  }
  return config.spells.effectPreviewPlaceholder;
}

export function formatPatternSummary(analysis, config = CONFIG) {
  const pierce = Math.round(analysis.piercePercent * config.patterns.percentMultiplier);
  const secondary = analysis.hasSecondaryEffect ? 'secondary yes' : 'secondary no';
  const closed = analysis.hasClosedBonus ? 'closed bonus yes' : 'closed bonus no';
  const unstable = analysis.unstable ? `unstable ${Math.round(analysis.misfireChance * config.patterns.percentMultiplier)}%` : 'stable';
  return `${analysis.weightBand} | cost ${analysis.energyCost} | pierce ${pierce}% | ${secondary} | ${closed} | ${unstable}`;
}
