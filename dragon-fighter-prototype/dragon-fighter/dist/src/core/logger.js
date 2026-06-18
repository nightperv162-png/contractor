export function createLogger(config) {
  function canLog(flagName) {
    return config.logging.enabled && config.logging[flagName];
  }

  function log(flagName, message, details) {
    if (!canLog(flagName)) {
      return;
    }

    if (details) {
      console.log(`${config.logging.prefix} ${message}`, details);
      return;
    }

    console.log(`${config.logging.prefix} ${message}`);
  }

  return { log };
}
