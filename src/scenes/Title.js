var SYL = (globalThis.SYL = globalThis.SYL || {});

SYL.TitleScene = class extends Phaser.Scene {
  constructor() { super('Title'); }

  create() {
    var C = SYL.C;
    this.add.rectangle(640, 360, 1280, 720, C.paper);
    SYL.art.ensureTextures(this);
    // Soft floor band to stand on
    this.add.ellipse(640, 500, 760, 70, 0xe9dfcf);
    SYL.audio.startMusic(); // begins on the first click/key (browser rule)

    // Title: "Shift" slides sideways now and then, the rest stays put.
    var shiftWord = SYL.text(this, 0, 0, 'Shift', 84, C.ink, { fontStyle: 'bold' });
    var rest = SYL.text(this, 0, 0, ' Your Life', 84, C.ink, { fontStyle: 'bold' });
    var total = shiftWord.width + rest.width;
    var x0 = 640 - total / 2;
    shiftWord.setPosition(x0, 120);
    rest.setPosition(x0 + shiftWord.width, 120);
    this.time.addEvent({
      delay: 3200, loop: true, callback: () => {
        this.tweens.add({ targets: shiftWord, x: x0 - 18, duration: 140, yoyo: true, ease: 'Quad.out' });
      },
    });

    // Three beats of the theme, one after another.
    ['Shift the room.', 'Shift the habits.', 'Survive the shift.'].forEach((line, i) => {
      var t = SYL.text(this, 640, 238 + i * 34, line, 26, i === 2 ? C.ink : C.inkSoft, { fontStyle: i === 2 ? 'bold' : 'normal' }).setOrigin(0.5).setAlpha(0);
      this.tweens.add({ targets: t, alpha: 1, x: { from: 620, to: 640 }, duration: 400, delay: 300 + i * 450, ease: 'Quad.out' });
    });

    // You, with three objects around you. Hold SHIFT to see the pulls.
    var px = 640, py = 436;
    this.pulls = this.add.graphics();
    this.pullLabels = [];
    this.props = [
      { id: 'phone', x: px - 200, y: py - 20, col: C.trap, txt: 'Scroll +4', w: 7 },
      { id: 'shoes', x: px + 200, y: py - 20, col: C.good, txt: 'Run +4', w: 5 },
      { id: 'book', x: px + 130, y: py + 50, col: C.rest, txt: 'Read +2', w: 3 },
    ];
    this.props.forEach((o, i) => {
      this.add.ellipse(o.x, o.y + 27, 50, 12, o.col, 0.45);
      var img = this.add.image(o.x, o.y, 'icon_' + o.id).setDepth(2);
      this.tweens.add({ targets: img, y: o.y - 5, duration: 900 + i * 150, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    });

    this.pipArt = SYL.art.makeHero(this, px, py, 34);
    var pip = this.pipArt.root.setDepth(3);
    this.tweens.add({ targets: this.pipArt.body, y: -6, scaleY: 1.03, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    this.pip = pip;

    this.hint = SYL.text(this, 640, 548, 'Hold SHIFT (or tap here) to see what pulls you', 20, C.inkSoft).setOrigin(0.5).setInteractive({ useHandCursor: true });
    this.hint.on('pointerdown', () => { this.toggled = !this.toggled; this.drawPulls(); });
    this.tweens.add({ targets: this.hint, alpha: 0.5, duration: 900, yoyo: true, repeat: -1 });

    this.shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    this.shiftKey.on('down', () => this.drawPulls());
    this.shiftKey.on('up', () => this.drawPulls());

    SYL.button(this, 640, 630, 240, 64, 'Start', () => {
      SYL.state.reset();
      this.scene.start('Story');
    });
    SYL.muteButton(this);
  }

  drawPulls() {
    var on = !!(this.toggled || this.shiftKey.isDown);
    if (on !== this.wasOn) SYL.audio.play(on ? 'shiftOn' : 'shiftOff');
    this.wasOn = on;
    this.pulls.clear();
    this.pullLabels.forEach((t) => t.destroy());
    this.pullLabels = [];
    // Your eyes drift to the strongest pull: the phone.
    this.pipArt.look(on ? -1 : 0, 0).mood(on ? 'o' : 'neutral');
    if (!on) return;
    this.props.forEach((o) => {
      this.pulls.setDepth(1).lineStyle(o.w, o.col, 0.85).lineBetween(o.x, o.y, this.pip.x, this.pip.y);
      var t = SYL.text(this, (o.x + this.pip.x) / 2, (o.y + this.pip.y) / 2 - 16, o.txt, 14, 0xffffff, {
        backgroundColor: SYL.hex(o.col), padding: { x: 5, y: 1 }, fontStyle: 'bold',
      }).setOrigin(0.5).setDepth(4);
      this.pullLabels.push(t);
    });
  }
};
