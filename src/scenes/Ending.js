var SYL = (globalThis.SYL = globalThis.SYL || {});

SYL.EndingScene = class extends Phaser.Scene {
  constructor() { super('Ending'); }

  create() {
    var C = SYL.C;
    var st = SYL.state;
    this.add.rectangle(640, 360, 1280, 720, C.paper);
    SYL.text(this, 640, 80, 'Five weeks later', 56, C.ink, { fontStyle: 'bold' }).setOrigin(0.5);

    var stars = st.history.reduce(function (n, h) { return n + h.stars; }, 0);
    var maxStars = st.history.reduce(function (n, h) { return n + h.maxStars; }, 0);
    SYL.text(this, 640, 140, 'Stars: ' + stars + ' / ' + maxStars, 26, C.inkSoft).setOrigin(0.5);

    var rows = [
      ['run', 'Running', C.good], ['eat', 'Proper dinners', C.good], ['read', 'Reading in bed', C.rest],
      ['rest', 'Resting', C.rest], ['scroll', 'Scrolling', C.trap], ['snack', 'Snacking', C.trap],
    ];
    rows.forEach((r, i) => {
      var y = 210 + i * 52;
      var v = st.habits[r[0]] || 0;
      var s0 = SYL.WORLD.startHabits[r[0]] || 0;
      SYL.text(this, 360, y, r[1], 24, C.ink).setOrigin(0, 0.5);
      this.add.rectangle(580, y, 360, 22, C.line).setOrigin(0, 0.5);
      this.add.rectangle(580, y, 360 * s0, 22, C.inkSoft, 0.35).setOrigin(0, 0.5);
      var bar = this.add.rectangle(580, y, 0, 22, r[2]).setOrigin(0, 0.5);
      this.tweens.add({ targets: bar, width: 360 * v, duration: 900, delay: 200 + i * 120, ease: 'Cubic.out' });
      SYL.text(this, 960, y, Math.round(v * 100) + '%', 22, C.inkSoft).setOrigin(0, 0.5);
    });
    SYL.text(this, 640, 535, 'Grey = where Pip started. Habits build fast, then level off, and a missed week only dents them.', 18, C.inkSoft).setOrigin(0.5);

    SYL.text(this, 640, 590, "Pip didn't find more willpower.\nTheir apartment just got on their side.", 28, C.ink, { align: 'center', fontStyle: 'italic' }).setOrigin(0.5);
    SYL.button(this, 640, 670, 240, 56, 'Play again', () => this.scene.start('Title'));
  }
};
