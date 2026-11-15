# Shift Your Life

*You can't make yourself do anything. You can only shift what's around you.*

A puzzle game for **GitHub Game Off 2026** (theme: **SHIFT**). You're 34, your
doctor has just said you have "prediabetes", and willpower has never worked for you. So over
seven weeks you rearrange your flat instead: running shoes by the door, phone out of
the bedroom, snacks out of sight etc.

## How to play

- **Drag** objects between spots in the apartment (mouse or finger). Each week you have a limited number of moves.
- **Hold SHIFT** (or tap **Pulls**) to see what each object pulls you towards, and how strongly.
- Press **Run evening** and watch your evening run on autopilot. At each room the thought bubble shows which pull won, and why: each option lists its score and what added to it (e.g. *Phone +4.0 · Habit +1.0*).
- Meet the week's goals, then move on. Habits you build carry over to later weeks.
- After each week, read the **Try this in your life** tip. The ending gives you the full shift list.
- Press **M** (or click *Sound* in the corner) to mute.

**Platform:** any modern browser on desktop, tablet or phone. Touch works
throughout. On phones, play in landscape: the game is 1280×720 and is very small
held upright. iPhones play no sound while the silent switch is on.

## Development

```bash
node tools/check-levels.js --verbose   # prove every week is solvable but not trivial
```

```bash
# one-time setup for the smoke test
npm install -g playwright && npx playwright install chromium

NODE_PATH=$(npm root -g) node tests/smoke.js   # headless play-through, screenshots in tests/screenshots/
# No downloaded Chromium? Use an installed browser: PW_CHANNEL=msedge (or chrome)
```

- `src/data/world.js` – rooms, slots, objects, actions and all balance numbers
- `src/data/levels.js` – the seven weeks
- `src/sim.js` – the deterministic simulation (no Phaser, runs in Node too)
- `src/health.js` – weekly weigh-ins and the day-49 retest numbers
- `src/research.js` – research lines shown on result cards
- `src/art.js`, `src/audio.js` – all art and sound, generated in code
- `src/ui.js` – shared colours, buttons and text helpers
- `src/scenes/` – Phaser scenes (Title, Story, Play, Ending)
- `DESIGN.md` – design document, `JAM_RULES.md` – jam rules, `ITCH_PAGE.md` – itch.io page text and upload settings

## Build for itch.io

Commit first, then:

```bash
git archive --format=zip -o dist/shift-your-life.zip HEAD index.html lib src
```

Upload `dist/shift-your-life.zip` as an HTML project (settings in `ITCH_PAGE.md`).
Don't zip with Windows "Compress" or PowerShell's `Compress-Archive`: they write
backslash paths that can break the game on itch.io.

## Credits

- Built with [Phaser 3](https://phaser.io) (MIT, see `lib/PHASER_LICENSE.md`).
- Sound effects and music are synthesised in code (`src/audio.js`). No audio files or samples.
- All art is drawn in code (`src/art.js`). No image files.
- Story and character adapted from the developer's earlier games *Momentum* and *Momentum Cards*.
- Research sources are listed in `SelfImprovement_Research.md`. This game is not medical advice.
- Made with AI assistance (Claude Code). See the AI usage log in `JAM_RULES.md`.
