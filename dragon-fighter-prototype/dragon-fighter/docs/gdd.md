# Dragon Fighter: Egg Spell Forge - GDD

## Current Vision

Dragon Fighter: Egg Spell Forge is a Canvas-only casual 1v1 dragon duel prototype. The player prepares five custom dragon-egg spells, then uses those prepared spells as the main combat skills.

The current design direction is spell-first combat. Prepared spell names, spell buttons, and spell-slot keys are the only combat input model.

## Design Pillars

- Voice first, not voice only: spoken spell names are the fantasy, with keyboard and Canvas fallback controls for testing.
- Spellcraft creates identity: each spell has a pattern, type, name, energy cost, and combat effect.
- Funny and immediate: casting should produce readable dragon feedback, effects, labels, cooldowns, and HP/energy changes.
- Combat decisions over movement: the player wins by choosing spells well, not by steering or aiming precisely.
- Small readable system: five prepared spells, clear HP, energy, cooldowns, feedback, and result state.

## What Is Built Now

- Canvas-only app shell.
- Preparation screen with 9-dot egg pattern drawing.
- Random valid pattern generation.
- Spell type selection: Attack, Defense, Support, Control, Utility.
- Spell name editing and cycling.
- Type-specific effect preview with weight, energy cost, piercing, secondary effect, closed bonus, and instability.
- Five spell slots with duplicate and too-similar name rejection, slot selection, and spell deletion for refilling a slot.
- Loadout confirmation into countdown, then active match.
- Match screen with dragons, player panels, HP/energy display, state labels, latest feedback, spell buttons, and microphone status.
- Combat spell buttons show each spell's energy cost and cooldown state.
- Player spell casting through voice, keyboard slots, and Canvas spell buttons.
- Attack, Defense, Support, Control, and Utility effects applied to the live match.
- Cooldown countdowns, energy regeneration, hit text, shield aura, projectile effects, and result overlay.

## Current Limitations

- The AI is a stationary dummy for the player-combat milestone and does not cast back yet.
- AI spell casting and tactical decision-making are planned for the next milestone.

## Spell Preparation Rules

Each player brings exactly five prepared spells into combat. A spell has:

- Spell name in `Element Move` form, such as `Light Slash`.
- Element identity from the first word of the spell name.
- Spell type: Attack, Defense, Support, Control, Utility.
- 9-dot pattern.
- Weight band.
- Energy cost.
- Effect preview.
- Cooldown data for the future combat phase.

Pattern complexity influences spell weight, energy cost, piercing, secondary effects, closed-pattern bonuses, and future misfire risk. Exact formulas and thresholds live in `tdd.md`.

## Spell Type Effects

- Attack: damage by weight, with closed-pattern bonus damage.
- Defense: shield value by weight, with closed-pattern bonus shield.
- Support: healing by weight, with closed-pattern bonus healing.
- Control: slow duration by weight, with closed-pattern bonus duration.
- Utility: energy-regen utility duration by weight, with closed-pattern bonus duration.

## Target Combat Rules

- Combat should be controlled by prepared spells only.
- Voice casting uses full prepared spell names.
- Button casting uses the Canvas spell buttons.
- Spells require enough energy, must be off cooldown, and only work during active match state.
- Voice casts use normal spell cooldown.
- Button casts use longer cooldown.
- Failed voice recognition costs no energy and applies retry delay.
- Damage priority is spell shield with piercing, then HP.
- Exact combat values, formulas, config keys, and implementation rules live in `tdd.md`.

## Target Match Flow

1. Player creates or randomizes five spells.
2. Player confirms the loadout.
3. Match starts after countdown.
4. Player and AI cast prepared spells.
5. HP, energy, cooldowns, effects, labels, and feedback update.
6. Match ends when a side reaches 0 HP or time expires.
7. Result shows Win, Lose, or Draw.

## Non-Goals

- No online multiplayer.
- No progression, rarity, collection, economy, or accounts.
- No public release using unlicensed dragon assets.
- No advanced movement, advanced combos, leaderboard, monetization, or story campaign.
