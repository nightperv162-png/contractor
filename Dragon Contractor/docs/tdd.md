# Dragon Contractor — Prototype TDD

## Purpose

This Technical Design Document defines the technical guidance for the **Dragon Contractor** prototype. It moves implementation guidance, architecture, formulas, config rules, diagnostics, logging, tests, and build workflow out of the GDD.

The prototype should stay small, Canvas-only, easy to tune, and readable for non-coders.

## Non-Negotiable Engineering Rules

### 1. Single Centralized Configuration

Use one dedicated config file, recommended as `src/config.js`.

All mechanical, physical, visual, timing, layout, AI, input, logging, and rules-based constants must live in this file. Non-coders should be able to tweak prototype balance from config without opening gameplay files.

### 2. Zero Magic Numbers

Do not hardcode gameplay numbers, pixel positions, sizes, colors, speeds, cooldowns, durations, energy costs, HP values, timers, turn limits, or AI intervals inside game loop, render, physics, input, AI, or combat files.

Local indexes and loop counters are acceptable. Anything that affects behavior, balance, layout, or presentation belongs in config.

### 3. Self-Documenting Config

Every config key must include a natural-language comment explaining:

- what the value changes
- how it affects gameplay or presentation
- recommended playtest range

Example:

```js
// Starting HP for each side at match start. Higher values make rounds last longer. Recommended range: 100–250.
startingHp: 200,
```

### 4. Maximum Separation of Concerns

Each source file should own one responsibility. Input does not apply damage. Combat does not render UI. UI does not decide match results. The main loop coordinates systems only.

### 5. Canvas-Only Game Surface

All UI elements, characters, overlays, contract slots, event handlers, buttons, labels, guide screens, drawing surfaces, and gameplay visuals must be created inside the Canvas.

The HTML file is only a container for the Canvas and script loading. It must not contain gameplay UI, gameplay logic, visual controls, HUD markup, or interactive buttons.

### 6. Commit After Every Turn

After completing every implementation request:

1. Run tests.
2. Run local compile/build check.
3. Fix failures before reporting success.
4. Verify the local dev server is running; start it if not.
5. Commit passing work with a clear conventional message, such as `feat: add contract resonance` or `fix: clamp vitality hp`.

If any step is blocked by the environment, report exactly what is blocked and what the user should run locally.

## Recommended Source Structure

```text
src/
  config.js
  main.js
  core/
    gameLoop.js
    gameState.js
    stateMachine.js
    logger.js
    diagnostics.js
  states/
    bootState.js
    contractCreationState.js
    loadoutState.js
    countdownState.js
    matchState.js
    pauseState.js
    resultState.js
  contracts/
    contractFactory.js
    contractLibrary.js
    contractEquipper.js
    callNameGenerator.js
    resonanceResolver.js
    drawingAnalyzer.js
  combat/
    contractInvoker.js
    effectResolver.js
    resourceResolver.js
    cooldowns.js
    buffCurseResolver.js
    matchRules.js
  ai/
    aiController.js
    aiLoadout.js
  input/
    voiceInput.js
    keyboardInput.js
    pointerInput.js
    inputMapper.js
  render/
    canvasRenderer.js
    arenaRenderer.js
    hudRenderer.js
    contractRenderer.js
    guideRenderer.js
    overlayRenderer.js
    sigilRenderer.js
  ui/
    canvasButtonSystem.js
    layout.js
    hitRegions.js
  assets/
    assetManifest.js
    assetLoader.js
  tests/
    contracts.test.js
    drawingAnalyzer.test.js
    resonance.test.js
    combat.test.js
    resources.test.js
    matchRules.test.js
    inputMapper.test.js
    ai.test.js
```

Names may change, but the responsibility split must remain clear.

## System Responsibilities

### Main Entry

Creates the Canvas, loads config, initializes state, registers input systems, starts diagnostics, and starts the game loop. It must not contain combat, drawing-analysis, AI, rendering, or match-result rules.

### Game Loop

Owns frame timing. It calls active state update and render functions with elapsed time. It should not directly change HP, energy, cooldowns, or match results.

### Game State

Stores serializable state for tests:

- active screen/state
- match timer and countdown
- player and AI HP, max HP, temporary HP modifiers
- player and AI energy
- equipped contract slots
- contract cooldown states
- active prepare/effect timers
- active Buff and Curse state
- latest input and failure reason
- result state

### State Machine

Use explicit states:

```text
Boot
ContractCreation
Loadout
Countdown
Match
Pause
Result
```

Only `Match` processes combat invocation. Contract creation and loadout happen outside timed combat.

### Contract Creation

The player chooses a Contract Type, draws a sigil, receives an analysis result, then saves or redraws.

The drawing analyzer must use simple stroke metrics, not AI art recognition. Empty drawings fail. Poor but intentional drawings create usable Rough contracts.

### Loadout and Call Names

Players equip saved contracts into battle slots before combat. Each equipped unique contract receives one short combat Call Name.

Rules:

- Combat only listens for Call Names.
- Call Names should be one word.
- Call Names should be pronounceable and voice-friendly.
- Call Names must be unique among equipped unique contracts.
- Same exact contract in multiple slots shares one Call Name.
- Different contracts cannot share the same Call Name.
- Reroll should choose words from dragon name, trait, or power name first.

### Combat Invocation

All input methods normalize into the same contract invocation path:

```text
raw input → normalized Call Name or slot selection → equipped contract → validation → resource payment → cooldown start → prepare timer → effect resolution
```

Input must never directly apply damage, healing, energy, Buff, Curse, or Vitality.

### Rendering

All visuals are Canvas-rendered:

- arena
- robed Scroll Contractor character
- opponent
- contract scroll and invocation feedback
- saved sigil highlight
- HP and MP/Energy bars
- compact contract HUD
- guide button and guide overlay
- drawing surface
- analysis result screen
- loadout slots
- countdown, pause, result overlays

Renderers read all layout, colors, text sizes, animation durations, and hit regions from config or layout helpers.

## Core Data Models

### Contract

A saved Dragon Contract should include:

```text
id
dragonName
trait
powerName
contractType
callNameCandidateWords
baseEffectValues
energyCost
prepareTime
effectDuration
tickInterval
cooldownSeconds
grade
sigilData
analysisSummary
```

### Equipped Contract Slot

```text
slotId
markerLabel
contractId
resolvedCallName
```

Duplicate slots may point to the same `contractId`.

### Sigil Data

```text
strokes
bounds
previewData
analysisScores
analysisLabels
```

The saved sigil is used during invocation as faint visual feedback only. It does not recalculate combat values during combat.

## Combat Rules and Formulas

### Contract Success Check

A contract succeeds only if:

```text
match is active
actor is alive
Call Name or slot maps to an equipped contract
contract cooldown is ready
actor has enough Energy
```

Failure reasons:

```text
Unknown Call
Contract Cooldown
Not Enough Energy
Defeated
Match Inactive
```

### Contract Types

Current prototype Contract Types:

```text
Damage
Burst
Heal
Energy
Buff
Curse
Vitality
```

Guard and Block are out of scope for the current prototype.

### Resources

- Base Max HP: 200.
- Temporary Max HP cap: 300.
- Max Energy: 100.
- Match length: 60 seconds.
- HP and Energy never go below 0.
- Energy never exceeds Max Energy.

### Per-Contract Cooldown

Every unique contract has its own cooldown timer. All contracts use the same base cooldown duration by default.

Using a contract starts cooldown only for that unique contract. Other ready contracts remain usable if the actor has enough Energy.

Duplicate slots pointing to the same contract share cooldown state.

### Resonance

Equipping the same contract in multiple slots creates a Resonant Contract.

Duplicates do not create extra casts. They create one stronger invocation with shared Call Name, shared cooldown, and shared state.

Recommended scaling:

```text
1 copy: 100% power, 100% cost, Normal
2 copies: 125% power, 125% cost, Echo
3 copies: 145% power, 145% cost, Surge
4 copies: 160% power, 160% cost, Overload
```

Formula:

```text
finalEffectBeforeCaps = baseEffect × resonancePowerMultiplier × buffMultiplier × traitAndGradeModifiers
finalCost = round(baseCost × resonanceCostMultiplier)
```

Apply caps after all modifiers.

### Damage Cap

No single hit may exceed the configured max single-hit damage.

```text
finalDamage = min(calculatedDamage, maxSingleHitDamage)
```

Recommended max single-hit damage: 40.

### Heal Over Time

Heal restores HP over time and does not increase Max HP.

```text
healPerTick = totalHeal / (healDuration / tickInterval)
currentHp = min(currentHp + healPerTick, currentMaxHp)
```

If Vitality is active, `currentMaxHp` includes the temporary Max HP bonus.

### Energy Over Time

Energy contracts restore Energy over time.

```text
energyPerTick = totalEnergyGain / (energyDuration / tickInterval)
energy = min(energy + energyPerTick, maxEnergy)
```

Energy contracts should scale gently to avoid infinite loops.

### Buff

Buff empowers future contracts.

Rules:

- only one active Buff per actor
- new Buff replaces old Buff
- Buff affects the next valid non-Buff contracts
- Buff cannot buff another Buff
- Buff cannot multiply itself
- Buff obeys effect caps

### Curse

Curse weakens the enemy’s next valid contract.

Rules:

- only one active Curse per target
- new Curse replaces old Curse
- Curse affects the enemy’s next valid contract
- Curse cannot stack with another Curse

### Vitality

Vitality gives instant temporary HP and temporary Max HP using the same value.

Player-facing text shows only:

```text
+X Max HP
```

Internal logic:

```text
vitalityAmount = min(configuredVitalityAmount, temporaryMaxHpCap - baseMaxHp)
temporaryMaxHp = baseMaxHp + vitalityAmount
currentHp = min(currentHp + vitalityAmount, temporaryMaxHp)
```

When Vitality expires:

```text
currentMaxHp = baseMaxHp
currentHp = min(currentHp, currentMaxHp)
```

Higher Vitality amount may use shorter duration. Lower Vitality amount may use longer duration.

## Drawing Analyzer Guidance

The analyzer reads intent, not art skill.

Measured factors:

```text
Sharpness
Size
Completion
Stability
Stroke Energy
Complexity
Closure
Symmetry
```

Main uses:

- Grade: mostly Completion and Stability.
- Trait: based on dominant style features.
- Bonus values: small modifier to effect, cost, duration, or prepare time.
- Contract Call candidates: dragon name, trait word, and power-name words.

Main analysis screen should show:

```text
CONTRACT ANALYSIS
Dragon - Trait - Power:
Ignivar - Fierce - Flame Bite

Contract Call:
[Ignivar] [Reroll]
Must be one word in contract.

Effect: 12 Damage
Cost: 10 Energy
Cooldown: 1.5s
Why: Sharp + energetic drawing improved damage.

[Save Contract] [Redraw]
```

Use human labels such as Low, Medium, and High instead of raw decimals unless debug overlay is enabled.

## Input Requirements

Supported input methods:

- voice Call Name
- Canvas slot tap
- keyboard slot key for desktop testing
- optional simple call mode such as One, Two, Three, Four

All input methods must route into the same normalized invocation path.

Voice recognition must accept complete Call Names only. It should log raw phrase, normalized result, confidence where available, and failure reason.

## UI Requirements

### Compact Combat HUD

Use the same compact format for all contracts:

```text
[A] Ignivar    10
[B] Voltaris   30
[C] Mirava     25
[D] Vorn       30
```

Meaning:

```text
[Marker] Call Name Energy Cost
```

Later, marker letters may be replaced by icons:

```text
[🔥] Ignivar    10
```

Vitality should look the same in compact HUD. Only details/analysis view shows `+X Max HP`.

### Contract Details View

Details view shows:

```text
Full Contract Name
Contract Type
Effect
Duration or rate if relevant
Energy Cost
Cooldown
Grade
Trait
Resonance
```

For Vitality, show only:

```text
Effect: +X Max HP
```

### Guide Button

Each major phase should include a Canvas-rendered Guide button.

Guide content is context-sensitive:

- Contract Creation: drawing and analysis rules.
- Loadout: slots, Call Names, duplicate Resonance.
- Combat: current Call Names, HP, Energy, input options, failure reasons.
- Result: restart or return to preparation.

Combat guide should pause the match while open.

### Sigil Highlight Feedback

Each contract stores the player-drawn sigil. When invoked:

1. sigil appears faintly during prepare
2. sigil flashes at activation
3. sigil fades out during effect feedback

The highlight color should match Contract Type. It is cosmetic only and does not recalculate combat values.

### Player Visual Direction

The player character is a robed **Scroll Contractor** holding a contract scroll.

During invocation:

- scroll opens or tilts forward
- saved sigil appears as faint glow
- dragon power effect activates

Tattoo-focused visuals are out of scope for the current prototype.

## Full Tunable Config List

All of these belong in `src/config.js` with comments and safe ranges.

### App and Canvas

```text
canvasWidth
canvasHeight
targetFrameRate
safeAreaPadding
backgroundColor
```

### Match and Resources

```text
matchDurationSeconds
countdownSeconds
startingHp
baseMaxHp
temporaryMaxHpCap
startingEnergy
maxEnergy
minHp
minEnergy
maxSingleHitDamage
baseContractCooldownSeconds
```

### Contract Types

```text
enabledContractTypes
contractTypeDefinitions.damage.baseDamage
contractTypeDefinitions.damage.energyCost
contractTypeDefinitions.burst.baseDamage
contractTypeDefinitions.burst.energyCost
contractTypeDefinitions.heal.totalHeal
contractTypeDefinitions.heal.durationSeconds
contractTypeDefinitions.heal.tickIntervalSeconds
contractTypeDefinitions.heal.energyCost
contractTypeDefinitions.energy.totalEnergyGain
contractTypeDefinitions.energy.durationSeconds
contractTypeDefinitions.energy.tickIntervalSeconds
contractTypeDefinitions.energy.energyCost
contractTypeDefinitions.buff.effectMultiplier
contractTypeDefinitions.buff.chargeCount
contractTypeDefinitions.buff.durationLimitSeconds
contractTypeDefinitions.buff.energyCost
contractTypeDefinitions.curse.effectMultiplier
contractTypeDefinitions.curse.durationLimitSeconds
contractTypeDefinitions.curse.energyCost
contractTypeDefinitions.vitality.amount
contractTypeDefinitions.vitality.durationSeconds
contractTypeDefinitions.vitality.energyCost
```

### Prepare and Effect Timing

```text
prepareTimeByContractType.damage
prepareTimeByContractType.burst
prepareTimeByContractType.heal
prepareTimeByContractType.energy
prepareTimeByContractType.buff
prepareTimeByContractType.curse
prepareTimeByContractType.vitality
minPrepareTimeSeconds
maxPrepareTimeSeconds
sigilAppearSeconds
sigilFlashSeconds
sigilFadeSeconds
```

### Resonance

```text
maxEquippedSlots
resonancePowerMultipliers
resonanceCostMultipliers
resonanceLabels
maxDuplicateCopies
```

### Drawing Analyzer

```text
drawingCanvasRect
minDrawingPoints
minStrokeLength
emptyDrawingThreshold
sharpnessThresholds
sizeThresholds
completionThresholds
stabilityThresholds
strokeEnergyThresholds
complexityThresholds
closureThresholds
symmetryThresholds
gradeThresholds
gradeBonusMultipliers
traitSelectionWeights
```

### Names and Call Names

```text
dragonNameParts
powerNamePoolsByContractType
traitPoolsByContractType
callNamePreferredSources
reservedCallNames
maxCallNameSyllables
maxCallNameLength
simpleCallModeWords
slotMarkerLabels
```

### AI

```text
aiActionIntervalSeconds
aiEnergyReserveThreshold
aiLowHpThreshold
aiContractTypeWeights
aiBuffChance
aiCurseChance
aiHealChanceAtLowHp
aiRandomSeed
```

### UI Layout

```text
playerHudRect
enemyHudRect
timerRect
arenaRect
contractSlotRects
guideButtonRect
pauseButtonRect
latestCallRect
analysisPanelRect
detailsPanelRect
loadoutSlotRects
drawingAreaRect
resultOverlayRect
hpBarSize
energyBarSize
cooldownIndicatorSize
uiFontFamily
uiFontSizeSmall
uiFontSizeMedium
uiFontSizeLarge
```

### Colors and Visual Feedback

```text
colorTextPrimary
colorTextSecondary
colorTextWarning
colorPanelBackground
colorPanelBorder
colorHpBar
colorHpMissing
colorEnergyBar
colorEnergyMissing
colorCooldownReady
colorCooldownActive
contractTypeColors.damage
contractTypeColors.burst
contractTypeColors.heal
contractTypeColors.energy
contractTypeColors.buff
contractTypeColors.curse
contractTypeColors.vitality
overlayBackgroundColor
sigilBaseOpacity
sigilFlashOpacity
```

### Input

```text
enableVoiceInput
enableKeyboardInput
enablePointerInput
enableSimpleCallMode
voiceConfidenceThreshold
unknownCallDisplaySeconds
keyboardSlotBindings
pointerTapForgivenessPixels
```

### Logging and Debug

```text
enableDebugLogs
enableCanvasDebugOverlay
logStateTransitions
logInputEvents
logVoiceEvents
logContractCreation
logDrawingAnalysis
logLoadoutEvents
logCombatEvents
logResourceEvents
logAiEvents
logRendererWarnings
logDiagnostics
```

### Build and Diagnostics

```text
requiredNodeVersion
localDevServerUrl
buildCommand
testCommand
devServerCommand
gitCommitEnabled
```

## Logging Requirements

Add concise logs for key interactions:

- app started
- config loaded
- asset load success/failure
- state transition
- drawing started/completed/analyzed
- contract created/saved/redrawn
- loadout changed
- Call Name generated/rerolled/conflict resolved
- raw voice phrase and normalized Call Name
- input failure reason
- contract invoked
- Energy paid
- cooldown started/completed
- prepare started/completed
- effect applied
- Heal/Energy ticks
- Buff/Curse applied/consumed/replaced
- Vitality applied/expired/clamped
- Resonance resolved
- AI decision made
- match ended and result chosen
- tests/build/dev-server diagnostics

Logs must be controlled by config toggles.

## Comments for Non-Coders

Add practical comments near:

- config sections
- contract type definitions
- drawing analyzer thresholds
- Resonance scaling
- Buff and Curse rules
- Vitality logic
- Call Name generation
- compact HUD layout
- AI behavior weights

Avoid comments that only repeat obvious code.

## Tests

Write automated tests for all logic-based code. Tests must not depend on real Canvas, real microphone input, real time, or external services.

Required test coverage:

- config loads and required keys exist
- Contract Type definitions are valid
- drawing analyzer rejects empty drawings
- drawing analyzer creates grade/style labels
- contract factory creates valid contracts
- Call Name generation uniqueness
- duplicate contract Resonance scaling
- same contract shares cooldown state across duplicate slots
- different contracts have separate cooldown state
- contract invocation success
- Unknown Call failure
- Contract Cooldown failure
- Not Enough Energy failure
- Defeated failure
- Match Inactive failure
- damage cap clamps final damage
- Heal over time ticks correctly
- Energy over time ticks correctly
- Buff affects next valid non-Buff contracts
- Buff does not buff Buff
- Curse affects enemy next valid contract
- Vitality grants equal instant HP and temporary Max HP
- Vitality clamps HP on expiry
- match timer win/loss/draw
- simultaneous defeat draw
- AI cannot act when defeated or outside match
- Canvas hit-region mapping to slot input

Update tests for every new feature or design change. Run tests every turn.

## Health, Build, and Commit Workflow

Before reporting done on any implementation task:

1. Run the test suite.
2. Run a local compile/build check.
3. Confirm the build compiles cleanly with no errors.
4. Verify the local dev server is running.
5. Start the local dev server if it is not running.
6. Run basic workspace diagnostics.
7. If all checks pass, create a Git commit using a conventional message.

If validation is blocked by sandbox or missing dependencies, say exactly what could not run and what command the user should run locally.

Example commands:

```bash
npm test
npm run build
npm run dev
git add .
git commit -m "feat: add contract call names"
```

## Acceptance Criteria

The prototype is technically acceptable when:

- all gameplay visuals and UI are inside Canvas
- HTML is only a container
- all tunables live in centralized config
- no gameplay/render/input/AI files contain magic numbers
- contract creation, loadout, and combat states are separated
- Call Names route all input into one invocation path
- duplicate contracts resolve through Resonance
- HP, Energy, cooldown, Buff, Curse, Heal, Energy gain, and Vitality rules are tested
- guide overlay and compact HUD are Canvas-rendered
- logs exist for key interactions
- tests pass
- build compiles cleanly
- dev server is verified or limitation is reported
- passing work is committed with a conventional message
