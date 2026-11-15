// The intro: who you are, how you got here, and why the answer is "shift".
// Adapted from Momentum's opening. Click, Space or Enter to go on; Skip jumps to Week 1.
var SYL = (globalThis.SYL = globalThis.SYL || {});

(function () {
  var C = SYL.C;

  function pill(scene, c, x, y, str, col) {
    var t = SYL.text(scene, x, y, str, 18, 0xffffff, { fontStyle: 'bold', backgroundColor: SYL.hex(col || C.ink), padding: { x: 10, y: 5 } }).setOrigin(0.5);
    c.add(t);
    return t;
  }

  // Each card: draw(scene, container) for the picture, then text (+ optional source).
  var CARDS = [
    {
      draw: function (s, c) {
        var h = SYL.art.makeHero(s, 640, 250, 44);
        c.add(h.root);
        pill(s, c, 400, 180, '34 years old');
        pill(s, c, 880, 180, 'Claims analyst');
        pill(s, c, 880, 300, 'One-bed flat, Elm Street');
        pill(s, c, 400, 300, 'Halcyon Insurance');
      },
      text: 'This is you. Thirty-four. Claims analyst at Halcyon Insurance. A one-bedroom flat on Elm Street.',
    },
    {
      draw: function (s, c) {
        var h = SYL.art.makeHero(s, 640, 250, 44);
        h.mood('tired').look(-0.8, 0.6);
        c.add(h.root);
        [['phone', 450, 210], ['snacks', 830, 210], ['blanket', 450, 320], ['postcard', 830, 320]].forEach(function (o) {
          c.add(s.add.image(o[1], o[2], 'icon_' + o[0]));
        });
        pill(s, c, 330, 210, '~5 h sleep', C.trap);
        pill(s, c, 955, 210, 'Takeaway most nights', C.trap);
        pill(s, c, 330, 320, 'Couch till 1am', C.rest);
        pill(s, c, 955, 320, 'Maya: unanswered', C.inkSoft);
      },
      text: "You're 118 kilos. You sleep about five hours, mostly with your phone. Dinner comes in a paper bag most nights. You can't remember the last time you replied to Maya.",
    },
    {
      draw: function (s, c) {
        [['clock', 'the snooze button'], ['blanket', 'the couch'], ['phone', 'the app'], ['snacks', 'the snack jar']].forEach(function (o, i) {
          var x = 340 + i * 200;
          var img = s.add.image(x, 230, 'icon_' + o[0]).setScale(1.4).setAlpha(0);
          var t = SYL.text(s, x, 300, o[1], 18, C.inkSoft).setOrigin(0.5).setAlpha(0);
          c.add([img, t]);
          s.tweens.add({ targets: [img, t], alpha: 1, duration: 300, delay: 200 + i * 350 });
        });
      },
      text: "None of this happened on purpose. It happened one small default at a time: the snooze button, the couch, the app, the snack jar on the counter.",
    },
    {
      draw: function (s, c) {
        var g = s.add.graphics();
        g.fillStyle(0x000000, 0.12).fillRoundedRect(436, 146, 420, 220, 12);
        g.fillStyle(0xffffff, 1).fillRoundedRect(430, 140, 420, 220, 12);
        g.fillStyle(C.rest, 1).fillRoundedRect(430, 140, 420, 44, { tl: 12, tr: 12, bl: 0, br: 0 });
        c.add(g);
        c.add(SYL.text(s, 450, 150, 'NORTHSIDE MEDICAL · BLOOD RESULTS', 16, 0xffffff, { fontStyle: 'bold' }));
        c.add(SYL.text(s, 450, 205, 'HbA1c', 22, C.ink, { fontStyle: 'bold' }));
        c.add(SYL.text(s, 830, 205, '6.1%', 26, C.trap, { fontStyle: 'bold' }).setOrigin(1, 0));
        c.add(SYL.text(s, 450, 235, 'Prediabetes range: 5.7 to 6.4%', 15, C.inkSoft));
        c.add(SYL.text(s, 450, 280, 'Blood pressure', 22, C.ink, { fontStyle: 'bold' }));
        c.add(SYL.text(s, 830, 280, '142 / 91', 26, C.trap, { fontStyle: 'bold' }).setOrigin(1, 0));
        c.add(SYL.text(s, 450, 310, 'High: stage 2 starts at 140/90', 15, C.inkSoft));
      },
      text: "Monday, 9:00. Dr Reyes goes through your blood results. 'Your HbA1c is 6.1%. That's prediabetes. Your blood pressure is 142 over 91. That's high. No lecture, I promise. This is the most reversible stage there is.'",
      src: 'Ranges: American Diabetes Association; ACC/AHA 2017 guideline',
    },
    {
      draw: function (s, c) {
        var big = SYL.text(s, 640, 190, '58%', 110, C.good, { fontStyle: 'bold' }).setOrigin(0.5);
        c.add(big);
        c.add(SYL.text(s, 640, 270, 'fewer people went on to get type 2 diabetes', 24, C.ink).setOrigin(0.5));
        c.add(SYL.text(s, 640, 306, 'when they lost 7% of their weight and moved 150 minutes a week', 18, C.inkSoft).setOrigin(0.5));
        c.add(SYL.text(s, 640, 334, '(for comparison, the diabetes drug metformin: 31% fewer)', 16, C.inkSoft).setOrigin(0.5));
        s.tweens.add({ targets: big, scale: { from: 0.6, to: 1 }, duration: 500, ease: 'Back.out' });
      },
      text: "Dr Reyes: 'For you, 7% is about 8 kilos. You don't need to lose it all at once. Half a kilo a week is safe and it lasts. That's about 3.5 kilos by your retest in seven weeks.'",
      src: 'Diabetes Prevention Program: Knowler et al., NEJM, 2002',
    },
    {
      draw: function (s, c) {
        var g = s.add.graphics();
        SYL.art.shapes(g, [
          { t: 'rr', x: 520, y: 170, w: 220, h: 110, r: 14, c: 0xffffff },
          { t: 'rr', x: 740, y: 200, w: 18, h: 50, r: 5, c: 0xffffff },
        ], 6);
        g.fillStyle(C.trap, 1).fillRoundedRect(532, 182, 40, 86, 8);
        c.add(g);
        c.add(SYL.text(s, 630, 310, 'WILLPOWER', 22, C.trap, { fontStyle: 'bold' }).setOrigin(0.5));
        s.tweens.add({ targets: g, alpha: 0.4, duration: 400, yoyo: true, repeat: -1 });
      },
      text: "'And please don't try to change everything on Monday with willpower. It runs out. People who seem to have great self-control mostly just meet fewer temptations. Change what's around you, and let habits do the work.'",
      src: 'Hofmann et al., 2012 · Wood & Neal, 2007',
    },
    {
      draw: function (s, c) {
        SYL.LEVELS.forEach(function (L, i) {
          var x = 640 + (i - (SYL.LEVELS.length - 1) / 2) * 150;
          var img = s.add.image(x, 220, 'icon_' + L.topic.icon).setScale(1.1).setAlpha(0);
          var t = SYL.text(s, x, 270, L.topic.name, 17, C.ink, { fontStyle: 'bold' }).setOrigin(0.5).setAlpha(0);
          var n = SYL.text(s, x, 296, 'Week ' + L.week, 13, C.inkSoft).setOrigin(0.5).setAlpha(0);
          c.add([img, t, n]);
          s.tweens.add({ targets: [img, t, n], alpha: 1, y: '-=8', duration: 300, delay: 150 + i * 180 });
        });
      },
      text: "You can't make yourself do anything. But you can shift what's around you. Seven weeks, seven shifts, one evening at a time. Then Dr Reyes retests you on day 49.",
      last: true,
    },
  ];

  SYL.StoryScene = class extends Phaser.Scene {
    constructor() { super('Story'); }

    create() {
      this.add.rectangle(640, 360, 1280, 720, C.paper);
      SYL.art.ensureTextures(this);
      this.index = -1;
      this.card = null;
      this.dots = [];
      for (var i = 0; i < CARDS.length; i++) this.dots.push(this.add.circle(640 + (i - (CARDS.length - 1) / 2) * 22, 680, 6, C.line));
      SYL.button(this, 1170, 40, 150, 44, 'Skip intro', () => this.finish(), { size: 17, fill: 0xe7dfd2 });
      this.input.keyboard.on('keydown-SPACE', () => this.next());
      this.input.keyboard.on('keydown-ENTER', () => this.next());
      SYL.muteButton(this);
      SYL.debug = this;
      this.next();
    }

    next() {
      if (this.busy) return;
      if (this.index >= CARDS.length - 1) { this.finish(); return; }
      this.index++;
      var cd = CARDS[this.index];
      if (this.card) this.card.destroy();
      var c = this.add.container(0, 0);
      cd.draw(this, c);
      var t = SYL.text(this, 640, 430, cd.text, 25, C.ink, { align: 'center', wordWrap: { width: 980 }, lineSpacing: 6 }).setOrigin(0.5, 0);
      c.add(t);
      if (cd.src) c.add(SYL.text(this, 640, 430 + t.height + 14, cd.src, 14, C.inkSoft).setOrigin(0.5, 0));
      if (cd.last) {
        c.add(SYL.button(this, 640, 620, 280, 60, 'Time to shift', () => this.finish(), { size: 24 }));
      } else {
        c.add(SYL.text(this, 640, 640, 'Click or press Space', 15, C.inkSoft).setOrigin(0.5));
        var hit = this.add.rectangle(640, 360, 1280, 600, 0xffffff, 0.001).setInteractive();
        hit.on('pointerdown', () => this.next());
        c.addAt(hit, 0);
      }
      c.setAlpha(0);
      c.x = 30;
      this.tweens.add({ targets: c, alpha: 1, x: 0, duration: 300, ease: 'Quad.out' });
      this.busy = true;
      this.time.delayedCall(350, () => { this.busy = false; });
      this.dots.forEach((d, i) => d.setFillStyle(i <= this.index ? C.accent : C.line));
      SYL.audio.play('click');
      this.card = c;
    }

    finish() {
      if (this.done) return;
      this.done = true;
      this.scene.start('Play');
    }
  };
})();
