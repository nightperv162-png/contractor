import { CONFIG } from '../config.js';

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
    patternControls: {
      x: config.layout.outerPadding,
      y: config.layout.prepUtilityPanelY,
      width: config.canvas.width - config.layout.outerPadding * config.match.sideCount,
      height: config.layout.prepUtilityPanelHeight
    },
    finalControls: {
      x: config.layout.outerPadding,
      y: config.layout.prepFinalPanelY,
      width: config.canvas.width - config.layout.outerPadding * config.match.sideCount,
      height: config.layout.prepFinalPanelHeight
    },
    randomPatternButton: {
      x: centeredX(config.layout.prepButtonWidth * config.match.sideCount + config.layout.saveSpellButtonWidth + config.layout.spellTypeButtonGap * config.match.sideCount, config),
      y: config.layout.prepUtilityPanelY + (config.layout.prepUtilityPanelHeight - config.layout.prepButtonHeight) / config.match.sideCount,
      width: config.layout.prepButtonWidth,
      height: config.layout.prepButtonHeight
    },
    confirmLoadoutButton: {
      x: centeredX(config.layout.prepButtonWidth * config.match.sideCount + config.layout.saveSpellButtonWidth + config.layout.spellTypeButtonGap * config.match.sideCount, config) + config.layout.saveSpellButtonWidth + config.layout.prepButtonWidth + config.layout.spellTypeButtonGap * config.match.sideCount,
      y: config.layout.prepFinalPanelY + (config.layout.prepFinalPanelHeight - config.layout.prepButtonHeight) / config.match.sideCount,
      width: config.layout.prepButtonWidth,
      height: config.layout.prepButtonHeight
    },
    nameField: {
      x: config.layout.forgePanelX + config.layout.outerPadding,
      y: config.layout.forgePanelY + config.layout.spellNameFieldY,
      width: config.layout.spellNameFieldWidth,
      height: config.layout.spellNameFieldHeight
    },
    cycleNameButton: {
      x: config.layout.forgePanelX + config.layout.outerPadding + config.layout.spellNameFieldWidth + config.layout.spellTypeButtonGap,
      y: config.layout.forgePanelY + config.layout.spellNameFieldY,
      width: config.layout.cycleNameButtonWidth,
      height: config.layout.spellNameFieldHeight
    },
    deleteSpellButton: {
      x: config.layout.spellSlotsX + config.layout.spellSlotsWidth - config.layout.outerPadding - config.layout.deleteSpellButtonWidth,
      y: config.layout.spellSlotsY + config.layout.outerPadding / config.match.sideCount,
      width: config.layout.deleteSpellButtonWidth,
      height: config.layout.deleteSpellButtonHeight
    },
    effectPreviewPanel: {
      x: config.layout.forgePanelX + config.layout.outerPadding,
      y: config.layout.forgePanelY + config.layout.effectPreviewPanelY,
      width: config.layout.forgePanelWidth - config.layout.outerPadding * config.match.sideCount,
      height: config.layout.effectPreviewPanelHeight
    },
    saveSpellButton: {
      x: centeredX(config.layout.prepButtonWidth * config.match.sideCount + config.layout.saveSpellButtonWidth + config.layout.spellTypeButtonGap * config.match.sideCount, config),
      y: config.layout.prepFinalPanelY + (config.layout.prepFinalPanelHeight - config.layout.prepButtonHeight) / config.match.sideCount,
      width: config.layout.saveSpellButtonWidth,
      height: config.layout.prepButtonHeight
    },
    clearPatternButton: {
      x: centeredX(config.layout.prepButtonWidth * config.match.sideCount + config.layout.saveSpellButtonWidth + config.layout.spellTypeButtonGap * config.match.sideCount, config) + config.layout.prepButtonWidth + config.layout.spellTypeButtonGap,
      y: config.layout.prepUtilityPanelY + (config.layout.prepUtilityPanelHeight - config.layout.prepButtonHeight) / config.match.sideCount,
      width: config.layout.saveSpellButtonWidth,
      height: config.layout.prepButtonHeight
    },
    randomSpellTypeButton: {
      x: centeredX(config.layout.prepButtonWidth * config.match.sideCount + config.layout.saveSpellButtonWidth + config.layout.spellTypeButtonGap * config.match.sideCount, config) + config.layout.prepButtonWidth + config.layout.saveSpellButtonWidth + config.layout.spellTypeButtonGap * config.match.sideCount,
      y: config.layout.prepUtilityPanelY + (config.layout.prepUtilityPanelHeight - config.layout.prepButtonHeight) / config.match.sideCount,
      width: config.layout.saveSpellButtonWidth,
      height: config.layout.prepButtonHeight
    },
    prepareAllSpellsButton: {
      x: centeredX(config.layout.prepButtonWidth * config.match.sideCount + config.layout.saveSpellButtonWidth + config.layout.spellTypeButtonGap * config.match.sideCount, config) + config.layout.saveSpellButtonWidth + config.layout.spellTypeButtonGap,
      y: config.layout.prepFinalPanelY + (config.layout.prepFinalPanelHeight - config.layout.prepButtonHeight) / config.match.sideCount,
      width: config.layout.prepButtonWidth,
      height: config.layout.prepButtonHeight
    }
  };
}

export function getPreparationSpellSlotRects(config = CONFIG) {
  const rect = getPreparationRects(config).spellSlots;
  return Array.from({ length: config.spells.perLoadout }, (_, index) => {
    const slotY = rect.y + config.layout.outerPadding + config.fonts.normalSize + config.layout.cooldownChipGap + index * (config.layout.spellSlotHeight + config.layout.spellSlotGap);
    return {
      id: `prep-spell-slot-${index + config.patterns.firstPointId}`,
      kind: 'preparation-spell-slot',
      spellIndex: index,
      rect: {
        x: rect.x + config.layout.outerPadding,
        y: slotY,
        width: rect.width - config.layout.outerPadding * config.match.sideCount,
        height: config.layout.spellSlotHeight
      }
    };
  });
}

export function getEggGridPoints(config = CONFIG) {
  const rect = getPreparationRects(config).eggDrawing;
  const gridWidth = config.layout.eggGridGap * (config.patterns.columns - (config.match.sideCount - 1));
  const gridHeight = config.layout.eggGridGap * (config.patterns.rows - (config.match.sideCount - 1));
  const startX = rect.x + (rect.width - gridWidth) / config.match.sideCount;
  const startY = rect.y + (rect.height - gridHeight) / config.match.sideCount + config.layout.eggGridCenterYOffset;
  const points = [];

  for (let row = config.match.minHp; row < config.patterns.rows; row += config.patterns.firstPointId) {
    for (let column = config.match.minHp; column < config.patterns.columns; column += config.patterns.firstPointId) {
      points.push({
        id: points.length + config.patterns.firstPointId,
        x: startX + column * config.layout.eggGridGap,
        y: startY + row * config.layout.eggGridGap,
        radius: config.layout.eggGridPointRadius
      });
    }
  }

  return points;
}

export function getSpellTypeButtonRects(config = CONFIG) {
  const rect = getPreparationRects(config).forgePanel;
  const startX = rect.x + config.layout.outerPadding;
  const startY = rect.y + config.layout.spellTypeButtonY;
  return config.spells.types.map((type, index) => ({
    id: `type-${type.toLowerCase()}`,
    kind: 'spell-type',
    label: type,
    spellType: type,
    rect: {
      x: startX + (index % config.layout.spellTypeButtonColumns) * (config.layout.spellTypeButtonWidth + config.layout.spellTypeButtonGap),
      y: startY + Math.floor(index / config.layout.spellTypeButtonColumns) * (config.layout.spellTypeButtonHeight + config.layout.spellTypeButtonGap),
      width: config.layout.spellTypeButtonWidth,
      height: config.layout.spellTypeButtonHeight
    }
  }));
}

export function getSpellButtonRects(config = CONFIG) {
  const totalWidth = config.spells.perLoadout * config.layout.spellButtonWidth + (config.spells.perLoadout - (config.match.sideCount - 1)) * config.layout.spellButtonGap;
  const startX = centeredX(totalWidth, config);

  return config.spells.defaultPlayerNames.map((name, index) => ({
    id: `spell-${name.toLowerCase().replace(/\s+/g, '-')}`,
    kind: 'prepared-spell',
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
