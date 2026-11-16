// Office life expansion: the office floor at Halcyon Insurance.
// Same shape as the flat's SYL.WORLD (see src/data/world.js and src/sim.js).
// Shared by the browser game and the Node level checker. No Phaser here.
var SYL = (globalThis.SYL = globalThis.SYL || {});

SYL.OFFICE_WORLD = {
  zones: [
    { id: 'lobby', label: 'Lobby', x0: 40, x1: 330, wx: 200 },
    { id: 'desk', label: 'Your desk', x0: 330, x1: 830, wx: 560 },
    { id: 'kitchen', label: 'Kitchenette', x0: 830, x1: 1240, wx: 1010 },
  ],

  // fixed: true slots hold things you can't move (they never take objects).
  slots: [
    { id: 'coat_stand', zone: 'lobby', label: 'Coat stand', x: 110, y: 250, kind: 'open', no: ['biscuits', 'lunch', 'laptop', 'mat', 'water'] },
    { id: 'bag_hook', zone: 'lobby', label: 'Your bag', x: 225, y: 370, kind: 'open', no: ['mat'] },
    { id: 'locker', zone: 'lobby', label: 'Locker', x: 290, y: 230, kind: 'hidden' },
    { id: 'desk_drawer', zone: 'desk', label: 'Desk drawer', x: 551, y: 406, kind: 'hidden', no: ['mat'] },
    { id: 'desktop', zone: 'desk', label: 'Desk', x: 500, y: 330, kind: 'open', no: ['mat'] },
    { id: 'side_shelf', zone: 'desk', label: 'Top shelf (far)', x: 610, y: 225, kind: 'far', no: ['mat'] },
    { id: 'floor', zone: 'desk', label: 'Floor', x: 640, y: 410, kind: 'open' },
    { id: 'counter', zone: 'kitchen', label: 'Counter', x: 880, y: 350, kind: 'open', no: ['mat'] },
    { id: 'table', zone: 'kitchen', label: 'Table', x: 1046, y: 370, kind: 'open', no: ['mat'] },
    { id: 'fridge', zone: 'kitchen', label: 'Fridge', x: 1190, y: 290, kind: 'hidden', no: ['mat', 'laptop'] },
    // Fixed things
    { id: 'sam_desk', zone: 'desk', label: "Sam's desk", x: 765, y: 345, kind: 'open', fixed: true },
    { id: 'vending_spot', zone: 'kitchen', label: 'Vending machine', x: 1112, y: 404, kind: 'open', fixed: true },
    { id: 'cake_spot', zone: 'kitchen', label: 'Cake', x: 962, y: 350, kind: 'open', fixed: true },
  ],

  // cue: how strongly the object pulls towards each action (before reach).
  objects: {
    phone: { label: 'Phone', cat: 'trap', cue: { scroll: 4, deep: -2 } },
    laptop: { label: 'Work laptop', cat: 'good', cue: { deep: 4, takehome: 4 } },
    priority: { label: 'Priority list', cat: 'good', cue: { deep: 3 } },
    headphones: { label: 'Noise-cancelling headphones', cat: 'good', cue: { deep: 2 } },
    biscuits: { label: 'Biscuit tin', cat: 'trap', cue: { snack: 5 } },
    lunch: { label: 'Packed lunch', cat: 'good', cue: { lunch: 6 } },
    water: { label: 'Water bottle', cat: 'good', cue: { water: 5 } },
    trainers: { label: 'Trainers', cat: 'good', cue: { stairs: 3, lunchwalk: 4 } },
    mat: { label: 'Standing mat', cat: 'good', cue: { stand: 4 } },
    ticket: { label: "Maya's cinema ticket", cat: 'good', cue: { leave: 4 } },
    note: { label: 'Stairs reminder', cat: 'good', cue: { stairs: 3 } },
    // Fixed: always there, can't be moved.
    sam: { label: 'Sam', cat: 'trap', cue: { chat: 2 }, fixed: true },
    vending: { label: 'Vending machine', cat: 'trap', cue: { vending: 3 }, fixed: true },
    cake: { label: 'Birthday cake', cat: 'trap', cue: { snack: 3.5 }, fixed: true },
  },

  // Where the fixed things are (their slots have fixed: true).
  fixed: { sam: 'sam_desk', vending: 'vending_spot' },

  // The workday. Desk visits are time blocks: you keep choosing until the block ends.
  route: [
    { zone: 'lobby', id: 'arrive', only: ['lift', 'stairs', 'scroll'] },
    { zone: 'desk', until: 12 * 60 + 30 },
    { zone: 'kitchen', until: 13 * 60 + 30 },
    { zone: 'desk', until: 17 * 60 + 30 },
    { zone: 'desk', id: 'end', until: 19 * 60 + 30, only: ['leave', 'stay'] },
    { zone: 'lobby', id: 'out', only: ['takehome', 'carry'] },
  ],
  end: { type: 'leave', zone: 'lobby' },
  startTime: 8 * 60 + 45,
  leaveBy: 17 * 60 + 45, // for the "Left at" colour

  // cat: colour in the decision bubble. anim/prop: reuse a base-game animation.
  actions: {
    carry: { label: 'Carry on', short: 'Carry on', verb: 'Carrying on', zones: ['kitchen', 'lobby'], mins: 0, base: 2.5 },
    lift: { label: 'Take the lift', short: 'Lift', verb: 'Taking the lift', zones: ['lobby'], at: 'arrive', mins: 2, base: 2.5 },
    stairs: { label: 'Take the stairs', short: 'Stairs', verb: 'Climbing the stairs', zones: ['lobby'], at: 'arrive', mins: 5, base: 0, once: true, cat: 'good' },
    scroll: { label: 'Scroll phone', short: 'Scroll', verb: 'Scrolling', zones: ['lobby', 'desk'], mins: 20, base: 0, needs: 'phone', cat: 'trap' },
    deep: { label: 'Deep work', short: 'Deep work', verb: 'Deep in the work', zones: ['desk'], mins: 60, base: 0, needs: 'laptop', cat: 'good', anim: 'focus' },
    email: { label: 'Check email', short: 'Email', verb: 'Checking email', zones: ['desk'], mins: 20, base: 3, anim: 'focus', prop: 'laptop' },
    chat: { label: 'Chat with Sam', short: 'Chat', verb: 'Chatting with Sam', zones: ['desk'], mins: 15, base: 0, needs: 'sam', cat: 'rest', anim: 'call', prop: false },
    snack: { label: 'Snack', short: 'Snack', verb: 'Snacking', zones: ['desk', 'kitchen'], mins: 10, base: 0.5, once: true, needs: ['biscuits', 'cake'], excludes: ['lunch'], cat: 'trap', prop: 'biscuits' }, // a proper lunch fills you up
    stand: { label: 'Work standing up', short: 'Stand', verb: 'Working standing up', zones: ['desk'], mins: 60, base: 0, once: true, needs: 'mat', cat: 'good', anim: 'stand' },
    water: { label: 'Refill your water', short: 'Water', verb: 'Refilling water', zones: ['desk'], mins: 5, base: 0, once: true, needs: 'water', cat: 'good', anim: 'eat', prop: 'water' },
    lunch: { label: 'Eat a proper lunch', short: 'Lunch', verb: 'Eating lunch', zones: ['kitchen'], mins: 30, base: 0, once: true, needs: 'lunch', excludes: ['vending'], cat: 'good', anim: 'eat', prop: 'lunch', sound: 'eat' },
    vending: { label: 'Vending machine lunch', short: 'Vending', verb: 'Crisps and a fizzy drink', zones: ['kitchen'], mins: 10, base: 0, once: true, needs: 'vending', excludes: ['lunch'], cat: 'trap', anim: 'snack', prop: false, sound: 'snack' },
    lunchwalk: { label: 'Lunchtime walk', short: 'Walk', verb: 'Walking round the block', zones: ['kitchen'], mins: 30, base: 0, once: true, needs: 'trainers', cat: 'good', anim: 'walk', sound: 'run' },
    leave: { label: 'Leave on time', short: 'Leave', verb: 'Packing up', zones: ['desk'], at: 'end', mins: 0, base: 3, cat: 'good' },
    stay: { label: 'Stay late', short: 'Stay late', verb: 'Staying late', zones: ['desk'], at: 'end', mins: 30, base: 1.5, cat: 'trap', anim: 'focus', prop: 'laptop' },
    takehome: { label: 'Take the laptop home', short: 'Take work home', verb: 'Packing the laptop', zones: ['lobby'], at: 'out', mins: 0, base: 0, needs: 'laptop', cat: 'trap' },
  },

  // Tie-break order (earlier wins a tie).
  priority: ['carry', 'leave', 'deep', 'lunch', 'stairs', 'lunchwalk', 'stand', 'water', 'email', 'lift', 'chat', 'stay', 'takehome', 'vending', 'snack', 'scroll'],

  // When what you'd do next doesn't fit before a time block ends, you do this instead (if it fits).
  filler: 'email',

  walkMins: 10,
  habitWeight: 2,
  reach: { same: 1, adjacent: 0.4, far: 0.5, hidden: 0.1 },

  // Office defaults: scrolling, snacking and staying late are already habits.
  startHabits: { scroll: 0.5, snack: 0.4, vending: 0.4, stay: 0.5, chat: 0.3, takehome: 0.3, deep: 0.1, lunch: 0.1, stairs: 0, lunchwalk: 0, stand: 0, water: 0 },
};
