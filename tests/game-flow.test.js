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
  const context = {
    console,
    document: { getElementById: () => canvas },
    Math,
    performance: { now: () => 0 },
    requestAnimationFrame() {},
    window
  };
  vm.runInNewContext(source, context);
  return window.DragonContractor;
}

test("starts at Loadout", () => {
  const app = loadGame();
  assert.equal(app.game.screen, "loadout");
});

test("three weak default contracts exist", () => {
  const app = loadGame();
  assert.equal(app.game.library.length, 3);
  assert.ok(app.game.library.every((contract) => contract.isStarter));
  assert.ok(app.game.library.every((contract) => contract.value < app.CONFIG.base[contract.type].effect));
});

test("delete contract removes it from the library", () => {
  const app = loadGame();
  const id = app.game.library[1].id;
  assert.equal(app.deleteContract(id), true);
  assert.equal(app.game.library.some((contract) => contract.id === id), false);
});

test("deleting a selected contract clears stale selection and slots", () => {
  const app = loadGame();
  const id = app.game.library[0].id;
  app.equipContract(id);
  assert.equal(app.game.selectedContractId, id);
  app.deleteContract(id);
  assert.notEqual(app.game.selectedContractId, id);
  assert.equal(app.game.loadout.includes(id), false);
});

test("creating and saving a contract leads to Combat", () => {
  const app = loadGame();
  app.openCreateContract();
  app.game.analysis = {
    ...app.game.library[0],
    id: "created-contract",
    isStarter: false
  };
  app.saveContract();
  assert.equal(app.game.screen, "combat");
  assert.ok(app.game.library.some((contract) => contract.id === "created-contract"));
  assert.equal(app.game.selectedContractId, "created-contract");
  assert.ok(app.game.loadout.includes("created-contract"));
});

test("End Game returns to Loadout", () => {
  const app = loadGame();
  app.startCombat();
  app.game.combat.result = "Win";
  app.endGame();
  assert.equal(app.game.screen, "loadout");
  assert.equal(app.game.combat, null);
});
