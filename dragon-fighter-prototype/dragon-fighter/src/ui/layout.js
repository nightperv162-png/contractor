import { ACTION_IDS, CONFIG } from '../config.js';

export function centeredX(width, config = CONFIG) {
  return (config.canvas.width - width) / config.match.sideCount;
}

export function getPreparationRects(config = CONFIG) {
  return {
    eggDrawing: {
      x: config.layout.eggDrawingX,
      y: config.layout.eggDrawingY,
      width: config.layout.eggDrawingWidth,
      height: config.layout.eggDrawingHeight
    },
    forgePanel: {
      x: config.layout.forgePanelX,
      y: config.layout.forgePanelY,
      width: config.layout.forgePanelWidth,
      height: config.layout.forgePanelHeight
    },
    spellSlots: {
      x: config.layout.spellSlotsX,
      y: config.layout.spellSlotsY,
      width: config.layout.spellSlotsWidth,
      height: config.layout.spellSlotsHeight
    },
    randomPatternButton: {
      x: config.layout.forgePanelX + config.layout.outerPadding,
      y: config.layout.forgePanelY + config.layout.forgePanelHeight - config.layout.prepButtonHeight - config.layout.outerPadding,
      width: config.layout.prepButtonWidth,
      height: config.layout.prepButtonHeight
    },
    confirmLoadoutButton: {
      x: config.layout.spellSlotsX + config.layout.outerPadding,
      y: config.layout.spellSlotsY + config.layout.spellSlotsHeight - config.layout.prepButtonHeight - config.layout.outerPadding,
      width: config.layout.prepButtonWidth,
      height: config.layout.prepButtonHeight
    }
  };
}

export function getActionButtonRects(config = CONFIG) {
  const totalWidth = ACTION_IDS.length * config.layout.actionButtonWidth + (ACTION_IDS.length - (config.match.sideCount - 1)) * config.layout.actionButtonGap;
  const startX = centeredX(totalWidth, config);

  return ACTION_IDS.map((actionId, index) => ({
    id: `action-${actionId}`,
    kind: 'action',
    label: config.actions[actionId].command,
    actionId,
    rect: {
      x: startX + index * (config.layout.actionButtonWidth + config.layout.actionButtonGap),
      y: config.layout.actionButtonY,
      width: config.layout.actionButtonWidth,
      height: config.layout.actionButtonHeight
    }
  }));
}

export function getSpellButtonRects(config = CONFIG) {
  const totalWidth = config.spells.perLoadout * config.layout.spellButtonWidth + (config.spells.perLoadout - (config.match.sideCount - 1)) * config.layout.spellButtonGap;
  const startX = centeredX(totalWidth, config);

  return config.spells.defaultPlayerNames.map((name, index) => ({
    id: `spell-${name.toLowerCase().replace(/\s+/g, '-')}`,
    kind: 'spell',
    label: name,
    spellIndex: index,
    rect: {
      x: startX + index * (config.layout.spellButtonWidth + config.layout.spellButtonGap),
      y: config.layout.spellButtonY,
      width: config.layout.spellButtonWidth,
      height: config.layout.spellButtonHeight
    }
  }));
}
