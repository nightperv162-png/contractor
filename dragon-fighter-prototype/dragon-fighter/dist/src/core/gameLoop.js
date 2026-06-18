export function startGameLoop({ config, canvas, renderer, state, logger }) {
  const context = canvas.getContext('2d');
  let previousTime = performance.now();

  function resizeCanvas() {
    canvas.width = config.canvas.width;
    canvas.height = config.canvas.height;
    canvas.style.width = config.canvas.cssWidth;
    canvas.style.height = config.canvas.cssHeight;
  }

  function frame(currentTime) {
    const deltaSeconds = (currentTime - previousTime) / config.math.millisecondsPerSecond;
    previousTime = currentTime;
    renderer.render(context, state, deltaSeconds);
    requestAnimationFrame(frame);
  }

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  logger.log('renderEvents', 'render loop started');
  requestAnimationFrame(frame);
}
