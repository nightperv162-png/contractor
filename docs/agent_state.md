# Agent State

## Next-Prompt Context
Read only `docs/agent_state.md`, `docs/agent_brief.md`, and the last 30 lines of `docs/work_log.md` before starting. Read other project documents only when the task specifically requires them.

## Current Goal
Maintain the Dragon Contractor game and its GitHub Pages deployment.

## Current Task
Update the game loop to start and end at Loadout, with starter contracts and safe library deletion.

## Completed Steps
- GitHub Pages deployment and root documentation consolidation were completed and pushed previously.
- The uncommitted top-navigation order is `Loadout`, `Create`, `Combat`; source and syntax checks passed.
- Created `docs/agent_brief.md` with the reusable startup, workflow, and completion rules.
- Confirmed `docs/agent_rules_short.md` does not exist in the working tree or Git history, so no source file required removal.
- Kept state, work log, project memory, and all full design documents separate.
- Changed the flow to `Loadout` -> `Create Contract` -> `Combat` -> `End Game` -> `Loadout`.
- Added three weak starter contracts in config/state and initialized them in the library and loadout.
- Added contract deletion with safe selected-contract and equipped-slot cleanup.
- Added six Node tests covering startup, defaults, deletion, creation-to-combat, and end-game return.
- Verified 6/6 tests pass, the inline script compiles, `git diff --check` passes, and the local server returns HTTP 200.
- Committed the verified game-flow and documentation changes on `main`.

## Next Action
Push `main` to GitHub, then verify the new flow on GitHub Pages.

## Blockers
- None.
