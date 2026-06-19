import { CONFIG } from '../config.js';
import { closeGuide, moveScreen, openGuide, transitionTo } from '../core/stateMachine.js';
import { createContractFromTemplate, createLoadoutFromLibrary, saveContractToLibrary } from '../contracts/contractLibrary.js';
import { createHitRegions, findHitRegion } from './hitRegions.js';

export function resolveCanvasAction(state, action, config = CONFIG, logger) {
  if (!action) return state;
  if (action.action === 'openGuide') return openGuide(state, logger);
  if (action.action === 'closeGuide') return closeGuide(state, logger);
  if (action.action === 'previousScreen') return moveScreen(state, -config.process.failureStatus, config, logger);
  if (action.action === 'nextScreen') return moveScreen(state, config.process.failureStatus, config, logger);
  if (action.action === 'pause') return transitionTo(state, config.states.pause, config, logger);
  if (action.action === 'goToContractCreation') {
    logger?.library('library create-first selected', { count: state.contractLibrary.length });
    return transitionTo(state, config.states.contractCreation, config, logger);
  }
  if (action.action === 'prepareLoadout') {
    logger?.library('library opened loadout', { count: state.contractLibrary.length });
    return transitionTo({
      ...state,
      equippedSlots: createLoadoutFromLibrary(state.contractLibrary, config)
    }, config.states.loadout, config, logger);
  }
  if (action.action === 'drawingPlaceholder') {
    const contract = createContractFromTemplate(config.contracts.sampleAnalysisContract, state.nextContractNumber, config);
    logger?.input('drawing placeholder completed', { contractId: contract.id });
    return {
      ...state,
      contractCreation: {
        hasDrawing: true,
        analysisContract: contract
      },
      latestFailureReason: null,
      detailsOverlay: null
    };
  }
  if (action.action === 'redrawContract') {
    logger?.input('contract redraw placeholder', { screen: state.activeScreen });
    return {
      ...state,
      contractCreation: {
        hasDrawing: false,
        analysisContract: null
      },
      latestFailureReason: null,
      detailsOverlay: null
    };
  }
  if (action.action === 'saveContract') {
    const contract = state.contractCreation.analysisContract;
    if (!contract) return { ...state, latestFailureReason: config.labels.drawFirst };
    const result = saveContractToLibrary(state.contractLibrary, contract, config);
    if (!result.success) {
      logger?.library('library full', { count: state.contractLibrary.length, limit: config.contracts.maxContractLibrarySize });
      return { ...state, latestFailureReason: result.reason };
    }
    logger?.library('contract saved', { contractId: contract.id, count: result.library.length });
    return transitionTo({
      ...state,
      contractLibrary: result.library,
      nextContractNumber: state.nextContractNumber + config.numbers.contractSequenceStep,
      contractCreation: {
        hasDrawing: false,
        analysisContract: null
      },
      equippedSlots: createLoadoutFromLibrary(result.library, config),
      latestFailureReason: result.reason
    }, config.states.contractLibrary, config, logger);
  }
  if (action.action === 'showContractDetails') {
    const contract = action.source === 'slot'
      ? state.equippedSlots[action.slotIndex]?.detailsContract
      : state.contractLibrary[action.itemIndex];
    logger?.library('contract selected', { source: action.source, contractId: contract?.id || null });
    return {
      ...state,
      detailsOverlay: contract ? {
        source: action.source,
        contract,
        currentCallName: action.source === 'slot' ? state.equippedSlots[action.slotIndex]?.resolvedCallName : contract.callName
      } : null
    };
  }
  if (action.action === 'startCountdown') return transitionTo(state, config.states.countdown, config, logger);
  if (action.action === 'returnToLibrary') {
    logger?.library('return from result', { target: config.states.contractLibrary, count: state.contractLibrary.length });
    return transitionTo(state, config.states.contractLibrary, config, logger);
  }
  if (action.action === 'returnToLoadout') {
    logger?.library('return from result', { target: config.states.loadout, count: state.contractLibrary.length });
    return transitionTo({
      ...state,
      equippedSlots: createLoadoutFromLibrary(state.contractLibrary, config)
    }, config.states.loadout, config, logger);
  }
  if (action.action === 'selectCombatSlot') {
    const slot = state.equippedSlots[action.slotIndex];
    logger?.input('combat slot selected', { slot: slot?.markerLabel });
    return { ...state, latestInput: slot?.resolvedCallName || null };
  }
  logger?.input('placeholder action', { action: action.action });
  return { ...state, latestInput: action.label };
}

export function handleCanvasPointer(state, point, config = CONFIG, logger) {
  const regions = createHitRegions(state, config);
  const hit = findHitRegion(point, regions);
  logger?.input('canvas pointer', { point, hit: hit?.id || null });
  return resolveCanvasAction(state, hit, config, logger);
}

export function handleCanvasHover(state, point, config = CONFIG, logger) {
  const detailsScreens = [config.states.contractLibrary, config.states.loadout];
  if (!detailsScreens.includes(state.activeScreen) || state.isGuideOpen) return state;
  const regions = createHitRegions(state, config);
  const hit = findHitRegion(point, regions);
  if (hit?.action === 'showContractDetails') return resolveCanvasAction(state, hit, config, logger);
  if (state.detailsOverlay) {
    logger?.library('contract details closed', { reason: 'hover-away' });
    return { ...state, detailsOverlay: null };
  }
  return state;
}
