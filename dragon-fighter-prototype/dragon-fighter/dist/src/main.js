import { CONFIG } from './config.js';
import { createInitialGameState } from './core/gameState.js';
import { startGameLoop } from './core/gameLoop.js';
import { createLogger } from './core/logger.js';
import { createCanvasRenderer } from './render/canvasRenderer.js';

document.title = CONFIG.labels.title;
document.body.style.background = CONFIG.canvas.pageBackground;

const canvas = document.getElementById(CONFIG.canvas.elementId);
const logger = createLogger(CONFIG);
const state = createInitialGameState(CONFIG);
const renderer = createCanvasRenderer(CONFIG);

logger.log('appEvents', 'app started');
logger.log('stateEvents', 'initial state created', state);

startGameLoop({
  config: CONFIG,
  canvas,
  renderer,
  state,
  logger
});
