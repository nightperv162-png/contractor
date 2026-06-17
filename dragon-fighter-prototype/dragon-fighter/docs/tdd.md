# Dragon Contractor - TDD

## Purpose

This Technical Design Document is the implementation guide for the Canvas-only Dragon Contractor prototype. The GDD owns player-facing design intent. This TDD owns architecture, code conventions, formulas, diagnostics, tests, build rules, and tunable configuration.

The current prototype has a working contract-preparation flow, countdown-to-active match loop, and player Dragon Contract combat. Contracts validate, spend energy when needed, start contract cooldowns, apply dragon-power effects, update combat feedback, and can end the match. The AI remains a stationary dummy until the next milestone.

## Hard Rules

- Canvas-only UI: no DOM gameplay widgets.
- Zero magic numbers in logic or rendering.
- All tunables live in `src/config.js`.
- Input normalizes raw voice, keyboard, and pointer events into contract slot indexes or dragon names.
- Input never directly applies damage, mitigation, cooldowns, or match results.
- Combat resolves from `contract.powerType`.
- Rendering only reads state and config.
- Logic must be testable through Node tests without Canvas or browser APIs.
- Keep edits incremental and scoped.
- Add comments only where they clarify non-obvious logic.
- Run tests and build before reporting complete.
- Commit after a complete implementation turn when requested by the active plan or user.

## Runtime Architecture

```text
src/
  main.js                  boot, Canvas setup, loop/input/render wiring
  config.js                centralized constants, text, layout, contracts
  ai/                      AI contract selection helpers
  combat/                  validation, cooldowns, damage, match rules
  core/                    state creation, reset, state machine, loop, logging
  input/                   keyboard, pointer, and voice normalization
  render/                  Canvas drawing only
  spells/                  legacy internal preparation helpers for patterns/names
  states/                  preparation and match state updates
  ui/                      Canvas layout rectangles and hitboxes
test/                      Node logic tests
```

The `spells/` folder name is legacy internal structure. Player-facing UI and docs should use Dragon Contract language.

## Central Contract Config

All prototype contract definitions live in `CONFIG.dragonContracts.definitions`.

- `id`: stable internal contract id.
- `dragonName`: player-facing call name.
- `powerType`: behavior key used by combat.
- `powerName`: short player-facing power label.
- `damage`: fixed damage for damage powers.
- `durationSeconds`: timed mitigation duration.
- `damageMultiplier`: incoming damage multiplier for mitigation powers.
- `cooldownSeconds`: base contract cooldown.
- `energyCost`: current energy cost.

Required prototype roster:

- Ignivar: Attack, 10 damage, 2-second cooldown.
- Aegon: Defence, 50% incoming damage for 3 seconds, 6-second cooldown.
- Bront: Block, prevents all incoming damage for 1 second, 5-second cooldown.
- Voltaris: Skill, 25 damage, 10-second cooldown.

## Combat Rules

- Active match duration: 60 seconds.
- Starting HP: 100 for each side.
- HP clamps at 0.
- Energy regenerates at 1 per second and displays as an integer.
- Block prevents all incoming damage and takes priority over Defence.
- Defence multiplies incoming damage by its active contract multiplier.
- Contract cooldowns tick down every active frame and clamp at 0.
- Actors cannot invoke contracts when defeated.
- Inputs outside active match fail with Match Inactive.
- Unknown dragon-name calls fail with Unknown Dragon.
- Cooldown failures show Contract Cooldown.
- Result flow remains Win, Lose, or Draw.

## Input Mapping

- Voice: normalize transcript, compare against prepared `dragonName`.
- Keyboard: keys `1-4` map to contract slots.
- Pointer: Canvas contract buttons map to contract slots.
- Latest recognized player call displays the dragon name, not the effect sentence.
- Failure feedback uses player-facing reasons from config.

## Rendering Rules

- The player-facing title is Dragon Contractor.
- UI uses contract, dragon name, dragon power, invoke, call, and summon language.
- Match contract buttons show dragon name, power label, energy cost, and cooldown state.
- Preparation slots show dragon name and power preview.
- No spell-focused language should be introduced in new player-facing UI.

## Tests

Logic tests must cover:

- Dragon-name voice mapping.
- Unknown Dragon rejection.
- Contract cooldown rejection.
- Ignivar damage behavior.
- Aegon defence behavior.
- Bront block behavior and Block-over-Defence priority.
- Voltaris damage behavior.
- Energy regeneration and integer display configuration.
- HP clamp, match timer, result flow, and defeated actor guard.
- AI direct helpers respecting cooldowns and defeated state.

## Verification Checklist

- `npm test`
- `npm run build`
- Start the dev server.
- Open the local URL.
- Confirm preparation screen uses Dragon Contractor and contract language.
- Confirm active match buttons show Ignivar, Aegon, Bront, and Voltaris.
- Invoke each contract by button or key and verify HP/effect/cooldown behavior.
- Verify voice input accepts dragon names when the browser supports speech recognition.
