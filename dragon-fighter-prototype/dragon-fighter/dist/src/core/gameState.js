export function createInitialGameState(config) {
  const cooldowns = Object.fromEntries(
    config.input.validCommands.map((command) => [command, config.math.zero])
  );

  return {
    phase: config.match.initialPhase,
    timerSeconds: config.match.durationSeconds,
    countdownSeconds: config.match.countdownSeconds,
    latestPlayerCommand: config.labels.noPlayerCommand,
    latestAiCommand: config.labels.noAiCommand,
    players: {
      player1: createSideState({
        id: 'player1',
        name: config.labels.player1Name,
        element: config.labels.player1Element,
        hp: config.match.startingHp,
        stateLabel: config.labels.idleState,
        cooldowns
      }),
      player2: createSideState({
        id: 'player2',
        name: config.labels.player2Name,
        element: config.labels.player2Element,
        hp: config.match.startingHp,
        stateLabel: config.labels.idleState,
        cooldowns
      })
    }
  };
}

function createSideState({ id, name, element, hp, stateLabel, cooldowns }) {
  return {
    id,
    name,
    element,
    hp,
    stateLabel,
    cooldowns: { ...cooldowns }
  };
}
