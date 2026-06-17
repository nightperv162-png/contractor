# Dragon Contractor - Build Plan

## Milestone Strategy

The core mechanic is Dragon Contract invocation. The player creates contracts with dragons, then calls a dragon name to invoke one dragon power. Victory comes from timing contract calls, managing contract cooldowns, and reading the battle state.

**Milestone 1 (Combat Foundation)** built the testable match state, HP, energy, cooldown, damage, state machine, layout, and diagnostics foundation.

**Milestone 2 (Player Contract Combat)** makes the player-side contract loop playable. The player invokes contracts via voice, keyboard, or Canvas buttons. Each invocation validates, starts contract cooldown, applies the dragon power, updates feedback, and can end the match. The AI remains a stationary dummy.

**Milestone 3 (AI Contracts & Match Completion)** will let the AI invoke contracts with the same rules, finish the result/restart loop, and make the duel complete.

## Current Prototype Contracts

- Ignivar: Attack behavior, 10 damage, 2-second contract cooldown.
- Aegon: Defence behavior, 50% incoming damage for 3 seconds, 6-second contract cooldown.
- Bront: Block behavior, prevents all incoming damage for 1 second, 5-second contract cooldown.
- Voltaris: Skill behavior, 25 damage, 10-second contract cooldown.

## Milestone 2 Acceptance Checklist

- [x] Player-facing title is Dragon Contractor.
- [x] Contract definitions live in centralized config.
- [x] UI shows dragon names instead of action command words.
- [x] Voice input maps dragon-name calls to contracts.
- [x] Keyboard and pointer input map to contract slots.
- [x] Input does not directly apply combat effects.
- [x] Combat executes from `contract.powerType`.
- [x] Latest recognized call displays the called dragon name.
- [x] Failure feedback uses Unknown Dragon, Contract Cooldown, Defeated, or Match Inactive where relevant.
- [x] Contract buttons show energy cost and contract cooldown state.
- [x] Energy display uses integer formatting.
- [x] Tests cover dragon-name mapping, unknown dragon rejection, contract cooldowns, and required power effects.
- [x] Match rules remain 60 seconds, 100 HP each, HP clamp at 0, Win/Lose/Draw result flow.

## Milestone 3 Scope

- AI invokes contracts automatically during active match.
- AI follows energy, contract cooldowns, defeated-state guards, and the same combat resolver.
- AI latest feedback displays dragon name and effect.
- Result screen remains Win, Lose, or Draw.
- Restart returns to preparation and preserves the ability to edit contracts.
- Tests cover AI contract selection, AI invocation, defeat handling, result flow, and restart.

## Final Verification Per Turn

- Run `npm test`.
- Run `npm run build`.
- Start `npm run dev`.
- Open the local URL and smoke-test the Canvas.
- Commit completed work when the active request requires commit-after-turn.
