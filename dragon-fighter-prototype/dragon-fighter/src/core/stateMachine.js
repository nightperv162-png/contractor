import { CONFIG } from '../config.js';

export function transitionTo(state, nextPhase, logger, config = CONFIG) {
  if (!Object.values(config.states).includes(nextPhase)) {
    logger?.warn('State transition rejected', { nextPhase });
    return false;
  }

  state.previousPhase = state.phase;
  state.phase = nextPhase;
  logger?.info('State changed', { from: state.previousPhase, to: nextPhase });
  return true;
}

export function showPreparation(state, logger, config = CONFIG) {
  return transitionTo(state, config.states.preparation, logger, config);
}

export function showMatchPreview(state, logger, config = CONFIG) {
  return transitionTo(state, config.states.matchPreview, logger, config);
}
