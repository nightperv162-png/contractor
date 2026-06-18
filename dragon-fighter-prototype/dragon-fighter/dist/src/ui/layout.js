export function createLayout(config) {
  const { canvas, layout } = config;
  const centerX = canvas.width * config.math.half;
  const bottomY = canvas.height - layout.bottomMargin - layout.latestCommandPanelHeight;

  return {
    canvas: {
      width: canvas.width,
      height: canvas.height
    },
    player1PanelRect: {
      x: layout.safeAreaPadding,
      y: layout.safeAreaPadding,
      width: layout.statusPanelWidth,
      height: layout.statusPanelHeight
    },
    player2PanelRect: {
      x: canvas.width - layout.safeAreaPadding - layout.statusPanelWidth,
      y: layout.safeAreaPadding,
      width: layout.statusPanelWidth,
      height: layout.statusPanelHeight
    },
    timerRect: {
      x: centerX - layout.timerPanelWidth * config.math.half,
      y: layout.safeAreaPadding,
      width: layout.timerPanelWidth,
      height: layout.timerPanelHeight
    },
    player1CommandRect: {
      x: layout.safeAreaPadding,
      y: bottomY,
      width: layout.latestCommandPanelWidth,
      height: layout.latestCommandPanelHeight
    },
    player2CommandRect: {
      x: canvas.width - layout.safeAreaPadding - layout.latestCommandPanelWidth,
      y: bottomY,
      width: layout.latestCommandPanelWidth,
      height: layout.latestCommandPanelHeight
    },
    commandReferenceRect: {
      x: centerX - layout.commandReferenceWidth * config.math.half,
      y: canvas.height - layout.bottomMargin - layout.commandReferenceHeight,
      width: layout.commandReferenceWidth,
      height: layout.commandReferenceHeight
    },
    arenaBounds: {
      nearLeft: layout.arenaNearLeft,
      nearRight: layout.arenaNearRight,
      farLeft: layout.arenaFarLeft,
      farRight: layout.arenaFarRight,
      horizonY: layout.horizonY,
      floorBottomY: layout.floorBottomY
    },
    player1Position: {
      x: layout.player1PositionX,
      y: layout.player1PositionY
    },
    player1DragonPosition: {
      x: layout.player1DragonPositionX,
      y: layout.player1DragonPositionY
    },
    player2Position: {
      x: layout.player2PositionX,
      y: layout.player2PositionY
    },
    player2DragonPosition: {
      x: layout.player2DragonPositionX,
      y: layout.player2DragonPositionY
    }
  };
}
