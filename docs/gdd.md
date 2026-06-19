# Dragon Contractor — Prototype GDD

## Pitch

**Dragon Contractor** is a casual 1v1 dragon-power duel where the player forges Dragon Contracts by drawing sigils, equips saved contracts before battle, then invokes them with short Call Names.

A contract is **not** the dragon. A contract is access to one power from a dragon.

```text
Draw sigil → forge contract → save contract → equip contract → get Call Name → call power in combat
```

## Design Pillars

### 1. Short Calls, Fast Combat
The player never says a full contract name in combat. Each equipped contract has a short **Call Name**.

### 2. Contract Type, Not Spell Type
The old spell-type mechanic becomes **Contract Type**. Contract Type decides the base effect.

### 3. Drawing Forges the Contract
Drawing affects grade, trait, bonus strength, and visual style. Poor drawings still create usable contracts unless empty.

### 4. Aggressive Combat
The current prototype removes Guard and Block. Survival comes from Heal, Energy, Curse, Vitality, and ending the fight quickly.

### 5. Voice First, Not Voice Only
Voice is the fantasy. Tapping slots, keyboard keys, and simple call mode must trigger the same contract path.

## Core Objects

### Dragon
A dragon is the source of a power.

### Dragon Power
The actual combat effect granted through a contract.

### Dragon Contract
A saved access link to one dragon power.

Each contract contains:

- **Dragon Name**: source of the power.
- **Power Name**: fantasy effect name.
- **Full Contract Name**: readable name, such as `Ignivar's Flame Bite`.
- **Call Name**: short combat trigger.
- **Contract Type**: mechanical category.
- **Grade**: Rough, Stable, Strong, or Perfect.
- **Trait**: dragon-style modifier.
- **Effect Values**: damage, healing, energy gain, duration, cost, or max HP value.
- **Saved Sigil**: the player-drawn contract mark.
- **Cooldown State**: tracked per unique contract.

### Call Name
A short word used to invoke a contract during combat.

Rules:

- Generated when contracts are equipped for combat.
- Different equipped contracts cannot share the same Call Name.
- The same exact contract in multiple slots shares one Call Name.
- Player can reroll or edit Call Names before combat.
- Combat listens for Call Names, not full contract names.
- Call Name should be one word from the contract when possible: dragon name, trait, or power word.

Example:

```text
Full Contract: Ignivar's Flame Bite
Call Name: Ignivar
Player says: "Ignivar"
Effect: Flame Bite activates
```

## Game Flow

### 1. Contract Creation

1. Player chooses a Contract Type.
2. Player draws a contract sigil.
3. Game analyzes the drawing.
4. Game generates dragon name, power name, grade, trait, and final values.
5. Player chooses or rerolls a Call Name.
6. Contract is saved to the Contract Library.

Contract creation is not part of the timed combat match.

### 2. Loadout Preparation

1. Player equips saved contracts into battle slots.
2. Game checks Call Name uniqueness.
3. Duplicate contracts create Resonance.
4. Player starts the match.

### 3. Combat

1. Match starts with a countdown.
2. Player invokes equipped contracts by saying Call Names or using fallback input.
3. AI invokes contracts using the same rules.
4. HP, Energy, cooldowns, buffs, curses, Vitality, and temporary effects update.
5. Match ends at defeat or when the timer reaches zero.

## Contract Analysis Screen

After drawing, show a concise result screen.

Example:

```text
CONTRACT ANALYSIS

Dragon - Trait - Power:
Ignivar - Fierce - Flame Bite

Contract Call:
[Ignivar] [Reroll]
Must be one word from this contract.

Effect:
12 Damage

Cost:
10 Energy

Cooldown:
1.5s

Why:
Sharp + energetic drawing improved damage.

[Save Contract] [Redraw]
```

Main screen shows the contract result. Detailed drawing factors can be hidden behind a detail view.

## Drawing Analysis Rules

Drawing rewards intent, not art skill.

Measured factors:

- **Sharpness**: corners, spikes, jagged turns. Helps Damage, Burst, Curse.
- **Size**: amount of drawing area used. Helps Burst and Vitality.
- **Completion**: whether the sigil feels finished. Strongly affects Grade.
- **Stability**: balance, centeredness, controlled shape. Helps Heal, Energy, Buff, Vitality.
- **Stroke Energy**: speed, rhythm, boldness. Helps Burst, Energy, Curse.
- **Complexity**: number of marks or ritual feel. Helps Buff and Curse.
- **Closure**: closed loops or sealed shapes. Helps Heal and Vitality.
- **Symmetry**: visual balance. Helps Grade and stable traits.

Design rule:

```text
Contract Type = base effect
Drawing Grade = quality bonus
Drawing Style = trait and visual flavor
```

An empty drawing asks the player to redraw. A weak but intentional drawing creates a Rough contract.

## Contract Types

Current prototype types:

| Contract Type | Role | Base Effect Example |
|---|---|---|
| **Damage** | quick HP pressure | deal 10 damage |
| **Burst** | heavy HP pressure | deal 25 damage |
| **Heal** | HP recovery over time | restore 20 HP over 3s |
| **Energy** | Energy recovery over time | restore 25 Energy over 5s |
| **Buff** | empower future calls | next 2 non-Buff contracts gain +30% effect |
| **Curse** | weaken enemy calls | enemy next contract loses 30% effect |
| **Vitality** | temporary survivability | +50 max HP for 5–10s |

Removed for now:

- **Guard**: removed to keep matches faster.
- **Block**: removed to avoid full-damage immunity.

## Resources and Match Rules

- Match length: **60 seconds**.
- Base Max HP: **200**.
- Temporary Max HP limit: **300**.
- Starting Energy: **100**.
- Max Energy: **100**.
- HP cannot go below 0.
- Energy cannot go below 0 or above max.
- A side is defeated at 0 HP.
- Simultaneous defeat is Draw.
- If time expires, higher HP wins.
- Equal HP at time expiry is Draw.

## Starter Balance Values

| Contract Type | Base Effect | Energy Cost | Cooldown |
|---|---:|---:|---:|
| Damage | 10 damage | 10 | 1.5s |
| Burst | 25 damage | 30 | 1.5s |
| Heal | restore 20 HP over 3s | 25 | 1.5s |
| Energy | restore 25 Energy over 5s | 0 | 1.5s |
| Buff | next 2 non-Buff contracts +30% effect | 20 | 1.5s |
| Curse | enemy next contract -30% effect | 20 | 1.5s |
| Vitality | +50 max HP for 5–10s | 25 | 1.5s |

Recommended caps:

- Max single-hit damage: **40**.
- Max basic Damage contract: **20**.
- Max Burst contract: **40**.
- Temporary max HP cannot exceed **300**.

## Vitality Rules

Vitality grants instant temporary HP and temporarily increases Max HP.

Player-facing text should show only:

```text
+X Max HP
```

Internal rule:

```text
Vitality Amount = instant HP gain = temporary Max HP bonus
```

Rules:

- Vitality does not reduce damage.
- Vitality does not heal over time.
- Recommended duration: 5–10 seconds.
- Higher Vitality amount may have shorter duration.
- When Vitality activates, current HP increases by the same amount, up to temporary max HP.
- When Vitality expires, max HP returns to normal and current HP clamps if above normal max HP.

Example:

```text
Current HP: 180 / 200
Vitality activates: +50 Max HP for 8s
New HP: 230 / 250
Effect expires
HP clamps to 200 / 200
```

## Heal Rules

Heal restores HP over time.

Rules:

- Heal does not increase Max HP.
- Heal can restore HP up to the current max HP.
- If Vitality is active, Heal can restore HP up to the temporary max HP.
- Prototype value: restore 20 HP over 3 seconds.

## Cooldown Rules

- Every unique contract has its own cooldown timer.
- All contracts use the same base cooldown duration by default.
- Using a contract only cools down that unique contract.
- Other ready contracts can still be invoked if Energy is available.
- The same exact contract equipped in multiple slots shares one cooldown state.
- Energy is the main limiter for chaining many different contracts quickly.

## Duplicate Contract Resonance

A duplicate contract means the same exact saved contract is equipped into more than one combat slot.

Duplicates create **Resonance**.

Rules:

- Same contract ID in multiple slots becomes one Resonant Contract.
- Duplicates do not create extra casts.
- Duplicates do not get separate cooldowns.
- A Resonant Contract has one Call Name, one cooldown state, and one activation.
- Each duplicate copy increases effect strength with diminishing returns.
- Energy cost also increases with Resonance.
- All duplicate slots show the same state.

Recommended Resonance table:

| Copies | Resonance | Effect Multiplier | Cost Multiplier |
|---:|---|---:|---:|
| 1 | Normal | 100% | 100% |
| 2 | Echo | 125% | 125% |
| 3 | Surge | 145% | 145% |
| 4 | Overload | 160% | 160% |

Example:

```text
Base Contract: Ignivar's Flame Bite
Base Damage: 12
Base Cost: 10 Energy
Copies Equipped: 3
Resonance: Surge
Final Damage: 17
Final Cost: 15 Energy
```

Final damage still obeys the max single-hit damage cap.

## Buff and Curse Rules

Buff:

- Only one active Buff per actor.
- New Buff replaces old Buff.
- Buff affects the next valid non-Buff contracts.
- Buff can improve damage, healing, energy gain, Vitality, or similar values.
- Buff should not multiply Resonance beyond effect caps.

Curse:

- Only one active Curse per target.
- New Curse replaces old Curse.
- Curse affects the target's next valid contract.
- Curse can reduce damage, healing, energy gain, Vitality, or similar values.

## Damage Rules

When damage lands:

1. Apply Curse or Buff modifiers if relevant.
2. Apply Resonance multiplier if relevant.
3. Clamp final single-hit damage to the damage cap.
4. Subtract HP.
5. HP cannot go below 0.

There is no Guard or Block damage priority in the current prototype.

## Equip Slot Rules

- Recommended battle slots: 4.
- Slots point to contracts from the Contract Library.
- The same exact contract may be equipped in multiple slots.
- Duplicate slots create Resonance for that contract.
- Duplicate slots share cooldown, active state, Energy rules, and Call Name.
- Different contracts must have different Call Names while equipped.

## Call Name Generation Rules

When creating or equipping contracts:

1. Try the dragon name first.
2. If it conflicts, try a short power keyword.
3. If it still conflicts, use a valid word from trait or power name.
4. Avoid Contract Type words as Call Names.
5. Avoid long, similar, or hard-to-pronounce names.
6. Allow reroll before combat.

Good Call Names:

```text
Ignivar, Mirava, Zephra, Orvyn, Noxar, Vorn, Flame, Ember
```

Bad Call Names:

```text
Ignivar's Flame Bite, Damage Contract, Dragon Contract Number Two
```

## Example Contracts

| Full Contract | Call Name | Type | Effect |
|---|---|---|---|
| Ignivar's Flame Bite | Ignivar | Damage | 12 damage |
| Voltaris's Thunder Crash | Voltaris | Burst | 29 damage |
| Mirava's Life Ember | Mirava | Heal | restore 20 HP over 3s |
| Zephra's Mana Breath | Zephra | Energy | restore 25 Energy over 5s |
| Orvyn's Dragon Oath | Orvyn | Buff | next 2 non-Buff contracts +30% |
| Noxar's Chain Hex | Noxar | Curse | enemy next contract -30% |
| Vorn's Blood Crown | Vorn | Vitality | +50 max HP for 5–10s |

## Battle Flow

1. Match begins with countdown.
2. Player watches HP, Energy, cooldowns, and enemy state.
3. Player says a short Call Name.
4. Game maps Call Name to an equipped contract.
5. Game validates match state, HP, Energy, and that contract's cooldown.
6. Energy is paid and that unique contract starts cooldown.
7. Contract enters its prepare phase if applicable.
8. Contract power activates if still valid.
9. Energy, HP, cooldowns, buffs, curses, Vitality, and labels update.
10. Match continues until defeat or timer end.

## AI Rules

- AI uses the same contract system as the player.
- AI only invokes equipped contracts that are valid.
- AI respects Energy, per-contract cooldowns, active match state, and defeat state.
- AI attempts one action at a configured interval while active.
- AI may prefer Damage when safe, Heal when low, Energy when resource-starved, Buff before Burst, Curse before enemy Burst, and Vitality when near defeat.

## Controls

### Contract Creation

- Choose Contract Type.
- Draw sigil.
- Review contract analysis.
- Reroll Call Name if desired.
- Save contract to library.

### Equip Phase

- Assign saved contracts to battle slots.
- Generate or validate unique Call Names.
- Apply duplicate Resonance when the same contract is equipped multiple times.
- Confirm combat loadout.

### Combat

- Primary input: say short Call Name by voice.
- Fallback input: keyboard and Canvas buttons.
- Optional Simple Call Mode: say slot numbers such as One, Two, Three, Four.
- Full contract names are never required as combat input.

## Guide Button

Each major phase should include a context-sensitive **Guide** button.

Rules:

- Label should be `Guide` or `?` depending on screen space.
- Guide opens a simple overlay for the current phase.
- In combat, opening Guide pauses the match.
- Guide should be readable in under 10 seconds.
- Combat Guide must show active Call Names because full contract names are too long to say.

Guide content by phase:

- **Contract Creation**: Contract Type, drawing sigil, grade, trait, and saving.
- **Equip Phase**: battle slots, Call Names, rerolling, and Resonance.
- **Combat**: current Call Names, input options, HP, Energy, cooldowns, and invocation rules.
- **Result Screen**: restart and return-to-preparation options.

## UI

### Contract Creation Screen

Show:

- Guide button.
- Contract Type selector.
- Drawing canvas.
- Contract Analysis result.
- Save Contract and Redraw buttons.

### Contract Analysis Result

Show:

- Dragon - Trait - Power.
- Contract Call with Reroll.
- Effect.
- Energy Cost.
- Cooldown.
- Short Why text.

### Equip Screen

Show:

- Guide button.
- Contract Library.
- Battle slots.
- Generated Call Name per unique equipped contract.
- Resonance label for duplicate contracts.
- Conflict warnings if needed.
- Reroll Call Name button.

### Battle Screen

Show:

- Guide or `?` button near pause.
- Player and AI HP bars.
- Player and AI Energy bars.
- Equipped contracts as speed-dial cards.
- Call Name as the largest slot text.
- Energy cost.
- Ready, Active, or Cooldown state.
- Resonance label if the contract is duplicated.
- Latest player call.
- Latest AI action.
- Timer and countdown.

Compact battle HUD:

```text
[A] Ignivar     10
[B] Voltaris    30
[C] Mirava      25
[D] Vorn        25
```

Later, alphabet markers may be replaced by icons:

```text
[🔥] Ignivar     10
[⚡] Voltaris    30
[💚] Mirava      25
[❤️] Vorn        25
```

Vitality should look like other contracts in the compact HUD. In details, display only `+X Max HP`.

## Details View

Details view is the contract receipt.

Template:

```text
[A] Ignivar

Ignivar's Flame Bite
Damage Contract

Effect:
12 Damage

Cost:
10 Energy

Cooldown:
1.5s

Grade:
Strong

Trait:
Fierce

Resonance:
1 Copy
```

Vitality details example:

```text
[D] Vorn

Vorn's Blood Crown
Vitality Contract

Effect:
+50 Max HP

Duration:
7s

Cost:
25 Energy

Cooldown:
1.5s

Grade:
Strong

Trait:
Ancient

Resonance:
1 Copy
```

## Visual Direction

Visuals should communicate configured power strength, Contract Type, and the Dragon Contractor fantasy.

### Player Character: Scroll Contractor

Use **Option A: Scroll Contractor** for the prototype.

The player character is a robed Dragon Contractor holding a contract scroll. The scroll represents the player's saved Dragon Contracts and should be the main visual anchor for contract invocation.

When a contract is invoked:

1. The player calls the short Call Name.
2. The scroll opens or tilts forward during the prepare phase.
3. The saved player-drawn sigil appears as a faint glowing overlay.
4. The sigil flashes at activation.
5. The dragon power effect appears and the sigil fades.

Design rule:

```text
Robe + scroll = who the player is
Saved sigil glow = which contract is active
Dragon power effect = what the contract does
```

Do not use the tattoo-focused contractor as the current prototype direction. Tattoo marks may be considered later, but the prototype should prioritize the scroll because it communicates contracts more clearly.

### Contract Type Effects

- Damage: quick strike, bite, slash, or projectile.
- Burst: large dramatic hit.
- Heal: soft light, life ember, or restorative breath.
- Energy: mana stream, spark flow, or charge-up effect.
- Buff: oath ring, glowing seal, or power-up mark.
- Curse: chain, shadow mark, or weakening seal.
- Vitality: gold life seal, expanding HP aura, or scroll-born blood crown.

Drawing style may influence visual flavor, but config and contract calculation control actual combat values.

### Sigil Highlight Feedback

Each contract stores the player's drawn sigil. During combat, invoking that contract briefly shows the saved sigil as a faint highlight.

Rules:

- The sigil appears during the prepare phase.
- The sigil flashes brighter when the effect activates.
- The sigil fades during or after the power effect.
- Highlight color should match the Contract Type.
- The highlight is cosmetic feedback only.
- The sigil reminds the player that this power came from the contract they drew.

## Scope

In scope:

- One arena.
- One human side and one AI side.
- Scroll Contractor player visual direction.
- Contract creation with drawing.
- Contract Library and equip slots.
- Generated unique Call Names for combat.
- Variable Contract Types: Damage, Burst, Heal, Energy, Buff, Curse, Vitality.
- HP, Energy, Vitality, per-contract cooldowns, duplicate Resonance, buffs, curses, and state labels.
- Guide button and context-sensitive guide overlays.
- Voice, keyboard, and Canvas fallback input where supported.
- Countdown, timer, result, and restart flow.
- Placeholder assets.

Out of scope:

- Online multiplayer.
- Guard and Block contract types for the current prototype.
- Tattoo-focused player direction for the current prototype.
- Dragon collection progression.
- Breeding, rarity, leveling, or monetization.
- Manual movement.
- Complex artwork recognition.
- Requiring players to say full contract names in combat.
