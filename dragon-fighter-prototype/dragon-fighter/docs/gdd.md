# Dragon Contractor - GDD

## Current Vision

Dragon Contractor is a Canvas-only casual 1v1 dragon duel prototype. The player creates Dragon Contracts, then calls a dragon name during battle to invoke that dragon's power. It should feel easy to read, a little funny, and fast enough that yelling "Ignivar!" at a browser feels like a reasonable life choice.

The player is not directly casting magic. Each contract binds one dragon name to one combat power.

## Design Pillars

- Voice first, not voice only: spoken dragon names are the fantasy, with keyboard and Canvas fallback controls for testing.
- Contracts create identity: each contract has a dragon name, dragon power, energy cost, contract cooldown, and combat behavior.
- Funny and immediate: invoking a contract should produce readable dragon feedback, effects, labels, cooldowns, and HP/energy changes.
- Combat decisions over movement: the player wins by choosing which dragon to call, not by steering or aiming.
- Small readable system: four prototype contracts, clear HP, integer energy, contract cooldowns, feedback, and result state.

## Prototype Contracts

- Ignivar: Attack behavior, 10 damage, 2-second contract cooldown.
- Aegon: Defence behavior, 50% incoming damage for 3 seconds, 6-second contract cooldown.
- Bront: Block behavior, prevents all incoming damage for 1 second, 5-second contract cooldown.
- Voltaris: Skill behavior, 25 damage, 10-second contract cooldown.

## What Is Built Now

- Canvas-only app shell with the player-facing title Dragon Contractor.
- Preparation screen with 9-dot contract sigil drawing.
- Random valid pattern generation.
- Dragon power selection: Attack, Defence, Block, Skill.
- Dragon name editing and cycling.
- Contract preview with weight, energy cost, piercing, secondary effect, closed bonus, and instability data.
- Four contract slots with duplicate and too-similar dragon name rejection, slot selection, and contract deletion for refilling a slot.
- Loadout confirmation into countdown, then active match.
- Match screen with dragons, player panels, HP/integer energy display, state labels, latest called dragon, contract buttons, and microphone status.
- Player contract invocation through voice, keyboard slots, and Canvas buttons.
- Required contract powers applied to the live match.
- Contract cooldown countdowns, energy regeneration, hit text, defence/block aura, projectile effects, and result overlay.

## Current Limitations

- The AI remains a stationary dummy during the current player-combat milestone.
- Full AI contract selection is planned for the next milestone.

## Target Combat Rules

- Combat is controlled by Dragon Contracts only.
- Voice input uses full dragon names.
- Button and keyboard input invoke contract slots.
- Contracts require enough energy, must be off contract cooldown, and only work during active match state.
- Failed recognition costs no energy and applies retry delay.
- Failure feedback should say Unknown Dragon, Contract Cooldown, Defeated, or Match Inactive where relevant.
- Damage priority is Block, then Defence, then shield/pierce fallback behavior, then HP.
- Exact combat values, formulas, config keys, and implementation rules live in `tdd.md`.

## Target Match Flow

1. Player creates or edits Dragon Contracts.
2. Player confirms the contract loadout.
3. Match starts after countdown.
4. Player calls dragon names to invoke powers.
5. HP, energy, contract cooldowns, effects, labels, and feedback update.
6. Match ends when a side reaches 0 HP or time expires.
7. Result shows Win, Lose, or Draw.

## Non-Goals

- No online multiplayer.
- No progression, rarity, collection, economy, or accounts.
- No public release using unlicensed dragon assets.
- No advanced movement, advanced combos, leaderboard, monetization, or story campaign.
