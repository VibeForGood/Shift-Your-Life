// Day 49: the retest with Dr Reyes. Day 1 vs day 49 results, and the shift list
// to take into your own life.
var SYL = (globalThis.SYL = globalThis.SYL || {});

SYL.EndingScene = class extends Phaser.Scene {
  constructor() { super('Ending'); }

  create() {
    var C = SYL.C;
    var H = SYL.health;
    var S = H.START;
    var st = SYL.state;
    var r = H.retest(st.healthWeeks);
    var lost = Math.round((S.kg - r.kg) * 10) / 10;
    var goal = Math.round(0.5 * st.healthWeeks.length * 10) / 10;

    this.add.rectangle(640, 360, 1280, 720, C.paper);
    SYL.art.ensureTextures(this);
    SYL.text(this, 640, 38, 'Day 49 · Your retest with Dr Reyes', 38, C.ink, { fontStyle: 'bold' }).setOrigin(0.5);

    // Dr Reyes' verdict follows the numbers.
    var quote = lost >= goal
      ? "'" + lost.toFixed(1) + " kilos, right on the half-a-kilo-a-week pace, and your blood pressure is coming down with it. You didn't white-knuckle this. You set your flat up to help you. Keep going.'"
      : lost >= 1
        ? "'" + lost.toFixed(1) + " kilos down. Slower than half a kilo a week, but it's moving the right way. Look at your shift list: which week slipped? Fix that one thing.'"
        : "'The numbers haven't moved yet, and that's OK. Seven weeks is a start, not a verdict. Pick one shift from your list and make it so easy it's almost silly.'";
    var hero = SYL.art.makeHero(this, 82, 116, 24);
    hero.mood(lost >= 1 ? 'happy' : 'content');
    var g = this.add.graphics();
    g.fillStyle(0xffffff, 1).fillRoundedRect(140, 76, 1100, 76, 14);
    g.fillTriangle(140, 104, 140, 124, 126, 114);
    SYL.text(this, 160, 86, quote, 18, C.ink, { wordWrap: { width: 1060 }, fontStyle: 'italic' });

    // Left: the results table
    var x0 = 40, cols = [x0, 300, 470, 640];
    var ty = 176;
    g.fillStyle(0xffffff, 0.7).fillRoundedRect(x0 - 12, ty - 8, 750, 378, 14);
    ['YOUR RESULTS', 'DAY 1', 'DAY 49', 'CHANGE'].forEach((h, i) => SYL.text(this, cols[i], ty, h, 14, C.inkSoft, { fontStyle: 'bold' }));
    var sign = (v, unit) => (v > 0 ? '+' : '') + v + (unit || '');
    var rows = [
      {
        name: 'Weight', a: S.kg.toFixed(1) + ' kg', b: r.kg.toFixed(1) + ' kg',
        ch: sign(Math.round((r.kg - S.kg) * 10) / 10, ' kg'), good: r.kg < S.kg - 0.05, bad: r.kg > S.kg + 0.05,
        note: 'Goal: about -' + goal.toFixed(1) + ' kg (0.5 kg a week)',
      },
      {
        name: 'Blood pressure', a: S.sbp + ' / ' + S.dbp, b: r.sbp + ' / ' + r.dbp,
        ch: sign(r.sbp - S.sbp) + ' / ' + sign(r.dbp - S.dbp), good: r.sbp < S.sbp, bad: r.sbp > S.sbp,
        note: H.bpLabel(S.sbp, S.dbp) + '  ->  ' + H.bpLabel(r.sbp, r.dbp),
      },
      {
        name: 'HbA1c *', a: S.a1c.toFixed(1) + '%', b: r.a1c.toFixed(1) + '%',
        ch: sign(Math.round((r.a1c - S.a1c) * 10) / 10, '%'), good: r.a1c < S.a1c, bad: r.a1c > S.a1c,
        note: H.a1cLabel(S.a1c) + '  ->  ' + H.a1cLabel(r.a1c) + '  (normal is under 5.7%)',
      },
      {
        name: 'Diabetes risk', a: S.risk + '%', b: r.risk + '%',
        ch: sign(r.risk - S.risk, ' pts'), good: r.risk < S.risk, bad: r.risk > S.risk,
        note: 'Chance of type 2 diabetes in the next 3 years',
      },
      {
        name: 'Active minutes', a: S.active + ' / wk', b: r.active + ' / wk',
        ch: r.active >= 150 ? 'goal met' : (150 - r.active) + ' to go', good: r.active >= 150, bad: false,
        note: 'Goal: 150 minutes a week',
      },
      {
        name: 'Sleep', a: S.sleepH + ' h', b: r.sleepH.toFixed(1) + ' h',
        ch: sign(Math.round((r.sleepH - S.sleepH) * 10) / 10, ' h'), good: r.sleepH >= 7, bad: r.sleepH < S.sleepH,
        note: 'Adults need at least 7 hours',
      },
    ];
    rows.forEach((row, i) => {
      var y = ty + 30 + i * 52;
      var col = row.good ? C.good : row.bad ? C.trap : C.ink;
      var items = [
        SYL.text(this, cols[0], y, row.name, 19, C.ink, { fontStyle: 'bold' }),
        SYL.text(this, cols[1], y, row.a, 19, C.inkSoft),
        SYL.text(this, cols[2], y, row.b, 19, col, { fontStyle: 'bold' }),
        SYL.text(this, cols[3], y, row.ch, 19, col, { fontStyle: 'bold' }),
        SYL.text(this, cols[0], y + 24, row.note, 13, C.inkSoft),
      ];
      items.forEach((t) => t.setAlpha(0));
      this.tweens.add({ targets: items, alpha: 1, duration: 300, delay: 400 + i * 350 });
      this.time.delayedCall(400 + i * 350, () => SYL.audio.play(row.bad ? 'goal' : 'star', row.bad ? false : i % 4));
    });
    SYL.text(this, x0, ty + 350, '* HbA1c shows about 3 months of blood sugar, so this is an early estimate. Dr Reyes checks it properly at 12 weeks.', 12, C.inkSoft);

    // Right: the shift list
    var lx = 815;
    g.fillStyle(0xe3f1e8, 1).fillRoundedRect(lx - 14, ty - 8, 452, 378, 14);
    SYL.text(this, lx, ty, 'YOUR SHIFT LIST: TRY THESE IN YOUR LIFE', 13, C.good, { fontStyle: 'bold' });
    SYL.LEVELS.forEach((L, i) => {
      var y = ty + 24 + i * 50;
      var h = st.history.find(function (x) { return x.week === L.week; });
      var done = h && h.met;
      this.add.image(lx + 14, y + 16, 'icon_' + L.topic.icon).setScale(0.42);
      SYL.text(this, lx + 36, y, (done ? '✓ ' : '') + L.topic.name, 14, done ? C.good : C.ink, { fontStyle: 'bold' });
      SYL.text(this, lx + 36, y + 17, L.tip.do, 11, C.ink, { wordWrap: { width: 380 } });
    });

    SYL.text(this, 640, 588, "You didn't find more willpower. You shifted what was around you.", 26, C.ink, { fontStyle: 'italic' }).setOrigin(0.5);
    SYL.text(this, 640, 620, "A game with simplified, illustrative numbers, not medical advice. If you're worried about your weight, blood sugar or blood pressure, talk to a doctor.", 13, C.inkSoft).setOrigin(0.5);
    SYL.muteButton(this);
    SYL.button(this, 640, 674, 240, 52, 'Play again', () => this.scene.start('Title'));
    SYL.debug = this;
  }
};
