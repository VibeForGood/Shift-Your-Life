# Shift Your Life

*You can't make yourself do anything. You can only shift what's around you.*

A puzzle game for **GitHub Game Off 2026** (theme: **SHIFT**). You're 34, your
doctor has just said "prediabetes", and willpower has never worked for you. So over
seven weeks you rearrange your flat instead: running shoes by the door, phone out of
the bedroom, snacks out of sight, laptop away from the phone, a postcard from an old
friend where you sit. Every week ends with one thing to try in your real life.

> Status: **playable, art and sound pass done** (Milestone 3 in progress). Playtesting and balance next.

## How to play

- **Drag** objects between spots in the apartment. Each week you have a limited number of moves.
- **Hold SHIFT** (or click **Pulls**) to see what each object pulls you towards, and how strongly.
- Press **Run evening** and watch your evening run on autopilot. At each room the thought bubble shows which pull won, and why.
- Meet the week's goals, then move on. Habits you build carry over to later weeks.
- After each week, read the **Try this in your life** tip. The ending gives you the full shift list.
- Press **M** (or click *Sound* in the corner) to mute.

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
# No downloaded Chromium? Use an installed browser: PW_CHANNEL=msedge (or chrome)
```

- `src/data/world.js` – rooms, slots, objects, actions and all balance numbers
- `src/data/levels.js` – the five weeks
- `src/sim.js` – the deterministic simulation (no Phaser, runs in Node too)
- `src/scenes/` – Phaser scenes
- `DESIGN.md` – design document, `JAM_RULES.md` – jam rules

## Credits

- Built with [Phaser 3](https://phaser.io) (MIT, see `lib/PHASER_LICENSE.md`).
- Sound effects and music are synthesised in code (`src/audio.js`). No audio files or samples.
- All art is drawn in code (`src/art.js`). No image files.
- Story and character adapted from the developer's earlier games *Momentum* and *Momentum Cards*.
- Research sources are listed in `SelfImprovement_Research.md`. This game is not medical advice.
- Made with AI assistance (Claude Code). See the AI usage log in `JAM_RULES.md`.
