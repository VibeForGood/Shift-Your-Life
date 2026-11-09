# Shift Your Life

*You can't make Pip do anything. You can only shift what's around them.*

A puzzle game for **GitHub Game Off 2026** (theme: **SHIFT**). Rearrange a tired
blob's apartment so their evening goes better: run instead of scroll, eat a
proper dinner, get to sleep on time. Willpower isn't on the menu. The
environment is.

> Status: **greybox prototype** (Milestone 1). Shapes and placeholder visuals; art and sound come later.

## How to play

- **Drag** objects between spots in the apartment. Each week you have a limited number of moves.
- **Hold SHIFT** (or click **Pulls**) to see what each object pulls Pip towards, and how strongly.
- Press **Run evening** and watch. At each room Pip weighs up the pulls. The thought bubble shows why they chose what they did.
- Meet the week's goals, then move on. Habits Pip builds carry over to later weeks.

## Run it locally

No build step. Either:

- Double-click `index.html`, or
- Serve the folder: `npx serve .` and open the printed address.

## Development

```bash
node tools/check-levels.js --verbose   # prove every week is solvable but not trivial
```

```bash
NODE_PATH=$(npm root -g) node tests/smoke.js   # headless play-through, screenshots in tests/screenshots/
```

- `src/data/world.js` – rooms, slots, objects, actions and all balance numbers
- `src/data/levels.js` – the five weeks
- `src/sim.js` – the deterministic simulation (no Phaser, runs in Node too)
- `src/scenes/` – Phaser scenes
- `DESIGN.md` – design document, `JAM_RULES.md` – jam rules

## Credits

- Built with [Phaser 3](https://phaser.io) (MIT, see `lib/PHASER_LICENSE.md`).
- Research sources are listed in `SelfImprovement_Research.md`. This game is not medical advice.
- Made with AI assistance (Claude Code). See the AI usage log in `JAM_RULES.md`.
