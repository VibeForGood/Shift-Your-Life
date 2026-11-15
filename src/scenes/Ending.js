// Day 49: the follow-up with Dr Reyes. Your habits, and the shift list to take into your own life.
var SYL = (globalThis.SYL = globalThis.SYL || {});

SYL.EndingScene = class extends Phaser.Scene {
  constructor() { super('Ending'); }

  create() {
    var C = SYL.C;
    var st = SYL.state;
    this.add.rectangle(640, 360, 1280, 720, C.paper);
    SYL.art.ensureTextures(this);
    SYL.text(this, 640, 42, 'Day 49 · Follow-up with Dr Reyes', 40, C.ink, { fontStyle: 'bold' }).setOrigin(0.5);

    // Dr Reyes' verdict depends on how many weeks went to plan.
    var met = st.history.filter(function (h) { return h.met; }).length;
    var quote = met >= 5
      ? "'Look at this. You didn't white-knuckle it. You set your flat up to help you. Half a kilo to a kilo a week is the pace that lasts, and these habits will carry it.'"
      : met >= 2
        ? "'Some of this is sticking, and that's how it works. A missed week dents a habit, it doesn't reset it. Keep shifting one thing at a time.'"
        : "'Seven weeks is a start, not a verdict. Pick one shift from your list and make it so easy it's almost silly. Then do it again tomorrow.'";
    var hero = SYL.art.makeHero(this, 90, 120, 26);
    hero.mood(met >= 2 ? 'happy' : 'content');
    var g = this.add.graphics();
    g.fillStyle(0xffffff, 1).fillRoundedRect(150, 82, 1090, 76, 14);
    g.fillTriangle(150, 110, 150, 130, 136, 120);
    SYL.text(this, 170, 92, quote, 18, C.ink, { wordWrap: { width: 1050 }, fontStyle: 'italic' });

    // Left: your habits, start (grey) vs now
    SYL.text(this, 50, 184, 'YOUR HABITS  (grey = week 1)', 14, C.inkSoft, { fontStyle: 'bold' });
    SYL.HABIT_ROWS.forEach((r, i) => {
      var y = 222 + i * 38;
      var v = st.habits[r[0]] || 0;
      var s0 = SYL.WORLD.startHabits[r[0]] || 0;
      SYL.text(this, 50, y, r[3], 18, C.ink).setOrigin(0, 0.5);
      this.add.rectangle(230, y, 250, 16, C.line).setOrigin(0, 0.5);
      this.add.rectangle(230, y, 250 * s0, 16, C.inkSoft, 0.35).setOrigin(0, 0.5);
      var bar = this.add.rectangle(230, y, 0, 16, r[2]).setOrigin(0, 0.5);
      this.tweens.add({ targets: bar, width: 250 * v, duration: 900, delay: 200 + i * 100, ease: 'Cubic.out' });
      SYL.text(this, 492, y, Math.round(v * 100) + '%', 16, C.inkSoft).setOrigin(0, 0.5);
    });

    // Right: the shift list, the real-life takeaways from every week
    var lx = 570;
    var panel = this.add.graphics();
    panel.fillStyle(0xe3f1e8, 1).fillRoundedRect(lx - 14, 172, 684, 376, 14);
    SYL.text(this, lx, 184, 'YOUR SHIFT LIST: TRY THESE IN YOUR LIFE', 14, C.good, { fontStyle: 'bold' });
    SYL.LEVELS.forEach((L, i) => {
      var y = 210 + i * 48;
      var h = st.history.find(function (x) { return x.week === L.week; });
      var done = h && h.met;
      this.add.image(lx + 16, y + 18, 'icon_' + L.topic.icon).setScale(0.48);
      SYL.text(this, lx + 42, y + 2, (done ? '✓ ' : '') + L.topic.name, 16, done ? C.good : C.ink, { fontStyle: 'bold' });
      SYL.text(this, lx + 150, y + 3, L.tip.do, 13, C.ink, { wordWrap: { width: 506 } });
    });

    SYL.text(this, 640, 586, "You didn't find more willpower. You shifted what was around you.", 26, C.ink, { fontStyle: 'italic' }).setOrigin(0.5);
    SYL.text(this, 640, 620, "A game, not medical advice. If you're worried about your weight, blood sugar or blood pressure, talk to a doctor.", 14, C.inkSoft).setOrigin(0.5);
    SYL.muteButton(this);
    SYL.audio.play('win');
    SYL.button(this, 640, 674, 240, 52, 'Play again', () => this.scene.start('Title'));
  }
};
