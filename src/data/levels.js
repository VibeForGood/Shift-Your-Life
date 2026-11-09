// The five weeks. Each level is one week of Pip's life.
var SYL = (globalThis.SYL = globalThis.SYL || {});

// Goal types:
//   { type: 'did', action }        Pip did this action
//   { type: 'didnt', action }      Pip never did this action
//   { type: 'any', actions }       Pip did at least one of these
//   { type: 'asleepBy', time }     asleep by this time (minutes after midnight)
//   { type: 'alarm' }              an alarm (phone or clock) is in the bedroom, not hidden
SYL.LEVELS = [
  {
    id: 'w1',
    week: 1,
    title: 'Week 1',
    brief: 'Pip wants to start running. Pip also really likes their phone.',
    twist: null,
    moves: 2,
    layout: {
      phone: 'door_hook',
      shoes: 'closet',
      headphones: 'drawer',
      snacks: 'counter',
      blanket: 'couch',
    },
    locked: [],
    goals: [{ type: 'did', action: 'run', label: 'Go for a run' }],
  },
  {
    id: 'w2',
    week: 2,
    title: 'Week 2',
    brief: "Pip's phone is also their alarm. Pip is also very good at 'just one more video'.",
    twist: null,
    moves: 3,
    layout: {
      phone: 'bedside',
      shoes: 'closet',
      headphones: 'drawer',
      snacks: 'counter',
      blanket: 'couch',
      book: 'coffee_table',
    },
    locked: [],
    goals: [
      { type: 'did', action: 'run', label: 'Go for a run' },
      { type: 'asleepBy', time: 23 * 60, label: 'Asleep by 23:00' },
      { type: 'alarm', label: 'Alarm in the bedroom' },
    ],
  },
  {
    id: 'w3',
    week: 3,
    title: 'Week 3',
    brief: 'Rough day at work. Pip is wiped out. Resting counts.',
    twist: { id: 'rough', label: 'Rough day', desc: 'Rest +2, Run -2, Snack +1', mods: { rest: 2, run: -2, snack: 1 } },
    moves: 3,
    layout: {
      phone: 'couch',
      shoes: 'shoe_rack',
      headphones: 'drawer',
      snacks: 'counter',
      meal: 'cupboard',
      blanket: 'closet',
      book: 'bedside',
      clock: 'hall_table',
    },
    locked: [],
    goals: [
      { type: 'did', action: 'eat', label: 'Eat a proper dinner' },
      { type: 'didnt', action: 'snack', label: 'No snacking' },
      { type: 'asleepBy', time: 23 * 60, label: 'Asleep by 23:00' },
      { type: 'alarm', label: 'Alarm in the bedroom' },
    ],
  },
  {
    id: 'w4',
    week: 4,
    title: 'Week 4',
    brief: 'Raining. Running in the rain is miserable... unless there is a good podcast.',
    twist: { id: 'rain', label: 'Raining', desc: 'Run -3 (cancelled by headphones in the same room)', mods: { run: -3 }, cancel: { action: 'run', object: 'headphones' } },
    moves: 3,
    layout: {
      phone: 'coffee_table',
      shoes: 'shoe_rack',
      headphones: 'drawer',
      snacks: 'counter',
      meal: 'table',
      blanket: 'couch',
      book: 'hall_table',
      clock: 'bedside',
    },
    locked: [],
    goals: [
      { type: 'did', action: 'run', label: 'Go for a run' },
      { type: 'didnt', action: 'snack', label: 'No snacking' },
      { type: 'asleepBy', time: 23 * 60, label: 'Asleep by 23:00' },
      { type: 'alarm', label: 'Alarm in the bedroom' },
    ],
  },
  {
    id: 'w5',
    week: 5,
    title: 'Week 5',
    brief: 'Overtime. Pip gets home at 20:00, too tired to even look at the kitchen. Straight to the couch.',
    twist: { id: 'overtime', label: 'Overtime', desc: 'Home at 20:00 · skips the kitchen', mods: {}, start: 20 * 60, skip: ['kitchen'], skipReason: 'Too tired for the kitchen' },
    moves: 2,
    layout: {
      phone: 'drawer',
      shoes: 'shoe_rack',
      headphones: 'closet',
      snacks: 'coffee_table',
      meal: 'cupboard',
      blanket: 'dresser',
      book: 'hall_table',
      clock: 'bedside',
    },
    locked: [],
    goals: [
      { type: 'any', actions: ['run', 'rest'], label: 'Run or rest' },
      { type: 'did', action: 'eat', label: 'Eat a proper dinner' },
      { type: 'asleepBy', time: 23 * 60, label: 'Asleep by 23:00' },
      { type: 'alarm', label: 'Alarm in the bedroom' },
    ],
  },
];
