// Dragon Contractor centralized configuration.
// All gameplay, timing, layout, visual, input, AI, logging, and diagnostic tunables live here.
// Non-coders should be able to adjust this file for playtesting without editing source logic.

export const CONFIG = {
  meta: {
    // Human-readable prototype title shown in logs and the browser title. Recommended: short text under 40 characters.
    title: 'Dragon Contractor',
    // Current prototype version shown in diagnostics. Recommended: semantic version-like text.
    version: '1.0.0'
  },

  diagnostics: {
    // Local development server port used by the dev script. Recommended range: 3000â€“9999.
    devServerPort: 5173,
    // Build output folder used by the build script. Recommended: a short folder name such as dist.
    buildOutputFolder: 'dist',
    // GitHub Pages branch name suggested for manual deploys. Recommended: gh-pages or main/docs.
    pagesBranch: 'gh-pages'
  },

  logging: {
    // Enables important gameplay logs for debugging input, combat, AI, and match state. Recommended: true during prototype development, false for demos.
    enabled: true,
    // Prefix added to every log message so game logs are easy to find in the browser console. Recommended: short text.
    prefix: '[Dragon Contractor]',
    // Enables more frequent frame/state logs. Recommended: false unless debugging timing problems.
    verboseFrames: false
  },

  states: {
    // Preparation state name used before combat so the player can review the egg spell forge. Recommended: preparation.
    preparation: 'preparation',
    // Match preview state name used for the static battle HUD layout. Recommended: match-preview.
    matchPreview: 'match-preview',
    // Countdown state name used once a real match wrapper is active. Recommended: countdown.
    countdown: 'countdown',
    // Active match state name used when combat rules are live. Recommended: active.
    active: 'active',
    // Result state name used after win, lose, or draw. Recommended: result.
    result: 'result'
  },

  canvas: {
    // Internal design width for all Canvas drawing. Recommended range: 960â€“1920.
    width: 1280,
    // Internal design height for all Canvas drawing. Recommended range: 540â€“1080.
    height: 720,
    // Canvas element id used by the HTML container. Recommended: keep as game.
    elementId: 'game',
    // CSS width applied to the Canvas so it fills the browser. Recommended: 100vw.
    cssWidth: '100vw',
    // CSS height applied to the Canvas so it fills the browser. Recommended: 100vh.
    cssHeight: '100vh',
    // Background color applied to the HTML body only behind the Canvas. Recommended: dark neutral color.
    pageBackground: '#08111f'
  },

  colors: {
    // Main sky/arena background color. Recommended: dark fantasy color for readability.
    background: '#10233f',
    // Far arena floor color. Recommended: muted ground color.
    arenaFar: '#294768',
    // Near arena floor color. Recommended: slightly brighter than arenaFar.
    arenaNear: '#40658f',
    // Arena boundary and line color. Recommended: readable low-saturation color.
    arenaLine: '#8fb8d9',
    // Primary panel fill color. Recommended: dark translucent color.
    panelFill: 'rgba(7, 17, 34, 0.84)',
    // Primary panel border color. Recommended: bright enough against panelFill.
    panelStroke: '#bad7ff',
    // Main text color. Recommended: near-white.
    textPrimary: '#f5fbff',
    // Secondary text color. Recommended: light blue/gray.
    textSecondary: '#b8cce6',
    // HP bar remaining health color. Recommended: saturated green.
    hpFill: '#49d17d',
    // HP bar missing health color. Recommended: dark red/brown.
    hpBack: '#5b1f2a',
    // Cooldown ready indicator color. Recommended: green or blue.
    cooldownReady: '#71e0ff',
    // Cooldown unavailable indicator color. Recommended: amber/orange.
    cooldownBlocked: '#ffb24d',
    // Player dragon body color. Recommended: distinct from AI dragon.
    playerDragon: '#67d0ff',
    // AI dragon body color. Recommended: distinct from player dragon.
    aiDragon: '#ff806d',
    // Player character silhouette color. Recommended: neutral light color.
    playerBody: '#d8e6ff',
    // AI character silhouette color. Recommended: neutral warm color.
    aiBody: '#ffd5c7',
    // Skill projectile color. Recommended: dramatic bright color.
    skillEffect: '#ff5fd2',
    // Shield aura color. Recommended: cool shield color.
    defenceAura: 'rgba(78, 194, 255, 0.38)',
    // Failed command feedback color. Recommended: red/orange.
    warning: '#ff6b6b',
    // Canvas fallback button fill color. Recommended: dark translucent color.
    buttonFill: 'rgba(12, 28, 54, 0.92)',
    // Canvas fallback button pressed/hover highlight color. Recommended: lighter than buttonFill.
    buttonHighlight: 'rgba(54, 112, 174, 0.96)',
    // Full-screen overlay color. Recommended: translucent black.
    overlayFill: 'rgba(3, 8, 15, 0.78)'
  },

  fonts: {
    // Font family used for all Canvas text. Recommended: system-safe sans-serif stack.
    family: 'Arial, Helvetica, sans-serif',
    // Large overlay text size in pixels. Recommended range: 48â€“96.
    overlaySize: 72,
    // Large HUD text size in pixels. Recommended range: 24â€“42.
    largeSize: 34,
    // Normal HUD text size in pixels. Recommended range: 16â€“28.
    normalSize: 22,
    // Small HUD text size in pixels. Recommended range: 12â€“20.
    smallSize: 16,
    // Button label text size in pixels. Recommended range: 16â€“26.
    buttonSize: 20,
    // Font weight for important labels. Recommended: bold or 700.
    boldWeight: '700',
    // Font weight for regular labels. Recommended: normal or 400.
    normalWeight: '400'
  },

  match: {
    // Total active match duration after countdown, in seconds. Recommended range: 30â€“90.
    durationSeconds: 60,
    // Starting countdown duration, in seconds. Recommended range: 2â€“5.
    countdownSeconds: 3,
    // Time the Fight banner remains visible when active play starts, in seconds. Recommended range: 0.25â€“1.5.
    fightBannerSeconds: 0.8,
    // Starting HP for each side. Recommended range: 50â€“200.
    startingHp: 100,
    // Starting energy cubes for each side. Recommended range: 10-30.
    startingEnergy: 20,
    // Lowest allowed energy value. Recommended: 0.
    minEnergy: 0,
    // Highest allowed energy cubes for each side. Recommended range: 20-50.
    maxEnergy: 30,
    // Energy regenerated each second during active combat. Recommended range: 0.5-3.
    energyRegenPerSecond: 1,
    // Rounding mode used only for displayed energy numbers. Recommended: floor to avoid overpromising spendable energy.
    energyDisplayRoundingMode: 'floor',
    // Lowest allowed HP value. Recommended: 0.
    minHp: 0,
    // Number of players in the prototype. Recommended: 2 for this vertical slice.
    sideCount: 2,
    // Player side id. Recommended: p1.
    playerId: 'p1',
    // AI side id. Recommended: p2.
    aiId: 'p2',
    // Match phase name before active combat. Recommended: countdown.
    countdownPhase: 'countdown',
    // Match phase name for active combat. Recommended: active.
    activePhase: 'active',
    // Match phase name after result is chosen. Recommended: result.
    resultPhase: 'result',
    // Result shown when Player 1 wins. Recommended: Win.
    winLabel: 'Win',
    // Result shown when Player 1 loses. Recommended: Lose.
    loseLabel: 'Lose',
    // Result shown when neither side wins. Recommended: Draw.
    drawLabel: 'Draw',
    // Restart instruction shown on result overlay. Recommended: short text.
    restartHint: 'Press R or tap Restart to play again'
  },

  combat: {
    // Short duration for failed contract labels such as Contract Cooldown or Unknown Dragon, in seconds. Recommended range: 0.4-1.2.
    failedFeedbackSeconds: 0.8,
    // State label shown when a dragon is doing nothing. Recommended: Idle.
    idleLabel: 'Idle',
    // State label shown when an action is on cooldown and a player tried to use it. Recommended: Cooldown.
    cooldownLabel: 'Contract Cooldown',
    // Cooldown chip label shown when a spell can be cast. Recommended: Ready.
    cooldownReadyLabel: 'Ready',
    // Number of decimal places shown for cooldown countdowns. Recommended range: 0-1.
    cooldownDecimalPlaces: 1,
    // State label shown after HP reaches zero. Recommended: Defeated.
    defeatedLabel: 'Defeated',
    // Failure reason shown for calls that do not match a valid dragon name. Recommended: Unknown Dragon.
    unknownCommandReason: 'Unknown Dragon',
    // Failure reason shown when an action is still cooling down. Recommended: Cooldown.
    cooldownReason: 'Contract Cooldown',
    // Failure reason shown when the actor is already defeated. Recommended: Defeated.
    defeatedReason: 'Defeated',
    // Failure reason shown when commands are attempted outside active match. Recommended: Match Inactive.
    inactiveReason: 'Match Inactive',
    // Failure reason shown while voice input is briefly locked after success. Recommended: Voice Cooling.
    voiceLockoutReason: 'Voice Cooling',
    // Failure reason shown during retry delay after a failed voice phrase. Recommended: Voice Retry.
    voiceRetryReason: 'Voice Retry',
    // Success reason text shown internally for successful commands. Recommended: Success.
    successReason: 'Success'
  },

  ai: {
    // How often the AI attempts one spell while the match is active, in seconds. Recommended range: 1.5â€“3.
    actionIntervalSeconds: 2,
    // Random seed used by deterministic tests and optional debug runs. Recommended: any positive integer.
    defaultSeed: 42,
    // AI command shown when no action has happened yet. Recommended: Waiting.
    waitingLabel: 'Waiting'
  },

  dragonContracts: {
    // Number of bound dragon contracts each side brings into combat. Recommended: exactly 4 for this prototype roster.
    perLoadout: 4,
    // Fixed prototype roster; each contract binds one dragon name to one power behavior.
    definitions: [
      { id: 'ignivar', dragonName: 'Ignivar', powerType: 'Attack', powerName: 'Flame Slash', damage: 10, durationSeconds: 0, damageMultiplier: 1, cooldownSeconds: 2, energyCost: 0 },
      { id: 'aegon', dragonName: 'Aegon', powerType: 'Defence', powerName: 'Halfguard Pact', damage: 0, durationSeconds: 3, damageMultiplier: 0.5, cooldownSeconds: 6, energyCost: 0 },
      { id: 'bront', dragonName: 'Bront', powerType: 'Block', powerName: 'Stone Block', damage: 0, durationSeconds: 1, damageMultiplier: 0, cooldownSeconds: 5, energyCost: 0 },
      { id: 'voltaris', dragonName: 'Voltaris', powerType: 'Skill', powerName: 'Storm Crash', damage: 25, durationSeconds: 0, damageMultiplier: 1, cooldownSeconds: 10, energyCost: 0 }
    ]
  },

  spells: {
    // Number of prepared contract slots each side brings into combat. Recommended: match dragonContracts.perLoadout.
    perLoadout: 4,
    // Element names used as the first word in generated spell names. Recommended: short readable words.
    elements: ['Light', 'Fire', 'Water', 'Earth', 'Wind', 'Dark', 'Stone', 'Ice'],
    // Spell family names derived from elements for placeholder identity. Recommended: match the first five elements.
    defaultFamilies: ['Light', 'Fire', 'Water', 'Earth', 'Wind'],
    // Move words used as the second word in generated spell names by spell type. Recommended: distinct action nouns.
    moveNamesByType: {
      Attack: 'Slash',
      Defence: 'Guard',
      Block: 'Block',
      Skill: 'Crash'
    },
    // Default player dragon names shown before custom contracts are created. Recommended: match the prototype roster.
    defaultPlayerNames: ['Ignivar', 'Aegon', 'Bront', 'Voltaris'],
    // Default AI dragon names shown before custom contracts are created. Recommended: match the prototype roster.
    defaultAiNames: ['Ignivar', 'Aegon', 'Bront', 'Voltaris'],
    // Dragon power labels used in the contract selector. Recommended: the four prototype power types.
    types: ['Attack', 'Defence', 'Block', 'Skill'],
    // Minimum accepted spell name length before saving a spell. Recommended range: 3-12 characters.
    minimumNameLength: 3,
    // Similarity ratio where two names are considered too close. Recommended range: 0.65-0.9.
    similarNameThreshold: 0.72,
    // Candidate element order cycled by the Canvas name button. Move word comes from selected spell type.
    nameCycle: ['Light', 'Fire', 'Water', 'Earth', 'Wind', 'Dark', 'Stone', 'Ice'],
    // Placeholder text for empty or not-yet-editable spell slots. Recommended: short status text.
    placeholderStatus: 'Ready to forge',
    // Static effect preview text before spell rules are implemented. Recommended: short text.
    effectPreviewPlaceholder: 'Effect preview placeholder'
  },

  patterns: {
    // Number of points available in the 9-dot grid. Recommended: 9.
    pointCount: 9,
    // Lowest valid point id in the grid. Recommended: 1.
    firstPointId: 1,
    // Number of rows in the 9-dot spell grid. Recommended: 3.
    rows: 3,
    // Number of columns in the 9-dot spell grid. Recommended: 3.
    columns: 3,
    // Whether the reverse of an existing connection is allowed. Recommended: false for readable patterns.
    allowReverseDuplicateConnections: false,
    // Light spell minimum connection count. Recommended: 1.
    lightMinConnections: 1,
    // Light spell maximum connection count. Recommended: 2.
    lightMaxConnections: 2,
    // Standard spell minimum connection count. Recommended: 3.
    standardMinConnections: 3,
    // Standard spell maximum connection count. Recommended: 4.
    standardMaxConnections: 4,
    // Heavy spell minimum connection count. Recommended: 5.
    heavyMinConnections: 5,
    // Heavy spell maximum connection count. Recommended: 6.
    heavyMaxConnections: 6,
    // Grand spell minimum connection count. Recommended: 7.
    grandMinConnections: 7,
    // Unique points required to add a secondary effect. Recommended: 5.
    uniquePointsForSecondaryEffect: 5,
    // Extra energy cost added for each crossed line. Recommended range: 1-4.
    crossedLineEnergyPenalty: 2,
    // Chance an unstable crossed-line spell misfires during casting. Recommended range: 0.1-0.4.
    unstableMisfireChance: 0.25,
    // Minimum generated random pattern connections. Recommended range: 2-4.
    randomMinConnections: 3,
    // Maximum generated random pattern connections. Recommended range: 4-8.
    randomMaxConnections: 6,
    // Maximum attempts to find a new random connection before scanning for a fallback. Recommended range: 9-40.
    randomPointAttemptLimit: 18,
    // Sharp angle count that still has no shield piercing. Recommended: 1.
    noPierceMaxSharpAngles: 1,
    // Sharp angle count where low piercing starts. Recommended: 2.
    lowPierceMinSharpAngles: 2,
    // Sharp angle count where low piercing ends. Recommended: 3.
    lowPierceMaxSharpAngles: 3,
    // Sharp angle count where high piercing starts. Recommended: 4.
    highPierceMinSharpAngles: 4,
    // Low shield piercing percent. Recommended: 0.25.
    lowPiercePercent: 0.25,
    // High shield piercing percent. Recommended: 0.5.
    highPiercePercent: 0.5,
    // Dot-product angle threshold used to count a corner as sharp. Recommended range: -0.2 to 0.4.
    sharpAngleDotThreshold: 0.35,
    // Multiplier used to format decimal rates as percentages. Recommended: 100.
    percentMultiplier: 100,
    // Weight label for 1-2 connection spells. Recommended: Light.
    lightLabel: 'Light',
    // Weight label for 3-4 connection spells. Recommended: Standard.
    standardLabel: 'Standard',
    // Weight label for 5-6 connection spells. Recommended: Heavy.
    heavyLabel: 'Heavy',
    // Weight label for 7+ connection spells. Recommended: Grand.
    grandLabel: 'Grand',
    // Weight label for patterns without enough connections. Recommended: Unformed.
    unformedLabel: 'Unformed'
  },

  spellCosts: {
    // Energy cost for Light spells before crossed-line penalties. Recommended: 4.
    Light: 4,
    // Energy cost for Standard spells before crossed-line penalties. Recommended: 6.
    Standard: 6,
    // Energy cost for Heavy spells before crossed-line penalties. Recommended: 8.
    Heavy: 8,
    // Energy cost for Grand spells before crossed-line penalties. Recommended: 10.
    Grand: 10,
    // Energy cost shown before a valid pattern exists. Recommended: 0.
    Unformed: 0
  },

  spellEffects: {
    // Attack spell damage by weight before combat mitigation. Recommended: 12, 18, 24, 30.
    attackDamageByWeight: { Light: 12, Standard: 18, Heavy: 24, Grand: 30, Unformed: 0 },
    // Defense spell shield amount by weight. Recommended: 16, 24, 32, 40.
    defenseShieldByWeight: { Light: 16, Standard: 24, Heavy: 32, Grand: 40, Unformed: 0 },
    // Support spell healing by weight. Recommended: 8, 12, 16, 20.
    supportHealByWeight: { Light: 8, Standard: 12, Heavy: 16, Grand: 20, Unformed: 0 },
    // Control spell slow duration by weight in seconds. Recommended: 1.5-3.
    controlSlowSecondsByWeight: { Light: 1.5, Standard: 2, Heavy: 2.5, Grand: 3, Unformed: 0 },
    // Utility spell bonus regeneration duration by weight in seconds. Recommended: 2-5.
    utilityBonusSecondsByWeight: { Light: 2, Standard: 3, Heavy: 4, Grand: 5, Unformed: 0 },
    // Closed Attack pattern bonus damage. Recommended: 3.
    closedAttackBonusDamage: 3,
    // Closed Defense pattern bonus shield. Recommended: 4.
    closedDefenseBonusShield: 4,
    // Closed Support pattern bonus healing. Recommended: 3.
    closedSupportBonusHeal: 3,
    // Closed Control pattern bonus duration in seconds. Recommended: 0.5.
    closedControlBonusSeconds: 0.5,
    // Closed Utility pattern bonus duration in seconds. Recommended: 1.
    closedUtilityBonusSeconds: 1
  },

  spellCasting: {
    // Base cooldown duration applied to custom contracts before input multipliers. Recommended range: 1.5-4.
    baseCooldownSeconds: 2,
    // Cooldown multiplier for voice-invoked contracts. Recommended: 1.0 (same as base).
    voiceCooldownMultiplier: 1.0,
    // Cooldown multiplier for button/keyboard-invoked contracts. Recommended: 1.5 (longer to encourage voice).
    buttonCooldownMultiplier: 1.5,
    // Cooldown multiplier applied while a caster is slowed. Recommended range: 1.25-2.0.
    slowCooldownMultiplier: 1.5,
    // Delay before a failed voice cast can be retried, in seconds. Recommended range: 0.3-1.0.
    voiceRetryDelaySeconds: 0.5,
    // Global lockout after a successful voice cast before next voice input is accepted, in seconds. Recommended range: 0.05-0.3.
    voiceGlobalLockoutSeconds: 0.1
  },

  shieldAndDamage: {
    // Duration that a shield buff remains active before expiring, in seconds. Recommended range: 3-8.
    shieldDurationSeconds: 5,
    // Bonus energy regenerated each second while Utility is active. Recommended range: 1-4.
    utilityBonusRegenPerSecond: 2,
    // Damage multiplier when target has no shield or block. Recommended: 1.0.
    fullDamageMultiplier: 1.0,
    // Rounding mode for damage calculations. Recommended: round.
    damageRoundingMode: 'round',
    // Rounding mode for HP changes. Recommended: round.
    hpRoundingMode: 'round'
  },

  input: {
    // Enables browser speech recognition when supported. Recommended: true for voice prototype testing.
    voiceEnabled: true,
    // Speech recognition language. Recommended: en-US for the current dragon names.
    speechLanguage: 'en-US',
    // Text shown when voice recognition is unavailable in the current browser. Recommended: short message.
    voiceUnavailableText: 'Voice unavailable: use keys or Canvas buttons',
    // Text shown while the mic is listening. Recommended: short message.
    voiceListeningText: 'Listening... call a dragon name',
    // Text shown before voice listening starts. Recommended: short message.
    voiceReadyText: 'Tap Voice to call a dragon',
    // Canvas voice button label. Recommended: Voice.
    voiceButtonLabel: 'Voice',
    // Restart key for desktop. Recommended: r.
    restartKey: 'r',
    // Keyboard key used to toggle voice listening. Recommended: v.
    voiceKey: 'v',
    // Maximum transcript length shown in the HUD. Recommended range: 20â€“60 characters.
    maxTranscriptCharacters: 36,
    // Message shown for invalid keyboard input in debug feedback. Recommended: short text.
    invalidKeyText: 'No command mapped to key'
  },

  layout: {
    // Padding around outer HUD elements in pixels. Recommended range: 12â€“32.
    outerPadding: 20,
    // Status panel width in pixels. Recommended range: 260â€“380.
    statusPanelWidth: 330,
    // Status panel height in pixels. Recommended range: 100â€“160.
    statusPanelHeight: 132,
    // Corner radius for Canvas panels and buttons in pixels. Recommended range: 6â€“20.
    cornerRadius: 14,
    // Border line width for panels in pixels. Recommended range: 1â€“4.
    panelLineWidth: 2,
    // HP bar height in pixels. Recommended range: 12â€“28.
    hpBarHeight: 18,
    // HP bar vertical offset inside status panels in pixels. Recommended range: 36â€“72.
    hpBarY: 48,
    // Width of each cooldown chip in pixels. Recommended range: 46â€“76.
    cooldownChipWidth: 63,
    // Height of each cooldown chip in pixels. Recommended range: 18â€“34.
    cooldownChipHeight: 24,
    // Spacing between cooldown chips in pixels. Recommended range: 4â€“12.
    cooldownChipGap: 7,
    // Top-center timer panel width in pixels. Recommended range: 180â€“320.
    timerPanelWidth: 240,
    // Top-center timer panel height in pixels. Recommended range: 58â€“96.
    timerPanelHeight: 74,
    // Bottom command panel width in pixels. Recommended range: 420â€“760.
    commandPanelWidth: 610,
    // Bottom command panel height in pixels. Recommended range: 66â€“120.
    commandPanelHeight: 88,
    // Width for latest command panels in pixels. Recommended range: 280â€“420.
    latestPanelWidth: 360,
    // Height for latest command panels in pixels. Recommended range: 58â€“96.
    latestPanelHeight: 82,
    // Preparation screen main drawing area x position in design pixels. Recommended range: 40-180.
    eggDrawingX: 70,
    // Preparation screen main drawing area y position in design pixels. Recommended range: 120-220.
    eggDrawingY: 150,
    // Preparation screen main drawing area width in pixels. Recommended range: 320-520.
    eggDrawingWidth: 430,
    // Preparation screen main drawing area height in pixels. Recommended range: 320-500.
    eggDrawingHeight: 410,
    // 9-dot grid spacing inside the egg drawing panel in pixels. Recommended range: 70-120.
    eggGridGap: 96,
    // Number of rows in the 9-dot egg grid. Recommended: 3.
    eggGridRows: 3,
    // Number of columns in the 9-dot egg grid. Recommended: 3.
    eggGridColumns: 3,
    // 9-dot grid point radius in pixels. Recommended range: 6-18.
    eggGridPointRadius: 10,
    // Extra vertical offset for centering the 9-dot grid inside its panel. Recommended range: 0-40.
    eggGridCenterYOffset: 24,
    // Preparation control panel x position in design pixels. Recommended range: 520-760.
    forgePanelX: 545,
    // Preparation control panel y position in design pixels. Recommended range: 120-220.
    forgePanelY: 150,
    // Preparation control panel width in pixels. Recommended range: 300-460.
    forgePanelWidth: 355,
    // Preparation control panel height in pixels. Recommended range: 320-500.
    forgePanelHeight: 410,
    // Spell slot panel x position in design pixels. Recommended range: 900-1040.
    spellSlotsX: 940,
    // Spell slot panel y position in design pixels. Recommended range: 120-220.
    spellSlotsY: 150,
    // Spell slot panel width in pixels. Recommended range: 260-360.
    spellSlotsWidth: 290,
    // Spell slot panel height in pixels. Recommended range: 320-500.
    spellSlotsHeight: 410,
    // Single spell slot height in pixels. Recommended range: 42-72.
    spellSlotHeight: 58,
    // Gap between spell slot rows in pixels. Recommended range: 6-16.
    spellSlotGap: 10,
    // Width for the delete-selected-spell button in pixels. Recommended range: 80-130.
    deleteSpellButtonWidth: 90,
    // Height for the delete-selected-spell button in pixels. Recommended range: 26-38.
    deleteSpellButtonHeight: 32,
    // Width for preparation action buttons in pixels. Recommended range: 160-260.
    prepButtonWidth: 210,
    // Height for preparation action buttons in pixels. Recommended range: 42-64.
    prepButtonHeight: 52,
    // Y position for the pattern utility controls panel in pixels. Recommended range: 560-610.
    prepUtilityPanelY: 568,
    // Height for the pattern utility controls panel in pixels. Recommended range: 56-76.
    prepUtilityPanelHeight: 62,
    // Y position for the final preparation controls panel in pixels. Recommended range: 625-660.
    prepFinalPanelY: 638,
    // Height for the final preparation controls panel in pixels. Recommended range: 56-76.
    prepFinalPanelHeight: 62,
    // Y offset for the spell type title inside the forge panel. Recommended range: 80-120.
    spellTypeTitleY: 98,
    // Y offset for spell type buttons inside the forge panel. Recommended range: 110-150.
    spellTypeButtonY: 128,
    // Spell type button width in pixels. Recommended range: 80-120.
    spellTypeButtonWidth: 98,
    // Spell type button height in pixels. Recommended range: 30-44.
    spellTypeButtonHeight: 34,
    // Gap between spell type buttons in pixels. Recommended range: 6-14.
    spellTypeButtonGap: 8,
    // Number of spell type buttons per row. Recommended range: 2-4.
    spellTypeButtonColumns: 3,
    // Y offset for the spell name title inside the forge panel. Recommended range: 12-36.
    spellNameTitleY: 18,
    // Y offset for the spell name input row inside the forge panel. Recommended range: 38-64.
    spellNameFieldY: 46,
    // Width for the spell name input field in pixels. Recommended range: 170-240.
    spellNameFieldWidth: 190,
    // Name field height in pixels. Recommended range: 30-44.
    spellNameFieldHeight: 34,
    // Width for the cycle spell name button in pixels. Recommended range: 90-130.
    cycleNameButtonWidth: 116,
    // Y offset for the dedicated effect preview panel inside the forge panel. Recommended range: 220-270.
    effectPreviewPanelY: 236,
    // Height for the dedicated effect preview panel inside the forge panel. Recommended range: 50-80.
    effectPreviewPanelHeight: 96,
    // Save spell button width in pixels. Recommended range: 140-220.
    saveSpellButtonWidth: 160,
    // Bottom margin for command HUD in pixels. Recommended range: 16â€“40.
    bottomMargin: 20,
    // Vertical placement for the arena horizon in pixels. Recommended range: 240â€“420.
    horizonY: 292,
    // Vertical placement for near floor edge in pixels. Recommended range: 580â€“720.
    floorBottomY: 690,
    // Player 1 human x position in design pixels. Recommended range: 720â€“1040.
    playerHumanX: 820,
    // Player 1 human y position in design pixels. Recommended range: 480â€“640.
    playerHumanY: 590,
    // Player 1 dragon x position in design pixels. Recommended range: 580â€“850.
    playerDragonX: 675,
    // Player 1 dragon y position in design pixels. Recommended range: 410â€“570.
    playerDragonY: 495,
    // AI human x position in design pixels. Recommended range: 440â€“660.
    aiHumanX: 580,
    // AI human y position in design pixels. Recommended range: 260â€“390.
    aiHumanY: 345,
    // AI dragon x position in design pixels. Recommended range: 500â€“720.
    aiDragonX: 655,
    // AI dragon y position in design pixels. Recommended range: 205â€“340.
    aiDragonY: 275,
    // Width of the player dragon placeholder in pixels. Recommended range: 100â€“190.
    playerDragonWidth: 170,
    // Height of the player dragon placeholder in pixels. Recommended range: 70â€“140.
    playerDragonHeight: 105,
    // Width of the AI dragon placeholder in pixels. Recommended range: 70â€“150.
    aiDragonWidth: 120,
    // Height of the AI dragon placeholder in pixels. Recommended range: 50â€“110.
    aiDragonHeight: 78,
    // Human silhouette width in pixels. Recommended range: 28â€“70.
    humanWidth: 48,
    // Human silhouette height in pixels. Recommended range: 70â€“130.
    humanHeight: 95,
    // Wing and snout scale used for simple dragon silhouettes. Recommended range: 0.35-0.7.
    dragonFeatureScale: 0.5,
    // State label offset above dragons in pixels. Recommended range: 40â€“90.
    stateLabelOffsetY: 68,
    // Canvas fallback action button height in pixels. Recommended range: 38â€“64.
    actionButtonHeight: 48,
    // Y position of Canvas fallback buttons in design pixels. Recommended range: 610â€“690.
    actionButtonY: 628,
    // Width of the Voice button in pixels. Recommended range: 90â€“160.
    voiceButtonWidth: 122,
    // Y position for the Voice button in design pixels. Recommended range: 300-420.
    voiceButtonY: 336,
    // Width of each match spell button in pixels. Recommended range: 120-190.
    spellButtonWidth: 150,
    // Height of each match spell button in pixels. Recommended range: 42-68.
    spellButtonHeight: 56,
    // Gap between match spell buttons in pixels. Recommended range: 8-18.
    spellButtonGap: 12,
    // Y position of match spell buttons in design pixels. Recommended range: 540-620.
    spellButtonY: 560,
    // Width of the Restart button in pixels. Recommended range: 130â€“220.
    restartButtonWidth: 174,
    // Height of overlay buttons in pixels. Recommended range: 42â€“72.
    overlayButtonHeight: 56,
    // Radius used for character heads and decorative circular icons in pixels. Recommended range: 8â€“28.
    iconRadius: 18,
    // Left edge of the arena trapezoid near floor in pixels. Recommended range: 80â€“240.
    arenaNearLeft: 90,
    // Right edge of the arena trapezoid near floor in pixels. Recommended range: 1040â€“1220.
    arenaNearRight: 1190,
    // Left edge of the arena trapezoid horizon in pixels. Recommended range: 320â€“500.
    arenaFarLeft: 420,
    // Right edge of the arena trapezoid horizon in pixels. Recommended range: 760â€“960.
    arenaFarRight: 860,
    // Y offset for attack effect arcs in pixels. Recommended range: 12â€“60.
    effectArcOffsetY: 35,
    // Width of attack/skill effect strokes in pixels. Recommended range: 4â€“16.
    effectLineWidth: 8
  },

  animation: {
    // Duration for floating hit text, in seconds. Recommended range: 0.4â€“1.4.
    hitTextSeconds: 0.9,
    // Vertical travel for floating hit text in pixels. Recommended range: 20â€“80.
    hitTextRise: 48,
    // Duration for attack projectile arc effects, in seconds. Recommended range: 0.25â€“1.0.
    projectileSeconds: 0.5,
    // Screen shake duration after a hit, in seconds. Recommended range: 0â€“0.5.
    shakeSeconds: 0.18,
    // Maximum screen shake offset in pixels. Recommended range: 0â€“12.
    shakePixels: 5,
    // Dragon bob animation height in pixels. Recommended range: 0â€“10.
    dragonBobPixels: 5,
    // Dragon bob cycle duration in seconds. Recommended range: 1â€“3.
    dragonBobSeconds: 1.6
  },

  text: {
    // Player 1 display name. Recommended: short text.
    playerName: 'Player 1',
    // Player 2 display name. Recommended: short text.
    aiName: 'AI Rival',
    // Player 1 dragon element shown in the HUD. Recommended: one emoji or short word.
    playerElement: 'ðŸ”¥',
    // Player 2 dragon element shown in the HUD. Recommended: one emoji or short word.
    aiElement: 'ðŸŒŠ',
    // Contract call reference heading. Recommended: short text.
    commandReferenceTitle: 'Dragon contract calls',
    // Preparation screen heading. Recommended: short text.
    preparationTitle: 'Dragon Contractor',
    // Preparation screen subtitle. Recommended: short text.
    preparationSubtitle: 'Make dragon contracts, then call dragon names in battle.',
    // Egg drawing panel heading. Recommended: short text.
    eggDrawingTitle: '9-Dot Contract Sigil',
    // Spell type selector heading. Recommended: short text.
    spellTypeTitle: 'Dragon Power',
    // Spell name field heading. Recommended: short text.
    spellNameTitle: 'Dragon Name',
    // Effect preview heading. Recommended: short text.
    effectPreviewTitle: 'Contract Preview',
    // Spell slot panel heading. Recommended: short text.
    spellSlotsTitle: 'Dragon Contracts',
    // Random pattern button label. Recommended: short command text.
    randomPatternLabel: 'Random Pattern',
    // Confirm loadout button label. Recommended: short command text.
    confirmLoadoutLabel: 'Start Match',
    // Save spell button label. Recommended: short command text.
    saveSpellLabel: 'Create Contract',
    // Delete selected spell button label. Recommended: short command text.
    deleteSpellLabel: 'Void',
    // Cycle spell name button label. Recommended: short command text.
    cycleNameLabel: 'Cycle Dragon',
    // Clear pattern button label. Recommended: short command text.
    clearPatternLabel: 'Clear Pattern',
    // Preparation feedback shown before any save attempt. Recommended: short sentence.
    prepReadyFeedback: 'Draw a sigil, choose a power, name the dragon, then create the contract.',
    // Feedback shown after a spell is saved. Recommended: short sentence.
    spellSavedFeedback: 'Contract created.',
    // Feedback shown when a spell name is duplicate or too similar. Recommended: short sentence.
    spellNameRejectedFeedback: 'Use a unique dragon name.',
    // Feedback shown when the pattern has too few connections. Recommended: short sentence.
    patternRejectedFeedback: 'Connect at least one line before saving.',
    // Feedback shown when all five slots are ready. Recommended: short sentence.
    loadoutReadyFeedback: 'Dragon contracts ready.',
    // Feedback shown after a prepared contract slot is selected. Recommended: short sentence.
    spellSelectedFeedback: 'Contract selected.',
    // Feedback shown after a prepared contract is voided. Recommended: short sentence.
    spellDeletedFeedback: 'Contract voided. Create a new one to refill the slot.',
    // Feedback shown when loadout confirmation is blocked. Recommended: short sentence.
    loadoutBlockedFeedback: 'Create every dragon contract first.',
    // Match preview back button label. Recommended: short command text.
    backToForgeLabel: 'Back To Contracts',
    // Match preview heading for the optional layout-only state. Recommended: short text.
    matchPreviewTitle: 'Contract Match Layout',
    // Energy label text used in HUD panels. Recommended: short text.
    energyLabel: 'Energy',
    // Short energy label used inside compact spell buttons. Recommended: 1-3 letters.
    energyShortLabel: 'EN',
    // Microphone status label used in match HUD. Recommended: short text.
    microphoneStateLabel: 'Mic',
    // Latest player command heading. Recommended: short text.
    latestPlayerTitle: 'Called Dragon',
    // Latest AI command heading. Recommended: short text.
    latestAiTitle: 'AI Contract',
    // Initial player command text before any input. Recommended: short text.
    noPlayerCommand: 'No dragon called',
    // Initial AI command text before any AI action. Recommended: short text.
    noAiCommand: 'Waiting',
    // Microcopy shown above fallback controls. Recommended: short text.
    fallbackHint: 'Keys: 1-4 invoke contracts / V Voice',
    // Private asset warning shown in the lower-left corner. Recommended: short reminder.
    assetWarning: 'Private prototype: replace any unlicensed dragon assets before sharing publicly.'
  }
};

