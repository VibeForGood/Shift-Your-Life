# Game Off 2026 — Jam Rules

Source: <https://itch.io/jam/game-off-2026> and the jam FAQ
(<https://itch.io/jam/game-off-2026/topic/7290154/frequently-asked-questions-faq>).
Copied from the official post by the project owner. If this file and the
official page ever disagree, the official page wins.

Jam theme: **SHIFT**

---

## Hard rules (check before any decision that touches these)

| # | Rule | What it means for this project |
|---|------|--------------------------------|
| 1 | **Start the game during the jam.** Templates, libraries and reusable code are fine, but the vast majority of development must happen in the submission period. | The project was a blank GameMaker template at jam start. Build everything during November. Do not import an old game. |
| 2 | **Source code in a public GitHub repo.** Any licence is allowed. | `cragoon/shift-your-life` must be **public** before the deadline. Add a `LICENSE` file (code and assets may be licensed separately). |
| 3 | **Any tools are allowed.** Any engine, language, assets or dev tools. | We're using Phaser 3 (browser). |
| 4 | **Solo or team**, no size limit, multiple games allowed. | — |
| 5 | **AI is allowed, but must be disclosed** when submitting. | Keep a running record of AI use (see "AI usage log" below) so the disclosure is accurate. |
| 6 | **Submit on itch.io before the deadline.** Pushing to GitHub does **not** enter the game. | Submit the playable build **and** the GitHub repo URL on the Game Off 2026 itch.io page. |

## Key dates

| Event | Time (PST, UTC−8) | Time (UTC) |
|---|---|---|
| Jam starts | Nov 1, 2026, 13:37 | Nov 1, 2026, 21:37 |
| **Submission deadline** | **Dec 1, 2026, 13:37** | **Dec 1, 2026, 21:37** |
| Voting ends | Jan 1, 2027, 13:37 | Jan 1, 2027, 21:37 |

Winners are announced on the GitHub Blog and social channels shortly after
voting ends.

## Submission checklist

- [ ] Code (and any redistributable assets) pushed to the public GitHub repo **before** Dec 1, 13:37 PST.
- [ ] `LICENSE` file in the repo.
- [ ] README with how to play, controls, platform, and credits/attribution for third-party assets or code.
- [ ] README notes any paid/proprietary assets left out of the repo because their licence forbids redistribution (use placeholders).
- [ ] Playable build uploaded to itch.io (a browser/HTML5 build is easiest for raters).
- [ ] Entry submitted to **Game Off 2026** on itch.io with the GitHub repo URL.
- [ ] AI use disclosed on the submission form.
- [ ] Mature content labelled, if any.
- [ ] Game is free to play (recommended, not required).

## After submitting

- You may update the game during the submission period.
- Once voting begins, **do not change the game except for critical bug fixes**, and leave a note explaining what changed.

## Judging

Participants with qualifying submissions (and their teammates) rate entries in
six categories:

1. Overall
2. Gameplay
3. Graphics
4. Audio
5. Innovation
6. Theme interpretation

Code quality is not judged. No cash or physical prizes; winners get featured
on the GitHub Blog and social channels.

---

## Full FAQ

### Development and tools

- **Any engine?** Yes, including Unity, Unreal, Godot, GameMaker, visual scripting and no-code tools.
- **Pre-made assets, code, templates, starter projects?** Yes, as long as the majority of the game is made during the jam. Include attribution for third-party assets or code where required.
- **Paid or commercial assets?** Yes. You don't need to include them in the repo if their licence forbids redistribution. Use placeholders and explain in the README which assets are required.
- **AI tools (Copilot, ChatGPT, AI art and audio)?** Yes: coding, brainstorming, images, audio and other assets. Use must be disclosed on submission.
- **VR, mobile, browser, unusual hardware?** All platforms welcome, as long as people have a way to access and play the game.

### Teams and participation

- Solo is welcome. No maximum team size.
- Teams can be formed or joined at any time, including after the jam starts.
- You can submit multiple games and be on multiple teams.
- **Before the jam** you may create the repo, organise the team, choose tools and set up the environment. Save the bulk of actual game development for the jam.

### GitHub and source code

- The game does **not** have to be open source, but the source must be publicly available on GitHub. Choose any licence (see <https://choosealicense.com>).
- No need to commit regularly. A single push at the end is fine, as long as it is before the deadline.
- Code and assets may use different licences, including keeping some artwork, music or characters proprietary.
- The game belongs to you. You may keep developing it or sell it after the jam.

### Submissions

- **Required:** (1) source code in a public GitHub repo, (2) a playable game submitted through the Game Off 2026 itch.io page. The repo URL is asked for on submission.
- Unfinished games and prototypes are welcome. Better to submit something interesting than miss the deadline.
- Updates are allowed during the submission period. After voting begins, only critical bug fixes, with a note explaining the change.
- Pushing to GitHub does **not** submit the game. Submit on itch.io before Dec 1, 2026, 13:37 PST.
- Using AI does not affect rating or eligibility. Disclosure is for transparency only.
- Don't submit an old game with only minor changes. The vast majority of development should happen during November.
- Free to play is recommended so everyone can rate it. You can sell it after the jam.
- You can join without submitting, but only participants with qualifying submissions (and teammates) can rate games.
- The game may also be entered in other jams if both jams allow it.
- Only use assets you created or have permission to use. Free, commercial and Creative Commons assets are fine if you follow their licences and attribution requirements.
- Windows is not required. Any platform is fine; give clear instructions on how to play.

### Voting and prizes

- Rated by participants in six categories: Overall, Gameplay, Graphics, Audio, Innovation, Theme interpretation.
- Only participants with qualifying submissions (and teammates) can rate, once submissions close.
- Rating other games is not required for yours to be rated, but is strongly encouraged.
- No cash or physical prizes. Winners are featured on the GitHub Blog and social channels.

### Community and other

- No strict content restrictions beyond itch.io's platform rules. Label mature content. Adult or graphic content is less likely to be featured by GitHub.
- Community Discord: <https://discord.gg/4hAr7sa>. The itch.io community board can also be used to find teammates and share progress.
- Official hashtag: **#GitHubGameOff**

---

## AI usage log

Keep this updated so the itch.io AI disclosure is accurate.

| Date | Tool | Used for |
|---|---|---|
| 2026-11-04 | Claude Code | Brainstorming the game concept, synthesising peer-review feedback into a design plan, formatting this rules file. |
| 2026-11-04 | Claude Code | Writing the design document (DESIGN.md). |
| 2026-11-04 | Claude Code | Milestone 1: all game code (Phaser scenes, simulation, level data), level checker and smoke test. |
| 2026-11-04 | Copilot SDK in VS Code | Independent review of the game design, implementation, balance checks and submission readiness. |
