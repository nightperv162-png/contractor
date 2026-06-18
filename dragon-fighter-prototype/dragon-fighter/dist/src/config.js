// Central Dragon Fighter tuning file.
// Designers should adjust playtest values here instead of editing render, state, loop, or input code.

export const CONFIG = {
  diagnostics: {
    // Folder replaced by the build script. Recommended: short folder name such as dist.
    buildOutputFolder: 'dist',
    // Source folders copied into the build output. Recommended: include only browser runtime folders.
    buildSourceFolders: ['src'],
    // Dev server settings used for local prototype review. Recommended port range: 3000-9999.
    devServer: {
      port: 5173,
      host: '127.0.0.1',
      rootPath: '/',
      fallbackFile: 'index.html',
      emptyPath: '',
      unsafePathPattern: /^(\.\.[/\\])+/,
      httpOk: 200,
      httpNotFound: 404,
      notFoundMessage: 'Not found',
      contentTypes: {
        '.html': 'text/html; charset=utf-8',
        '.js': 'text/javascript; charset=utf-8',
        '.json': 'application/json; charset=utf-8',
        '.css': 'text/css; charset=utf-8',
        default: 'text/plain; charset=utf-8'
      }
    }
  },
  logging: {
    // Enables essential development logs. Recommended: true while building milestones, false for demos.
    enabled: true,
    // Prefix used to make browser console messages easy to filter. Recommended: short text.
    prefix: '[Dragon Fighter]',
    // Enables app-start logs. Recommended: true during Milestone 1 validation.
    appEvents: true,
    // Enables render lifecycle logs. Recommended: false unless diagnosing Canvas issues.
    renderEvents: false,
    // Enables state creation logs. Recommended: true during early milestones.
    stateEvents: true
  },
  math: {
    // Zero value used for empty timers and origin math. Recommended: keep at 0.
    zero: 0,
    // Half multiplier used for centering and midpoint calculations. Recommended: keep at 0.5.
    half: 0.5,
    // Full ratio used for complete HP bars. Recommended: keep at 1.
    one: 1,
    // Double multiplier used for full circle math. Recommended: keep at 2.
    two: 2,
    // Percentage value for full health display. Recommended: keep at 100.
    percentFull: 100,
    // First content index after a URL slash in the dev server. Recommended: keep at 1.
    firstContentIndex: 1,
    // Milliseconds per second for frame timing. Recommended: keep at 1000.
    millisecondsPerSecond: 1000
  },
  canvas: {
    // Internal design width for all Canvas drawing. Recommended range: 960-1920.
    width: 1280,
    // Internal design height for all Canvas drawing. Recommended range: 540-1080.
    height: 720,
    // Canvas element id loaded by index.html. Recommended: game.
    elementId: 'game',
    // Body background visible only behind the Canvas. Recommended: dark neutral color.
    pageBackground: '#06101d',
    // Canvas resize CSS width. Recommended: 100vw.
    cssWidth: '100vw',
    // Canvas resize CSS height. Recommended: 100vh.
    cssHeight: '100vh'
  },
  match: {
    // Length of a future active match in seconds. Prototype value: 60, recommended range: 30-90.
    durationSeconds: 60,
    // Pre-match countdown length in seconds. Prototype value: 3, recommended range: 2-5.
    countdownSeconds: 3,
    // Starting HP for both sides. Prototype value: 100, recommended range: 50-200.
    startingHp: 100,
    // Minimum HP clamp. Prototype value: 0.
    minHp: 0,
    // Initial static screen phase for Milestone 1. Recommended: static-arena.
    initialPhase: 'static-arena',
    // Whether simultaneous defeat creates a draw in later milestones. Recommended: true.
    drawOnSimultaneousDefeat: true,
    // Whether equal HP at timer end creates a draw in later milestones. Recommended: true.
    timerTieIsDraw: true
  },
  actions: {
    // Full spoken command for basic damage. Prototype value: Attack.
    attackCommandWord: 'Attack',
    // Attack damage before mitigation. Prototype value: 10, recommended range: 5-20.
    attackDamage: 10,
    // Attack cooldown in seconds. Prototype value: 2, recommended range: 1-4.
    attackCooldownSeconds: 2,
    // Attack label duration in seconds. Recommended range: 0.3-1.2.
    attackStateDurationSeconds: 0.7,
    // Full spoken command for reduced incoming damage. Prototype value: Defence.
    defenceCommandWord: 'Defence',
    // Incoming damage multiplier while Defence is active. Prototype value: 0.5, recommended range: 0.25-0.75.
    defenceDamageMultiplier: 0.5,
    // Defence active duration in seconds. Prototype value: 3, recommended range: 2-5.
    defenceDurationSeconds: 3,
    // Defence cooldown in seconds. Prototype value: 6, recommended range: 4-10.
    defenceCooldownSeconds: 6,
    // Full spoken command for preventing incoming damage. Prototype value: Block.
    blockCommandWord: 'Block',
    // Incoming damage multiplier while Block is active. Prototype value: 0.
    blockDamageMultiplier: 0,
    // Block active duration in seconds. Prototype value: 1, recommended range: 0.5-2.
    blockDurationSeconds: 1,
    // Block cooldown in seconds. Prototype value: 5, recommended range: 3-8.
    blockCooldownSeconds: 5,
    // Full spoken command for heavy damage. Prototype value: Skill.
    skillCommandWord: 'Skill',
    // Skill damage before mitigation. Prototype value: 25, recommended range: 15-40.
    skillDamage: 25,
    // Skill cooldown in seconds. Prototype value: 10, recommended range: 7-15.
    skillCooldownSeconds: 10,
    // Skill label duration in seconds. Recommended range: 0.8-2.
    skillStateDurationSeconds: 1.1
  },
  input: {
    // Complete command words accepted by the prototype. Recommended: match the GDD words exactly.
    validCommands: ['Attack', 'Defence', 'Block', 'Skill'],
    // Desktop fallback keys reserved for Milestone 2. Recommended: single lowercase letters.
    keyboardBindings: { a: 'Attack', d: 'Defence', b: 'Block', s: 'Skill' },
    // Enables future microphone input. Recommended: false until voice command work starts.
    enableVoiceInput: false,
    // Enables future keyboard input. Recommended: false for static Milestone 1.
    enableKeyboardInput: false,
    // Enables future Canvas fallback buttons. Recommended: false until commands are live.
    enablePointerButtons: false,
    // Minimum voice confidence for accepting speech. Recommended range: 0.5-0.95.
    voiceConfidenceThreshold: 0.75,
    // Failed command display duration in seconds. Recommended range: 1-3.
    unknownCommandDisplaySeconds: 2
  },
  ai: {
    // Time between future AI action attempts in seconds. Prototype value: 2, recommended range: 1.5-4.
    actionIntervalSeconds: 2,
    // HP threshold where future AI may prefer Skill. Recommended range: 20-80.
    skillPreferenceHpThreshold: 45,
    // Reaction window after player Skill for future defensive choices. Recommended range: 0.2-1.
    defensiveReactionWindowSeconds: 0.6,
    // Relative future Attack preference. Recommended range: 1-10.
    attackWeight: 6,
    // Relative future Defence preference. Recommended range: 1-10.
    defenceWeight: 2,
    // Relative future Block preference. Recommended range: 1-10.
    blockWeight: 2,
    // Relative future Skill preference. Recommended range: 1-10.
    skillWeight: 3
  },
  labels: {
    // Browser title and optional diagnostic label. Recommended: short title text.
    title: 'Dragon Fighter',
    // Player 1 display name. Recommended: short name.
    player1Name: 'Player 1',
    // Player 2 display name. Recommended: short name.
    player2Name: 'Player 2',
    // Player 1 dragon element label. Recommended: one short word.
    player1Element: 'Fire',
    // Player 2 dragon element label. Recommended: one short word.
    player2Element: 'Water',
    // State label shown before any action. Recommended: Idle.
    idleState: 'Idle',
    // Latest Player 1 command heading. Recommended: short text.
    playerCommandTitle: 'Latest Player 1 Command',
    // Latest AI command heading. Recommended: short text.
    aiCommandTitle: 'Latest AI Command',
    // Empty Player 1 command text. Recommended: short text.
    noPlayerCommand: 'None yet',
    // Empty AI command text. Recommended: short text.
    noAiCommand: 'Waiting',
    // Timer heading for the top center panel. Recommended: short text.
    timerTitle: 'Countdown / Timer',
    // Command reference heading. Recommended: short text.
    commandReferenceTitle: 'Command Reference',
    // HP label shown in status panels. Recommended: short text.
    hpLabel: 'HP'
  },
  colors: {
    // Main canvas background color. Recommended: readable dark or mid-tone value.
    backgroundColor: '#10233f',
    // Far arena floor color. Recommended: muted ground color.
    arenaFar: '#274461',
    // Near arena floor color. Recommended: slightly brighter than arenaFar.
    arenaNear: '#537da1',
    // Arena guide and boundary color. Recommended: readable low-saturation color.
    arenaLine: '#a8c8e5',
    // HUD panel background color. Recommended: dark translucent color.
    colorPanelBackground: 'rgba(7, 17, 34, 0.84)',
    // HUD panel border color. Recommended: bright enough against panel background.
    colorPanelBorder: '#c3dcff',
    // Primary readable text color. Recommended: near-white.
    colorTextPrimary: '#f5fbff',
    // Secondary readable text color. Recommended: light blue-gray.
    colorTextSecondary: '#b8cce6',
    // HP filled bar color. Recommended: saturated green.
    colorHpFull: '#49d17d',
    // HP empty bar background color. Recommended: dark red.
    colorHpEmpty: '#5b1f2a',
    // Cooldown ready indicator color. Recommended: cyan or green.
    colorCooldownReady: '#71e0ff',
    // Cooldown unavailable indicator color. Recommended: amber.
    colorCooldownActive: '#ffb24d',
    // Attack effect color reserved for later milestones. Recommended: warm bright color.
    colorAttackEffect: '#ffd166',
    // Defence effect color reserved for later milestones. Recommended: cool shield color.
    colorDefenceEffect: '#5cc8ff',
    // Block effect color reserved for later milestones. Recommended: bright blue-white.
    colorBlockEffect: '#d8f3ff',
    // Skill effect color reserved for later milestones. Recommended: high contrast accent.
    colorSkillEffect: '#ff5fd2',
    // Player 1 dragon body color. Recommended: distinct from Player 2.
    player1Dragon: '#67d0ff',
    // Player 2 dragon body color. Recommended: distinct from Player 1.
    player2Dragon: '#ff806d',
    // Player 1 trainer silhouette color. Recommended: neutral light color.
    player1Trainer: '#d8e6ff',
    // Player 2 trainer silhouette color. Recommended: neutral warm color.
    player2Trainer: '#ffd5c7',
    // Command reference background color. Recommended: translucent dark.
    commandReferenceBackground: 'rgba(12, 28, 54, 0.92)',
    // Warning or failed-command text color. Recommended: red-orange.
    colorTextWarning: '#ff6b6b',
    // Full-screen overlay tint reserved for later milestones. Recommended: translucent black.
    overlayBackgroundColor: 'rgba(3, 8, 15, 0.78)'
  },
  fonts: {
    // Font family used for Canvas text. Recommended: system-safe sans-serif stack.
    uiFontFamily: 'Arial, Helvetica, sans-serif',
    // Small UI text size in pixels. Recommended range: 12-24.
    uiFontSizeSmall: 16,
    // Main UI text size in pixels. Recommended range: 18-36.
    uiFontSizeMedium: 22,
    // Large UI text size in pixels. Recommended range: 36-96.
    uiFontSizeLarge: 42,
    // Font weight for main labels. Recommended: 700.
    boldWeight: '700',
    // Font weight for regular labels. Recommended: 400.
    normalWeight: '400'
  },
  layout: {
    // Padding from screen edges for HUD elements. Recommended range: 8-48 pixels.
    safeAreaPadding: 20,
    // Corner radius for Canvas panels in pixels. Recommended range: 4-16.
    panelRadius: 8,
    // Border line width for Canvas panels in pixels. Recommended range: 1-4.
    panelLineWidth: 2,
    // Status panel width in pixels. Recommended range: 260-380.
    statusPanelWidth: 330,
    // Status panel height in pixels. Recommended range: 100-160.
    statusPanelHeight: 132,
    // Timer panel width in pixels. Recommended range: 180-320.
    timerPanelWidth: 250,
    // Timer panel height in pixels. Recommended range: 58-96.
    timerPanelHeight: 76,
    // Latest command panel width in pixels. Recommended range: 280-420.
    latestCommandPanelWidth: 360,
    // Latest command panel height in pixels. Recommended range: 58-96.
    latestCommandPanelHeight: 82,
    // Command reference panel width in pixels. Recommended range: 380-680.
    commandReferenceWidth: 520,
    // Command reference panel height in pixels. Recommended range: 62-110.
    commandReferenceHeight: 82,
    // Bottom margin for command panels in pixels. Recommended range: 16-40.
    bottomMargin: 20,
    // HP bar width in pixels. Recommended range: 120-360.
    hpBarWidth: 240,
    // HP bar height in pixels. Recommended range: 8-32.
    hpBarHeight: 18,
    // HP bar y offset inside status panels in pixels. Recommended range: 40-72.
    hpBarY: 54,
    // Cooldown indicator size in pixels. Recommended range: 16-64.
    cooldownIndicatorSize: 26,
    // Cooldown indicator gap in pixels. Recommended range: 4-14.
    cooldownIndicatorGap: 10,
    // Cooldown row y offset inside status panels in pixels. Recommended range: 78-118.
    cooldownRowY: 94,
    // Text left inset inside panels in pixels. Recommended range: 12-28.
    panelTextInset: 18,
    // Text baseline offset for panel titles in pixels. Recommended range: 24-38.
    panelTitleY: 30,
    // Text baseline offset for panel body lines in pixels. Recommended range: 48-66.
    panelBodyY: 58,
    // Command text baseline offset inside bottom panels in pixels. Recommended range: 48-68.
    commandTextY: 56,
    // Command reference item spacing in pixels. Recommended range: 82-132.
    commandReferenceItemSpacing: 104,
    // Vertical placement for the arena horizon in pixels. Recommended range: 240-420.
    horizonY: 292,
    // Vertical placement for near floor edge in pixels. Recommended range: 580-720.
    floorBottomY: 690,
    // Left edge of the arena trapezoid near floor in pixels. Recommended range: 80-240.
    arenaNearLeft: 90,
    // Right edge of the arena trapezoid near floor in pixels. Recommended range: 1040-1220.
    arenaNearRight: 1190,
    // Left edge of the arena trapezoid horizon in pixels. Recommended range: 320-500.
    arenaFarLeft: 420,
    // Right edge of the arena trapezoid horizon in pixels. Recommended range: 760-960.
    arenaFarRight: 860,
    // Player 1 trainer x position in design pixels. Recommended range: 720-1040.
    player1PositionX: 850,
    // Player 1 trainer y position in design pixels. Recommended range: 480-640.
    player1PositionY: 590,
    // Player 1 dragon x position in design pixels. Recommended range: 580-850.
    player1DragonPositionX: 690,
    // Player 1 dragon y position in design pixels. Recommended range: 410-570.
    player1DragonPositionY: 500,
    // Player 2 trainer x position in design pixels. Recommended range: 440-660.
    player2PositionX: 560,
    // Player 2 trainer y position in design pixels. Recommended range: 260-390.
    player2PositionY: 350,
    // Player 2 dragon x position in design pixels. Recommended range: 500-720.
    player2DragonPositionX: 650,
    // Player 2 dragon y position in design pixels. Recommended range: 205-340.
    player2DragonPositionY: 278,
    // Player 1 dragon visual width in pixels. Recommended range: 100-190.
    player1DragonWidth: 170,
    // Player 1 dragon visual height in pixels. Recommended range: 70-140.
    player1DragonHeight: 105,
    // Player 2 dragon visual width in pixels. Recommended range: 70-150.
    player2DragonWidth: 120,
    // Player 2 dragon visual height in pixels. Recommended range: 50-110.
    player2DragonHeight: 78,
    // Trainer silhouette width in pixels. Recommended range: 28-70.
    trainerWidth: 48,
    // Trainer silhouette height in pixels. Recommended range: 70-130.
    trainerHeight: 95,
    // Dragon feature scale for wings and heads. Recommended range: 0.35-0.7.
    dragonFeatureScale: 0.5,
    // Vertical offset for labels above dragons. Recommended range: 40-90.
    stateLabelOffsetY: 68,
    // Character head radius in pixels. Recommended range: 8-28.
    headRadius: 18,
    // Dragon head radius in pixels. Recommended range: 10-30.
    dragonHeadRadius: 20,
    // Dragon eye radius in pixels. Recommended range: 2-8.
    dragonEyeRadius: 4,
    // Shadow ellipse height in pixels. Recommended range: 8-28.
    shadowHeight: 18,
    // Shadow alpha for grounded characters. Recommended range: 0.1-0.5.
    shadowAlpha: 0.25
  }
};
