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

function formatEffectPreviewStats(analysis, config) {
  const pierce = Math.round(analysis.piercePercent * config.patterns.percentMultiplier);
  const secondary = analysis.hasSecondaryEffect ? 'secondary yes' : 'secondary no';
  const closed = analysis.hasClosedBonus ? 'closed bonus yes' : 'closed bonus no';
  const unstable = analysis.unstable ? `unstable ${Math.round(analysis.misfireChance * config.patterns.percentMultiplier)}%` : 'stable';
  return `${analysis.weightBand} | cost ${analysis.energyCost} | pierce ${pierce}%\n${secondary} | ${closed} | ${unstable}`;
}

export function getSpellEffectPreview(spellType, analysis, config = CONFIG) {
  const weight = analysis.weightBand;
  let effect = config.spells.effectPreviewPlaceholder;
  if (spellType === 'Attack') {
    const damage = addClosedBonus(config.spellEffects.attackDamageByWeight[weight], spellType, analysis, config);
    effect = `Deals ${damage} damage`;
  } else if (spellType === 'Defense') {
    const shield = addClosedBonus(config.spellEffects.defenseShieldByWeight[weight], spellType, analysis, config);
    effect = `Shield blocks ${shield} damage`;
  } else if (spellType === 'Support') {
    const heal = addClosedBonus(config.spellEffects.supportHealByWeight[weight], spellType, analysis, config);
    effect = `Restores ${heal} HP`;
  } else if (spellType === 'Control') {
    const seconds = addClosedBonus(config.spellEffects.controlSlowSecondsByWeight[weight], spellType, analysis, config);
    effect = `Slows for ${seconds}s`;
  } else if (spellType === 'Utility') {
    const seconds = addClosedBonus(config.spellEffects.utilityBonusSecondsByWeight[weight], spellType, analysis, config);
    effect = `Boosts energy for ${seconds}s`;
  }
  return `${effect}\n${formatEffectPreviewStats(analysis, config)}`;
}
