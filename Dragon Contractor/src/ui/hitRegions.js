import { CONFIG } from '../config.js';

export function pointInRect(point, rect) {
  return point.x >= rect.x
    && point.x <= rect.x + rect.width
    && point.y >= rect.y
    && point.y <= rect.y + rect.height;
}

export function createHitRegions(state, config = CONFIG) {
  const regions = [
    { id: 'guide', action: 'openGuide', rect: config.layout.guideButtonRect, label: config.labels.guideButton },
    { id: 'previousScreen', action: 'previousScreen', rect: config.layout.prevButtonRect, label: config.labels.previousButton },
    { id: 'nextScreen', action: 'nextScreen', rect: config.layout.nextButtonRect, label: config.labels.nextButton }
  ];

  if (state.activeScreen === config.states.match) {
    regions.push({ id: 'pause', action: 'pause', rect: config.layout.pauseButtonRect, label: config.labels.pauseButton });
    config.layout.combatSlotRects.forEach((rect, index) => {
      regions.push({
        id: `combatSlot-${index}`,
        action: 'selectCombatSlot',
        rect,
        slotIndex: index,
        label: config.contracts.slotMarkerLabels[index]
      });
    });
  }

  if (state.activeScreen === config.states.contractLibrary) {
    if (state.contractLibrary.length === 0) {
      regions.push({ id: 'createFirstContract', action: 'goToContractCreation', rect: config.layout.emptyLibraryButtonRect, label: config.labels.createFirstContract });
    } else {
      regions.push({ id: 'prepareLoadout', action: 'prepareLoadout', rect: config.layout.prepareLoadoutButtonRect, label: config.labels.prepareLoadout });
      state.contractLibrary.forEach((contract, index) => {
        const rect = config.layout.libraryCardRects[index];
        if (!rect) return;
        regions.push({
          id: `libraryCard-${index}`,
          action: 'showContractDetails',
          rect,
          source: 'library',
          itemIndex: index,
          label: contract.fullContractName
        });
      });
    }
  }

  if (state.activeScreen === config.states.contractCreation) {
    regions.push({ id: 'drawingArea', action: 'drawingPlaceholder', rect: config.layout.drawingAreaRect, label: config.labels.drawSigil });
    if (state.contractCreation.hasDrawing) {
      regions.push({ id: 'saveContract', action: 'saveContract', rect: config.layout.saveContractButtonRect, label: config.labels.saveContract });
      regions.push({ id: 'redrawContract', action: 'redrawContract', rect: config.layout.redrawButtonRect, label: config.labels.redraw });
      regions.push({ id: 'rerollCallName', action: 'rerollPlaceholder', rect: config.layout.rerollButtonRect, label: config.labels.reroll });
    }
  }

  if (state.activeScreen === config.states.loadout) {
    state.contractLibrary.forEach((contract, index) => {
      const rect = {
        x: config.layout.libraryRect.x + config.app.safeAreaPadding,
        y: config.layout.libraryRect.y + config.app.safeAreaPadding * 3 + index * config.layout.loadoutLibraryCardHeight,
        width: config.layout.libraryRect.width - config.app.safeAreaPadding * 2,
        height: config.layout.loadoutLibraryCardHeight - config.visuals.strokeThin
      };
      regions.push({
        id: `loadoutLibraryCard-${index}`,
        action: 'showContractDetails',
        rect,
        source: 'library',
        itemIndex: index,
        label: contract.fullContractName
      });
    });
    config.layout.loadoutSlotRects.forEach((rect, index) => {
      regions.push({
        id: `loadoutSlot-${index}`,
        action: 'showContractDetails',
        rect,
        source: 'slot',
        slotIndex: index,
        label: config.contracts.slotMarkerLabels[index]
      });
    });
    regions.push({ id: 'startBattle', action: 'startCountdown', rect: { x: config.layout.rightPanelRect.x, y: config.layout.rightPanelRect.y, width: config.layout.rightPanelRect.width, height: config.layout.guideButtonRect.height }, label: config.labels.startBattle });
  }

  if (state.activeScreen === config.states.result) {
    regions.push({ id: 'returnToLibrary', action: 'returnToLibrary', rect: config.layout.resultLibraryButtonRect, label: config.labels.returnToLibrary });
    regions.push({ id: 'returnToLoadout', action: 'returnToLoadout', rect: config.layout.resultLoadoutButtonRect, label: config.labels.returnToLoadout });
  }

  if (state.isGuideOpen) {
    regions.push({ id: 'closeGuide', action: 'closeGuide', rect: config.layout.guideOverlayRect, label: 'Close Guide' });
  }

  return regions;
}

export function findHitRegion(point, regions) {
  return [...regions].reverse().find((region) => pointInRect(point, region.rect)) || null;
}
