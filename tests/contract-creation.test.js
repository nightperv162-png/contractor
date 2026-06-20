const assert = require("node:assert/strict");
const fs = require("node:fs");
const test = require("node:test");
const vm = require("node:vm");

function loadGame() {
  const html = fs.readFileSync("index.html", "utf8");
  const source = html.match(/<script>([\s\S]*?)<\/script>/)[1];
  const context2d = new Proxy({}, {
    get(target, property) {
      if (property === "createLinearGradient") return () => ({ addColorStop() {} });
      if (!(property in target)) target[property] = () => {};
      return target[property];
    },
    set(target, property, value) {
      target[property] = value;
      return true;
    }
  });
  const canvas = {
    addEventListener() {},
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 1280, height: 720 }),
    getContext: () => context2d,
    style: {}
  };
  const window = {
    addEventListener() {},
    innerHeight: 720,
    innerWidth: 1280
  };
  vm.runInNewContext(source, {
    console,
    document: { getElementById: () => canvas },
    Math,
    performance: { now: () => 0 },
    requestAnimationFrame() {},
    window
  });
  return window.DragonContractor;
}

function analyzer(app, strokes, options = {}) {
  return app.Creation.analyzeDrawing(
    strokes,
    app.CONFIG.base.Damage,
    analysisConfig(app),
    options
  );
}

function analysisConfig(app) {
  return {
    ...app.CONFIG.creation.analysis,
    ...app.CONFIG.creation.drawingRules,
    occupiedAreaReference: app.CONFIG.creation.balance.occupiedAreaReference,
    areaEffectBonusMax: app.CONFIG.creation.balance.areaEffectBonusMax,
    areaEnergyCostMax: app.CONFIG.creation.balance.areaEnergyCostMax
  };
}

function orderState() {
  return { strokes: [], edges: new Set(), currentStrokeIndex: null, lastPointIndex: null };
}

test("mode selection works", () => {
  const app = loadGame();
  assert.equal(app.selectCreationMode("order", () => 0), true);
  assert.equal(app.game.creationMode, "order");
  assert.equal(app.game.strokes.length, 0);
});

test("Chaos assigns a random contract type only when analysis runs", () => {
  const app = loadGame();
  app.game.screen = "create";
  app.selectCreationMode("chaos", () => 0.999);
  assert.equal(app.game.selectedType, null);
  app.game.strokes = [[{ x: 300, y: 430 }, { x: 340, y: 450 }]];
  app.makeAnalysis(() => 0.999);
  assert.equal(app.game.selectedType, app.CONFIG.types.at(-1));
  assert.equal(app.game.analysis.type, app.CONFIG.types.at(-1));
});

test("Order prevents duplicate reversed edges", () => {
  const app = loadGame();
  const Creation = app.Creation;
  const points = Creation.createOrderPoints(app.CONFIG.creation.order, app.CONFIG.types, () => 0);
  const state = orderState();
  Creation.addOrderPoint(state, 0, points);
  assert.equal(Creation.addOrderPoint(state, 1, points).accepted, true);
  Creation.breakOrderPath(state);
  Creation.addOrderPoint(state, 1, points);
  assert.equal(Creation.addOrderPoint(state, 0, points).accepted, false);
});

test("Order validates continuous paths", () => {
  const app = loadGame();
  const Creation = app.Creation;
  const points = Creation.createOrderPoints(app.CONFIG.creation.order, app.CONFIG.types, () => 0);
  const state = orderState();
  Creation.addOrderPoint(state, 0, points);
  Creation.addOrderPoint(state, 1, points);
  Creation.addOrderPoint(state, 2, points);
  assert.equal(Creation.isContinuousPath(state.strokes), true);
  Creation.breakOrderPath(state);
  Creation.addOrderPoint(state, 4, points);
  Creation.addOrderPoint(state, 5, points);
  assert.equal(Creation.isContinuousPath(state.strokes), false);
});

test("Order first point sets type and starts the drawing path", () => {
  const app = loadGame();
  app.selectCreationMode("order", () => 0);
  assert.equal(app.game.selectedType, null);
  const firstPoint = app.game.orderPoints[3];
  app.selectOrderPoint(3);
  assert.equal(app.game.selectedType, firstPoint.type);
  assert.equal(app.game.strokes[0][0].orderIndex, firstPoint.index);
  assert.equal(app.game.strokes[0][0].x, firstPoint.x);
  assert.equal(app.game.strokes[0][0].y, firstPoint.y);
});

test("Balance produces mirrored drawing data", () => {
  const app = loadGame();
  app.selectCreationMode("balance");
  app.game.selectedType = "Damage";
  const center = app.CONFIG.creation.balance.center;
  app.beginCreationStroke({ x: center.x + 40, y: center.y + 20 });
  app.continueCreationStroke({ x: center.x + 60, y: center.y + 30 });
  app.endCreationStroke();
  assert.equal(app.game.strokes.length, 2);
  assert.equal(app.game.strokes[0][0].x, app.game.strokes[1][0].x);
  assert.equal(app.game.strokes[0][0].y + app.game.strokes[1][0].y, center.y * 2);
});

test("Balance no longer uses line length as its main energy driver", () => {
  const app = loadGame();
  const short = analyzer(app, [[{ x: 0, y: 0 }, { x: 100, y: 100 }]], { mode: "balance" });
  const long = analyzer(app, [[{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 0, y: 100 }, { x: 100, y: 100 }]], { mode: "balance" });
  assert.ok(long.metrics.totalDrawingLength > short.metrics.totalDrawingLength);
  assert.equal(long.metrics.occupiedArea, short.metrics.occupiedArea);
  assert.equal(long.value, short.value);
  assert.ok(long.cost <= short.cost);
});

test("Balance effect and energy increase with occupied area", () => {
  const app = loadGame();
  const small = analyzer(app, [[{ x: 0, y: 0 }, { x: 20, y: 20 }]], { mode: "balance" });
  const large = analyzer(app, [[{ x: 0, y: 0 }, { x: 180, y: 180 }]], { mode: "balance" });
  assert.ok(large.metrics.occupiedArea > small.metrics.occupiedArea);
  assert.ok(large.value > small.value);
  assert.ok(large.cost > small.cost);
});

test("dash-line mode and rules are removed", () => {
  const source = fs.readFileSync("index.html", "utf8");
  assert.doesNotMatch(source, /dashedDrawing|dashPattern|Dashed On|Dashed Off/i);
});

test("broken paths still work", () => {
  const app = loadGame();
  const result = analyzer(app, [[{ x: 0, y: 0 }, { x: 60, y: 0 }], [{ x: 120, y: 0 }, { x: 180, y: 0 }]]);
  assert.equal(result.metrics.disconnectedSegments, 2);
  assert.ok(result.value > 0);
});

test("more drawing increases strength and energy cost outside Balance", () => {
  const app = loadGame();
  const short = analyzer(app, [[{ x: 0, y: 0 }, { x: 80, y: 0 }]]);
  const long = analyzer(app, [[{ x: 0, y: 0 }, { x: 300, y: 0 }]]);
  assert.ok(long.value > short.value);
  assert.ok(long.cost > short.cost);
});

test("energy cost is capped by configured global max", () => {
  const app = loadGame();
  const result = analyzer(app, [[{ x: 0, y: 0 }, { x: 10000, y: 0 }]], { coreLineCount: 8 });
  assert.equal(app.CONFIG.creation.analysis.maxEnergyCost, 60);
  assert.equal(result.cost, app.CONFIG.creation.analysis.maxEnergyCost);
});

test("global effect boost adds 20 percent after effectiveness", () => {
  const app = loadGame();
  const strokes = [[{ x: 0, y: 0 }, { x: 100, y: 0 }]];
  const config = analysisConfig(app);
  const result = app.Creation.analyzeDrawing(strokes, app.CONFIG.base.Damage, config);
  const strengthBonus = Math.min(config.maxStrengthBonus, result.metrics.totalDrawingLength * config.strengthPerLength);
  const expected = Math.round(app.CONFIG.base.Damage.effect * (config.strengthBase + strengthBonus) * result.effectiveness * config.globalEffectBoost);
  assert.equal(config.globalEffectBoost, 1.2);
  assert.ok(result.effectiveness >= config.effectivenessMin && result.effectiveness <= config.effectivenessMax);
  assert.equal(result.value, expected);
});

test("each Core Line multiplies effect by x1.05", () => {
  const app = loadGame();
  const strokes = [[{ x: 0, y: 0 }, { x: 100, y: 50 }]];
  const base = analyzer(app, strokes, { coreLineCount: 0 });
  const core = analyzer(app, strokes, { coreLineCount: 1 });
  assert.equal(app.CONFIG.creation.drawingRules.coreLineEffectMultiplier, 1.05);
  assert.ok(Math.abs(core.effectMultiplier / base.effectMultiplier - 1.05) < 0.000001);
});

test("each Core Line multiplies energy by x1.1 before the cap", () => {
  const app = loadGame();
  const strokes = [[{ x: 0, y: 0 }, { x: 100, y: 50 }]];
  const base = analyzer(app, strokes, { coreLineCount: 0 });
  const core = analyzer(app, strokes, { coreLineCount: 1 });
  assert.equal(app.CONFIG.creation.drawingRules.coreLineEnergyMultiplier, 1.1);
  assert.ok(Math.abs(core.metrics.uncappedEnergyCost / base.metrics.uncappedEnergyCost - 1.1) < 0.000001);
});

test("more strokes increase energy cost", () => {
  const app = loadGame();
  const oneStroke = analyzer(app, [[{ x: 0, y: 0 }, { x: 100, y: 0 }]]);
  const twoStrokes = analyzer(app, [[{ x: 0, y: 0 }, { x: 50, y: 0 }], [{ x: 50, y: 0 }, { x: 100, y: 0 }]]);
  assert.ok(twoStrokes.cost > oneStroke.cost);
});

test("more stroke breaks increase energy cost", () => {
  const app = loadGame();
  const base = analyzer(app, [[{ x: 0, y: 0 }, { x: 100, y: 0 }]], { extraStrokeBreaks: 0 });
  const broken = analyzer(app, [[{ x: 0, y: 0 }, { x: 100, y: 0 }]], { extraStrokeBreaks: 3 });
  assert.ok(broken.cost > base.cost);
});

test("one continuous path costs less than disconnected strokes of similar length", () => {
  const app = loadGame();
  const continuous = analyzer(app, [[{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 200, y: 0 }]]);
  const disconnected = analyzer(app, [[{ x: 0, y: 0 }, { x: 100, y: 0 }], [{ x: 300, y: 0 }, { x: 400, y: 0 }]]);
  assert.ok(continuous.cost < disconnected.cost);
});

test("disconnected strokes can form completed shapes", () => {
  const app = loadGame();
  const triangle = analyzer(app, [
    [{ x: 0, y: 0 }, { x: 100, y: 0 }],
    [{ x: 100, y: 0 }, { x: 50, y: 80 }],
    [{ x: 50, y: 80 }, { x: 0, y: 0 }]
  ]);
  assert.ok(triangle.metrics.completedShapes >= 1);
});

test("a more complete outer outline lowers energy cost", () => {
  const app = loadGame();
  const complete = analyzer(app, [[{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 100 }, { x: 0, y: 100 }, { x: 0, y: 0 }]]);
  const open = analyzer(app, [[{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 200, y: 0 }, { x: 300, y: 0 }, { x: 400, y: 0 }]]);
  assert.ok(complete.metrics.outerOutlineCompletion > open.metrics.outerOutlineCompletion);
  assert.ok(complete.cost < open.cost);
});

test("crossings and overlaps reduce effectiveness", () => {
  const app = loadGame();
  const clean = analyzer(app, [[{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 200, y: 0 }]]);
  const tangled = analyzer(app, [[{ x: 0, y: 0 }, { x: 100, y: 100 }, { x: 0, y: 100 }, { x: 100, y: 0 }, { x: 0, y: 0 }]]);
  assert.ok(tangled.metrics.crossings > 0);
  assert.ok(tangled.metrics.overlaps > 0);
  assert.ok(tangled.effectiveness < clean.effectiveness);
});

test("small completed inner shapes increase effectiveness", () => {
  const app = loadGame();
  const outer = [{ x: 0, y: 0 }, { x: 150, y: 0 }, { x: 150, y: 150 }, { x: 0, y: 150 }, { x: 0, y: 0 }];
  const baseline = analyzer(app, [outer]);
  const withInner = analyzer(app, [outer, [{ x: 50, y: 50 }, { x: 80, y: 50 }, { x: 65, y: 75 }, { x: 50, y: 50 }]]);
  assert.ok(withInner.metrics.innerCompletedShapes > baseline.metrics.innerCompletedShapes);
  assert.ok(withInner.effectiveness > baseline.effectiveness);
});

test("all modes use the shared analysis helper", () => {
  const app = loadGame();
  const strokes = [[{ x: 300, y: 430 }, { x: 330, y: 450 }, { x: 350, y: 430 }]];
  const lengths = [];
  app.game.screen = "create";
  for (const mode of ["chaos", "order", "balance"]) {
    app.selectCreationMode(mode, () => 0);
    app.game.selectedType = "Damage";
    app.game.strokes = strokes;
    app.game.orderState.strokes = app.game.strokes;
    lengths.push(app.analyzeCurrentDrawing().metrics.totalDrawingLength);
  }
  assert.deepEqual(lengths, [lengths[0], lengths[0], lengths[0]]);
  assert.match(app.analyzeCurrentDrawing.toString(), /Creation\.analyzeDrawing/);
});

test("all creation modes render on the Canvas surface", () => {
  const app = loadGame();
  app.game.screen = "create";
  for (const mode of ["chaos", "order", "balance"]) {
    app.selectCreationMode(mode, () => 0);
    assert.doesNotThrow(() => app.draw());
  }
});
