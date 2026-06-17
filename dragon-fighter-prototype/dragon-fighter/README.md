# Dragon Contractor

Canvas-only 1v1 dragon contract prototype based on `docs/gdd.md` and `docs/tdd.md`.

The player creates Dragon Contracts, then calls a dragon name during battle to invoke that dragon's power.

## Run Locally

```bash
npm test
npm run build
npm run dev
```

Open `http://localhost:5173`.

## Prototype Contracts

- `Ignivar`: 10 damage, 2-second contract cooldown.
- `Aegon`: 50% incoming damage for 3 seconds, 6-second contract cooldown.
- `Bront`: prevents all incoming damage for 1 second, 5-second contract cooldown.
- `Voltaris`: 25 damage, 10-second contract cooldown.

## Controls

- `1-4`: invoke the matching contract slot.
- `V`: voice input when supported by the browser.
- `R`: restart after result.

All game visuals, HUD, overlays, buttons, and characters render inside the Canvas. `index.html` is only the Canvas container.
