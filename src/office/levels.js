// Office life expansion: five workweeks, one shift each. Same format as SYL.LEVELS
// (see src/data/levels.js for goal types). Extra goal types used here:
//   { type: 'minutes', action, min }   spent at least `min` minutes on an action
//   { type: 'leftBy', time }           out of the office by this time
//   { type: 'didntAny', actions }      did none of these
//
// tip.src: CANDIDATE sources. Each must be checked and added to
// SelfImprovement_Research.md before the expansion ships.
var SYL = (globalThis.SYL = globalThis.SYL || {});

SYL.OFFICE_LEVELS = [
  {
    id: 'o1',
    week: 1,
    title: 'Office week 1',
    topic: { name: 'Deep work', icon: 'priority' },
    brief: 'One big report is due Friday. Your phone, your inbox and Sam would all like a word first.',
    twist: { id: 'noise', label: 'Open-plan noise', desc: 'Chat +2.5 (cancelled by headphones at your desk)', mods: { chat: 2.5 }, cancel: { action: 'chat', object: 'headphones' } },
    moves: 2,
    layout: {
      phone: 'bag_hook',
      laptop: 'desktop',
      priority: 'desk_drawer',
      headphones: 'locker',
      biscuits: 'counter',
      lunch: 'fridge',
      trainers: 'coat_stand',
    },
    locked: [],
    goals: [
      { type: 'minutes', action: 'deep', min: 120, label: '2 hours of deep work' },
      { type: 'didnt', action: 'scroll', label: 'No scrolling' },
    ],
    tip: {
      do: 'Block out your best hour for one task. Put your phone out of sight and check email at set times, not all day.',
      why: 'Every switch leaves part of your attention on the last task. A phone in view can pull at your attention even when you ignore it.',
      src: 'Candidates: Leroy 2009 · Ward et al. 2017 · Kushlev & Dunn 2015',
    },
  },
  {
    id: 'o2',
    week: 2,
    title: 'Office week 2',
    topic: { name: 'Move more', icon: 'trainers' },
    brief: 'You sit at your desk for most of the day. Dr Reyes would like some of those hours back.',
    twist: null,
    moves: 3,
    layout: {
      phone: 'side_shelf',
      laptop: 'desktop',
      trainers: 'fridge',
      note: 'desk_drawer',
      mat: 'locker',
      biscuits: 'counter',
      water: 'bag_hook',
    },
    locked: [],
    goals: [
      { type: 'did', action: 'stairs', label: 'Take the stairs' },
      { type: 'did', action: 'lunchwalk', label: 'Go for a lunchtime walk' },
      { type: 'did', action: 'stand', label: 'Stand for an hour' },
    ],
    tip: {
      do: 'Put a reminder where the choice happens: a note by the lift, trainers by the kitchen, a standing spot by your desk.',
      why: 'Prompts at the point of decision nudge people towards the stairs, and short walks break up long sitting.',
      src: 'Candidates: Soler et al. 2010 · Shrestha et al. 2018 · Thøgersen-Ntoumani et al. 2015',
    },
  },
  {
    id: 'o3',
    week: 3,
    title: 'Office week 3',
    topic: { name: 'Food at work', icon: 'lunch' },
    brief: "It's somebody's birthday. There is cake. There is always cake.",
    twist: { id: 'cake', label: 'Birthday cake', desc: 'Cake in the kitchenette (it stays put)', mods: {}, fixed: { cake: 'cake_spot' } },
    moves: 3,
    layout: {
      phone: 'bag_hook',
      laptop: 'desktop',
      lunch: 'fridge',
      biscuits: 'side_shelf',
      water: 'locker',
      trainers: 'coat_stand',
      priority: 'desk_drawer',
    },
    locked: [],
    goals: [
      { type: 'did', action: 'lunch', label: 'Eat a proper lunch' },
      { type: 'didntAny', actions: ['vending', 'snack'], label: 'No vending machine, no snacks' },
      { type: 'did', action: 'water', label: 'Refill your water' },
    ],
    tip: {
      do: 'Bring lunch and put it where you will see it first. Keep the biscuits in a drawer and a water bottle on your desk.',
      why: 'Making the healthy option the visible, easy one changes what people pick, without asking for more willpower.',
      src: 'Candidates: Thorndike et al. 2012 · Hollands et al. 2019',
    },
  },
  {
    id: 'o4',
    week: 4,
    title: 'Office week 4',
    topic: { name: 'Leave on time', icon: 'ticket' },
    brief: "Maya got cinema tickets for 18:30. Your boss sends 'quick question' emails at five.",
    twist: { id: 'boss', label: '17:00 email', desc: 'Stay late +2.5', mods: { stay: 2.5 } },
    moves: 3,
    layout: {
      phone: 'desktop',
      laptop: 'bag_hook',
      ticket: 'locker',
      priority: 'side_shelf',
      biscuits: 'desk_drawer',
      lunch: 'counter',
      headphones: 'fridge',
    },
    locked: [],
    goals: [
      { type: 'didnt', action: 'stay', label: 'Leave on time' },
      { type: 'didnt', action: 'takehome', label: 'Laptop stays at work' },
      { type: 'minutes', action: 'deep', min: 60, label: 'An hour of deep work' },
    ],
    tip: {
      do: 'Leave the work laptop at work and put an evening plan where you will see it at five o\'clock.',
      why: 'Switching off from work in the evening helps people recover. Expecting to answer email after hours is linked to strain.',
      src: 'Candidates: Sonnentag & Fritz 2015 · Becker et al. 2021',
    },
  },
  {
    id: 'o5',
    week: 5,
    title: 'Office week 5',
    topic: { name: 'The whole day', icon: 'laptop' },
    brief: 'Deadline week. Everything is urgent. Your setup has to do the work for you.',
    twist: { id: 'deadline', label: 'Deadline week', desc: 'Stay late +2, Email +1', mods: { stay: 2, email: 1 } },
    moves: 3,
    layout: {
      phone: 'side_shelf',
      laptop: 'desktop',
      lunch: 'fridge',
      trainers: 'locker',
      ticket: 'desk_drawer',
      biscuits: 'counter',
      priority: 'bag_hook',
    },
    locked: [],
    goals: [
      { type: 'did', action: 'deep', label: 'Some deep work' },
      { type: 'any', actions: ['stairs', 'lunchwalk'], label: 'Stairs or a lunch walk' },
      { type: 'did', action: 'lunch', label: 'Eat a proper lunch' },
      { type: 'didnt', action: 'stay', label: 'Leave on time' },
    ],
    tip: {
      do: 'Write two if-then plans for busy days: "If it is 12:30, then I take my lunch to the kitchen." "If it is 17:30, then I pack up."',
      why: 'Linking an action to a specific moment makes it far more likely to happen when you are busy or stressed.',
      src: 'Candidates: Gollwitzer & Sheeran 2006',
    },
  },
];
