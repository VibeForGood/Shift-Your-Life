var SYL = (globalThis.SYL = globalThis.SYL || {});

SYL.game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: 1280,
  height: 720,
  backgroundColor: SYL.hex(SYL.C.bg),
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: [SYL.TitleScene, SYL.StoryScene, SYL.PlayScene, SYL.EndingScene],
});
