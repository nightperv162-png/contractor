(function attachContractCreation(root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.ContractCreation = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createContractCreationApi() {
  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function distance(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  function edgeKey(first, second) {
    return first < second ? `${first}:${second}` : `${second}:${first}`;
  }

  function createOrderPoints(config, types, random = Math.random) {
    const points = [];
    for (let index = 0; index < config.pointCount; index += 1) {
      const angle = config.startAngle + index * Math.PI * 2 / config.pointCount;
      const type = index < types.length ? types[index] : types[Math.floor(random() * types.length)];
      points.push({
        x: config.center.x + Math.cos(angle) * config.radius,
        y: config.center.y + Math.sin(angle) * config.radius,
        type,
        index
      });
    }
    return points;
  }

  function addOrderPoint(state, pointIndex, points) {
    const point = points[pointIndex];
    if (!point) return { accepted: false, reason: "Unknown point." };
    if (state.lastPointIndex === null) {
      state.strokes.push([{ x: point.x, y: point.y, orderIndex: pointIndex }]);
      state.currentStrokeIndex = state.strokes.length - 1;
      state.lastPointIndex = pointIndex;
      return { accepted: true, first: true, type: point.type };
    }
    if (state.lastPointIndex === pointIndex) return { accepted: false, reason: "Choose a different point." };

    const key = edgeKey(state.lastPointIndex, pointIndex);
    if (state.edges.has(key)) return { accepted: false, reason: "That edge already exists." };
    state.edges.add(key);
    state.strokes[state.currentStrokeIndex].push({ x: point.x, y: point.y, orderIndex: pointIndex });
    state.lastPointIndex = pointIndex;
    return { accepted: true, first: false, type: point.type, edge: key };
  }

  function breakOrderPath(state) {
    state.lastPointIndex = null;
    state.currentStrokeIndex = null;
  }

  function isContinuousPath(strokes) {
    return strokes.filter((stroke) => stroke.length > 1).length <= 1;
  }

  function mirrorPointSet(point, config) {
    const dx = point.x - config.center.x;
    const dy = point.y - config.center.y;
    const radius = Math.hypot(dx, dy);
    const angle = Math.atan2(dy, dx) - config.axisOffset;
    const points = [];
    for (let axis = 0; axis < config.axes; axis += 1) {
      const rotation = axis * Math.PI * 2 / config.axes + config.axisOffset;
      for (const reflectedAngle of [angle + rotation, -angle + rotation]) {
        const mirrored = {
          x: config.center.x + Math.cos(reflectedAngle) * radius,
          y: config.center.y + Math.sin(reflectedAngle) * radius
        };
        if (!points.some((candidate) => distance(candidate, mirrored) <= config.dedupeTolerance)) points.push(mirrored);
      }
    }
    return points;
  }

  function collectSegments(strokes) {
    const segments = [];
    strokes.forEach((stroke, strokeIndex) => {
      for (let pointIndex = 1; pointIndex < stroke.length; pointIndex += 1) {
        segments.push({
          a: stroke[pointIndex - 1],
          b: stroke[pointIndex],
          strokeIndex,
          pointIndex: pointIndex - 1
        });
      }
    });
    return segments;
  }

  function buildGraph(strokes, tolerance) {
    const nodes = [];
    const edges = [];
    const parent = [];

    function find(index) {
      if (parent[index] !== index) parent[index] = find(parent[index]);
      return parent[index];
    }

    function union(first, second) {
      const rootA = find(first);
      const rootB = find(second);
      if (rootA !== rootB) parent[rootB] = rootA;
    }

    function nodeFor(point) {
      let index = nodes.findIndex((node) => distance(node, point) <= tolerance);
      if (index !== -1) return index;
      index = nodes.length;
      nodes.push({ x: point.x, y: point.y });
      parent.push(index);
      return index;
    }

    for (const stroke of strokes) {
      if (!stroke.length) continue;
      nodeFor(stroke[0]);
      for (let index = 1; index < stroke.length; index += 1) {
        const first = nodeFor(stroke[index - 1]);
        const second = nodeFor(stroke[index]);
        edges.push([first, second]);
        union(first, second);
      }
    }

    const components = new Set(nodes.map((node, index) => find(index))).size;
    const completedShapes = Math.max(0, edges.length - nodes.length + components);
    return { completedShapes, components };
  }

  function linesCross(first, second, epsilon, endpointTolerance) {
    if ([first.a, first.b].some((pointA) => [second.a, second.b].some((pointB) => distance(pointA, pointB) <= endpointTolerance))) return false;
    const denominator = (first.a.x - first.b.x) * (second.a.y - second.b.y) - (first.a.y - first.b.y) * (second.a.x - second.b.x);
    if (Math.abs(denominator) <= epsilon) return false;
    const t = ((first.a.x - second.a.x) * (second.a.y - second.b.y) - (first.a.y - second.a.y) * (second.a.x - second.b.x)) / denominator;
    const u = -((first.a.x - first.b.x) * (first.a.y - second.a.y) - (first.a.y - first.b.y) * (first.a.x - second.a.x)) / denominator;
    return t > epsilon && t < 1 - epsilon && u > epsilon && u < 1 - epsilon;
  }

  function countCrossings(segments, config) {
    let crossings = 0;
    for (let first = 0; first < segments.length; first += 1) {
      for (let second = first + 1; second < segments.length; second += 1) {
        if (linesCross(segments[first], segments[second], config.intersectionEpsilon, config.endpointTolerance)) crossings += 1;
      }
    }
    return crossings;
  }

  function countOverlaps(strokes, tolerance) {
    const points = strokes.flatMap((stroke, strokeIndex) => stroke.map((point, pointIndex) => ({ point, strokeIndex, pointIndex })));
    let overlaps = 0;
    for (let first = 0; first < points.length; first += 1) {
      for (let second = first + 1; second < points.length; second += 1) {
        const a = points[first];
        const b = points[second];
        if (a.strokeIndex === b.strokeIndex && Math.abs(a.pointIndex - b.pointIndex) <= 1) continue;
        if (distance(a.point, b.point) <= tolerance) overlaps += 1;
      }
    }
    return overlaps;
  }

  function analyzeDrawing(strokes, base, config, options = {}) {
    const drawableStrokes = strokes.filter((stroke) => stroke.length > 0);
    const segments = collectSegments(drawableStrokes);
    const totalDrawingLength = segments.reduce((total, segment) => total + distance(segment.a, segment.b), 0);
    const graph = buildGraph(drawableStrokes, config.shapePointTolerance);
    const strokeCount = drawableStrokes.length;
    const disconnectedSegments = graph.components;
    const strokeBreaks = Math.max(0, strokeCount - 1) + (options.extraStrokeBreaks || 0);
    const crossings = countCrossings(segments, config);
    const overlaps = countOverlaps(drawableStrokes, config.overlapTolerance);
    const outlineRatio = totalDrawingLength / config.outerTargetLength;
    const outerOutlineCompletion = graph.completedShapes > 0
      ? clamp(outlineRatio, config.multiplierFloor, config.outlineCompletionMax)
      : clamp(outlineRatio * config.openOutlineFactor, config.multiplierFloor, config.maxOpenOutlineCompletion);
    const hasOuterOutline = outerOutlineCompletion >= config.outerShapeThreshold;
    const innerCompletedShapes = Math.max(0, graph.completedShapes - (hasOuterOutline ? 1 : 0));
    const penalizedBreaks = Math.max(0, strokeBreaks - innerCompletedShapes * config.breaksForgivenPerInnerShape);
    const effectiveness = clamp(
      config.effectivenessBase
        + innerCompletedShapes * config.innerShapeBonus
        - crossings * config.crossingPenalty
        - overlaps * config.overlapPenalty
        - penalizedBreaks * config.strokeBreakEffectPenalty,
      config.effectivenessMin,
      config.effectivenessMax
    );
    const strengthBonus = Math.min(config.maxStrengthBonus, totalDrawingLength * config.strengthPerLength);
    const value = Math.max(config.minimumValue, Math.round(base.effect * (config.strengthBase + strengthBonus) * effectiveness));
    const continuous = strokeCount === 1 && disconnectedSegments <= 1;
    const rawMana = base.cost
      + totalDrawingLength * config.manaPerLength
      + strokeCount * config.manaPerStroke
      + Math.max(0, disconnectedSegments - 1) * config.disconnectedSegmentCost
      + strokeBreaks * config.strokeBreakPenalty
      - outerOutlineCompletion * config.outerOutlineManaDiscount
      - (continuous ? config.continuousLineBonus : 0);
    const cost = Math.max(config.minimumManaCost, Math.round(rawMana));

    return {
      value,
      cost,
      effectiveness,
      metrics: {
        totalDrawingLength,
        strokeCount,
        disconnectedSegments,
        strokeBreaks,
        outerOutlineCompletion,
        completedShapes: graph.completedShapes,
        innerCompletedShapes,
        crossings,
        overlaps,
        continuous,
        dashed: Boolean(options.dashed)
      }
    };
  }

  return {
    addOrderPoint,
    analyzeDrawing,
    breakOrderPath,
    createOrderPoints,
    edgeKey,
    isContinuousPath,
    mirrorPointSet
  };
});
