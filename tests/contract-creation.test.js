const assert = require("node:assert/strict");
const fs = require("node:fs");
const test = require("node:test");
const vm = require("node:vm");

const ContractCreation = require("../src/contract-creation.js");

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
    ContractCreation,
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
  return ContractCreation.analyzeDrawing(
    strokes,
    app.CONFIG.base.Damage,
    { ...app.CONFIG.creation.analysis, ...app.CONFIG.creation.drawingRules },
    options
  );
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

test("Chaos assigns a random contract type", () => {
  const app = loadGame();
  app.selectCreationMode("chaos", () => 0.999);
  assert.equal(app.game.selectedType, app.CONFIG.types.at(-1));
});

test("Order prevents duplicate reversed edges", () => {
  const app = loadGame();
  const points = ContractCreation.createOrderPoints(app.CONFIG.creation.order, app.CONFIG.types, () => 0);
  const state = orderState();
  ContractCreation.addOrderPoint(state, 0, points);
  assert.equal(ContractCreation.addOrderPoint(state, 1, points).accepted, true);
  ContractCreation.breakOrderPath(state);
  ContractCreation.addOrderPoint(state, 1, points);
  assert.equal(ContractCreation.addOrderPoint(state, 0, points).accepted, false);
});

test("Order validates continuous paths", () => {
  const app = loadGame();
  const points = ContractCreation.createOrderPoints(app.CONFIG.creation.order, app.CONFIG.types, () => 0);
  const state = orderState();
  ContractCreation.addOrderPoint(state, 0, points);
  ContractCreation.addOrderPoint(state, 1, points);
  ContractCreation.addOrderPoint(state, 2, points);
  assert.equal(ContractCreation.isContinuousPath(state.strokes), true);
  ContractCreation.breakOrderPath(state);
  ContractCreation.addOrderPoint(state, 4, points);
  ContractCreation.addOrderPoint(state, 5, points);
  assert.equal(ContractCreation.isContinuousPath(state.strokes), false);
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

test("dashed and disconnected drawing is accepted", () => {
  const app = loadGame();
  const result = analyzer(app, [[{ x: 0, y: 0 }, { x: 60, y: 0 }], [{ x: 120, y: 0 }, { x: 180, y: 0 }]], { dashed: true });
  assert.equal(result.metrics.dashed, true);
  assert.equal(result.metrics.disconnectedSegments, 2);
  assert.ok(result.value > 0);
});

test("more drawing increases strength and mana cost", () => {
  const app = loadGame();
  const short = analyzer(app, [[{ x: 0, y: 0 }, { x: 80, y: 0 }]]);
  const long = analyzer(app, [[{ x: 0, y: 0 }, { x: 300, y: 0 }]]);
  assert.ok(long.value > short.value);
  assert.ok(long.cost > short.cost);
});

test("more strokes increase mana cost", () => {
  const app = loadGame();
  const oneStroke = analyzer(app, [[{ x: 0, y: 0 }, { x: 100, y: 0 }]]);
  const twoStrokes = analyzer(app, [[{ x: 0, y: 0 }, { x: 50, y: 0 }], [{ x: 50, y: 0 }, { x: 100, y: 0 }]]);
  assert.ok(twoStrokes.cost > oneStroke.cost);
});

test("more stroke breaks increase mana cost", () => {
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

test("a more complete outer outline lowers mana cost", () => {
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
