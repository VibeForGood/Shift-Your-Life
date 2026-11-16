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

## 10. Full days: work and home in one game (in progress, `full-day` branch)

The office and the flat are merged into **one game**. Each week is one full day,
standing for the whole week: the workday at **Halcyon Insurance** (see §3),
the commute, the evening at home, and sleep. The two halves feed each other:
bad sleep follows you into work, and a bad workday follows you home.

> Your doctor says sit less, eat better, sleep more. Your job says sit here,
> eat that, answer this. You can't change the job or the doctor. You can **shift**
> your desk and your flat.

### 10.1 How it fits

- **One campaign.** It replaces the separate home weeks and the Office life
  expansion. The title screen has a single **Start** button again.
- **One run = one day:** 08:45 office → leave → 30 min commute → evening at
  home → asleep. Same decision rules as before in each place.
- **One plan, one move budget.** The plan screen toggles between **Work** and
  **Home**. Moves count across both, so each week asks: fix work or fix home?
- **One habit set.** Scrolling and snacking are the same habit at work and at
  home: scroll all day and the evening phone wins more easily too.
- Day 49 retest with Dr Reyes, as in §6, with the weekly weigh-in counting both
  halves of the day.

### 10.2 How the halves affect each other

Shown to the player like twists: on the week card and in the decision bubble,
with their own label.

**Last night → today's work** (from the previous week's evening; week 1 starts
with your old habits: asleep after midnight, phone as your alarm)

| Last night | Effect at work |
|---|---|
| Asleep by 23:00 | **Rested:** Deep work +1 |
| Asleep after 23:00 | **Tired:** Deep work -2, Snack +1, Scroll +1, Stairs -1 |
| No alarm in the bedroom | **Overslept:** you get in at 09:45 and miss the stairs-or-lift choice |

**Today's work → this evening**

| At work | Effect at home |
|---|---|
| Time you leave | You get home 30 min later (stay late, get home late) |
| No proper lunch | **Hungry:** Snack +2 |
| Less than an hour of deep work | **Frazzled:** Rest +1, Scroll +1 |
| Took the laptop home | **Work email:** Scroll +1, Sleep -1 |
| Took the stairs or a lunch walk | **Already moving:** Run +1 |

### 10.3 Weeks (7)

Each week has goals at work, at home or both, one move budget, and one
"Try this in your life" tip.

| Week | Shift | Goals | Notes |
|---|---|---|---|
| 1 | Move | Take the stairs · go for a run | You start tired from your old nights. |
| 2 | Sleep | An hour of deep work · asleep by 23:00 · alarm in the bedroom | Next week's workday depends on tonight. |
| 3 | Food | Proper lunch · proper dinner · no snacking | Skipping lunch makes the evening snacks harder to beat. |
| 4 | Focus | 2 hours of deep work · no scrolling all day · asleep by 23:00 | Open-plan noise. |
| 5 | Leave on time | Leave on time · laptop stays at work · call Maya | |
| 6 | Make it fun | Lunch walk · go for a run · no snacking | Raining after work. |
| 7 | Hard days | Deadline at work · run or rest · proper dinner · asleep by 23:00 | If-then plans. |

The office floor, objects and time-block rules below (from the Office life
build) still apply to the work half. The flat is as in §5.

### 10.4 The office floor

One cutaway floor, fixed camera. Zones from left to right:

| Zone | Slots |
|---|---|
| Lobby | coat stand, your bag, locker (hidden) |
| Your desk | desk, top shelf (far), floor, desk drawer (hidden) |
| Kitchenette | counter, table, fridge (hidden) |

Fixed things you **can't** move: the vending machine (kitchenette) and your
coworker Sam at the next desk. They give steady pulls that you have to work
around, the way a real office does. A twist can add more (the birthday cake).

### 10.5 The workday route

Unlike the evening, your desk is visited twice and desk visits are **time blocks**:
you keep making decisions there until the block ends.

```
[Lobby]  →  [Desk: morning]  →  [Kitchenette]  →  [Desk: afternoon]  →  [Desk: 17:30]  →  [Lobby]
 08:45       until 12:30          until 13:30       until 17:30           leave or stay     out
```

| Stop | Choices |
|---|---|
| Lobby (arrive) | Take the stairs · Take the lift (default) · Scroll |
| Desk blocks | Deep work · Check email (default) · Scroll · Chat with Sam · Snack · Work standing up · Refill water |
| Kitchenette | Proper lunch · Vending machine lunch · Lunchtime walk · Carry on (back to your desk) |
| Desk (17:30) | Leave on time · Stay late (30 min at a time, until 19:30) |
| Lobby (out) | Take the laptop home · Carry on |

Time-block rules:
- Checking email is the default at the desk: a fixed baseline that weak cues can't beat.
- You always get at least one choice at a stop, even if you arrive late.
- If what you'd do next doesn't fit before the block ends, you check email
  instead if that fits, or wrap up and move on. Deep work doesn't eat your lunch hour.
- The same choice winning again and again in a block shows its bubble only once.
- A proper lunch fills you up: no snacking afterwards. Lunch and the vending
  machine rule each other out.

### 10.6 Office objects (11 + fixed)

| Object | Pulls towards | Notes |
|---|---|---|
| Phone | **Scroll** | Lowers Deep work by 2 wherever it reaches, as at home. |
| Work laptop | **Deep work** at the desk | In your bag in the lobby it pulls **Take the laptop home**. |
| Priority list | **Deep work** | A sticky note with today's one big task. |
| Noise-cancelling headphones | **Deep work** | At your desk, cancels the open-plan noise twist. |
| Biscuit tin | **Snack** (strong) | The office version of the snack jar. |
| Packed lunch | **Proper lunch** (strong) | Competes with the vending machine and the cake. |
| Water bottle | **Refill water** | |
| Trainers | **Stairs**, **Lunch walk** | One pair can't be in the lobby and the kitchenette at once. |
| Stairs reminder | **Stairs** | A note by the lift: a point-of-decision prompt. |
| Standing mat | **Work standing up** | Only goes on the floor or in the locker. |
| Maya's cinema ticket | **Leave on time** | Ties back to the base game. |
| *Sam (fixed)* | Chat | At the next desk. |
| *Vending machine (fixed)* | Vending machine lunch | |
| *Birthday cake (fixed, week 3)* | Snack | |

### 10.7 Weigh-in, sources, ending

**Weekly weigh-in:** both halves count. Home as in §6 (proper dinner, no
snacking, asleep by 23:00, running) plus work: a proper lunch (-300 kcal/day)
and lunchtime walks (-100 kcal/day averaged, 150 active minutes a week); stairs
add 25 active minutes. Snacking at work or at home counts as snacking.
Illustrative numbers, to be checked like the rest.

**Sources:** the office tips' sources are still candidates (Leroy 2009; Ward
2017; Kushlev & Dunn 2015; Soler 2010; Shrestha 2018; Thøgersen-Ntoumani 2015;
Thorndike 2012; Sonnentag & Fritz 2015; Becker 2021). Each must be added to
`SelfImprovement_Research.md` and checked before it appears in the game.

**Ending:** the day-49 retest with Dr Reyes (§6), with the seven tips as your
shift list.

### 10.8 How it's built

- `src/sim.js` is `SYL.makeSim(world)`, one simulator per place. A day runs the
  office simulator, then the flat's, passing the carry-over effects between them
  (and from each night to the next week's workday).
- The office world, art and weigh-in stay in `src/office/`, now part of the game.
- `tools/check-levels.js` brute-forces both layouts under one move budget, with
  the previous night carried in. `tests/smoke.js` plays the full game.

## 11. How you test it

After each push:
- Pull the branch and double-click `index.html`, **or**
- I'll set up GitHub Pages so every push is playable at a link.

Player feedback on what feels confusing, boring or broken is welcome.
