// World data: zones, slots, objects, actions.
// Shared by the browser game and the Node level checker. No Phaser here.
var SYL = (globalThis.SYL = globalThis.SYL || {});

SYL.WORLD = {
  // Your route through the evening, in order. x = waypoint position (room coords).
  zones: [
    { id: 'door', label: 'Front door', x0: 40, x1: 200, wx: 120 },
    { id: 'hall', label: 'Hallway', x0: 200, x1: 420, wx: 310 },
    { id: 'kitchen', label: 'Kitchen', x0: 420, x1: 690, wx: 555 },
    { id: 'living', label: 'Living room', x0: 690, x1: 960, wx: 825 },
    { id: 'bedroom', label: 'Bedroom', x0: 960, x1: 1240, wx: 1100 },
  ],

  // Slots objects can sit in. kind: 'open' (full pull), 'far' (half pull),
  // 'hidden' (out of sight: almost no pull, never reaches other rooms).
  slots: [
    // no: objects that make no sense there (food on a coat hook...)
    { id: 'door_hook', zone: 'door', label: 'Hook', x: 160, y: 214, kind: 'open', no: ['snacks', 'meal', 'laptop', 'book'] },
    { id: 'shoe_rack', zone: 'door', label: 'Shoe rack', x: 156, y: 392, kind: 'open', no: ['snacks', 'meal', 'laptop'] },
    { id: 'hall_table', zone: 'hall', label: 'Hall table', x: 270, y: 360, kind: 'open' },
    { id: 'closet', zone: 'hall', label: 'Closet', x: 366, y: 300, kind: 'hidden' },
    { id: 'counter', zone: 'kitchen', label: 'Counter', x: 492, y: 360, kind: 'open' },
    { id: 'table', zone: 'kitchen', label: 'Table', x: 620, y: 362, kind: 'open' },
    { id: 'cupboard', zone: 'kitchen', label: 'Cupboard', x: 492, y: 205, kind: 'hidden' },
    { id: 'coffee_table', zone: 'living', label: 'Coffee table', x: 745, y: 388, kind: 'open' },
    { id: 'couch', zone: 'living', label: 'Couch', x: 870, y: 350, kind: 'open' },
    { id: 'bedside', zone: 'bedroom', label: 'Bedside', x: 1005, y: 364, kind: 'open' },
    { id: 'dresser', zone: 'bedroom', label: 'Dresser (far)', x: 1201, y: 286, kind: 'far' },
    { id: 'drawer', zone: 'bedroom', label: 'Drawer', x: 1201, y: 396, kind: 'hidden' },
  ],

  // cue: how strongly the object pulls towards each action (before reach).
  // cat: colour family for the SHIFT view. good = healthy, trap = pulls you off track, rest = recovery.
  objects: {
    // The phone also drags down focus wherever it can reach (notifications, switching).
    phone: { label: 'Phone', short: 'PH', cat: 'trap', cue: { scroll: 4, focus: -2 }, alarm: true },
    shoes: { label: 'Running shoes', short: 'SH', cat: 'good', cue: { run: 4 } },
    headphones: { label: 'Headphones', short: 'HP', cat: 'good', cue: { run: 2 } },
    snacks: { label: 'Snack jar', short: 'SN', cat: 'trap', cue: { snack: 5 } },
    meal: { label: 'Prepped meal', short: 'ML', cat: 'good', cue: { eat: 4 } },
    blanket: { label: 'Blanket', short: 'BL', cat: 'rest', cue: { rest: 4 } },
    book: { label: 'Book', short: 'BK', cat: 'rest', cue: { read: 5 } },
    clock: { label: 'Alarm clock', short: 'AC', cat: 'good', cue: {}, alarm: true },
    laptop: { label: 'Laptop', short: 'LT', cat: 'good', cue: { focus: 4 } },
    postcard: { label: "Maya's postcard", short: 'PC', cat: 'good', cue: { call: 4 } },
  },

  // Actions. zones: where you can do it. mins: how long it takes.
  // base: built-in pull. once: can only happen once per evening.
  // needs: only possible if that object reaches the room (no shoes, no run).
  actions: {
    carry: { label: 'Carry on', short: 'Carry on', verb: 'Carrying on', zones: ['door', 'hall', 'kitchen', 'living'], mins: 0, base: 2.5 },
    run: { label: 'Go for a run', short: 'Run', verb: 'Running', zones: ['door', 'hall'], mins: 60, base: 0, once: true, needs: 'shoes' },
    scroll: { label: 'Scroll phone', short: 'Scroll', verb: 'Scrolling', zones: ['door', 'hall', 'kitchen', 'living'], mins: 75, base: 1, needs: 'phone' },
    eat: { label: 'Eat a proper dinner', short: 'Dinner', verb: 'Eating dinner', zones: ['kitchen', 'living'], mins: 40, base: 0, once: true, needs: 'meal' },
    snack: { label: 'Snack', short: 'Snack', verb: 'Snacking', zones: ['kitchen', 'living'], mins: 20, base: 0.5, once: true, needs: 'snacks' },
    focus: { label: 'Work on the project', short: 'Project', verb: 'Focusing on the project', zones: ['kitchen', 'living'], mins: 60, base: 0, once: true, needs: 'laptop' },
    call: { label: 'Call Maya', short: 'Call Maya', verb: 'Catching up with Maya', zones: ['hall', 'kitchen', 'living'], mins: 45, base: 0, once: true, needs: 'postcard' },
    rest: { label: 'Rest on the couch', short: 'Rest', verb: 'Resting', zones: ['living'], mins: 60, base: 0.5, once: true },
    // Bedtime decision (bedroom only)
    read: { label: 'Read in bed', short: 'Read', verb: 'Reading', zones: ['bedroom'], mins: 20, base: 0, needs: 'book' },
    bedscroll: { label: 'Scroll in bed', short: 'Scroll in bed', verb: 'Scrolling in bed', zones: ['bedroom'], mins: 75, base: 1, habit: 'scroll', cueAs: 'scroll', needs: 'phone' },
    sleep: { label: 'Go to sleep', short: 'Sleep', verb: 'Sleeping', zones: ['bedroom'], mins: 0, base: 4 },
  },

  // Tie-break order (earlier wins a tie).
  priority: ['carry', 'sleep', 'eat', 'run', 'focus', 'call', 'read', 'rest', 'snack', 'scroll', 'bedscroll'],

  walkMins: 10, // between waypoints
  bedtime: 22 * 60 + 30, // you head to bed at 22:30 (or later if busy)
  habitWeight: 2,
  reach: { same: 1, adjacent: 0.4, far: 0.5, hidden: 0.1 },

  startHabits: { scroll: 0.5, snack: 0.4, rest: 0.3, run: 0, eat: 0.1, read: 0, focus: 0, call: 0 },
};
