import assert from 'node:assert/strict';
import test from 'node:test';
import { CONFIG } from '../src/config.js';
import { createContractFromTemplate, createLoadoutFromLibrary, saveContractToLibrary } from '../src/contracts/contractLibrary.js';
import { createDiagnostics } from '../src/core/diagnostics.js';
import { createInitialGameState } from '../src/core/gameState.js';
import { closeGuide, getOrderedScreens, moveScreen, openGuide, transitionTo } from '../src/core/stateMachine.js';
import { formatCompactSlotCard, getContractDetailsLines, getLibraryEmptyMessage } from '../src/render/canvasRenderer.js';
import { handleCanvasHover, handleCanvasPointer } from '../src/ui/canvasButtonSystem.js';
import { createHitRegions, findHitRegion, pointInRect } from '../src/ui/hitRegions.js';

test('config loads required Milestone 1 sections', () => {
  assert.equal(CONFIG.meta.title, 'Dragon Contractor');
  assert.ok(CONFIG.app.canvasWidth > 0);
  assert.ok(CONFIG.app.canvasHeight > 0);
  assert.equal(CONFIG.contracts.maxEquippedSlots, CONFIG.layout.combatSlotRects.length);
  assert.equal(CONFIG.contracts.maxEquippedSlots, CONFIG.layout.loadoutSlotRects.length);
  assert.equal(CONFIG.contracts.maxContractLibrarySize, 16);
  assert.equal(CONFIG.layout.libraryCardRects.length, CONFIG.contracts.maxContractLibrarySize);
  assert.deepEqual(CONFIG.contracts.enabledContractTypes, ['Damage', 'Burst', 'Heal', 'Energy', 'Buff', 'Curse', 'Vitality']);
  assert.equal(Object.values(CONFIG.states).includes('ContractAnalysis'), false);
});

test('initial game state is serializable and starts on Contract Library', () => {
  const state = createInitialGameState(CONFIG);
  assert.equal(state.activeScreen, CONFIG.states.contractLibrary);
  assert.equal(state.player.hp, CONFIG.match.startingHp);
  assert.equal(state.enemy.energy, CONFIG.match.startingEnergy);
  assert.equal(state.contractLibrary.length, 0);
  assert.equal(state.equippedSlots.length, CONFIG.contracts.maxEquippedSlots);
  assert.equal(getLibraryEmptyMessage(CONFIG), 'No contracts yet. Create your first Dragon Contract.');
  assert.doesNotThrow(() => JSON.stringify(state));
});

test('state machine transitions only to known screens', () => {
  const state = createInitialGameState(CONFIG);
  const loadout = transitionTo(state, CONFIG.states.loadout, CONFIG);
  assert.equal(loadout.activeScreen, CONFIG.states.loadout);
  assert.equal(loadout.previousScreen, CONFIG.states.contractLibrary);
  const failed = transitionTo(loadout, 'MissingScreen', CONFIG);
  assert.equal(failed.activeScreen, CONFIG.states.loadout);
  assert.equal(failed.latestFailureReason, 'Unknown Screen');
});

test('screen cycling covers all milestone screens', () => {
  const screens = getOrderedScreens(CONFIG);
  assert.deepEqual(screens, [
    CONFIG.states.contractLibrary,
    CONFIG.states.contractCreation,
    CONFIG.states.loadout,
    CONFIG.states.countdown,
    CONFIG.states.match,
    CONFIG.states.pause,
    CONFIG.states.result
  ]);
  let state = createInitialGameState(CONFIG);
  for (const screen of screens.slice(1)) {
    state = moveScreen(state, CONFIG.process.failureStatus, CONFIG);
    assert.equal(state.activeScreen, screen);
  }
  state = moveScreen(state, CONFIG.process.failureStatus, CONFIG);
  assert.equal(state.activeScreen, screens[0]);
});

test('empty library button navigates to Contract Creation', () => {
  const state = createInitialGameState(CONFIG);
  const point = {
    x: CONFIG.layout.emptyLibraryButtonRect.x + CONFIG.layout.emptyLibraryButtonRect.width / 2,
    y: CONFIG.layout.emptyLibraryButtonRect.y + CONFIG.layout.emptyLibraryButtonRect.height / 2
  };
  const next = handleCanvasPointer(state, point, CONFIG);
  assert.equal(next.activeScreen, CONFIG.states.contractCreation);
});

test('Contract Analysis appears only after drawing in Contract Creation', () => {
  const creation = transitionTo(createInitialGameState(CONFIG), CONFIG.states.contractCreation, CONFIG);
  assert.equal(creation.contractCreation.hasDrawing, false);
  const drawPoint = {
    x: CONFIG.layout.drawingAreaRect.x + CONFIG.layout.drawingAreaRect.width / 2,
    y: CONFIG.layout.drawingAreaRect.y + CONFIG.layout.drawingAreaRect.height / 2
  };
  const drawn = handleCanvasPointer(creation, drawPoint, CONFIG);
  assert.equal(drawn.activeScreen, CONFIG.states.contractCreation);
  assert.equal(drawn.contractCreation.hasDrawing, true);
  assert.ok(drawn.contractCreation.analysisContract.id.startsWith(CONFIG.contracts.sampleAnalysisContract.id));
  assert.ok(createHitRegions(drawn, CONFIG).some((region) => region.id === 'saveContract'));
});

test('saving a drawn contract adds it to the library and returns to Library', () => {
  const creation = transitionTo(createInitialGameState(CONFIG), CONFIG.states.contractCreation, CONFIG);
  const drawn = {
    ...creation,
    contractCreation: {
      hasDrawing: true,
      analysisContract: createContractFromTemplate(CONFIG.contracts.sampleAnalysisContract, CONFIG.numbers.firstContractNumber, CONFIG)
    }
  };
  const savePoint = {
    x: CONFIG.layout.saveContractButtonRect.x + CONFIG.layout.saveContractButtonRect.width / 2,
    y: CONFIG.layout.saveContractButtonRect.y + CONFIG.layout.saveContractButtonRect.height / 2
  };
  const saved = handleCanvasPointer(drawn, savePoint, CONFIG);
  assert.equal(saved.activeScreen, CONFIG.states.contractLibrary);
  assert.equal(saved.contractLibrary.length, 1);
  assert.equal(saved.contractCreation.hasDrawing, false);
});

test('library persists contracts across Result returns', () => {
  const contract = createContractFromTemplate(CONFIG.contracts.sampleAnalysisContract, CONFIG.numbers.firstContractNumber, CONFIG);
  const result = transitionTo({
    ...createInitialGameState(CONFIG),
    contractLibrary: [contract],
    equippedSlots: createLoadoutFromLibrary([contract], CONFIG)
  }, CONFIG.states.result, CONFIG);
  const libraryPoint = {
    x: CONFIG.layout.resultLibraryButtonRect.x + CONFIG.layout.resultLibraryButtonRect.width / 2,
    y: CONFIG.layout.resultLibraryButtonRect.y + CONFIG.layout.resultLibraryButtonRect.height / 2
  };
  const returnedLibrary = handleCanvasPointer(result, libraryPoint, CONFIG);
  assert.equal(returnedLibrary.activeScreen, CONFIG.states.contractLibrary);
  assert.equal(returnedLibrary.contractLibrary.length, 1);
  const loadout = transitionTo(result, CONFIG.states.result, CONFIG);
  const loadoutPoint = {
    x: CONFIG.layout.resultLoadoutButtonRect.x + CONFIG.layout.resultLoadoutButtonRect.width / 2,
    y: CONFIG.layout.resultLoadoutButtonRect.y + CONFIG.layout.resultLoadoutButtonRect.height / 2
  };
  const returnedLoadout = handleCanvasPointer(loadout, loadoutPoint, CONFIG);
  assert.equal(returnedLoadout.activeScreen, CONFIG.states.loadout);
  assert.equal(returnedLoadout.contractLibrary.length, 1);
});

test('library max size blocks saving the seventeenth contract', () => {
  const fullLibrary = Array.from({ length: CONFIG.contracts.maxContractLibrarySize }, (_, index) => createContractFromTemplate(CONFIG.contracts.sampleAnalysisContract, index + CONFIG.numbers.firstContractNumber, CONFIG));
  const extra = createContractFromTemplate(CONFIG.contracts.sampleVitalityContract, CONFIG.contracts.maxContractLibrarySize + CONFIG.numbers.firstContractNumber, CONFIG);
  const result = saveContractToLibrary(fullLibrary, extra, CONFIG);
  assert.equal(result.success, false);
  assert.equal(result.library.length, CONFIG.contracts.maxContractLibrarySize);
  assert.equal(result.reason, CONFIG.library.fullSaveReason);
});

test('Loadout only equips contracts from the library', () => {
  const library = [
    createContractFromTemplate(CONFIG.contracts.sampleAnalysisContract, CONFIG.numbers.firstContractNumber, CONFIG),
    createContractFromTemplate(CONFIG.contracts.sampleVitalityContract, CONFIG.numbers.firstContractNumber + CONFIG.numbers.contractSequenceStep, CONFIG)
  ];
  const slots = createLoadoutFromLibrary(library, CONFIG);
  const libraryIds = new Set(library.map((contract) => contract.id));
  assert.equal(slots.filter((slot) => slot.contractId).every((slot) => libraryIds.has(slot.contractId)), true);
  assert.equal(slots[0].resolvedCallName, library[0].callName);
  assert.equal(slots[1].resolvedCallName, library[1].callName);
});

test('Library and Loadout details are temporary overlays', () => {
  const contract = createContractFromTemplate(CONFIG.contracts.sampleVitalityContract, CONFIG.numbers.firstContractNumber, CONFIG);
  const library = {
    ...createInitialGameState(CONFIG),
    contractLibrary: [contract]
  };
  const cardPoint = {
    x: CONFIG.layout.libraryCardRects[0].x + CONFIG.layout.libraryCardRects[0].width / 2,
    y: CONFIG.layout.libraryCardRects[0].y + CONFIG.layout.libraryCardRects[0].height / 2
  };
  const withDetails = handleCanvasHover(library, cardPoint, CONFIG);
  assert.equal(withDetails.detailsOverlay.contract.id, contract.id);
  const detailLines = getContractDetailsLines(withDetails.detailsOverlay);
  assert.ok(detailLines.includes('Effect: +50 Max HP'));
  assert.equal(detailLines.some((line) => line.includes('instant HP') || line.includes('temporary Max HP')), false);
  const awayPoint = {
    x: CONFIG.layout.topBarRect.x,
    y: CONFIG.layout.topBarRect.y
  };
  const closed = handleCanvasHover(withDetails, awayPoint, CONFIG);
  assert.equal(closed.detailsOverlay, null);
});

test('compact combat cards contain only marker Call Name and Energy cost', () => {
  const contract = createContractFromTemplate(CONFIG.contracts.sampleAnalysisContract, CONFIG.numbers.firstContractNumber, CONFIG);
  const state = {
    ...createInitialGameState(CONFIG),
    equippedSlots: createLoadoutFromLibrary([contract], CONFIG)
  };
  assert.equal(formatCompactSlotCard(state.equippedSlots[0], CONFIG), '[A] Ignivar    10');
});

test('guide overlay state opens and closes with combat pause behavior', () => {
  const combat = transitionTo(createInitialGameState(CONFIG), CONFIG.states.match, CONFIG);
  const guided = openGuide(combat);
  assert.equal(guided.isGuideOpen, true);
  assert.equal(guided.isPaused, true);
  assert.equal(guided.guide.screen, CONFIG.states.match);
  const closed = closeGuide(guided);
  assert.equal(closed.isGuideOpen, false);
  assert.equal(closed.isPaused, false);
});

test('hit regions include guide navigation and combat slots', () => {
  const state = transitionTo(createInitialGameState(CONFIG), CONFIG.states.match, CONFIG);
  const regions = createHitRegions(state, CONFIG);
  assert.ok(regions.some((region) => region.id === 'guide'));
  assert.ok(regions.some((region) => region.id === 'pause'));
  assert.equal(regions.filter((region) => region.action === 'selectCombatSlot').length, CONFIG.contracts.maxEquippedSlots);
});

test('point mapping finds the expected Canvas hit region', () => {
  const state = createInitialGameState(CONFIG);
  const regions = createHitRegions(state, CONFIG);
  const point = {
    x: CONFIG.layout.guideButtonRect.x + CONFIG.layout.guideButtonRect.width / 2,
    y: CONFIG.layout.guideButtonRect.y + CONFIG.layout.guideButtonRect.height / 2
  };
  assert.equal(pointInRect(point, CONFIG.layout.guideButtonRect), true);
  assert.equal(findHitRegion(point, regions).id, 'guide');
});

test('canvas pointer opens and closes guide through hit regions', () => {
  const state = createInitialGameState(CONFIG);
  const guidePoint = {
    x: CONFIG.layout.guideButtonRect.x + CONFIG.layout.guideButtonRect.width / 2,
    y: CONFIG.layout.guideButtonRect.y + CONFIG.layout.guideButtonRect.height / 2
  };
  const guided = handleCanvasPointer(state, guidePoint, CONFIG);
  assert.equal(guided.isGuideOpen, true);
  const closePoint = {
    x: CONFIG.layout.guideOverlayRect.x + CONFIG.layout.guideOverlayRect.width / 2,
    y: CONFIG.layout.guideOverlayRect.y + CONFIG.layout.guideOverlayRect.height / 2
  };
  const closed = handleCanvasPointer(guided, closePoint, CONFIG);
  assert.equal(closed.isGuideOpen, false);
});

test('diagnostics exposes build and screen metadata', () => {
  const diagnostics = createDiagnostics(CONFIG);
  assert.equal(diagnostics.devServerUrl, CONFIG.diagnostics.localDevServerUrl);
  assert.equal(diagnostics.canvasSize.width, CONFIG.app.canvasWidth);
  assert.ok(diagnostics.screens.includes(CONFIG.states.result));
});
