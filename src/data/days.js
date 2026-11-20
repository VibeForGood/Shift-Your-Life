// The seven weeks of the full-day game: one day each (work, then home), standing
// for the whole week. One move budget across both places. See DESIGN.md §10.
//
// Goals take `at`: 'work', 'home' or 'day' (both halves together). Goal types are
// the simulator's (src/sim.js evalGoal). The flat's layouts, twists and tips come
// from the home weeks (src/data/levels.js), whose tips are already checked
// against SelfImprovement_Research.md.
//
// Mechanics arrive one at a time, so early weeks switch carry-overs off:
//   carries: { night, alarm, evening }  false = this week doesn't use it yet
//                                       (default: all on; see src/day.js D.carries)
//   newRule: the rule this week adds, shown on the week card as "New this week: ..."
//   Week 1: none. Week 2: last night's sleep. Week 3: oversleeping and work -> evening.
var SYL = (globalThis.SYL = globalThis.SYL || {});

(function () {
  var H = SYL.LEVELS;
  function home(i, extra) {
    return Object.assign({ layout: Object.assign({}, H[i].layout), twist: H[i].twist, locked: [] }, extra || {});
  }

  SYL.DAYS = [
    {
      id: 'd1', week: 1, title: 'Week 1',
      topic: { name: 'Move', icon: 'shoes' },
      brief: "Dr Reyes wants 150 active minutes a week. You'd like to start moving. You'd also really like to look at your phone.",
      moves: 3,
      work: {
        layout: { phone: 'desktop', laptop: 'side_shelf', trainers: 'locker', note: 'desk_drawer', biscuits: 'counter', lunch: 'fridge' },
        twist: null,
      },
      home: home(0),
      goals: [
        { at: 'work', type: 'did', action: 'stairs', label: 'Take the stairs at work' },
        { at: 'home', type: 'did', action: 'run', label: 'Go for a run after work' },
      ],
      carries: { night: false, evening: false }, // week 1 teaches one thing: put the cue where you'll be
      tip: H[0].tip,
    },
    {
      id: 'd2', week: 2, title: 'Week 2',
      topic: { name: 'Sleep', icon: 'clock' },
      brief: "Your phone is also your alarm. Tonight decides how next week's workdays go.",
      moves: 3,
      work: {
        layout: { phone: 'desktop', laptop: 'side_shelf', priority: 'desk_drawer', biscuits: 'counter', lunch: 'fridge', trainers: 'coat_stand' },
        twist: null,
      },
      home: home(1),
      goals: [
        { at: 'work', type: 'minutes', action: 'deep', min: 60, label: 'An hour of deep work' },
        { at: 'home', type: 'asleepBy', time: 23 * 60, label: 'Asleep by 23:00' },
        { at: 'home', type: 'alarm', label: 'Alarm in the bedroom' },
      ],
      carries: { alarm: false, evening: false }, // the alarm is taught this week, so oversleeping counts from week 3
      newRule: 'how you slept last night carries into your workday. In bed by 23:00 and you start Rested; up late and you start Tired. From next week, no alarm in the bedroom means you oversleep.',
      tip: H[1].tip,
    },
    {
      id: 'd3', week: 3, title: 'Week 3',
      topic: { name: 'Food', icon: 'meal' },
      brief: 'Skip lunch and the evening snacks get much harder to beat. Feed yourself properly at both ends of the day.',
      moves: 3,
      work: {
        layout: { phone: 'bag_hook', laptop: 'desktop', lunch: 'fridge', biscuits: 'desk_drawer', trainers: 'coat_stand', priority: 'side_shelf' },
        twist: null,
      },
      home: home(2, { layout: Object.assign({}, H[2].layout, { phone: 'dresser' }) }),
      goals: [
        { at: 'work', type: 'did', action: 'lunch', label: 'Proper lunch at work' },
        { at: 'home', type: 'did', action: 'eat', label: 'Proper dinner at home' },
        { at: 'day', type: 'didnt', action: 'snack', label: 'No snacking all day' },
      ],
      newRule: "your workday follows you home. Skip lunch and you're Hungry, skip deep work and you're Frazzled, take the stairs or a lunch walk and you're Already moving.",
      tip: H[2].tip,
    },
    {
      id: 'd4', week: 4, title: 'Week 4',
      topic: { name: 'Focus', icon: 'laptop' },
      brief: 'One big report is due Friday. Your phone, your inbox and Sam would all like a word first.',
      moves: 3,
      work: {
        layout: { phone: 'bag_hook', laptop: 'desktop', priority: 'desk_drawer', headphones: 'locker', biscuits: 'counter', lunch: 'fridge', trainers: 'coat_stand' },
        twist: { id: 'noise', label: 'Open-plan noise', desc: 'Chat +2.5 (cancelled by headphones at your desk)', mods: { chat: 2.5 }, cancel: { action: 'chat', object: 'headphones' } },
      },
      home: home(1, { twist: null }),
      goals: [
        { at: 'work', type: 'minutes', action: 'deep', min: 120, label: '2 hours of deep work' },
        { at: 'day', type: 'didnt', action: 'scroll', label: 'No scrolling all day' },
        { at: 'home', type: 'asleepBy', time: 23 * 60, label: 'Asleep by 23:00' },
      ],
      tip: H[4].tip,
    },
    {
      id: 'd5', week: 5, title: 'Week 5',
      topic: { name: 'Friends', icon: 'postcard' },
      brief: "You owe Maya a call. Your boss sends 'quick question' emails at five.",
      moves: 3,
      work: {
        layout: { phone: 'side_shelf', laptop: 'desktop', ticket: 'locker', priority: 'bag_hook', biscuits: 'desk_drawer', lunch: 'counter' },
        twist: { id: 'boss', label: '17:00 email', desc: 'Stay late +2.5', mods: { stay: 2.5 } },
      },
      home: home(5),
      goals: [
        { at: 'work', type: 'didnt', action: 'stay', label: 'Leave work on time' },
        { at: 'home', type: 'did', action: 'call', label: 'Call Maya' },
      ],
      tip: H[5].tip,
    },
    {
      id: 'd6', week: 6, title: 'Week 6',
      topic: { name: 'Make it fun', icon: 'headphones' },
      brief: "It's raining after work. Moving needs to be something you'd actually look forward to.",
      moves: 3,
      work: {
        layout: { phone: 'side_shelf', laptop: 'desktop', trainers: 'fridge', note: 'desk_drawer', biscuits: 'counter', lunch: 'table' },
        twist: null,
      },
      home: home(3),
      goals: [
        { at: 'work', type: 'did', action: 'lunchwalk', label: 'Lunchtime walk' },
        { at: 'home', type: 'did', action: 'run', label: 'Go for a run' },
        { at: 'day', type: 'didnt', action: 'snack', label: 'No snacking all day' },
      ],
      tip: H[3].tip,
    },
    {
      id: 'd7', week: 7, title: 'Week 7',
      topic: { name: 'Hard days', icon: 'blanket' },
      brief: 'Deadline week. Everything is urgent. Your setup has to do the work for you, at both ends of the day.',
      moves: 3,
      work: {
        layout: { phone: 'side_shelf', laptop: 'desktop', lunch: 'fridge', trainers: 'locker', ticket: 'desk_drawer', biscuits: 'counter', priority: 'bag_hook' },
        twist: { id: 'deadline', label: 'Deadline week', desc: 'Stay late +2, Email +1', mods: { stay: 2, email: 1 } },
      },
      home: home(6, { twist: null }),
      goals: [
        { at: 'work', type: 'did', action: 'lunch', label: 'Proper lunch at work' },
        { at: 'home', type: 'any', actions: ['run', 'rest'], label: 'Run or rest' },
        { at: 'home', type: 'did', action: 'eat', label: 'Proper dinner' },
        { at: 'home', type: 'asleepBy', time: 23 * 60, label: 'Asleep by 23:00' },
      ],
      tip: H[6].tip,
    },
  ];

  SYL.DAYS.forEach(function (d) { d.work.locked = d.work.locked || []; });
})();
