# Project Memory

## Stable Decisions

- The active Dragon Fighter project lives in `dragon-fighter-prototype/dragon-fighter`.
- Milestone 1 is a static Canvas-only battle screen; no real command handling or combat is implemented yet.
- All gameplay, timing, UI, render, logging, server, and build tunables are centralized in `src/config.js`.
- HTML stays minimal: it contains only the Canvas, basic page sizing CSS, and the module script.
- The initial state labels for both dragons are `Idle`.
- Command vocabulary for the prototype is exactly `Attack`, `Defence`, `Block`, and `Skill`.
