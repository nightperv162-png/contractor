import { CONFIG } from '../config.js';

export function pointToGrid(pointId, config = CONFIG) {
  const offset = pointId - config.patterns.firstPointId;
  return {
    x: offset % config.patterns.columns,
    y: Math.floor(offset / config.patterns.columns)
  };
}

export function getPatternConnections(points) {
  const connections = [];
  for (let index = 0; index < points.length - 1; index += 1) {
    connections.push([points[index], points[index + 1]]);
  }
  return connections;
}

export function hasConnection(points, fromPoint, toPoint, config = CONFIG) {
  return getPatternConnections(points).some(([from, to]) => {
    if (from === fromPoint && to === toPoint) return true;
    return !config.patterns.allowReverseDuplicateConnections && from === toPoint && to === fromPoint;
  });
}

function direction(fromPoint, toPoint, config) {
  const from = pointToGrid(fromPoint, config);
  const to = pointToGrid(toPoint, config);
  return { x: to.x - from.x, y: to.y - from.y };
}

function isSharpTurn(previousPoint, cornerPoint, nextPoint, config) {
  const incoming = direction(cornerPoint, previousPoint, config);
  const outgoing = direction(cornerPoint, nextPoint, config);
  const incomingLength = Math.hypot(incoming.x, incoming.y);
  const outgoingLength = Math.hypot(outgoing.x, outgoing.y);
  if (!incomingLength || !outgoingLength) return false;
  const dot = (incoming.x * outgoing.x + incoming.y * outgoing.y) / (incomingLength * outgoingLength);
  return dot <= config.patterns.sharpAngleDotThreshold;
}

function orientation(a, b, c) {
  return (b.y - a.y) * (c.x - b.x) - (b.x - a.x) * (c.y - b.y);
}

function segmentsCross(first, second, config) {
  const firstStart = pointToGrid(first[0], config);
  const firstEnd = pointToGrid(first[1], config);
  const secondStart = pointToGrid(second[0], config);
  const secondEnd = pointToGrid(second[1], config);
  if ([first[0], first[1]].includes(second[0]) || [first[0], first[1]].includes(second[1])) return false;
  return orientation(firstStart, firstEnd, secondStart) * orientation(firstStart, firstEnd, secondEnd) < 0
    && orientation(secondStart, secondEnd, firstStart) * orientation(secondStart, secondEnd, firstEnd) < 0;
}

export function getWeightBand(connectionCount, config = CONFIG) {
  if (connectionCount >= config.patterns.grandMinConnections) return config.patterns.grandLabel;
  if (connectionCount >= config.patterns.heavyMinConnections && connectionCount <= config.patterns.heavyMaxConnections) return config.patterns.heavyLabel;
  if (connectionCount >= config.patterns.standardMinConnections && connectionCount <= config.patterns.standardMaxConnections) return config.patterns.standardLabel;
  if (connectionCount >= config.patterns.lightMinConnections && connectionCount <= config.patterns.lightMaxConnections) return config.patterns.lightLabel;
  return config.patterns.unformedLabel;
}

export function getPiercePercent(sharpAngleCount, config = CONFIG) {
  if (sharpAngleCount >= config.patterns.highPierceMinSharpAngles) return config.patterns.highPiercePercent;
  if (sharpAngleCount >= config.patterns.lowPierceMinSharpAngles && sharpAngleCount <= config.patterns.lowPierceMaxSharpAngles) return config.patterns.lowPiercePercent;
  return config.match.minHp;
}

export function analyzePattern(points, config = CONFIG) {
  const connections = getPatternConnections(points);
  const uniquePointCount = new Set(points).size;
  const connectionCount = connections.length;
  const weightBand = getWeightBand(connectionCount, config);
  let sharpAngleCount = config.match.minHp;
  let crossedLineCount = config.match.minHp;

  for (let index = config.patterns.firstPointId; index < points.length - config.patterns.firstPointId; index += config.patterns.firstPointId) {
    if (isSharpTurn(points[index - config.patterns.firstPointId], points[index], points[index + config.patterns.firstPointId], config)) {
      sharpAngleCount += config.patterns.firstPointId;
    }
  }

  for (let firstIndex = config.match.minHp; firstIndex < connections.length; firstIndex += config.patterns.firstPointId) {
    for (let secondIndex = firstIndex + config.patterns.firstPointId; secondIndex < connections.length; secondIndex += config.patterns.firstPointId) {
      if (segmentsCross(connections[firstIndex], connections[secondIndex], config)) crossedLineCount += config.patterns.firstPointId;
    }
  }

  const baseCost = config.spellCosts[weightBand];
  const energyCost = baseCost + crossedLineCount * config.patterns.crossedLineEnergyPenalty;
  const closedPattern = connectionCount > config.match.minHp && points[config.match.minHp] === points[points.length - config.patterns.firstPointId];

  return {
    points: [...points],
    connections,
    connectionCount,
    uniquePointCount,
    sharpAngleCount,
    crossedLineCount,
    weightBand,
    energyCost,
    piercePercent: getPiercePercent(sharpAngleCount, config),
    hasSecondaryEffect: uniquePointCount >= config.patterns.uniquePointsForSecondaryEffect,
    hasClosedBonus: closedPattern,
    unstable: crossedLineCount > config.match.minHp,
    misfireChance: crossedLineCount > config.match.minHp ? config.patterns.unstableMisfireChance : config.match.minHp
  };
}

export function addPointToPattern(points, pointId, config = CONFIG) {
  const lastPoint = points[points.length - config.patterns.firstPointId];
  if (!lastPoint) return [pointId];
  if (lastPoint === pointId) return points;
  if (hasConnection(points, lastPoint, pointId, config)) return points;
  return [...points, pointId];
}

export function generateRandomPattern(random, config = CONFIG) {
  const span = config.patterns.randomMaxConnections - config.patterns.randomMinConnections + config.patterns.firstPointId;
  const connectionCount = config.patterns.randomMinConnections + Math.floor(random() * span);
  let points = [config.patterns.firstPointId + Math.floor(random() * config.patterns.pointCount)];

  while (points.length < connectionCount + config.patterns.firstPointId) {
    let nextPoints = points;
    for (let attempt = config.match.minHp; attempt < config.patterns.randomPointAttemptLimit; attempt += config.patterns.firstPointId) {
      const nextPoint = config.patterns.firstPointId + Math.floor(random() * config.patterns.pointCount);
      nextPoints = addPointToPattern(points, nextPoint, config);
      if (nextPoints.length > points.length) break;
    }

    if (nextPoints.length === points.length) {
      for (let pointId = config.patterns.firstPointId; pointId <= config.patterns.pointCount; pointId += config.patterns.firstPointId) {
        nextPoints = addPointToPattern(points, pointId, config);
        if (nextPoints.length > points.length) break;
      }
    }

    if (nextPoints.length === points.length) break;
    points = nextPoints;
  }

  return points;
}
