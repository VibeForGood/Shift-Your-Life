var SYL = (globalThis.SYL = globalThis.SYL || {});

SYL.TitleScene = class extends Phaser.Scene {
  constructor() { super('Title'); }

  create() {
    var C = SYL.C;
    this.add.rectangle(640, 360, 1280, 720, C.paper);
    SYL.text(this, 640, 210, 'Shift Your Life', 84, C.ink, { fontStyle: 'bold' }).setOrigin(0.5);
    SYL.text(this, 640, 290, "You can't make Pip do anything.\nYou can only shift what's around them.", 28, C.inkSoft, { align: 'center' }).setOrigin(0.5);

    var pip = this.add.container(640, 420);
    pip.add(this.add.circle(0, 0, 40, C.pip));
    pip.add(this.add.circle(-13, -6, 9, 0xffffff));
    pip.add(this.add.circle(13, -6, 9, 0xffffff));
    pip.add(this.add.circle(-11, -4, 4, C.ink));
    pip.add(this.add.circle(15, -4, 4, C.ink));
    this.tweens.add({ targets: pip, y: 410, scaleY: 1.06, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

    SYL.button(this, 640, 540, 240, 64, 'Start', () => {
      SYL.state.reset();
      this.scene.start('Play');
    });
    SYL.text(this, 640, 640, 'Drag objects to move them  ·  Hold SHIFT to see what pulls Pip', 20, C.inkSoft).setOrigin(0.5);
  }
};
