import { CONFIG } from '../config.js';
import { analyzePattern } from './patternAnalyzer.js';
import { getSpellEffectPreview } from './spellRules.js';

export function normalizeSpellName(name) {
  return String(name || '').trim().replace(/\s+/g, ' ');
}

export function createSpell({ name, type, patternPoints }, config = CONFIG) {
  const spellName = normalizeSpellName(name);
  const analysis = analyzePattern(patternPoints, config);
  return {
    id: `spell-${spellName.toLowerCase().replace(/\s+/g, '-')}`,
    contractId: `custom-${spellName.toLowerCase().replace(/\s+/g, '-')}`,
    dragonName: spellName,
    name: spellName,
    family: spellName.split(' ')[config.match.minHp] ?? config.spells.defaultFamilies[config.match.minHp],
    powerType: type,
    powerName: config.spells.moveNamesByType[type] ?? type,
    type,
    patternPoints: [...patternPoints],
    pattern: analysis,
    weightBand: analysis.weightBand,
    energyCost: analysis.energyCost,
    effectPreview: getSpellEffectPreview(type, analysis, config),
    status: `${analysis.weightBand} / ${analysis.energyCost} ${config.text.energyShortLabel}`,
    cooldownRemaining: config.match.minHp
  };
}
