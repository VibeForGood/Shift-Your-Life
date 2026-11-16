// Office life expansion: day 84, the second retest with Dr Reyes. Day 1, day 49 and
// day 84 side by side, and the office shift list. Same style as the base game's ending.
var SYL = (globalThis.SYL = globalThis.SYL || {});

SYL.OfficeEndingScene = class extends Phaser.Scene {
  constructor() { super('OfficeEnding'); }

  create() {
    var C = SYL.C;
    var H = SYL.health;
    var st = SYL.state;
    var R = SYL.officeHealth.retests(st);
    var d1 = R.d1, d49 = R.d49, d84 = R.d84;
    var lost = Math.round((d49.kg - d84.kg) * 10) / 10; // since day 49
    var goal = Math.round(0.5 * st.healthWeeks.length * 10) / 10;

    this.add.rectangle(640, 360, 1280, 720, C.paper);
    SYL.art.ensureTextures(this);
    SYL.text(this, 640, 38, 'Day 84 · Your second retest with Dr Reyes', 38, C.ink, { fontStyle: 'bold' }).setOrigin(0.5);

    var quote = lost >= goal
      ? "'Another " + lost.toFixed(1) + " kilos since day 49, and your workdays are helping now instead of fighting you. This is what lasting change looks like.'"
      : lost >= 0.5
        ? "'" + lost.toFixed(1) + " kilos since day 49. Slower, but still the right way. Which office week slipped? Make that one shift easier.'"
        : "'Not much movement since day 49, and that's OK. Workdays are hard to change. Pick the easiest shift on your list and start there.'";
    var hero = SYL.art.makeHero(this, 82, 116, 24);
    hero.mood(lost >= 0.5 ? 'happy' : 'content');
    var g = this.add.graphics();
    g.fillStyle(0xffffff, 1).fillRoundedRect(140, 76, 1100, 76, 14);
    g.fillTriangle(140, 104, 140, 124, 126, 114);
    SYL.text(this, 160, 86, quote, 18, C.ink, { wordWrap: { width: 1060 }, fontStyle: 'italic' });

    // Left: the results table
    var x0 = 40, cols = [x0, 270, 420, 570, 700];
    var ty = 176;
    g.fillStyle(0xffffff, 0.7).fillRoundedRect(x0 - 12, ty - 8, 760, 378, 14);
    ['YOUR RESULTS', 'DAY 1', 'DAY 49', 'DAY 84', ''].forEach((h, i) => SYL.text(this, cols[i], ty, h, 14, C.inkSoft, { fontStyle: 'bold' }));
    var rows = [
      { name: 'Weight', v: [d1.kg.toFixed(1) + ' kg', d49.kg.toFixed(1) + ' kg', d84.kg.toFixed(1) + ' kg'], good: d84.kg < d49.kg - 0.05, bad: d84.kg > d49.kg + 0.05, note: 'Goal since day 49: about -' + goal.toFixed(1) + ' kg (0.5 kg a week)' },
      { name: 'Blood pressure', v: [d1.sbp + ' / ' + d1.dbp, d49.sbp + ' / ' + d49.dbp, d84.sbp + ' / ' + d84.dbp], good: d84.sbp < d49.sbp, bad: d84.sbp > d49.sbp, note: H.bpLabel(d1.sbp, d1.dbp) + '  ->  ' + H.bpLabel(d84.sbp, d84.dbp) },
      { name: 'HbA1c *', v: [d1.a1c.toFixed(1) + '%', d49.a1c.toFixed(1) + '%', d84.a1c.toFixed(1) + '%'], good: d84.a1c < d49.a1c, bad: d84.a1c > d49.a1c, note: H.a1cLabel(d1.a1c) + '  ->  ' + H.a1cLabel(d84.a1c) + '  (normal is under 5.7%)' },
      { name: 'Diabetes risk', v: [d1.risk + '%', d49.risk + '%', d84.risk + '%'], good: d84.risk < d49.risk, bad: d84.risk > d49.risk, note: 'Chance of type 2 diabetes in the next 3 years' },
      { name: 'Active minutes', v: [d1.active + ' / wk', d49.active + ' / wk', d84.active + ' / wk'], good: d84.active >= 150, bad: false, note: 'Goal: 150 minutes a week' },
    ];
    rows.forEach((row, i) => {
      var y = ty + 30 + i * 60;
      var col = row.good ? C.good : row.bad ? C.trap : C.ink;
      var items = [
        SYL.text(this, cols[0], y, row.name, 19, C.ink, { fontStyle: 'bold' }),
        SYL.text(this, cols[1], y, row.v[0], 19, C.inkSoft),
        SYL.text(this, cols[2], y, row.v[1], 19, C.inkSoft),
        SYL.text(this, cols[3], y, row.v[2], 19, col, { fontStyle: 'bold' }),
        SYL.text(this, cols[0], y + 24, row.note, 13, C.inkSoft),
      ];
      items.forEach((t) => t.setAlpha(0));
      this.tweens.add({ targets: items, alpha: 1, duration: 300, delay: 400 + i * 350 });
      this.time.delayedCall(400 + i * 350, () => SYL.audio.play(row.bad ? 'goal' : 'star', row.bad ? false : i % 4));
    });
    var homeNote = st.results.home ? '' : '  Day 49 assumes you kept to the half-a-kilo-a-week pace at home.';
    SYL.text(this, x0, ty + 340, '* HbA1c shows about 3 months of blood sugar, so day 84 is a better read than day 49.' + homeNote, 12, C.inkSoft, { wordWrap: { width: 740 } });

    // Right: the office shift list
    var lx = 825;
    g.fillStyle(0xe3f1e8, 1).fillRoundedRect(lx - 14, ty - 8, 442, 378, 14);
    SYL.text(this, lx, ty, 'YOUR OFFICE SHIFT LIST: TRY THESE AT WORK', 13, C.good, { fontStyle: 'bold' });
    SYL.OFFICE_LEVELS.forEach((L, i) => {
      var y = ty + 26 + i * 68;
      var h = st.history.find(function (x) { return x.week === L.week; });
      var done = h && h.met;
      this.add.image(lx + 14, y + 16, 'icon_' + L.topic.icon).setScale(0.42);
      SYL.text(this, lx + 36, y, (done ? '✓ ' : '') + L.topic.name, 14, done ? C.good : C.ink, { fontStyle: 'bold' });
      SYL.text(this, lx + 36, y + 17, L.tip.do, 11, C.ink, { wordWrap: { width: 370 } });
    });

    SYL.text(this, 640, 588, "You still didn't find more willpower. You shifted your desk.", 26, C.ink, { fontStyle: 'italic' }).setOrigin(0.5);
    SYL.text(this, 640, 620, "A game with simplified, illustrative numbers, not medical advice. If you're worried about your weight, blood sugar or blood pressure, talk to a doctor.", 13, C.inkSoft).setOrigin(0.5);
    SYL.muteButton(this);
    SYL.button(this, 640, 674, 240, 52, 'Back to title', () => this.scene.start('Title'));
    SYL.debug = this;
  }
};

SYL.EXTRA_SCENES = (SYL.EXTRA_SCENES || []).concat([SYL.OfficeEndingScene]);
