import { CONFIG } from '../config.js';

export function getOrderedScreens(config = CONFIG) {
  return [
    config.states.contractLibrary,
    config.states.contractCreation,
    config.states.loadout,
    config.states.countdown,
    config.states.match,
    config.states.pause,
    config.states.result
  ];
}

export function transitionTo(state, screen, config = CONFIG, logger) {
  const validScreens = getOrderedScreens(config);
  if (!validScreens.includes(screen)) {
    return { ...state, latestFailureReason: 'Unknown Screen' };
  }
  logger?.state('state transition', { from: state.activeScreen, to: screen });
  return {
    ...state,
    previousScreen: state.activeScreen,
    activeScreen: screen,
    isGuideOpen: false,
    isPaused: screen === config.states.pause,
    detailsOverlay: null,
    guide: { screen }
  };
}

export function openGuide(state, logger) {
  logger?.state('guide opened', { screen: state.activeScreen });
  return {
    ...state,
    isGuideOpen: true,
    isPaused: state.activeScreen === CONFIG.states.match ? true : state.isPaused,
    guide: { screen: state.activeScreen }
  };
}

export function closeGuide(state, logger) {
  logger?.state('guide closed', { screen: state.activeScreen });
  return {
    ...state,
    isGuideOpen: false,
    isPaused: state.activeScreen === CONFIG.states.match ? false : state.isPaused
  };
}

export function moveScreen(state, direction, config = CONFIG, logger) {
  const screens = getOrderedScreens(config);
  const currentIndex = screens.indexOf(state.activeScreen);
  const nextIndex = (currentIndex + direction + screens.length) % screens.length;
  return transitionTo(state, screens[nextIndex], config, logger);
}
