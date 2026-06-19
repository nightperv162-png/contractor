import { CONFIG } from '../config.js';
import { createLoadoutFromLibrary } from '../contracts/contractLibrary.js';

export function createInitialGameState(config = CONFIG) {
  const contractLibrary = [];
  return {
    activeScreen: config.states.initialScreen,
    previousScreen: null,
    isGuideOpen: false,
    isPaused: false,
    selectedContractType: config.contracts.enabledContractTypes[0],
    latestInput: null,
    latestFailureReason: null,
    nextContractNumber: config.numbers.firstContractNumber,
    contractCreation: {
      hasDrawing: false,
      analysisContract: null
    },
    detailsOverlay: null,
    match: {
      timerSeconds: config.match.matchDurationSeconds,
      countdownSeconds: config.match.countdownSeconds,
      result: null
    },
    player: {
      hp: config.match.startingHp,
      maxHp: config.match.baseMaxHp,
      energy: config.match.startingEnergy
    },
    enemy: {
      hp: config.match.startingHp,
      maxHp: config.match.baseMaxHp,
      energy: config.match.startingEnergy
    },
    contractLibrary,
    equippedSlots: createLoadoutFromLibrary(contractLibrary, config),
    guide: {
      screen: config.states.initialScreen
    }
  };
}
