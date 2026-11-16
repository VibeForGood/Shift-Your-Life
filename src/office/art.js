// Office life expansion: art drawn in code, in the same style as src/art.js.
// Adds icons for the office objects to SYL.art.ICONS and draws the office floor.
var SYL = (globalThis.SYL = globalThis.SYL || {});

(function () {
  var A = SYL.art;
  var shapes = A.shapes, line = A.line;
  var INK = 0x3a3848;
  var FLOOR_Y = 440;

  // ---------- object icons (64x64 textures) ----------
  Object.assign(A.ICONS, {
    priority: function (g) {
      shapes(g, [{ t: 'p', pts: [[10, 12], [54, 8], [56, 52], [12, 56]], c: 0xfff07a }]);
      g.fillStyle(0xe8d65c, 1).fillPoints([{ x: 46, y: 52 }, { x: 56, y: 42 }, { x: 56, y: 52 }], true);
      g.lineStyle(3, 0xe0645a, 1).strokeCircle(22, 24, 5);
      g.lineStyle(3, INK, 0.8).lineBetween(32, 22, 48, 21).lineBetween(18, 36, 46, 34).lineBetween(18, 44, 38, 43);
    },
    trainers: function (g) {
      shapes(g, [
        { t: 'p', pts: [[10, 44], [11, 22], [25, 18], [33, 29], [50, 32], [57, 38], [58, 44]], c: 0x5a8fd8 },
        { t: 'rr', x: 7, y: 42, w: 53, h: 9, r: 4, c: 0xffffff },
      ]);
      g.fillStyle(0x3f6fb5, 1).fillPoints([{ x: 11, y: 22 }, { x: 25, y: 18 }, { x: 26, y: 24 }, { x: 12, y: 28 }], true);
      line(g, 2.5, 0xffffff, 24, 30, 30, 27); line(g, 2.5, 0xffffff, 27, 34, 33, 31);
      line(g, 3, 0xf2b84b, 40, 42, 52, 36);
    },
    biscuits: function (g) {
      shapes(g, [
        { t: 'rr', x: 10, y: 22, w: 44, h: 32, r: 8, c: 0xe0645a },
        { t: 'rr', x: 8, y: 14, w: 48, h: 12, r: 6, c: 0xc94f46 },
      ]);
      g.fillStyle(0xf2b84b, 1).fillCircle(22, 38, 6).fillCircle(42, 38, 6);
      g.fillStyle(0xc98a4b, 1).fillCircle(22, 38, 2).fillCircle(42, 38, 2);
      g.fillStyle(0xffffff, 0.5).fillRoundedRect(14, 17, 18, 4, 2);
    },
    lunch: function (g) {
      shapes(g, [
        { t: 'rr', x: 8, y: 22, w: 48, h: 32, r: 6, c: 0x4fae78 },
        { t: 'rr', x: 24, y: 12, w: 16, h: 12, r: 4, c: 0x3b8f60 },
      ]);
      g.fillStyle(0xffffff, 1).fillRoundedRect(13, 27, 38, 22, 4);
      g.fillStyle(0xf2b84b, 1).fillCircle(22, 38, 5);
      g.fillStyle(0x4fae78, 1).fillEllipse(36, 36, 12, 8);
      g.fillStyle(0xe0645a, 1).fillCircle(44, 42, 4);
    },
    water: function (g) {
      shapes(g, [
        { t: 'rr', x: 22, y: 16, w: 20, h: 42, r: 7, c: 0x9fd6f0 },
        { t: 'rr', x: 25, y: 6, w: 14, h: 12, r: 3, c: 0x5a8fd8 },
      ]);
      g.fillStyle(0x5a8fd8, 0.6).fillRoundedRect(24, 34, 16, 22, 5);
      g.fillStyle(0xffffff, 0.7).fillRoundedRect(26, 20, 4, 16, 2);
    },
    mat: function (g) {
      shapes(g, [{ t: 'p', pts: [[6, 42], [20, 30], [58, 30], [44, 42]], c: 0x6b6880 }]);
      shapes(g, [{ t: 'p', pts: [[6, 42], [44, 42], [44, 48], [6, 48]], c: 0x55526a }]);
      g.fillStyle(0xf2b84b, 1).fillEllipse(26, 36, 8, 4).fillEllipse(38, 36, 8, 4);
    },
    ticket: function (g) {
      shapes(g, [{ t: 'rr', x: 6, y: 18, w: 52, h: 28, r: 5, c: 0xf2b84b }]);
      g.fillStyle(0xfffaf0, 1).fillCircle(6, 32, 5).fillCircle(58, 32, 5);
      g.lineStyle(2, INK, 0.5).lineBetween(42, 20, 42, 44);
      g.fillStyle(0xe0645a, 1).fillCircle(22, 29, 3.2).fillCircle(28, 28, 3.2).fillTriangle(19, 30, 31, 29, 25.5, 37);
      g.fillStyle(INK, 0.6).fillRect(46, 26, 8, 2).fillRect(46, 31, 8, 2).fillRect(46, 36, 8, 2);
    },
    note: function (g) {
      shapes(g, [{ t: 'rr', x: 10, y: 10, w: 44, h: 44, r: 3, c: 0x9fe0b8 }]);
      g.lineStyle(4, INK, 0.85);
      g.lineBetween(16, 46, 26, 46).lineBetween(26, 46, 26, 36).lineBetween(26, 36, 36, 36).lineBetween(36, 36, 36, 26).lineBetween(36, 26, 46, 26).lineBetween(46, 26, 46, 16);
      g.fillStyle(0x4fae78, 1).fillTriangle(40, 18, 50, 18, 45, 12);
    },
    sam: function (g) {
      shapes(g, [
        { t: 'rr', x: 14, y: 36, w: 36, h: 24, r: 10, c: 0xe0a33c },
        { t: 'c', x: 32, y: 24, r: 14, c: 0xc98a64 },
      ]);
      g.fillStyle(0x3a2e2a, 1).fillEllipse(32, 13, 26, 10);
      g.fillStyle(INK, 1).fillCircle(27, 24, 2).fillCircle(37, 24, 2);
      g.lineStyle(2, INK, 1).beginPath().arc(32, 28, 5, 0.2, Math.PI - 0.2, false).strokePath();
    },
    vending: function (g) {
      shapes(g, [{ t: 'rr', x: 12, y: 4, w: 40, h: 56, r: 4, c: 0xe0645a }]);
      g.fillStyle(0xdff2ff, 1).fillRect(16, 9, 24, 36);
      [[19, 13, 0xf2b84b], [27, 13, 0x5a8fd8], [35, 13, 0x4fae78], [19, 24, 0xe0645a], [27, 24, 0xf2b84b], [35, 24, 0x8b7bb8], [19, 35, 0x5a8fd8], [27, 35, 0xe0645a]].forEach(function (s) {
        g.fillStyle(s[2], 1).fillRoundedRect(s[0], s[1], 6, 8, 1);
      });
      g.fillStyle(INK, 1).fillRect(43, 12, 6, 10);
      g.fillStyle(0x2f2d3a, 1).fillRect(16, 49, 24, 6);
    },
    cake: function (g) {
      shapes(g, [
        { t: 'rr', x: 10, y: 30, w: 44, h: 22, r: 4, c: 0xf6c7d4 },
        { t: 'rr', x: 6, y: 50, w: 52, h: 6, r: 3, c: 0xffffff },
      ]);
      g.fillStyle(0xffffff, 1).fillRoundedRect(10, 28, 44, 8, 4);
      g.fillStyle(0xe0645a, 1).fillCircle(20, 42, 2.5).fillCircle(32, 44, 2.5).fillCircle(44, 42, 2.5);
      [20, 32, 44].forEach(function (x) {
        g.fillStyle(0x5a8fd8, 1).fillRect(x - 1.5, 16, 3, 12);
        g.fillStyle(0xf2b84b, 1).fillEllipse(x, 13, 5, 8);
      });
    },
  });

  // ---------- the office floor ----------
  var WALLS = { lobby: 0xe6e8ee, desk: 0xeef0e8, kitchen: 0xe3efe7 };

  function drawOffice(scene, room) {
    var W = SYL.OFFICE_WORLD;
    var top = room.top, bot = room.bottom, L = 30, R = 1250;
    var g = scene.add.graphics().setDepth(1);
    W.zones.forEach(function (z, i) {
      var x0 = i === 0 ? L : z.x0, x1 = i === W.zones.length - 1 ? R : z.x1;
      g.fillStyle(WALLS[z.id], 1).fillRect(x0, top, x1 - x0, FLOOR_Y - top);
    });
    // Floors: lobby tiles, office carpet, kitchen lino
    W.zones.forEach(function (z, i) {
      var x0 = i === 0 ? L : z.x0, x1 = i === W.zones.length - 1 ? R : z.x1;
      if (z.id === 'lobby') {
        for (var tx = x0; tx < x1; tx += 30) for (var ty = FLOOR_Y; ty < bot; ty += 30) {
          g.fillStyle(((tx - x0) / 30 + (ty - FLOOR_Y) / 30) % 2 ? 0xd9d4cc : 0xe9e5de, 1).fillRect(tx, ty, Math.min(30, x1 - tx), Math.min(30, bot - ty));
        }
      } else if (z.id === 'desk') {
        g.fillStyle(0x9aa7b8, 1).fillRect(x0, FLOOR_Y, x1 - x0, bot - FLOOR_Y);
        g.fillStyle(0x8c99ab, 1);
        for (var cx = x0; cx < x1; cx += 12) for (var cy = FLOOR_Y + 6; cy < bot; cy += 12) g.fillRect(cx + ((cy / 12) % 2) * 6, cy, 2, 2);
      } else {
        for (var kx = x0; kx < x1; kx += 22) for (var ky = FLOOR_Y; ky < bot; ky += 22) {
          g.fillStyle(((kx - x0) / 22 + (ky - FLOOR_Y) / 22) % 2 ? 0xe4dccd : 0xf4efe6, 1).fillRect(kx, ky, Math.min(22, x1 - kx), Math.min(22, bot - ky));
        }
      }
    });
    g.fillStyle(0xffffff, 0.7).fillRect(L, FLOOR_Y - 8, R - L, 8);
    line(g, 2, 0xd8cdbd, L, FLOOR_Y, R, FLOOR_Y);
    // Glass partitions between zones
    W.zones.forEach(function (z, i) {
      if (i === 0) return;
      g.fillStyle(0xcfe6f2, 0.5).fillRect(z.x0 - 5, top, 10, FLOOR_Y - top - 150);
      g.fillStyle(0xb9c4cf, 1).fillRect(z.x0 - 5, top, 10, 5);
    });

    var f = scene.add.graphics().setDepth(2);
    // --- Lobby: lift (standing on the floor), stairs sign, coat stand, full-height locker
    shapes(f, [{ t: 'rr', x: 140, y: 200, w: 86, h: 240, r: 4, c: 0xb9c4cf }], 4);
    f.fillStyle(0xd5dde5, 1).fillRect(146, 208, 36, 226).fillRect(184, 208, 36, 226);
    shapes(f, [{ t: 'rr', x: 169, y: 182, w: 28, h: 14, r: 3, c: 0x2f2d3a }], 3);
    f.fillStyle(0xf2b84b, 1).fillTriangle(177, 192, 183, 185, 189, 192);
    SYL.text(scene, 183, 164, 'LIFT', 11, INK, { fontStyle: 'bold' }).setOrigin(0.5, 0).setDepth(2);
    // Green stairs sign on the wall between the lift and the locker
    shapes(f, [{ t: 'rr', x: 232, y: 300, w: 24, h: 14, r: 2, c: 0x4fae78 }], 3);
    f.fillStyle(0xffffff, 1).fillTriangle(240, 311, 248, 311, 248, 303);
    // Coat stand: pole to the floor, hooks at the top
    line(f, 4, 0x8c7a6a, 110, 210, 110, 438);
    f.fillStyle(0x8c7a6a, 1).fillCircle(110, 208, 6);
    line(f, 3, 0x8c7a6a, 110, 218, 96, 226); line(f, 3, 0x8c7a6a, 110, 218, 124, 226);
    line(f, 4, 0x8c7a6a, 96, 438, 124, 438);
    shapes(f, [
      { t: 'rr', x: 262, y: 160, w: 58, h: 280, r: 4, c: 0x8fa8c8 },
    ], 4);
    f.fillStyle(0x7d96b6, 1).fillRect(268, 166, 22, 268).fillRect(292, 166, 22, 268);
    f.fillStyle(INK, 1).fillRect(284, 220, 3, 12).fillRect(295, 220, 3, 12);
    shapes(f, [{ t: 'rr', x: 196, y: 396, w: 58, h: 44, r: 6, c: 0x5a6b8a }], 4);
    f.fillStyle(0x4a5a78, 1).fillRoundedRect(204, 386, 42, 14, 6);
    // --- Your desk: desk, monitor, chair, shelf; Sam's desk on the right
    shapes(f, [
      { t: 'rr', x: 410, y: 368, w: 10, h: 72, r: 2, c: 0x6b6880 },
      { t: 'rr', x: 580, y: 368, w: 10, h: 72, r: 2, c: 0x6b6880 },
      { t: 'rr', x: 400, y: 358, w: 200, h: 14, r: 4, c: 0xdcb88e },
      { t: 'rr', x: 545, y: 280, w: 60, h: 44, r: 4, c: 0x3a3848 },
      { t: 'rr', x: 568, y: 324, w: 14, h: 34, r: 2, c: 0x6b6880 },
    ], 4);
    f.fillStyle(0xdff2ff, 1).fillRoundedRect(550, 285, 50, 34, 2);
    f.fillStyle(0x5a8fd8, 1).fillRect(555, 292, 30, 3).fillRect(555, 300, 22, 3);
    shapes(f, [
      { t: 'rr', x: 462, y: 380, w: 50, h: 40, r: 10, c: 0x4a5a78 },
      { t: 'rr', x: 484, y: 420, w: 8, h: 16, r: 2, c: 0x2f2d3a },
      { t: 'rr', x: 468, y: 432, w: 40, h: 6, r: 3, c: 0x2f2d3a },
    ], 4);
    // Drawer pedestal under the right of the desk (the desk drawer slot sits in it)
    shapes(f, [{ t: 'rr', x: 524, y: 372, w: 54, h: 68, r: 3, c: 0xc49a6c }], 4);
    f.fillStyle(0xdcb88e, 1).fillRoundedRect(529, 378, 44, 26, 2).fillRoundedRect(529, 408, 44, 26, 2);
    f.fillStyle(INK, 1).fillRect(545, 389, 12, 3).fillRect(545, 419, 12, 3);
    // Top shelf on two brackets
    shapes(f, [{ t: 'rr', x: 566, y: 256, w: 92, h: 10, r: 3, c: 0xdcb88e }], 4);
    f.fillStyle(0x6b6880, 1).fillTriangle(575, 266, 587, 266, 575, 278).fillTriangle(649, 266, 637, 266, 649, 278);
    // Sam's desk: his chair behind him, the desk front drawn over him so he sits behind it
    shapes(f, [{ t: 'rr', x: 742, y: 318, w: 46, h: 60, r: 12, c: 0x4a5a78 }], 4);
    var samDesk = scene.add.graphics().setDepth(11);
    shapes(samDesk, [
      { t: 'rr', x: 700, y: 368, w: 10, h: 72, r: 2, c: 0x6b6880 },
      { t: 'rr', x: 812, y: 368, w: 10, h: 72, r: 2, c: 0x6b6880 },
      { t: 'rr', x: 692, y: 358, w: 136, h: 14, r: 4, c: 0xdcb88e },
      { t: 'rr', x: 796, y: 320, w: 30, h: 24, r: 3, c: 0x3a3848 },
      { t: 'rr', x: 806, y: 344, w: 10, h: 14, r: 2, c: 0x6b6880 },
    ], 4);
    samDesk.fillStyle(0xdff2ff, 1).fillRoundedRect(799, 323, 24, 18, 2);
    // Wall clock
    shapes(f, [{ t: 'c', x: 470, y: 190, r: 20, c: 0xffffff }], 4);
    line(f, 3, INK, 470, 190, 470, 177); line(f, 3, INK, 470, 190, 480, 194);
    // A plant
    shapes(f, [{ t: 'rr', x: 350, y: 404, w: 28, h: 36, r: 4, c: 0xd98c6a }], 4);
    f.fillStyle(0x4fae78, 1).fillEllipse(356, 392, 18, 30).fillEllipse(372, 388, 18, 34).fillEllipse(364, 380, 16, 30);
    // --- Kitchenette: cupboards, counter + sink, fridge, table
    // Wall cupboards; a wider counter (room for the cake) with the sink in the middle
    shapes(f, [
      { t: 'rr', x: 856, y: 160, w: 120, h: 70, r: 6, c: 0x7fb6a4 },
      { t: 'rr', x: 848, y: 382, w: 150, h: 14, r: 4, c: 0xf4efe6 },
      { t: 'rr', x: 852, y: 396, w: 142, h: 44, r: 3, c: 0x7fb6a4 },
    ], 4);
    f.fillStyle(0x93c6b5, 1).fillRoundedRect(862, 166, 52, 58, 4).fillRoundedRect(918, 166, 52, 58, 4);
    f.fillStyle(0x9aa7b8, 1).fillRoundedRect(905, 384, 30, 8, 3);
    // Full-height fridge standing on the floor
    shapes(f, [
      { t: 'rr', x: 1150, y: 230, w: 84, h: 210, r: 8, c: 0xf4f6f8 },
    ], 4);
    line(f, 2, 0xc9d0d8, 1150, 300, 1234, 300);
    f.fillStyle(INK, 1).fillRect(1222, 250, 4, 30).fillRect(1222, 320, 4, 50);
    // Vending machine body, taller than a person (its front is the vending icon)
    shapes(f, [{ t: 'rr', x: 1086, y: 230, w: 52, h: 210, r: 4, c: 0xe0645a }], 4);
    f.fillStyle(0xdff2ff, 1).fillRect(1092, 240, 40, 120);
    [[1096, 248, 0xf2b84b], [1108, 248, 0x5a8fd8], [1120, 248, 0x4fae78], [1096, 276, 0xe0645a], [1108, 276, 0xf2b84b], [1120, 276, 0x8b7bb8], [1096, 304, 0x5a8fd8], [1108, 304, 0xe0645a], [1120, 304, 0x4fae78], [1096, 332, 0xf2b84b], [1108, 332, 0x8b7bb8]].forEach(function (s) {
      f.fillStyle(s[2], 1).fillRoundedRect(s[0], s[1], 8, 14, 2);
    });
    // A small table
    shapes(f, [
      { t: 'rr', x: 1018, y: 410, w: 8, h: 30, r: 2, c: 0x6b6880 },
      { t: 'rr', x: 1066, y: 410, w: 8, h: 30, r: 2, c: 0x6b6880 },
      { t: 'rr', x: 1010, y: 402, w: 72, h: 10, r: 4, c: 0xffffff },
    ], 4);

    // --- Animated bits: the front door (left edge), windows
    var door = scene.add.container(42, 166).setDepth(3);
    var dg = scene.add.graphics();
    shapes(dg, [{ t: 'rr', x: 0, y: 0, w: 60, h: 274, r: 4, c: 0x9fb3c8 }], 5);
    dg.fillStyle(0xdff2ff, 0.8).fillRoundedRect(8, 10, 44, 250, 4);
    dg.fillStyle(0x6b6880, 1).fillRect(48, 120, 5, 40);
    door.add(dg);

    var windows = [{ x: 650, y: 150, w: 120, h: 90 }, { x: 1010, y: 160, w: 110, h: 80 }];
    var sky = scene.add.graphics().setDepth(1.5);
    var frames = scene.add.graphics().setDepth(2);
    windows.forEach(function (w) {
      frames.lineStyle(6, 0xffffff, 1).strokeRect(w.x, w.y, w.w, w.h);
      frames.lineStyle(4, 0xffffff, 1).lineBetween(w.x + w.w / 2, w.y, w.x + w.w / 2, w.y + w.h);
      frames.lineStyle(2, 0xd8cdbd, 1).strokeRect(w.x - 3, w.y - 3, w.w + 6, w.h + 6);
    });
    // Ceiling lights stay on all day (it's an office); the sky does the storytelling.
    var dark = scene.add.rectangle(L, top, R - L, bot - top, 0x1b1e3a, 0).setOrigin(0, 0).setDepth(8);
    var SKY = [[8 * 60, 0xffe2b0], [10 * 60, 0xbfe3f5], [16 * 60, 0xa9d8f2], [17 * 60 + 30, 0xffc58a], [18 * 60 + 30, 0xe0806a], [19 * 60 + 30, 0x4a4a85], [21 * 60, 0x1e2250]];
    function lerp(a, b, t) {
      var ca = Phaser.Display.Color.IntegerToColor(a), cb = Phaser.Display.Color.IntegerToColor(b);
      var c = Phaser.Display.Color.Interpolate.ColorWithColor(ca, cb, 100, Math.round(t * 100));
      return Phaser.Display.Color.GetColor(c.r, c.g, c.b);
    }
    var lastT = -1;
    function setTime(t) {
      t = Math.round(t / 5) * 5;
      if (t === lastT) return;
      lastT = t;
      var c = SKY[SKY.length - 1][1];
      for (var i = 0; i < SKY.length - 1; i++) {
        if (t <= SKY[i + 1][0]) { c = lerp(SKY[i][1], SKY[i + 1][1], Math.max(0, (t - SKY[i][0]) / (SKY[i + 1][0] - SKY[i][0]))); break; }
      }
      sky.clear();
      windows.forEach(function (w) {
        sky.fillStyle(c, 1).fillRect(w.x, w.y, w.w, w.h);
        sky.fillStyle(0xffffff, 0.6).fillEllipse(w.x + w.w * 0.3, w.y + w.h * 0.35, 30, 10).fillEllipse(w.x + w.w * 0.7, w.y + w.h * 0.6, 24, 8);
      });
      dark.setAlpha(Phaser.Math.Clamp((t - 18 * 60) / 180, 0, 1) * 0.2);
    }
    setTime(W.startTime);

    return { door: door, setTime: setTime, exitX: -40 };
  }

  A.drawOffice = drawOffice;
})();
