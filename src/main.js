var SYL = (globalThis.SYL = globalThis.SYL || {});

// Shown in the bottom-left of the title screen. Bump on each itch.io upload.
SYL.VERSION = 'v1.0';

SYL.game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: 1280,
  height: 720,
  backgroundColor: SYL.hex(SYL.C.bg),
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: [SYL.TitleScene, SYL.StoryScene, SYL.PlayScene, SYL.EndingScene],
});
