# Shift Your Life

Browser game (Phaser 3, plain JS, no build step) for **GitHub Game Off 2026**
(theme: **SHIFT**). Solo developer; all code is written by Claude.

- **Design:** `DESIGN.md` is the source of truth for scope. Don't add systems
  outside its "Must ship" list unless the user asks; stretch goals come in the
  listed order.

- **Jam rules:** read `JAM_RULES.md` before making decisions about scope,
  assets, licensing, submission or deadlines. Follow it. The submission
  deadline is **Dec 1, 2026, 13:37 PST**.
- **Checks before every push:** `node tools/check-days.js` (every full-day week
  solvable within its shared move budget, none with zero moves; takes a few
  minutes), `node tools/check-levels.js` (the home weeks the days build on) and a headless play-through with no
  JS errors. Playwright isn't bundled: install it with
  `npm install -g playwright`, then install Chromium with
  `npx playwright install chromium`. Set `NODE_PATH` to `npm root -g` when
  running `tests/smoke.js` so Node can find the global Playwright package.
  Look at the screenshots in `tests/screenshots/` after visual changes.
- **itch.io build:** `git archive --format=zip -o dist/shift-your-life.zip HEAD index.html lib src`
  (never PowerShell `Compress-Archive`: backslash paths break on itch). Must work
  with touch on phones and tablets, not just mouse and keyboard.
- **Balance:** the flat's numbers live in `src/data/world.js` and `src/data/levels.js`,
  the office's in `src/office/world.js`, the weeks in `src/data/days.js`, and the
  work/home carry-over effects in `src/day.js`. `src/sim.js` and `src/day.js` must
  stay free of Phaser so the checkers can run them in Node.
- **Research:** `SelfImprovement_Research.md` holds the self-help techniques
  the game draws on.
- **AI disclosure:** AI use must be disclosed on submission. When you do
  meaningful work on this project, add a row to the "AI usage log" table at
  the bottom of `JAM_RULES.md`.
- **Third-party assets:** only use assets we made or have permission to use,
  and record attribution in the README.
