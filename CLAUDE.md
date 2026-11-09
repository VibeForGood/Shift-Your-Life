# Shift Your Life

Browser game (Phaser 3, plain JS, no build step) for **GitHub Game Off 2026**
(theme: **SHIFT**). Solo developer; all code is written by Claude.

- **Design:** `DESIGN.md` is the source of truth for scope. Don't add systems
  outside its "Must ship" list unless the user asks; stretch goals come in the
  listed order.

- **Jam rules:** read `JAM_RULES.md` before making decisions about scope,
  assets, licensing, submission or deadlines. Follow it. The submission
  deadline is **Dec 1, 2026, 13:37 PST**.
- **Checks before every push:** `node tools/check-levels.js` (all weeks
  solvable, none solvable with zero moves) and
  `NODE_PATH=$(npm root -g) node tests/smoke.js` (headless play-through, no
  JS errors). Look at the screenshots in `tests/screenshots/` after visual changes.
- **Balance:** all numbers live in `src/data/world.js` and `src/data/levels.js`.
  `src/sim.js` must stay free of Phaser so the checker can run it in Node.
- **Research:** `SelfImprovement_Research.md` holds the self-help techniques
  the game draws on.
- **AI disclosure:** AI use must be disclosed on submission. When you do
  meaningful work on this project, add a row to the "AI usage log" table at
  the bottom of `JAM_RULES.md`.
- **Third-party assets:** only use assets we made or have permission to use,
  and record attribution in the README.
