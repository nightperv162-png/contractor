# Dragon Fighter: Egg Spell Forge - TDD

## Purpose

This Technical Design Document is the implementation guide for the Canvas-only Dragon Fighter prototype. The GDD owns player-facing design intent. This TDD owns architecture, code conventions, formulas, diagnostics, tests, build rules, and tunable configuration.

The current prototype has a working spell-preparation flow, countdown-to-active match loop, and player spell combat. Prepared spells validate, spend energy, start cooldowns, apply type-specific effects, update combat feedback, and can end the match. The AI remains a stationary dummy until the next milestone.

## Non-Negotiable Engineering Rules

- Single centralized configuration: all mechanical, physical, visual, timing, input, AI, text, balance, and rule constants live in `src/config.js`.
- Zero magic numbers: do not hardcode pixel dimensions, colors, speeds, cooldowns, friction, limits, turn counts, or balance values in game loop, physics, render, input, combat, AI, or state files.
- Self-documenting config: every config key must have a natural-language comment explaining what it changes, how it affects the prototype, and a recommended playtest range.
- Canvas-only UI: all gameplay UI, characters, buttons, labels, overlays, event regions, and feedback are created and rendered inside the Canvas. `index.html` is only a Canvas and script container.
- Maximum separation of concerns: source files are decoupled by responsibility. Input maps intent; states own flow; spell modules analyze spells; combat resolves rules; render draws state; UI layout calculates regions; config stores tunables.
- Logic remains testable without Canvas, browser permissions, microphone input, or real time.
- Add essential logging at key interactions so a non-coder can follow what happened from console output.
- Add practical comments near important behavior that designers may tune. Avoid comments that only restate obvious code.
- Every new feature or design change updates or adds tests for affected logic.
- Every completed request ends with tests, build, server diagnostics, and a Git commit if checks pass.

## Source Architecture

Recommended source ownership:

```text
src/
  config.js                 centralized tunables only
  main.js                   bootstraps Canvas, state, input, loop, renderer
  core/
    gameLoop.js             frame timing and update/render orchestration
    gameState.js            plain serializable state creation/reset
    logger.js               config-gated diagnostics
    random.js               deterministic random helpers
    stateMachine.js         state transitions and guards
  states/
    preparationState.js     egg spell forge interactions
    matchState.js           countdown, active match, result flow
  spells/
    patternAnalyzer.js      9-dot pattern math
    spellFactory.js         spell object creation
    spellLoadout.js         spell name/loadout validation
    spellRules.js           spell summaries and effect previews
  combat/
    casting.js              target spell-casting pipeline
    cooldowns.js            cooldown ticking and readiness
    damageResolver.js       shield, piercing, HP, healing
    matchRules.js           result and timer rules
  ai/
    aiController.js         AI decisions using shared spell rules
  input/
    inputController.js      keyboard, pointer, voice intent mapping
  render/
    renderer.js             Canvas drawing only
  ui/
    layout.js               Canvas hitboxes and layout regions
test/
  *.test.js                 Node tests for logic modules
```

Exact filenames may change, but ownership boundaries should stay clear.

## Runtime States

- `preparation`: player draws or randomizes egg patterns, chooses type, edits name, saves five spell slots, and confirms loadout.
- `match-preview`: optional static battle layout state for layout inspection.
- `countdown`: match-start countdown after loadout confirmation; combat input is visibly inactive.
- `active`: playable spell combat state.
- `result`: future Win, Lose, or Draw summary and restart flow.

Only the active state should process its own gameplay inputs.

## Target Spell Combat Pipeline

Prepared spells are the main combat controls. Basic action commands are not target design.

```text
raw input -> normalized cast attempt -> spell lookup -> validation -> cost/cooldown -> effect -> state feedback -> render
```

Input sources:

- Voice: complete prepared spell name.
- Canvas: prepared spell button.
- Keyboard: optional testing shortcut that maps to a prepared spell slot.

Validation:

- Actor exists and is not defeated.
- Match phase is active.
- Spell exists in confirmed loadout.
- Actor has enough energy.
- Spell cooldown is ready.
- Voice retry delay and global voice lockout allow the cast.

Failure reasons must be user-facing and logged: unknown spell, inactive match, defeated, not enough energy, cooldown, voice retry, or voice lockout.

## Core Formulas And Rules

Use config values for every threshold, label, cost, and duration.

Energy:

```text
energy = clamp(currentEnergy + regenPerSecond * deltaSeconds, minEnergy, maxEnergy)
```

Pattern weight:

```text
Light    = 1-2 connections
Standard = 3-4 connections
Heavy    = 5-6 connections
Grand    = 7+ connections
```

Spell cost:

```text
spellCost = baseCostForWeight + crossedLineCount * crossedLineEnergyPenalty
```

Piercing:

```text
0-1 sharp angles = no shield pierce
2-3 sharp angles = low shield pierce
4+ sharp angles  = high shield pierce
```

Damage priority:

```text
incoming damage -> piercing bypass -> active shield -> HP -> clamp HP at minHp
```

Result priority:

- Defeat ends the match when one or both sides reach minimum HP.
- Simultaneous defeat uses configured tiebreakers.
- Timer expiry uses HP first, then energy, then draw.

## System Guidance

### Configuration

`src/config.js` is the only place non-coders should need to tune the prototype. Add new constants there first, grouped by domain, with comments and safe ranges.

### Game State

State should be plain data where possible. Avoid storing Canvas contexts, DOM nodes, timers, or browser-only objects in state. This keeps state easy to reset, inspect, and test.

### Input

Input modules read keyboard, pointer, touch, and voice events, then emit normalized intents. They must not apply damage, spend energy, pick AI actions, or draw UI.

### Spell Preparation

Preparation owns 9-dot point selection, random patterns, name editing, type selection, spell save attempts, loadout validation, and loadout confirmation. Pattern math belongs in spell modules, not render code.

### Combat

Combat owns cast validation, energy spend, cooldown starts, damage, shields, healing, slow, utility effects, HP clamps, and result checks. Combat code must not draw Canvas UI.

### AI

AI uses the same spell, energy, cooldown, damage, and result rules as the player. AI decision code may choose an intent, but shared combat code resolves it.

### Rendering

Rendering receives state and config, then draws. It must not decide gameplay outcomes. Canvas hitboxes come from `ui/layout.js` or equivalent layout helpers.

### Logging

Log through the shared logger with config gates. Required log points:

- App boot and state transitions.
- Pattern created, cleared, randomized, and analyzed.
- Spell save success or rejection.
- Loadout confirmation.
- Raw voice phrase and normalized input.
- Cast success or failure with reason.
- Energy spend/regeneration and cooldown updates.
- Effect application, damage resolution, HP changes, and result selection.
- AI decisions.
- Restart, build diagnostics, and server diagnostics.

## Testing Requirements

Use Node tests for logic-based code. Tests must not require Canvas rendering, real microphone input, browser permissions, network access, or real-time waits.

Current coverage should include:

- Config shape and required tuning sections.
- Initial state and state transitions.
- Canvas layout helper output.
- Pattern connection count, weight band, crossed lines, closed patterns, piercing, instability, and costs.
- Spell creation, effect preview, name validation, similar-name rejection, and five-slot loadout confirmation.
- Prepared spell input mapping.
- Cast validation failures and success path.
- Energy spend, shortage, regeneration, and clamp.
- Spell cooldowns and voice lockouts.
- Attack, Defense, Support, Control, and Utility effects.
- Shield and piercing resolution.
- Timer, defeat, tiebreakers, restart, and return-to-preparation reset.

Next coverage should include:

- AI spell choices using shared rules.
- AI energy/cooldown management and tactical priorities.
- Full two-sided match simulations.

## Build, Diagnostics, And Commit Workflow

At the end of every completed request:

1. Run the test suite.
2. Run the local compile/build check.
3. Fix failing tests or build errors before reporting success.
4. Verify the local dev server is running; if it is not running, start it.
5. Report any sandbox limitation that blocks local tests, build, or server diagnostics, and say exactly what should be run locally.
6. If checks pass, commit all relevant changes with a clear conventional message such as `feat: add spell casting`, `fix: correct shield math`, `chore: update docs`, or `test: cover pattern validation`.

Do not report completion while the build is failing.

## Tunable Config Inventory

Every item below belongs in `src/config.js` or an equivalent single centralized config export. Each key must be commented with purpose and recommended range. New work should add missing target-combat keys here before using them in code.

### Meta And Diagnostics

- `meta.title`, `meta.version`
- `diagnostics.devServerPort`, `diagnostics.buildOutputFolder`, `diagnostics.pagesBranch`

### Logging

- `logging.enabled`, `logging.prefix`, `logging.verboseFrames`
- Add category flags as needed: input, spell, combat, AI, state, build, server.

### States And Timing

- `states.preparation`, `states.matchPreview`, `states.countdown`, `states.active`, `states.result`
- `match.durationSeconds`, `match.countdownSeconds`, `match.fightBannerSeconds`
- Add result delay and restart delay when result flow is implemented.

### Canvas And Page Container

- `canvas.width`, `canvas.height`, `canvas.elementId`, `canvas.cssWidth`, `canvas.cssHeight`, `canvas.pageBackground`

### Colors And Fonts

- `colors.background`, `colors.arenaFar`, `colors.arenaNear`, `colors.arenaLine`
- `colors.panelFill`, `colors.panelStroke`, `colors.textPrimary`, `colors.textSecondary`
- `colors.hpFill`, `colors.hpBack`, `colors.cooldownReady`, `colors.cooldownBlocked`
- `colors.playerDragon`, `colors.aiDragon`, `colors.playerBody`, `colors.aiBody`
- `colors.skillEffect`, `colors.defenceAura`
- `colors.warning`, `colors.buttonFill`, `colors.buttonHighlight`, `colors.overlayFill`
- `fonts.family`, `fonts.overlaySize`, `fonts.largeSize`, `fonts.normalSize`, `fonts.smallSize`, `fonts.buttonSize`, `fonts.boldWeight`, `fonts.normalWeight`

### Match Stats

- `match.startingHp`, `match.minHp`, `match.startingEnergy`, `match.minEnergy`, `match.maxEnergy`, `match.energyRegenPerSecond`, `match.energyDisplayRoundingMode`
- `match.sideCount`, `match.playerId`, `match.aiId`
- `match.countdownPhase`, `match.activePhase`, `match.resultPhase`
- `match.winLabel`, `match.loseLabel`, `match.drawLabel`, `match.restartHint`

### Spell Loadout

- `spells.perLoadout`, `spells.elements`, `spells.defaultFamilies`, `spells.moveNamesByType`, `spells.defaultPlayerNames`, `spells.defaultAiNames`, `spells.types`
- `spells.minimumNameLength`, `spells.similarNameThreshold`, `spells.nameCycle`
- `spells.placeholderStatus`, `spells.effectPreviewPlaceholder`

### Pattern Analysis

- `patterns.pointCount`, `patterns.firstPointId`, `patterns.rows`, `patterns.columns`, `patterns.allowReverseDuplicateConnections`
- `patterns.lightMinConnections`, `patterns.lightMaxConnections`, `patterns.standardMinConnections`, `patterns.standardMaxConnections`
- `patterns.heavyMinConnections`, `patterns.heavyMaxConnections`, `patterns.grandMinConnections`
- `patterns.uniquePointsForSecondaryEffect`, `patterns.crossedLineEnergyPenalty`, `patterns.unstableMisfireChance`
- `patterns.randomMinConnections`, `patterns.randomMaxConnections`, `patterns.randomPointAttemptLimit`
- `patterns.noPierceMaxSharpAngles`, `patterns.lowPierceMinSharpAngles`, `patterns.lowPierceMaxSharpAngles`, `patterns.highPierceMinSharpAngles`
- `patterns.lowPiercePercent`, `patterns.highPiercePercent`, `patterns.sharpAngleDotThreshold`, `patterns.percentMultiplier`
- `patterns.lightLabel`, `patterns.standardLabel`, `patterns.heavyLabel`, `patterns.grandLabel`, `patterns.unformedLabel`

### Spell Costs And Effects

- `spellCosts.Light`, `spellCosts.Standard`, `spellCosts.Heavy`, `spellCosts.Grand`, `spellCosts.Unformed`
- `spellEffects.attackDamageByWeight.Light`, `spellEffects.attackDamageByWeight.Standard`, `spellEffects.attackDamageByWeight.Heavy`, `spellEffects.attackDamageByWeight.Grand`, `spellEffects.attackDamageByWeight.Unformed`
- `spellEffects.defenseShieldByWeight.Light`, `spellEffects.defenseShieldByWeight.Standard`, `spellEffects.defenseShieldByWeight.Heavy`, `spellEffects.defenseShieldByWeight.Grand`, `spellEffects.defenseShieldByWeight.Unformed`
- `spellEffects.supportHealByWeight.Light`, `spellEffects.supportHealByWeight.Standard`, `spellEffects.supportHealByWeight.Heavy`, `spellEffects.supportHealByWeight.Grand`, `spellEffects.supportHealByWeight.Unformed`
- `spellEffects.controlSlowSecondsByWeight.Light`, `spellEffects.controlSlowSecondsByWeight.Standard`, `spellEffects.controlSlowSecondsByWeight.Heavy`, `spellEffects.controlSlowSecondsByWeight.Grand`, `spellEffects.controlSlowSecondsByWeight.Unformed`
- `spellEffects.utilityBonusSecondsByWeight.Light`, `spellEffects.utilityBonusSecondsByWeight.Standard`, `spellEffects.utilityBonusSecondsByWeight.Heavy`, `spellEffects.utilityBonusSecondsByWeight.Grand`, `spellEffects.utilityBonusSecondsByWeight.Unformed`
- `spellEffects.closedAttackBonusDamage`, `spellEffects.closedDefenseBonusShield`, `spellEffects.closedSupportBonusHeal`, `spellEffects.closedControlBonusSeconds`, `spellEffects.closedUtilityBonusSeconds`
- Add misfire effect modifiers when spell combat is implemented.

### Casting And Cooldowns

- Current keys: `spellCasting.baseCooldownSeconds`, `spellCasting.voiceCooldownMultiplier`, `spellCasting.buttonCooldownMultiplier`, `spellCasting.slowCooldownMultiplier`, `spellCasting.voiceRetryDelaySeconds`, `spellCasting.voiceGlobalLockoutSeconds`, `combat.failedFeedbackSeconds`, `combat.cooldownReadyLabel`, `combat.cooldownDecimalPlaces`
- Target spell-combat keys to add: inactive-input feedback duration.

### Shield And Damage

- Current keys: `shieldAndDamage.shieldDurationSeconds`, `shieldAndDamage.utilityBonusRegenPerSecond`, `shieldAndDamage.fullDamageMultiplier`, `shieldAndDamage.damageRoundingMode`, `shieldAndDamage.hpRoundingMode`
- Target spell-combat keys to add: additional shield absorption rules and damage text variants.

### AI

- Current keys: `ai.actionIntervalSeconds`, `ai.defaultSeed`, `ai.waitingLabel`
- Target spell-combat keys to add: support HP threshold, defensive reaction window, spell type preference weights, AI loadout names.

### Input

- `input.voiceEnabled`, `input.speechLanguage`, `input.voiceUnavailableText`, `input.voiceListeningText`, `input.voiceReadyText`
- `input.voiceButtonLabel`, `input.restartKey`, `input.voiceKey`, `input.maxTranscriptCharacters`, `input.invalidKeyText`
- Add voice confidence threshold and microphone mode when the casting pipeline is expanded.

### Preparation Layout

- `layout.eggDrawingX`, `layout.eggDrawingY`, `layout.eggDrawingWidth`, `layout.eggDrawingHeight`
- `layout.eggGridGap`, `layout.eggGridRows`, `layout.eggGridColumns`, `layout.eggGridPointRadius`
- `layout.forgePanelX`, `layout.forgePanelY`, `layout.forgePanelWidth`, `layout.forgePanelHeight`
- `layout.spellSlotsX`, `layout.spellSlotsY`, `layout.spellSlotsWidth`, `layout.spellSlotsHeight`, `layout.spellSlotHeight`, `layout.spellSlotGap`, `layout.deleteSpellButtonWidth`, `layout.deleteSpellButtonHeight`
- `layout.prepButtonWidth`, `layout.prepButtonHeight`, `layout.spellTypeButtonWidth`, `layout.spellTypeButtonHeight`, `layout.spellTypeButtonGap`, `layout.spellTypeButtonColumns`
- `layout.spellNameFieldHeight`, `layout.saveSpellButtonWidth`

### Match Layout

- Shared layout: `layout.outerPadding`, `layout.cornerRadius`, `layout.panelLineWidth`, `layout.bottomMargin`, `layout.iconRadius`
- HUD: `layout.statusPanelWidth`, `layout.statusPanelHeight`, `layout.hpBarHeight`, `layout.hpBarY`, `layout.cooldownChipWidth`, `layout.cooldownChipHeight`, `layout.cooldownChipGap`, `layout.timerPanelWidth`, `layout.timerPanelHeight`, `layout.latestPanelWidth`, `layout.latestPanelHeight`
- Command panel: `layout.commandPanelWidth`, `layout.commandPanelHeight`
- Spell buttons and voice: `layout.voiceButtonWidth`, `layout.actionButtonHeight`, `layout.actionButtonY`, `layout.spellButtonWidth`, `layout.spellButtonHeight`, `layout.spellButtonGap`, `layout.spellButtonY`
- Result controls: `layout.restartButtonWidth`, `layout.overlayButtonHeight`
- Arena and actors: `layout.horizonY`, `layout.floorBottomY`, `layout.playerHumanX`, `layout.playerHumanY`, `layout.playerDragonX`, `layout.playerDragonY`, `layout.aiHumanX`, `layout.aiHumanY`, `layout.aiDragonX`, `layout.aiDragonY`, `layout.playerDragonWidth`, `layout.playerDragonHeight`, `layout.aiDragonWidth`, `layout.aiDragonHeight`, `layout.humanWidth`, `layout.humanHeight`, `layout.dragonFeatureScale`, `layout.stateLabelOffsetY`
- Arena bounds and effect placement: `layout.arenaNearLeft`, `layout.arenaNearRight`, `layout.arenaFarLeft`, `layout.arenaFarRight`, `layout.effectArcOffsetY`, `layout.effectLineWidth`

### Animation And Effects

- `animation.hitTextSeconds`, `animation.hitTextRise`, `animation.projectileSeconds`, `animation.shakeSeconds`, `animation.shakePixels`, `animation.dragonBobPixels`, `animation.dragonBobSeconds`

### Text

- Names and identity: `text.playerName`, `text.aiName`, `text.playerElement`, `text.aiElement`
- Headings: `text.commandReferenceTitle`, `text.preparationTitle`, `text.preparationSubtitle`, `text.eggDrawingTitle`, `text.spellTypeTitle`, `text.spellNameTitle`, `text.effectPreviewTitle`, `text.spellSlotsTitle`, `text.matchPreviewTitle`
- Buttons: `text.randomPatternLabel`, `text.confirmLoadoutLabel`, `text.saveSpellLabel`, `text.deleteSpellLabel`, `text.cycleNameLabel`, `text.clearPatternLabel`, `text.backToForgeLabel`
- Feedback: `text.prepReadyFeedback`, `text.spellSavedFeedback`, `text.spellSelectedFeedback`, `text.spellDeletedFeedback`, `text.spellNameRejectedFeedback`, `text.patternRejectedFeedback`, `text.loadoutReadyFeedback`, `text.loadoutBlockedFeedback`
- HUD and hints: `text.energyLabel`, `text.energyShortLabel`, `text.microphoneStateLabel`, `text.latestPlayerTitle`, `text.latestAiTitle`, `text.noPlayerCommand`, `text.noAiCommand`, `text.fallbackHint`, `text.assetWarning`

## Known Technical Debt

- Match screen still includes preview-state affordances while active spell combat matures.
- AI is intentionally disabled in the active match loop for Milestone 2 and needs tactical casting in Milestone 3.
- Renderer is broad and may need splitting when combat visuals grow.
