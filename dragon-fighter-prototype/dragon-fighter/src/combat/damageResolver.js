import { CONFIG } from '../config.js';
import { log } from '../core/logger.js';

/**
 * Applies damage to a target, accounting for active shield with piercing bypass.
 * Damage priority: active shield (with piercing bypass) → HP → clamp to minHp.
 *
 * @param {Object} target - The target actor.
 * @param {number} incomingDamage - Base damage amount.
 * @param {number} piercePercent - Piercing percent (0.0 to 1.0), default 0 (no pierce).
 * @param {Object} config - Configuration object.
 * @returns {Object} { damageApplied: number, shieldAbsorbed: number, hpFinal: number }
 */
export function applyDamage(target, incomingDamage, piercePercent = 0, config = CONFIG) {
  let shieldAbsorbed = 0;
  let damageApplied = incomingDamage;

  // Check for active shield
  if (target.shield && target.shield > 0) {
    // Calculate pierced damage
    const pierced = incomingDamage * piercePercent;
    const blocked = incomingDamage - pierced;

    // Shield absorbs blocked damage
    if (target.shield >= blocked) {
      target.shield -= blocked;
      shieldAbsorbed = blocked;
      damageApplied = pierced;
    } else {
      // Shield is overwhelmed
      damageApplied = pierced + (blocked - target.shield);
      shieldAbsorbed = blocked - (blocked - target.shield);
      target.shield = 0;
    }
  }

  // Apply remaining damage to HP
  target.hp = Math.max(config.match.minHp, target.hp - damageApplied);
  const hpAfterDamage = target.hp;

  log(`Damage applied: ${incomingDamage} incoming, ${shieldAbsorbed} blocked by shield, ${damageApplied} to HP`, {
    category: 'combat',
    incomingDamage,
    piercePercent,
    shieldAbsorbed,
    damageApplied,
    targetHpAfter: hpAfterDamage,
    targetShieldAfter: target.shield || 0
  });

  return {
    damageApplied,
    shieldAbsorbed,
    hpFinal: hpAfterDamage
  };
}

/**
 * Applies a shield buff to an actor.
 *
 * @param {Object} actor - The actor receiving shield.
 * @param {number} shieldAmount - Amount of shield to add.
 * @param {Object} config - Configuration object.
 * @returns {Object} { shieldAdded: number, shieldTotal: number }
 */
export function applyShield(actor, shieldAmount, config = CONFIG) {
  if (!actor.shield || typeof actor.shield !== 'number') {
    actor.shield = 0;
  }

  const shieldBefore = actor.shield;
  actor.shield += shieldAmount;
  actor.shieldExpiryTime = (actor.shieldExpiryTime || 0) + config.shieldAndDamage.shieldDurationSeconds;

  log(`Shield applied: +${shieldAmount} shield`, {
    category: 'combat',
    actor: actor.id,
    shieldBefore,
    shieldAfter: actor.shield,
    expiryTime: actor.shieldExpiryTime
  });

  return {
    shieldAdded: shieldAmount,
    shieldTotal: actor.shield
  };
}

/**
 * Applies healing to an actor, clamped at maxHp.
 *
 * @param {Object} actor - The actor receiving healing.
 * @param {number} healAmount - Amount of HP to restore.
 * @param {Object} config - Configuration object.
 * @returns {Object} { healApplied: number, hpFinal: number }
 */
export function applyHeal(actor, healAmount, config = CONFIG) {
  const hpBefore = actor.hp;
  actor.hp = Math.min(config.match.startingHp, actor.hp + healAmount);
  const healApplied = actor.hp - hpBefore;

  log(`Heal applied: +${healApplied} HP`, {
    category: 'combat',
    actor: actor.id,
    hpBefore,
    hpAfter: actor.hp,
    healApplied
  });

  return {
    healApplied,
    hpFinal: actor.hp
  };
}

/**
 * Applies a slow effect to a target, slowing their next spell cast.
 * Stored as a duration counter that gets ticked down each frame.
 *
 * @param {Object} target - The target actor.
 * @param {number} slowDuration - Duration of slow in seconds.
 * @param {Object} config - Configuration object.
 * @returns {Object} { slowDuration: number, expiryTime: number }
 */
export function applySlow(target, slowDuration, config = CONFIG) {
  if (!target.slowActive) {
    target.slowActive = 0;
  }

  target.slowActive = slowDuration;

  log(`Slow applied: ${slowDuration}s slow`, {
    category: 'combat',
    target: target.id,
    slowDuration
  });

  return {
    slowDuration,
    expiryTime: target.slowActive
  };
}

/**
 * Applies a utility buff (bonus energy regen) to an actor.
 *
 * @param {Object} actor - The actor receiving utility buff.
 * @param {number} utilityDuration - Duration of bonus regen in seconds.
 * @param {Object} config - Configuration object.
 * @returns {Object} { utilityDuration: number, expiryTime: number }
 */
export function applyUtility(actor, utilityDuration, config = CONFIG) {
  if (!actor.utilityBonusActive) {
    actor.utilityBonusActive = 0;
  }

  actor.utilityBonusActive = utilityDuration;

  log(`Utility buff applied: ${utilityDuration}s bonus regen`, {
    category: 'combat',
    actor: actor.id,
    utilityDuration
  });

  return {
    utilityDuration,
    expiryTime: actor.utilityBonusActive
  };
}

function addClosedBonus(baseValue, spell, config) {
  if (!spell.pattern?.hasClosedBonus) return baseValue;
  if (spell.type === 'Attack') return baseValue + config.spellEffects.closedAttackBonusDamage;
  if (spell.type === 'Defense') return baseValue + config.spellEffects.closedDefenseBonusShield;
  if (spell.type === 'Support') return baseValue + config.spellEffects.closedSupportBonusHeal;
  if (spell.type === 'Control') return baseValue + config.spellEffects.closedControlBonusSeconds;
  if (spell.type === 'Utility') return baseValue + config.spellEffects.closedUtilityBonusSeconds;
  return baseValue;
}

function getSpellEffectValue(spell, config) {
  const weight = spell.weightBand ?? config.patterns.unformedLabel;
  if (spell.type === 'Attack') return addClosedBonus(config.spellEffects.attackDamageByWeight[weight], spell, config);
  if (spell.type === 'Defense') return addClosedBonus(config.spellEffects.defenseShieldByWeight[weight], spell, config);
  if (spell.type === 'Support') return addClosedBonus(config.spellEffects.supportHealByWeight[weight], spell, config);
  if (spell.type === 'Control') return addClosedBonus(config.spellEffects.controlSlowSecondsByWeight[weight], spell, config);
  if (spell.type === 'Utility') return addClosedBonus(config.spellEffects.utilityBonusSecondsByWeight[weight], spell, config);
  return config.match.minHp;
}

function addHitText(state, sideId, text, amount, config) {
  state.hitEffects.push({
    sideId,
    text,
    amount,
    seconds: config.animation.hitTextSeconds
  });
}

function addProjectile(state, actorId, targetId, config) {
  state.projectileEffects.push({
    actorId,
    targetId,
    seconds: config.animation.projectileSeconds
  });
}

export function applySpellEffect(actor, target, spell, state, config = CONFIG) {
  const value = getSpellEffectValue(spell, config);
  if (spell.type === 'Attack') {
    const piercePercent = spell.pattern?.piercePercent ?? config.match.minHp;
    const damage = applyDamage(target, value, piercePercent, config);
    addProjectile(state, actor.id, target.id, config);
    addHitText(state, target.id, `-${damage.damageApplied}`, damage.damageApplied, config);
    state.shakeRemaining = damage.damageApplied > config.match.minHp ? config.animation.shakeSeconds : state.shakeRemaining;
    return {
      type: spell.type,
      damage: damage.damageApplied,
      shieldAbsorbed: damage.shieldAbsorbed,
      feedbackMessage: `${spell.name} hit for ${damage.damageApplied} damage`
    };
  }

  if (spell.type === 'Defense') {
    const shield = applyShield(actor, value, config);
    addHitText(state, actor.id, `+${shield.shieldAdded} shield`, config.match.minHp, config);
    return {
      type: spell.type,
      shield: shield.shieldAdded,
      feedbackMessage: `${spell.name} added ${shield.shieldAdded} shield`
    };
  }

  if (spell.type === 'Support') {
    const heal = applyHeal(actor, value, config);
    addHitText(state, actor.id, `+${heal.healApplied} HP`, -heal.healApplied, config);
    return {
      type: spell.type,
      heal: heal.healApplied,
      feedbackMessage: `${spell.name} healed ${heal.healApplied} HP`
    };
  }

  if (spell.type === 'Control') {
    const slow = applySlow(target, value, config);
    addProjectile(state, actor.id, target.id, config);
    addHitText(state, target.id, `Slowed ${slow.slowDuration}s`, config.match.minHp, config);
    return {
      type: spell.type,
      slowDuration: slow.slowDuration,
      feedbackMessage: `${spell.name} slowed target for ${slow.slowDuration}s`
    };
  }

  if (spell.type === 'Utility') {
    const utility = applyUtility(actor, value, config);
    addHitText(state, actor.id, `Regen ${utility.utilityDuration}s`, config.match.minHp, config);
    return {
      type: spell.type,
      utilityDuration: utility.utilityDuration,
      feedbackMessage: `${spell.name} boosted regen for ${utility.utilityDuration}s`
    };
  }

  return {
    type: spell.type,
    feedbackMessage: `${spell.name} had no effect`
  };
}

/**
 * Updates effect durations (shield, slow, utility) by ticking them down.
 *
 * @param {Object} actor - The actor to update.
 * @param {number} deltaSeconds - Time elapsed.
 * @param {Object} config - Configuration object.
 */
export function updateEffectDurations(actor, deltaSeconds, config = CONFIG) {
  if (actor.shieldExpiryTime && typeof actor.shieldExpiryTime === 'number') {
    actor.shieldExpiryTime = Math.max(0, actor.shieldExpiryTime - deltaSeconds);
    if (actor.shieldExpiryTime <= 0) {
      actor.shield = 0;
    }
  }

  if (actor.slowActive && typeof actor.slowActive === 'number') {
    actor.slowActive = Math.max(0, actor.slowActive - deltaSeconds);
  }

  if (actor.utilityBonusActive && typeof actor.utilityBonusActive === 'number') {
    actor.utilityBonusActive = Math.max(0, actor.utilityBonusActive - deltaSeconds);
  }
}

export function normalizeDamageAmount(amount, config = CONFIG) {
  if (config.shieldAndDamage.damageRoundingMode === 'round') return Math.round(amount);
  if (config.shieldAndDamage.damageRoundingMode === 'floor') return Math.floor(amount);
  if (config.shieldAndDamage.damageRoundingMode === 'ceil') return Math.ceil(amount);
  return amount;
}
