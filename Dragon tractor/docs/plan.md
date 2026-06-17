# Dragon Contractor — Prototype Build Plan

## Reasoning for the Milestone Split

This prototype has two linked mechanics, not one generic combat loop:

1. **Contract forging**: the player chooses a Contract Type, draws a sigil, receives a dragon power, reviews the Contract Analysis, and saves the contract.
2. **Contract invocation**: the player equips saved contracts, receives short Call Names, then invokes those powers in a 60-second duel.

The milestone split follows that shape. Milestone 1 builds the Canvas-only shell and all screen layouts so the game can run and look like the intended product before logic is added. Milestone 2 proves the forging loop, because a Dragon Contract must exist before combat has meaning. Milestone 3 proves the battle mechanic: input becomes a Call Name, Call Name becomes a contract, and the contract affects HP, Energy, Buff, Curse, Heal, Vitality, cooldown, Resonance, and sigil feedback. Milestone 4 wraps the prototype into a complete playable match against AI with countdown, timer, win/lose/draw, restart, diagnostics, and deploy.

The final milestone is not a polish pass. It exists because the game is only shareable once the player can create or use saved contracts, equip them, fight an AI opponent, finish a full match, and restart or replay from a browser build.

---

## Milestone 1 — Canvas Shell, Config Foundation, and Screen Layouts

### Scope

Create the static foundation for **Dragon Contractor**. The game launches in a browser, creates a Canvas-only game surface, loads the centralized config, initializes the state machine, and renders the main screens as schematic but usable layouts: Contract Creation, Contract Analysis, Loadout Preparation, Combat, Guide overlay, Pause, and Result. No real contract forging or combat effects are live yet. The goal is to verify that the Canvas surface, robed Scroll Contractor visual direction, HUD placement, contract slots, drawing area, guide button, timer area, HP/Energy bars, and module boundaries are correct before gameplay logic is added.

All source organization, logging, diagnostics hooks, Canvas hit-region conventions, and config-driven layout values must follow `tdd.md` from the start.

### End-User Test Checklist

- Open the prototype in the browser and see a single Canvas-based game surface.
- Confirm the HTML page contains no visible gameplay UI outside the Canvas.
- Confirm Contract Creation screen shows Contract Type selector, drawing area, Guide button, Save/Redraw placeholders, and analysis panel placeholder.
- Confirm Loadout screen shows Contract Library placeholder, 4 battle slots, Call Name placeholders, Resonance label area, and Start Battle button placeholder.
- Confirm Combat screen shows player/enemy HP bars, Energy bars, timer area, Guide/Pause buttons, latest call text, and compact contract HUD like `[A] Ignivar 10`.
- Confirm the player visual reads as a robed Scroll Contractor holding a scroll.
- Confirm a faint saved-sigil placeholder can be displayed in the combat arena.
- Open Guide on each screen and confirm a context-appropriate overlay appears inside Canvas.
- Resize or reload the browser and confirm the layout remains coherent.
- Confirm basic diagnostics/logging can be toggled from config.
- Confirm automated tests and build checks pass.

### Prompt for Local AI Coding Agent

```text
Implement Milestone 1 for Dragon Contractor using gdd.md and tdd.md as the source of truth.

Scope: build the Canvas-only static foundation and config-driven screen layouts. The prototype should launch in the browser and render the major game screens: Contract Creation, Contract Analysis, Loadout Preparation, Combat, Guide overlay, Pause, and Result. Do not implement real contract creation, drawing analysis, contract invocation, AI, or match resolution yet.

Required visible layout:
- Contract Creation screen with Guide button, Contract Type selector, drawing area, and analysis placeholder.
- Contract Analysis placeholder using the intended layout: Dragon - Trait - Power, Contract Call, Effect, Cost, Cooldown, Why, Save Contract, Redraw.
- Loadout screen with Contract Library placeholder, 4 battle slots, Call Name placeholders, Resonance label area, and Start Battle placeholder.
- Combat screen with player/enemy HP bars, Energy bars, timer area, compact contract HUD, latest player call, latest AI action, Guide/Pause buttons, Scroll Contractor player visual, opponent placeholder, and saved-sigil highlight placeholder.
- Context-sensitive Guide overlays rendered inside Canvas.

Follow all tdd.md conventions strictly:
- Use one centralized config file, recommended as src/config.js.
- Put all tunable values, layout rectangles, colors, text labels, timings, and debug toggles in config.
- Add natural-language comments for every config key with recommended ranges.
- Maintain zero magic numbers in game loop, render, input, state, or UI files.
- Keep source files separated by responsibility.
- Render all visuals, buttons, overlays, hit regions, event handlers, and UI inside Canvas only. HTML is only a Canvas container.
- Add essential logs controlled by config.
- Add tests for config loading, initial state creation, state transitions, layout data, Canvas hit-region setup, and Guide overlay state.

Before reporting done:
1. Run the Milestone 1 end-user test checklist from plan.md.
2. Run automated tests.
3. Run the local compile/build check.
4. Verify the local dev server is running or start it.
5. If all checks pass, create a Git commit with a clear conventional message such as `feat: add canvas screen foundation`.
6. If any validation step is blocked, report exactly what is blocked and what I should run locally.
```

---

## Milestone 2 — Contract Forging, Drawing Analysis, Library, and Loadout

### Scope

Implement the full **contract creation and preparation loop** outside combat. The player chooses a Contract Type, draws a sigil, receives a Contract Analysis result, gets a dragon/trait/power, can reroll a one-word Contract Call, saves the contract to the library, then equips contracts into 4 battle slots. Duplicate saved contracts create Resonance. Different equipped contracts must have unique Call Names. This milestone proves the first half of the game: drawing a sigil creates a usable saved contract.

Combat can still be a static preview or disabled. The end state should be testable by creating several contracts, saving them, equipping them, seeing Call Names, and seeing Resonance when the same contract is equipped multiple times.

### End-User Test Checklist

- Choose each available Contract Type: Damage, Burst, Heal, Energy, Buff, Curse, and Vitality.
- Draw an intentional sigil and confirm a Contract Analysis result appears.
- Draw an empty or tiny accidental mark and confirm the game asks for Redraw.
- Confirm Contract Analysis shows Dragon - Trait - Power, Contract Call, Effect, Cost, Cooldown, and Why text.
- Confirm Contract Call is one word from the dragon name, trait, or power name where possible.
- Reroll the Contract Call and confirm it changes to a valid one-word option.
- Save a contract and confirm it appears in the Contract Library.
- Create at least three saved contracts and confirm each keeps its saved sigil and generated values.
- Equip contracts into 4 battle slots.
- Equip the same contract into multiple slots and confirm Resonance appears.
- Confirm duplicate slots share the same Call Name and represent one Resonant Contract.
- Equip different contracts that would conflict on Call Name and confirm the conflict is prevented or resolved.
- Confirm Vitality details show `+X Max HP`, not separate instant HP and temporary Max HP lines.
- Confirm Guide explains drawing, analysis, loadout, Call Names, and Resonance.
- Confirm tests and build checks pass.

### Prompt for Local AI Coding Agent

```text
Implement Milestone 2 for Dragon Contractor using gdd.md, tdd.md, and plan.md as the source of truth.

Scope: build the full contract forging and loadout-preparation loop. The player must be able to choose a Contract Type, draw a sigil, receive a Contract Analysis, reroll/select a one-word Contract Call, save the contract to the Contract Library, and equip saved contracts into 4 battle slots. Combat effects do not need to resolve yet.

Required Contract Types:
- Damage
- Burst
- Heal
- Energy
- Buff
- Curse
- Vitality

Required forging behavior:
- Drawing analyzer uses simple stroke metrics, not AI art recognition.
- Empty drawings fail and ask for Redraw.
- Poor but intentional drawings create Rough contracts.
- Drawing factors include Sharpness, Size, Completion, Stability, Stroke Energy, Complexity, Closure, and Symmetry.
- Analysis result shows Dragon - Trait - Power, Contract Call, Effect, Cost, Cooldown, and short Why text.
- Human-readable labels such as Low/Medium/High should be used instead of raw decimals unless debug overlay is enabled.
- Vitality player-facing effect shows only `+X Max HP`.

Required library/loadout behavior:
- Saved contracts persist in a Contract Library during the session.
- Each battle slot points to a saved contract.
- Recommended battle slots: 4.
- Each equipped unique contract has one unique Call Name.
- Same exact contract in multiple slots creates Resonance.
- Duplicate slots share Call Name and represent one Resonant Contract.
- Different equipped contracts cannot share the same Call Name.
- Reroll should prefer dragon name, trait word, or power-name words.

Follow all tdd.md conventions strictly:
- Use one centralized config file for every tunable value.
- Maintain zero magic numbers.
- Keep drawing analysis, contract factory, contract library, Call Name generation, Resonance, loadout, UI, and rendering decoupled.
- Render every UI element, drawing surface, button, guide overlay, and event handler inside Canvas only.
- Add logs for drawing start/end, drawing analysis, contract generated, contract saved, Call Name reroll, loadout changed, conflict resolution, and Resonance resolution.
- Add or update tests for drawing analyzer, empty drawing rejection, contract factory, Contract Type values, Vitality display rules, Call Name uniqueness, reroll rules, contract library, loadout assignment, and Resonance scaling.

Before reporting done:
1. Run the Milestone 2 end-user test checklist from plan.md.
2. Run automated tests.
3. Run the local compile/build check.
4. Verify the local dev server is running or start it.
5. If all checks pass, create a Git commit with a clear conventional message such as `feat: add contract forging and loadout`.
6. If any validation step is blocked, report exactly what is blocked and what I should run locally.
```

---

## Milestone 3 — Contract Invocation Combat Loop

### Scope

Implement the core battle mechanic end-to-end using equipped contracts. The player invokes contracts by short Call Name, slot tap, keyboard key, or Simple Call Mode. The input maps to an equipped contract, validates match state, Energy, and that contract's cooldown, then pays Energy, starts the per-contract cooldown, shows prepare/sigil feedback, and applies the contract effect. This milestone proves the main combat idea even if AI and full match result flow are still minimal.

The player should be able to enter a test battle with equipped contracts and use Damage, Burst, Heal, Energy, Buff, Curse, and Vitality against a dummy or basic opponent. HP, Energy, cooldowns, Resonance, Buff, Curse, Heal-over-time, Energy-over-time, Vitality, damage cap, latest call feedback, and failure reasons must be visible and testable.

### End-User Test Checklist

- Start a combat test using equipped contracts from the loadout.
- Say or trigger a Call Name and confirm the matching contract activates.
- Tap a slot and confirm it triggers the same invocation path as voice.
- Press a keyboard slot key and confirm it triggers the same invocation path.
- Use Simple Call Mode such as One, Two, Three, Four if enabled.
- Confirm full contract names are never required during combat.
- Use Damage and confirm enemy HP decreases.
- Use Burst and confirm stronger damage, capped by max single-hit damage.
- Use Heal and confirm HP restores over time up to current max HP.
- Use Energy and confirm Energy restores over time up to max Energy.
- Use Buff and confirm the next valid non-Buff contracts are stronger.
- Use Curse and confirm the target's next valid contract is weaker.
- Use Vitality and confirm HP and temporary max HP increase by the same amount, while details display only `+X Max HP`.
- Let Vitality expire and confirm HP clamps down if above base max HP.
- Equip duplicate contracts and confirm Resonance increases one invocation's effect and cost, not extra casts.
- Confirm duplicate slots share Call Name, cooldown, active state, and displayed state.
- Try to use a contract without enough Energy and confirm `Not Enough Energy` feedback.
- Try to reuse a contract during cooldown and confirm `Contract Cooldown` feedback.
- Confirm other ready contracts remain usable while one unique contract cools down.
- Confirm saved sigil highlight appears during prepare, flashes at activation, and fades.
- Confirm Guide in combat pauses and shows current Call Names.
- Confirm tests and build checks pass.

### Prompt for Local AI Coding Agent

```text
Implement Milestone 3 for Dragon Contractor using gdd.md, tdd.md, and plan.md as the source of truth.

Scope: build the contract invocation combat loop end-to-end. The player must be able to use equipped contracts in combat through short Call Names, Canvas slot taps, keyboard slot keys, and optional Simple Call Mode. This milestone should prove input → normalized Call Name/slot → equipped contract → validation → Energy payment → cooldown → prepare/sigil feedback → effect resolution.

Required combat rules:
- Current Contract Types are Damage, Burst, Heal, Energy, Buff, Curse, and Vitality.
- Guard and Block remain out of scope.
- Base Max HP is 200.
- Temporary Max HP cap is 300.
- Max Energy is 100.
- Match length target is 60s, but full win/loss flow may be completed in Milestone 4.
- Every unique contract has its own cooldown timer.
- All contracts use the same base cooldown duration by default.
- Using one contract only cools down that unique contract.
- Other ready contracts can still be invoked if Energy is available.
- Duplicate slots pointing to the same contract create Resonance and share Call Name, cooldown, active state, and invocation state.
- Resonance increases one invocation's effect and Energy cost with diminishing returns; it must not create extra casts.
- Damage must obey max single-hit damage cap.
- Heal restores HP over time up to current max HP.
- Energy restores Energy over time up to max Energy.
- Buff affects next valid non-Buff contracts and cannot buff Buff.
- Curse affects target's next valid contract and does not stack.
- Vitality grants equal instant HP and temporary Max HP, displays only `+X Max HP`, and clamps HP when it expires.

Required feedback:
- Compact HUD shows `[Marker] Call Name Energy Cost` for all contracts.
- Slot state shows Ready, Active/Preparing, or Cooldown.
- Latest player call and latest AI/dummy action display inside Canvas.
- Failure reasons include Unknown Call, Contract Cooldown, Not Enough Energy, Defeated, and Match Inactive.
- Saved sigil appears faintly during prepare, flashes on activation, then fades.
- Guide overlay pauses combat and shows current Call Names and input options.

Follow all tdd.md conventions strictly:
- Use centralized config for all numbers, text, colors, timings, layout, effects, caps, and toggles.
- Maintain zero magic numbers.
- Keep input, invocation validation, resources, cooldowns, effect resolution, Buff/Curse, Vitality, rendering, and state transitions decoupled.
- Render all UI, hit regions, buttons, overlays, characters, sigil effects, and event feedback inside Canvas only.
- Add logs for raw input, normalized Call Name, validation failure, Energy payment, cooldown start/end, prepare start/end, effect applied, Heal/Energy ticks, Buff/Curse consume/replace, Vitality apply/expire/clamp, Resonance resolution, and Guide open/close.
- Add or update tests for invocation success/failure, resource checks, per-contract cooldowns, duplicate cooldown sharing, different-contract cooldown separation, Resonance scaling, damage cap, Heal ticks, Energy ticks, Buff, Curse, Vitality, input mapping, and Canvas slot hit mapping.

Before reporting done:
1. Run the Milestone 3 end-user test checklist from plan.md.
2. Run automated tests.
3. Run the local compile/build check.
4. Verify the local dev server is running or start it.
5. If all checks pass, create a Git commit with a clear conventional message such as `feat: add contract invocation combat loop`.
6. If any validation step is blocked, report exactly what is blocked and what I should run locally.
```

---

## Milestone 4 — Complete AI Match, Result Flow, Restart, and Shareable Build

### Scope

Wrap the proven contract systems into a complete playable 1v1 vertical slice. Add the countdown, 60-second timer, AI loadout and AI decisions, defeat handling, timer win/loss/draw, result overlay, restart and return-to-loadout flow, final diagnostics, and GitHub Pages deployment. The player should be able to create or use saved contracts, equip a loadout, start a match, fight AI, finish the match, view result, restart, and share the browser build.

This milestone delivers the complete game loop, not generic polish.

### End-User Test Checklist

- Open the local or deployed build in a browser.
- Create or use saved contracts and equip a 4-slot loadout.
- Start a match and see a visible countdown.
- Confirm combat input is ignored or marked inactive during countdown.
- Play a full 60-second match against AI.
- Confirm AI uses contracts through the same rules as the player.
- Confirm AI respects Energy, per-contract cooldowns, Buff, Curse, Vitality, and defeat state.
- Confirm AI can use Damage, Burst, Heal, Energy, Buff, Curse, and Vitality if equipped/configured.
- Confirm match ends immediately when either side reaches 0 HP.
- Confirm simultaneous defeat creates Draw.
- Let timer reach 0 and confirm higher HP wins, equal HP draws.
- Confirm result overlay shows Win, Lose, or Draw.
- Confirm Restart resets HP, Energy, cooldowns, active effects, buffs, curses, Vitality, timer, latest calls, and result state.
- Confirm Return to Loadout preserves saved contracts and allows changing equipped slots.
- Confirm Guide works in Contract Creation, Loadout, Combat, and Result screens.
- Confirm all UI remains Canvas-only.
- Confirm deployed build or deployment instructions are available.
- Confirm tests and build checks pass.

### Prompt for Local AI Coding Agent

```text
Implement Milestone 4 for Dragon Contractor using gdd.md, tdd.md, and plan.md as the source of truth.

Scope: complete the playable vertical slice. Add countdown, 60-second match timer, AI loadout and decisions, full win/lose/draw rules, result overlay, restart, return-to-loadout flow, final diagnostics, and GitHub Pages deployment setup. The player should be able to create or use saved contracts, equip a loadout, fight AI, finish a full match, restart, and share the browser build.

Required match rules:
- Match length is 60 seconds.
- Base Max HP is 200.
- Temporary Max HP cap is 300.
- Max Energy is 100.
- HP cannot go below 0.
- Energy cannot go below 0 or above max.
- Defeat occurs at 0 HP.
- Simultaneous defeat is Draw.
- If time expires, higher HP wins.
- Equal HP at time expiry is Draw.
- Countdown must happen before the match becomes active.
- Combat input during Countdown or Result must be ignored or clearly marked inactive.

Required AI rules:
- AI uses the same contract system as the player.
- AI has an equipped loadout.
- AI respects Energy, per-contract cooldowns, active match state, and defeated state.
- AI attempts actions at configured intervals.
- AI may prefer Damage when safe, Heal when low, Energy when resource-starved, Buff before Burst, Curse before enemy Burst, and Vitality near defeat.
- AI behavior must be deterministic enough for tests; randomness must be seeded or injectable.

Required result/restart rules:
- Result overlay shows Win, Lose, or Draw.
- Restart resets HP, Energy, cooldowns, active prepare/effect timers, Buff, Curse, Vitality, timer, countdown, latest call text, AI state, and result state.
- Return to Loadout preserves saved contracts and allows changing battle slots.

Follow all tdd.md conventions strictly:
- Keep every gameplay, timing, AI, layout, color, deploy, and diagnostic value in centralized config where applicable.
- Maintain zero magic numbers.
- Keep AI, match rules, result flow, restart, rendering, input, diagnostics, and deployment setup decoupled.
- Render all UI, overlays, buttons, labels, characters, guide screens, and feedback inside Canvas only.
- Add logs for countdown, match start, AI decisions, match timer, result selection, restart, return to loadout, deployment diagnostics, build checks, and dev-server status.
- Add or update tests for countdown state, ignored input outside Match, AI legality, AI defeated behavior, timer win/loss/draw, simultaneous defeat draw, Vitality expiry during match end, restart reset, return-to-loadout preservation, and result selection.

Before reporting done:
1. Run the Milestone 4 end-user test checklist from plan.md.
2. Run automated tests.
3. Run the local compile/build check.
4. Verify the local dev server is running or start it.
5. Verify GitHub Pages deployment setup or report the exact deployment command I should run locally.
6. If all checks pass, create a Git commit with a clear conventional message such as `feat: complete playable ai match flow`.
7. If any validation step is blocked, report exactly what is blocked and what I should run locally.
```
