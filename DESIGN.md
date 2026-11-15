# Shift Your Life — Design Document

GitHub Game Off 2026 · Theme: **SHIFT** · Solo dev + Claude (vibe coded)
Rules: see `JAM_RULES.md`. Earlier versions of the idea: `../Momentum`, `../Momentum_Cards`. Deadline **Dec 1, 2026, 13:37 PST**. Target submit **Nov 28**.

---

## 1. Pitch

> You're 34, 118 kg, and your doctor has just told you that you have prediabetes.
> You can't make yourself do anything. You can only **shift** what's around you.

A puzzle game where you rearrange your own flat to nudge your evening, one week
and one life area at a time: movement, sleep, food, fun, focus, friends and hard days.

**Core lesson:** willpower is unreliable; environment and habit do the heavy
lifting. The player learns it by playing, because the only tool they have is the
environment. **Every week ends with one concrete thing to try in real life**, and
the ending hands the player their whole "shift list".

**Tone:** dry humour, warm underneath. Weight and health are part of the story
(as in Momentum, the earlier version of this idea): stated plainly by the doctor,
backed by research, never a joke, never shaming. The character is drawn with care.

## 2. Pillars

1. **Shift the environment.** Moving objects is the only verb. Limited moves make it a puzzle.
2. **Watch it unfold.** Short, dramatic autopilot run. Decisions are the beats.
3. **See the invisible.** Hold SHIFT to see the pull every object has.

Anything that doesn't serve these three is a stretch goal or cut.

## 3. The character

**You.** Thirty-four, claims analyst at Halcyon Insurance, a one-bed flat on Elm
Street (carried over from Momentum). 118 kg, about five hours' sleep, takeaway most
nights, hasn't replied to Maya since March. On Monday Dr Reyes gives you your
results: HbA1c 6.1% (prediabetes), blood pressure 142/91. Follow-up on day 49.

Second person throughout: *Shift Your Life*. The UI says "your habits", "you fell
asleep at 22:30". The character's personality is in animation: tired eyes after
scrolling, a victory hop after a run, a happy face on the phone to Maya.

**Intro (Story scene):** seven short cards adapted from Momentum's opening: who you
are, the small defaults, the blood results, the Diabetes Prevention Program (-58%),
"don't rely on willpower", then the seven shifts and **Time to shift**. Skippable.

## 4. Core loop (≈ 2 min per attempt, instant retry)

1. **Brief card** — "Week 3. Rough day at work. Goals: eat a proper dinner · asleep by 23:00."
2. **Plan** — the room is shown as it is. Hold **SHIFT** to see pull lines. Drag up to **N** objects into slots. Undo freely; moves count only when you press Run.
3. **Run** — the evening plays from 18:00. You walk a fixed route. At each **decision point** time slows, a thought bubble shows the competing pulls as bars, the strongest wins, reacts, and the action plays out. Walking is fast. Speed toggle 1× / 2× / 4×.
4. **Result** — goals ticked or crossed, stars, and one line of real research tied to what just happened. **Retry** (same week) or **Next week**.

## 5. Systems

### 5.1 The apartment

One top-down cutaway room, fixed camera, 1280×720.

Your route through the evening (waypoints = decision points):

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
| Phone | **Scroll** (strong) | It's also the **alarm**: must be in the bedroom at night or you oversleep (unless Alarm clock is placed). |
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

Each action you *complete* in a week builds that habit:

```
habit += (1 − habit) × 0.35     // fast early, levels off (Lally et al.)
habit −= 0.05                    // a missed week only dents it, never resets
```

Habits carry between weeks and add to the action's score. **Built habits need
less environmental support, which frees moves for new goals.** Week 1 needs every
move to get you running; by Week 4 running needs one nudge, and the moves go to
sleep and food. Each level is framed as **one week** to keep the habit timescale honest.

Bad habits build too: if you scroll every week, scrolling gets harder to beat.

### 5.6 SHIFT view

Hold SHIFT during planning (and during the run, paused):

- Room desaturates; objects glow by category (green = healthy, red = pull/trap, blue = rest).
- Lines from each object to the waypoints it reaches. Thickness = pull strength.
- Waypoints show small habit badges.
- It does **not** show who wins. You read the forces; the run tells you the result.

### 5.7 Decision bubble (readability)

At each decision during the run: time slows to ~0.3×, a bubble over you shows
the top 2–3 competing actions as bars with object icons, the winner flashes,
You react. The player should always be able to answer "why did that happen?"
without reading a sentence.

### 5.8 Stars

- ★ per goal met.
- ★ bonus: solved with fewer moves than allowed.
Retry is instant; stars are the reason to retry.

## 6. Levels (7 weeks, one shift each)

Each week opens with a **Shift card** (topic, brief, goals) and ends with a
**Try this in your life** panel (a concrete action, why it works, the source).

| Week | Shift | Twist | Goals | Moves | Real-life tip |
|---|---|---|---|---|---|
| 1 | Move | — | Run | 2 | Shoes by the front door (Wood & Neal 2007) |
| 2 | Sleep | — | Run · asleep by 23:00 · alarm | 3 | Phone out of the bedroom, alarm clock, book (Exelmans 2016, Al Khatib 2017) |
| 3 | Food | Rough day | Dinner · no snacking · asleep · alarm | 3 | Prep the good option, hide the snacks (Hollands 2019) |
| 4 | Make it fun | Raining | Run · no snacking · asleep · alarm | 3 | Temptation bundling (Milkman 2014) |
| 5 | Focus | Deadline stress | An hour on the project · asleep · alarm | 3 | Phone in another room, batch notifications (Leroy 2009, Mark 2008) |
| 6 | Friends | Lonely week | Call Maya · dinner · asleep · alarm | 3 | A reminder of a friend where you sit; call, don't scroll (Holt-Lunstad 2010, Hall 2019) |
| 7 | Hard days | Late shift | Run or rest · dinner · asleep · alarm | 2 | If-then plans for bad days (Gollwitzer & Sheeran 2006, Lally 2010) |

New objects: **Laptop** (pulls to Focus; the phone's reach *lowers* Focus by 2),
**Maya's postcard** (pulls to Call Maya). Slots can refuse objects that make no
sense there (no food or laptops on the coat hook or shoe rack).

**Weekly weigh-in:** every result card turns that evening (the flat stays set up
all week) into a weigh-in: what helped, what held you back, and the kg change.
Model in `src/health.js`, formulas from Momentum's `scr_body`: old habits = +300
kcal/day; proper dinners -450, no snacking -200, asleep by 23:00 -275 (Al Khatib),
running -210 and 150 active min; 7,700 kcal per kg; capped at -1 / +0.6 kg a week.
Good play lands about -0.5 kg a week (the goal Dr Reyes sets); doing nothing gains.

**Ending:** day 49, **retest with Dr Reyes**. Day 1 vs day 49: weight, blood
pressure (~1 mmHg per kg, Neter; exercise effect, Cornelissen), HbA1c (labelled an
early, illustrative estimate: it reflects ~3 months), 3-year diabetes risk (29%
x 0.84 per kg, Hamman/DPP), active minutes vs 150, sleep vs 7 h. Her line follows
the weight result. Beside it, **your shift list**: all seven tips, ticked where you
nailed the week. Closing line:
*"You didn't find more willpower. You shifted what was around you."*
Stars are one per goal met; there is no bonus star.

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
1. Juice: squash/stretch, particles, screen-shake on big decisions, character reactions
2. If-then card: one per week, e.g. "After I get home → shoes on" (anchors an action to a waypoint)
3. What-the-hell momentum: a slip raises the pull of similar slips for the rest of the evening
4. Sleep quality carrying into the next week

**Cut:** breathing/urge minigame, emotion labelling, social texts, mood graphs, research card collection.

## 9. Tech plan

- **Engine:** Phaser 3 (vendored `phaser.min.js` in the repo, no CDN, no build step).
- **Plain `<script>` tags**, no bundler, so `index.html` can be opened by double-clicking.
- **Art:** clean flat shapes drawn in code (Phaser Graphics + generated textures). Soft palette, rounded shapes, bold icons. No image assets to license.
- **Audio:** sound effects and the music loop are synthesised in code with the Web Audio API (`src/audio.js`). No files, nothing to license.
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
| Nov 14–19 | **M3 Look & sound** | Art pass, character animations, sound effects, music, title/ending |
| Nov 20–24 | **M4 Playtest** | Friends play it cold; fix confusion; balance; stretch goals if time |
| Nov 25–28 | **M5 Ship** | README, LICENSE, credits, AI disclosure, itch page, screenshots, **submit Nov 28** |
| Nov 29–Dec 1 | Buffer | Only fixes |

## 11. How you test it

After each push:
- Pull the branch and double-click `index.html`, **or**
- I'll set up GitHub Pages so every push is playable at a link.

Tell me what felt confusing, boring or broken. That's the most valuable input
you can give; I'll handle the code.
