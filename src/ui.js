// Shared look and small UI helpers.
var SYL = (globalThis.SYL = globalThis.SYL || {});

SYL.C = {
  bg: 0x2b2a33,
  paper: 0xf6f0e6,
  floor: 0xfffaf2,
  line: 0xd8cdbd,
  ink: 0x3a3848,
  inkSoft: 0x7a768a,
  good: 0x4fae78,
  trap: 0xe0645a,
  rest: 0x5a8fd8,
  accent: 0xf2b84b,
  pip: 0x9ac1ff,
  hidden: 0xb9ad9c,
};
// Habit bars, shared by the Play and Ending screens: [habit, short label, colour, long label]
SYL.HABIT_ROWS = [
  ['run', 'Run', SYL.C.good, 'Running'], ['scroll', 'Scroll', SYL.C.trap, 'Scrolling'],
  ['eat', 'Dinner', SYL.C.good, 'Proper dinners'], ['snack', 'Snack', SYL.C.trap, 'Snacking'],
  ['focus', 'Focus', SYL.C.good, 'Focused work'], ['rest', 'Rest', SYL.C.rest, 'Resting'],
  ['call', 'Friends', SYL.C.good, 'Calling friends'], ['read', 'Read', SYL.C.rest, 'Reading in bed'],
];
// Your weight right now: start weight plus every finished week.
SYL.currentKg = function () {
  return SYL.health.START.kg + SYL.state.healthWeeks.reduce(function (n, w) { return n + w.dKg; }, 0);
};
SYL.hex = function (n) { return '#' + n.toString(16).padStart(6, '0'); };
SYL.FONT = '"Trebuchet MS", "Segoe UI", Arial, sans-serif';

SYL.text = function (scene, x, y, str, size, color, opts) {
  var style = Object.assign({ fontFamily: SYL.FONT, fontSize: size + 'px', color: SYL.hex(color === undefined ? SYL.C.ink : color) }, opts || {});
  return scene.add.text(x, y, str, style);
};

// Rounded button. Returns a container with .setEnabled(bool) and .setLabel(str).
SYL.button = function (scene, x, y, w, h, label, onClick, opts) {
  opts = opts || {};
  var fill = opts.fill || SYL.C.accent;
  var c = scene.add.container(x, y);
  var g = scene.add.graphics();
  var t = SYL.text(scene, 0, 0, label, opts.size || 22, opts.color === undefined ? SYL.C.ink : opts.color, { fontStyle: 'bold' }).setOrigin(0.5);
  function draw(hover) {
    g.clear();
    g.fillStyle(0x000000, 0.18).fillRoundedRect(-w / 2, -h / 2 + 4, w, h, 14);
    g.fillStyle(c.enabled ? fill : 0xbbb5aa, 1).fillRoundedRect(-w / 2, -h / 2 + (hover ? -2 : 0), w, h, 14);
  }
  c.add([g, t]);
  c.enabled = true;
  c.setSize(w, h).setInteractive({ useHandCursor: true });
  c.on('pointerover', function () { draw(true); });
  c.on('pointerout', function () { draw(false); });
  c.on('pointerdown', function () { if (c.enabled) { SYL.audio.play('click'); onClick(); } });
  c.setEnabled = function (v) { c.enabled = v; t.setAlpha(v ? 1 : 0.6); draw(false); return c; };
  c.setLabel = function (s) { t.setText(s); return c; };
  draw(false);
  return c;
};

// Mute toggle in the corner of every scene, plus the M key.
SYL.muteButton = function (scene) {
  var label = function () { return SYL.audio.isMuted() ? 'Sound: off' : 'Sound: on'; };
  var t = SYL.text(scene, 1272, 712, label(), 13, SYL.C.inkSoft).setOrigin(1, 1).setDepth(100).setInteractive({ useHandCursor: true });
  var toggle = function () { SYL.audio.toggleMute(); t.setText(label()); };
  t.on('pointerdown', toggle);
  scene.input.keyboard.on('keydown-M', toggle);
  return t;
};

// Promise helpers that respect the scene's time scale (speed toggle).
SYL.wait = function (scene, ms) {
  return new Promise(function (res) { scene.time.delayedCall(ms, res); });
};
SYL.tween = function (scene, cfg) {
  return new Promise(function (res) { cfg.onComplete = res; scene.tweens.add(cfg); });
};

SYL.state = {
  levelIndex: 0,
  habits: Object.assign({}, SYL.WORLD.startHabits),
  history: [],
  healthWeeks: [],
  speed: 1,
  reset: function () {
    this.levelIndex = 0;
    this.habits = Object.assign({}, SYL.WORLD.startHabits);
    this.history = [];
    this.healthWeeks = [];
    this.briefSeen = {};
  },
};
