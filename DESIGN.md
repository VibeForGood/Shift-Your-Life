# Shift Your Life — Design Document

GitHub Game Off 2026 · Theme: **SHIFT** · Solo developer, AI-assisted

Rules: see `JAM_RULES.md`. This design draws on ideas from earlier prototypes;
none are required to play or build this game.

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

**Tone:** dry humour, warm underneath. Weight and health are part of the story:
stated plainly by the doctor, backed by research, never a joke, never shaming.
The character is drawn with care.

## 2. Pillars

1. **Shift the environment.** Moving objects is the only verb. Limited moves make it a puzzle.
2. **Watch it unfold.** Short, dramatic autopilot run. Decisions are the beats.
3. **See the invisible.** Hold SHIFT to see the pull every object has.

Anything that doesn't serve these three is a stretch goal or cut.

## 3. The character

**You.** A fictional 34-year-old claims analyst at Halcyon Insurance, in a one-bed flat on Elm
Street. 118 kg, about five hours' sleep, takeaway most
nights, hasn't replied to Maya since March. On Monday Dr Reyes gives you your
results: HbA1c 6.1% (prediabetes), blood pressure 142/91. Follow-up on day 49.

The character and all personal health results are fictional. The game's health
figures are simplified illustrations, not predictions or medical guidance.

Second person throughout: *Shift Your Life*. The UI says "your habits", "you fell
asleep at 22:30". The character's personality is in animation: tired eyes after
scrolling, a victory hop after a run, a happy face on the phone to Maya.

**Intro (Story scene):** seven short cards adapted from an earlier prototype: who you
are, the small defaults, the blood results, the Diabetes Prevention Program (-58%),
"don't rely on willpower", then the seven shifts and **Time to shift**. Skippable.

## 4. Core loop (≈ 2 min per attempt, instant retry)

1. **Brief card** — "Week 3. Rough day at work. Goals: eat a proper dinner · asleep by 23:00."
2. **Plan** — the room is shown as it is. Hold **SHIFT** to see pull lines. Drag objects into slots, up to **N** objects moved from their starting spots. The counter tracks changed objects; drag one back to its starting spot or use **Reset** to undo.
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

Each waypoint has **2–3 slots** (12 total). Objects can only sit in slots.

| Zone | Slots |
|---|---|
| Front door | hook, shoe rack |
| Hallway | hall table, closet (hidden) |
| Kitchen | counter, table, cupboard (hidden) |
| Living room | coffee table, couch |
| Bedroom | bedside, dresser (far), drawer (hidden) |

"Hidden" slots (closet, cupboard, drawer) are out of sight: objects there give **almost no pull**. That's the "out of sight, out of mind" tool, and storing something there still costs a move. The **far** dresser gives half pull.

### 5.2 Objects (jam build: 10)

| Object | Pulls towards | Notes / conflicts |
|---|---|---|
| Phone | **Scroll** (strong) | It's also the **alarm**: must be in the bedroom at night or you oversleep (unless Alarm clock is placed). |
| Running shoes | **Run** | Strongest at the front door. |
| Headphones | boosts **Run** | Temptation bundling: only matters next to the shoes. Rain twist cancels its effect without them. |
| Snack jar | **Snack** (strong) | |
| Prepped meal | **Eat a proper dinner** | Competes with the snack jar for the kitchen. |
| Blanket | **Rest** | Rest is a *valid* win on tired days, a trap on normal days. |
| Book | **Read** → helps **Sleep** | Good bedside competitor to the phone. |
| Alarm clock | frees the phone | Solves the alarm conflict, but costs a move. |
| Laptop | **Work on the project** | The phone's reach *lowers* Focus by 2. |
| Maya's postcard | **Call Maya** | |

### 5.3 Actions

`Run`, `Scroll`, `Snack`, `Eat a proper dinner`, `Work on the project`, `Call Maya`, `Rest`, `Read`, `Scroll in bed`, `Sleep`, plus `Carry on` (do nothing, walk to the next waypoint).

Each action takes in-game time (e.g. Run 60 min, Scroll 75 min, Eat 40 min). Being asleep by the goal time is a natural consequence of what happened earlier.

### 5.4 The decision rule (deterministic)

At each waypoint, for each available action:

```
score(action) = baseline(action)
              + Σ objects: cue(object, action) × reach(object slot, waypoint)
              + habit(action) × HABIT_WEIGHT
              + twist modifier(action)
              + momentum(action)            // stretch: what-the-hell effect
```

- `reach` = 1.0 same zone, 0.5 far slot, 0.4 adjacent zone, 0.1 hidden slot (own room only), 0 otherwise.
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
the top 2–3 competing actions with object icons. Each row has the action and its
score, the breakdown of what added to it on its own line (e.g. *Phone +4.0 ·
Habit +1.0*), and a bar. The winner flashes and you react. The player should always be able to answer "why did that happen?"
without reading a sentence.

### 5.8 Stars

- ★ per goal met.
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
Model in `src/health.js`, adapted from an earlier prototype: old habits = +300
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
- Room, route, slots, 10 objects, drag-and-drop (mouse and touch), move counter and reset
- Deterministic sim + decision bubble
- SHIFT view
- 7 weeks, goals, stars, retry, habit carry-over
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
- **Testing:** Playwright loads the game, plays scripted runs, and takes screenshots so bugs are caught before you see them. Install it once with `npm install -g playwright && npx playwright install chromium`.

```
/index.html
/src/
  main.js            Phaser config, scene list
  data/world.js      rooms, slots, objects, actions, all balance numbers
  data/levels.js     weeks, twists, goals, starting layouts, tips
  sim.js             pure decision/time simulation (no Phaser)
  health.js          weekly weigh-ins, day-49 retest
  research.js        research lines for result cards
  art.js             all art, drawn in code
  audio.js           synthesised sound effects and music
  ui.js              colours, buttons, text helpers
  scenes/Title.js  Story.js  Play.js  Ending.js
/lib/phaser.min.js
/tools/check-levels.js   brute-force solvability checker (Node)
/tests/                  Playwright smoke test + screenshots
```

The early prototype started from a blank GameMaker project; it is not part of
the current build. If the game is ever ported to GameMaker, the data files and
`sim.js` should translate with little change.

**Publishing:** `git archive --format=zip -o dist/shift-your-life.zip HEAD index.html lib src`
→ itch.io "HTML" project, "played in the browser", 1280×720 viewport, mobile
friendly (landscape), fullscreen button. Full steps in `ITCH_PAGE.md`. Optionally also GitHub Pages.

## 10. Expansion: Office life (in design, `office-life` branch)

An expansion to the base game (the seven home weeks), treated like DLC. Same verb,
same rules, new place: your workday at **Halcyon Insurance**, where you work as
a claims analyst (see §3).

> Your doctor says sit less, eat better, sleep more. Your job says sit here,
> eat that, answer this. You can't change the job. You can **shift** your desk.

### 10.1 How it fits

- **An add-on, kept separate in the code.** The office files live in their own
  folder (`src/office/`) and load after the base game. Remove their script tags
  and the base game runs exactly as before. The title screen shows an
  **Office life** entry only when the expansion is loaded.
- **The story continues after the day-49 retest.** Dr Reyes is pleased you've
  made a start but wants you to keep going: the evenings are sorted, now the
  workdays need to change too. Follow-up on day 84.
- **Weight carries over.** Office weeks start from your day-49 weight. If the
  home weeks haven't been played in this session, the expansion starts from a
  fixed default weight.
- Its own habit set, starting from office defaults (email and scrolling high,
  stairs and walking low). Home habits don't carry over.
- **The weekly weigh-in continues** (`health.js`), with office inputs: proper
  lunch, no vending or biscuits, stairs and lunch walks (active minutes), and
  hours spent sitting.
- Same loop as §4: brief card → plan (drag objects, limited moves, SHIFT view) →
  run (the day plays out, decision bubbles) → result + **Try this in your life**.

### 10.2 The office floor

One cutaway floor, fixed camera. Zones from left to right:

| Zone | Slots |
|---|---|
| Lobby | coat stand, bag hook, locker (hidden) |
| Your desk | desktop, side shelf, under desk (far), desk drawer (hidden) |
| Kitchenette | counter, table, fridge (hidden) |

Fixed things you **can't** move: the lift, the vending machine (kitchenette) and
your coworker Sam's desk next to yours. They give steady pulls that you have to
work around, the way a real office does.

### 10.3 The workday route

Unlike the evening, your desk is visited twice and desk visits are **time blocks**:
you keep making decisions there until the block ends.

```
[Lobby]  →  [Desk: morning]  →  [Kitchenette]  →  [Desk: afternoon]  →  [Lobby]
 08:45       until 12:30          lunch            until 17:30           leave?
```

| Stop | Choices |
|---|---|
| Lobby (arrive) | Take the stairs · Take the lift (default) · Scroll |
| Desk blocks | Deep work · Check email (default) · Scroll · Chat with Sam · Snack · Stand while working · Refill water |
| Kitchenette | Proper lunch · Vending machine · Lunch walk · Back to desk (eat at desk) |
| Lobby (leave) | Leave on time · Stay late · Take the laptop home |

Checking email is the office's "Carry on": a fixed baseline that weak cues can't beat.

### 10.4 Objects (10)

| Object | Pulls towards | Notes |
|---|---|---|
| Phone | **Scroll** (strong) | Lowers Deep work by 2 wherever it reaches, as at home. |
| Work laptop | **Deep work** at the desk | In the lobby bag it pulls **Take the laptop home** instead. In the locker: no pull at all. |
| Priority list | **Deep work** | A sticky note with today's one big task. |
| Noise-cancelling headphones | **Deep work** | Cancels Sam's chat pull. |
| Biscuit tin | **Snack** (strong) | The office version of the snack jar. |
| Packed lunch | **Proper lunch** | Competes with the vending machine. |
| Water bottle | **Refill water** | Each refill is a short walk: also counts towards moving more. |
| Trainers | **Stairs**, **Lunch walk** | Strongest in the lobby and kitchenette. |
| Standing mat | **Stand while working** | Only works at the desk. |
| Evening plans (Maya's cinema ticket) | **Leave on time** | Ties back to the base game. |

### 10.5 Weeks (5)

| Week | Shift | Twist | Goals | Moves | Real-life tip (sources to verify) |
|---|---|---|---|---|---|
| O1 | Deep work | Open-plan noise | 2 h deep work · no scrolling at your desk | 2 | Phone out of reach, check email in batches (Ward 2017; Kushlev & Dunn 2015; Mark 2008) |
| O2 | Move more | — | Stairs · lunch walk · stand for an hour | 3 | Cues at the point of decision; break up sitting (Soler 2010; Shrestha 2018; Thøgersen-Ntoumani 2015) |
| O3 | Food at work | Birthday cake in the kitchenette | Proper lunch · no vending or biscuits · drink water | 3 | Make the good option the visible one (Thorndike 2012; Hollands 2019) |
| O4 | Leave on time | Boss emails at 17:00 | Leave by 17:45 · laptop stays at work · 1 h deep work | 3 | Switch off after work (Sonnentag & Fritz 2015; Becker 2021) |
| O5 | The whole day | Deadline week | Deep work · stairs or lunch walk · proper lunch · leave on time | 3 | If-then plans for busy days (Gollwitzer & Sheeran 2006) |

Every source above is a candidate. Each must be added to
`SelfImprovement_Research.md` and checked before it appears in the game.

**Ending:** day 84, **second retest with Dr Reyes**, in the same style as the
home ending. It compares day 1, day 49 and day 84: weight, blood pressure, HbA1c
(day 84 is about three months in, so this estimate is less early than the
day-49 one) and diabetes risk. Next to the numbers it shows your office shift
list, with the five office tips, ticked where you nailed the week.

### 10.6 What the code needs

- `world.js` → one world per game area (`SYL.WORLDS.home` in the base game, `SYL.WORLDS.office` registered by the expansion);
  each level names its world. `sim.js` takes the world as a parameter (still no Phaser).
- Separate zone **layout** (for reach) from the **route** (visit order), so the
  desk can be visited twice.
- **Time-block zones**: decisions repeat at a zone until its end time.
- **Fixed pull sources** (lift, vending machine, Sam) that aren't draggable.
- Everything office-only (world data, levels, art, intro cards, ending) goes in
  `src/office/`. Base files only get generic hooks (world parameter, time
  blocks, fixed pulls, a title-screen slot for an expansion), never office content.
- `health.js` accepts a starting weight and office inputs; the ending can show
  three points in time (day 1, 49, 84).
- `tools/check-levels.js` and `tests/smoke.js` cover the base game and the expansion.

### 10.7 Decided

- Weigh-ins continue, and weight carries over from the home weeks.
- The expansion ends with Dr Reyes (day 84 retest).
- Office results **don't** affect the home evenings for now. The two stay independent.

## 11. How you test it

After each push:
- Pull the branch and double-click `index.html`, **or**
- I'll set up GitHub Pages so every push is playable at a link.

Player feedback on what feels confusing, boring or broken is welcome.
