# Shift Your Life — Design Document

GitHub Game Off 2026 · Theme: **SHIFT** · Solo dev + Claude (vibe coded)
Rules: see `JAM_RULES.md`. Deadline **Dec 1, 2026, 13:37 PST**. Target submit **Nov 28**.

---

## 1. Pitch

> A puzzle game where you rearrange someone's apartment to nudge their evening.
> You can't make them do anything. You can only **shift** what's around them.

**Core lesson (never stated as a lecture):** willpower is unreliable; environment
and habit do the heavy lifting. The player learns it by playing, because the
only tool they have is the environment.

**Tone:** dry humour, warm underneath. Exaggerated, readable reactions. Never
preachy, never about weight, calories or body shape.

## 2. Pillars

1. **Shift the environment.** Moving objects is the only verb. Limited moves make it a puzzle.
2. **Watch it unfold.** Short, dramatic autopilot run. Decisions are the beats.
3. **See the invisible.** Hold SHIFT to see the pull every object has.

Anything that doesn't serve these three is a stretch goal or cut.

## 3. The character

**Pip** — a small round blob (they/them) living a tired adult life. Big eyes,
squash-and-stretch movement, very expressive. A non-human character keeps it
funny and avoids body-image issues entirely.

Pip has no personality stats. Their personality is in **animation and reaction**:
a double-take at the phone, a reluctant sigh putting on shoes, a tiny victory
hop after a run, melting into the couch.

## 4. Core loop (≈ 2 min per attempt, instant retry)

1. **Brief card** — "Week 3. Rough day at work. Goals: eat a proper dinner · asleep by 23:00."
2. **Plan** — the room is shown as it is. Hold **SHIFT** to see pull lines. Drag up to **N** objects into slots. Undo freely; moves count only when you press Run.
3. **Run** — the evening plays from 18:00. Pip walks a fixed route. At each **decision point** time slows, a thought bubble shows the competing pulls as bars, Pip picks one, reacts, and the action plays out. Walking is fast. Speed toggle 1× / 2× / 4×.
4. **Result** — goals ticked or crossed, stars, and one line of real research tied to what just happened. **Retry** (same week) or **Next week**.

## 5. Systems

### 5.1 The apartment

One top-down cutaway room, fixed camera, 1280×720.

Pip's route through the evening (waypoints = decision points):

```
 [Front door] → [Hallway] → [Kitchen] → [Living room / couch] → [Bedroom] → [Bed]
   18:00                                                                    asleep?
```

Each waypoint has **1–2 slots** (≈ 9 slots total). Objects can only sit in slots.

| Zone | Slots |
|---|---|
| Front door | door hook, shoe rack |
| Hallway | hall table |
| Kitchen | counter, fridge-top (hidden) |
| Living room | coffee table, couch |
| Bedroom | bedside table, drawer (hidden) |

"Hidden" slots (fridge-top, drawer) are out of sight: objects there give **almost no pull**. That's the "out of sight, out of mind" tool, and storing something there still costs a move.

### 5.2 Objects (jam build: 8)

| Object | Pulls towards | Notes / conflicts |
|---|---|---|
| Phone | **Scroll** (strong) | It's also the **alarm**: must be in the bedroom at night or Pip oversleeps (unless Alarm clock is placed). |
| Running shoes | **Run** | Strongest at the front door. |
| Headphones | boosts **Run** | Temptation bundling: only matters next to the shoes. Rain twist cancels its effect without them. |
| Snack jar | **Snack** (strong) | |
| Fruit bowl | **Eat well** | Only one counter slot: fruit or snacks. |
| Blanket | **Rest** | Rest is a *valid* win on tired days, a trap on normal days. |
| Book | **Read** → helps **Sleep** | Good bedside competitor to the phone. |
| Alarm clock | frees the phone | Unlocked in Week 3. Solves the alarm conflict, but costs a move. |

### 5.3 Actions

`Run`, `Scroll`, `Snack`, `Eat well`, `Rest`, `Read`, `Sleep`, plus `Carry on` (do nothing, walk to the next waypoint).

Each action takes in-game time (e.g. Run 60 min, Scroll 90 min, Eat 30 min). Being asleep by the goal time is a natural consequence of what happened earlier.

### 5.4 The decision rule (deterministic)

At each waypoint, for each available action:

```
score(action) = baseline(action)
              + Σ objects: cue(object, action) × reach(object slot, waypoint)
              + habit(action) × HABIT_WEIGHT
              + twist modifier(action)
              + momentum(action)            // stretch: what-the-hell effect
```

- `reach` = 1.0 same zone, 0.4 adjacent zone, 0.1 hidden slot, 0 otherwise.
- `Carry on` has a fixed baseline, so weak cues don't trigger anything.
- Highest score wins. Ties break by a fixed priority list.
- **Same setup → same result, always.** Variety comes from the week's twist, shown before planning.

All numbers live in one data file so balancing is a one-line change.

### 5.5 Habits (the progression mechanic)

Each action Pip *completes* in a week builds that habit:

```
habit += (1 − habit) × 0.35     // fast early, levels off (Lally et al.)
habit −= 0.05                    // a missed week only dents it, never resets
```

Habits carry between weeks and add to the action's score. **Built habits need
less environmental support, which frees moves for new goals.** Week 1 needs every
move to get Pip running; by Week 4 running needs one nudge, and the moves go to
sleep and food. Each level is framed as **one week** to keep the habit timescale honest.

Bad habits build too: if Pip scrolls every week, scrolling gets harder to beat.

### 5.6 SHIFT view

Hold SHIFT during planning (and during the run, paused):

- Room desaturates; objects glow by category (green = healthy, red = pull/trap, blue = rest).
- Lines from each object to the waypoints it reaches. Thickness = pull strength.
- Waypoints show small habit badges.
- It does **not** show who wins. You read the forces; the run tells you the result.

### 5.7 Decision bubble (readability)

At each decision during the run: time slows to ~0.3×, a bubble over Pip shows
the top 2–3 competing actions as bars with object icons, the winner flashes,
Pip reacts. The player should always be able to answer "why did that happen?"
without reading a sentence.

### 5.8 Stars

- ★ per goal met.
- ★ bonus: solved with fewer moves than allowed.
Retry is instant; stars are the reason to retry.

## 6. Levels (5 weeks)

| Week | Twist | Goals | Moves | Teaches |
|---|---|---|---|---|
| 1 | — (tutorial) | Go for a run | 2 | Drag objects, run, SHIFT view. Phone on couch beats shoes in the closet. |
| 2 | — | Run · asleep by 23:00 | 3 | Phone conflict: alarm vs bedtime scroll. Book as competitor. |
| 3 | **Rough day** (Rest +, Run −) | Eat a proper dinner · asleep by 23:00 | 3 | Rest is a valid choice. Fruit vs snacks on one counter. Alarm clock unlocked. |
| 4 | **Raining** (Run − unless headphones) | Run · no snacking · asleep by 23:00 | 3 | Temptation bundling. Running habit from weeks 1–2 now helps. |
| 5 | **Overtime** (home at 20:00, one object locked) | Run or Rest · eat well · asleep by 23:00 | 2 | Everything learned, with less room. |

**Ending:** a summary of the five weeks with habit meters, and one closing line:
*"Pip didn't find more willpower. Their apartment just got on their side."*

## 7. Research lines (one per result screen)

Shown small, under the result, with the source in tiny print. Picked by what happened.

| Trigger | Line |
|---|---|
| Phone won a decision | Even an unused phone nearby can drain attention. (Ward et al., 2017) |
| Hidden snacks worked | What we see is what we eat. Changing your space beats relying on intentions. (Hollands et al., 2019) |
| Habit meter grew | Habits took a median of 66 days to feel automatic. Missing a day didn't reset them. (Lally et al., 2010) |
| Headphones + shoes | Pairing exercise with something you enjoy raised gym visits by up to 51%. (Milkman et al., 2014) |
| Scrolled in bed | Phone use in bed is linked to later, worse sleep. (Exelmans & Van den Bulck, 2016) |
| Rest on rough day | Self-control often means meeting fewer temptations, not resisting harder. (Hofmann et al., 2012) |

Every number must be double-checked against `SelfImprovement_Research.md` before shipping.

## 8. Scope

**Must ship**
- Room, route, slots, 8 objects, drag-and-drop, move counter, undo
- Deterministic sim + decision bubble
- SHIFT view
- 5 levels, goals, stars, retry, habit carry-over
- Speed toggle
- Title, result and ending screens
- Sound effects + one music loop (Audio is a judged category)

**Stretch (in order)**
1. Juice: squash/stretch, particles, screen-shake on big decisions, Pip reactions
2. If-then card: one per week, e.g. "After I get home → shoes on" (anchors an action to a waypoint)
3. What-the-hell momentum: a slip raises the pull of similar slips for the rest of the evening
4. Sleep quality carrying into the next week

**Cut:** breathing/urge minigame, emotion labelling, social texts, mood graphs, research card collection.

## 9. Tech plan

- **Engine:** Phaser 3 (vendored `phaser.min.js` in the repo, no CDN, no build step).
- **Plain `<script>` tags**, no bundler, so `index.html` can be opened by double-clicking.
- **Art:** clean flat shapes drawn in code (Phaser Graphics + generated textures). Soft palette, rounded shapes, bold icons. No image assets to license.
- **Audio:** sound effects generated in code with ZzFX (MIT, tiny). One CC0 music loop, credited in the README.
- **Simulation separate from rendering:** `sim.js` is pure logic (no Phaser), so it can run headless in Node.
- **Level checker:** a Node script brute-forces every arrangement within each week's move limit to confirm each level is **solvable**, and **not solvable with zero moves** or by one obvious move. Run it after every balance change.
- **Testing:** Playwright (pre-installed) loads the game, plays scripted runs, and takes screenshots so bugs are caught before you see them.

```
/index.html
/src/
  main.js            Phaser config, scene list
  data/objects.js    objects, cue values
  data/levels.js     weeks, twists, goals, starting layouts
  sim.js             pure decision/time simulation
  scenes/Title.js  Plan.js  Run.js  Result.js  Ending.js
  ui/                bubble, SHIFT overlay, buttons
  audio.js           ZzFX sound definitions
/lib/phaser.min.js
/tools/check-levels.js   brute-force solvability checker (Node)
/tests/                  Playwright smoke tests + screenshots
```

The blank GameMaker project is removed at the start of Milestone 1 (it stays in
git history). If we ever port to GameMaker, the data files and `sim.js` translate
almost line for line.

**Publishing:** zip the repo's game files → itch.io "HTML" project, "played in
the browser", 1280×720 viewport with fullscreen button. Optionally also GitHub Pages.

## 10. Milestones

| Dates | Milestone | Done when |
|---|---|---|
| Nov 5–8 | **M1 Greybox** | Boxes-and-circles room, drag/drop, sim runs, Week 1 playable, level checker works |
| Nov 9–13 | **M2 Game** | Decision bubble, SHIFT view, all 5 weeks, habits, stars, retry. *Playable start to finish.* |
| Nov 14–19 | **M3 Look & sound** | Art pass, Pip animations, sound effects, music, title/ending |
| Nov 20–24 | **M4 Playtest** | Friends play it cold; fix confusion; balance; stretch goals if time |
| Nov 25–28 | **M5 Ship** | README, LICENSE, credits, AI disclosure, itch page, screenshots, **submit Nov 28** |
| Nov 29–Dec 1 | Buffer | Only fixes |

## 11. How you test it

After each push:
- Pull the branch and double-click `index.html`, **or**
- I'll set up GitHub Pages so every push is playable at a link.

Tell me what felt confusing, boring or broken. That's the most valuable input
you can give; I'll handle the code.
