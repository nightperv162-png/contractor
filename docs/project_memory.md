# Project Memory

## Stable Facts
- Project name: Dragon Contractor.
- Repository root: `D:\for code\contractor`.
- GitHub remote: `https://github.com/nightperv162-png/contractor.git`.
- GitHub default branch is `main`.
- Current deployment work uses `main`; an earlier local branch was `master`.
- The deployable game entrypoint is `index.html` at the repository root.
- The game is a single-file HTML5 Canvas project with inline CSS and JavaScript.
- There is no build step and no generated build output to deploy.
- GitHub Pages should deploy the repository root.
- Earlier local project folder was `Dragon Contractor`; before that, the tracked folder was `Dragon tractor`.
- Commit `d68abae chore: rename project folder` recorded the rename from `Dragon tractor` to `Dragon Contractor`.
- Earlier comparison found `origin/main` had a different Dragon Fighter tree before the Dragon Contractor project was restored onto `main`.

## Terminology
- Contract: a player-created ability generated from a drawn sigil.
- Call Name: the one-word invocation used for a saved contract.
- Loadout: the equipped contract slots used in combat.

## Decisions
- Keep gameplay logic unchanged unless a deployment issue requires it.
- Use relative/static-compatible paths for any future assets.
- Keep GitHub Pages deployment simple: root `index.html`, `.nojekyll`, and GitHub Actions Pages workflow.
- Root `/docs` memory files are the canonical task-memory location for this repository.
- Do not force-update GitHub `main` without explicit user approval when branch trees differ.
- Generated build output such as `dist` should not be staged unless deployment explicitly requires it.
- Project design documents from nested `Dragon Contractor/docs/` were consolidated into root `docs/`.
- The game flow is `Loadout` -> `Create Contract` -> `Combat` -> `End Game` -> `Loadout`.
- New sessions start with three weak starter contracts defined in `CONFIG.starterContracts` and copied into game state.
- Deleting a contract clears its loadout slots and safely advances or clears `selectedContractId`.
- Contract Creation has three Canvas-only modes: Chaos free-draw with random type, Order typed-point connections, and Balance mirrored drawing.
- `index.html` is the single playable source of truth and contains all runtime HTML, CSS, config, state, input, creation analysis, combat, rendering, and game flow.
- Shared drawing metrics and stat formulas are inlined in the `CONTRACT CREATION` section of `index.html`; all modes use the same analyzer.
- Creation tuning, geometry, penalties, symmetry axes, and 80%-120% effectiveness limits live under `CONFIG.creation`.
- Chaos Contract Type remains unassigned until a valid analysis runs.
- Contract analysis caps energy at `CONFIG.creation.analysis.maxEnergyCost` (60) and applies `globalEffectBoost` (1.2) after the separate 80%-120% effectiveness multiplier.
- Balance Contract Creation uses occupied area, not line length, as its primary effect and drawing-energy driver.
- Each user-marked Core Line multiplies effect by 1.05 and uncapped energy by 1.1; broken paths remain allowed.
