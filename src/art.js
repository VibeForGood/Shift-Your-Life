// All the art, drawn in code: object icons (generated textures), the main character, and the
// furnished apartment. No image files. Style: flat fills, soft ink outlines.
var SYL = (globalThis.SYL = globalThis.SYL || {});

(function () {
  var INK = 0x3a3848;
  var OUT = 5; // outline stroke width (about half shows outside the shape)

  // ---------- shape helpers ----------
  // Shapes: { t: 'rr', x, y, w, h, r, c } | { t: 'c', x, y, r, c } | { t: 'e', x, y, w, h, c } | { t: 'p', pts: [[x,y]...], c }
  function pts(list) { return list.map(function (p) { return { x: p[0], y: p[1] }; }); }
  function one(g, s, stroke) {
    if (s.t === 'rr') { g.fillRoundedRect(s.x, s.y, s.w, s.h, s.r || 0.01); if (stroke) g.strokeRoundedRect(s.x, s.y, s.w, s.h, s.r || 0.01); }
    else if (s.t === 'c') { g.fillCircle(s.x, s.y, s.r); if (stroke) g.strokeCircle(s.x, s.y, s.r); }
    else if (s.t === 'e') { g.fillEllipse(s.x, s.y, s.w, s.h); if (stroke) g.strokeEllipse(s.x, s.y, s.w, s.h); }
    else if (s.t === 'p') { var p = pts(s.pts); g.fillPoints(p, true); if (stroke) g.strokePoints(p, true, true); }
  }
  // Outlined group: ink silhouette first, then colour fills on top.
  function shapes(g, list, w) {
    g.lineStyle(w || OUT, INK, 1);
    g.fillStyle(INK, 1);
    list.forEach(function (s) { if (!s.noOutline) one(g, s, true); });
    list.forEach(function (s) { g.fillStyle(s.c, s.a === undefined ? 1 : s.a); one(g, s, false); });
  }
  function line(g, w, c, x1, y1, x2, y2, a) { g.lineStyle(w, c, a === undefined ? 1 : a).lineBetween(x1, y1, x2, y2); }

  // ---------- object icons (64x64 textures) ----------
  var ICONS = {
    phone: function (g) {
      shapes(g, [
        { t: 'rr', x: 20, y: 8, w: 24, h: 48, r: 6, c: 0x2f2d3a },
        { t: 'c', x: 44, y: 10, r: 6, c: 0xe0645a },
      ]);
      g.fillStyle(0x8fd8ff, 1).fillRoundedRect(23, 15, 18, 34, 3);
      g.fillStyle(0xffffff, 0.8).fillRoundedRect(26, 19, 5, 5, 1).fillRoundedRect(33, 19, 5, 5, 1).fillRoundedRect(26, 27, 5, 5, 1);
      g.fillStyle(0xffffff, 0.5).fillRoundedRect(26, 36, 12, 3, 1).fillRoundedRect(26, 41, 9, 3, 1);
      g.fillStyle(0x555366, 1).fillCircle(32, 52, 1.6);
    },
    shoes: function (g) {
      shapes(g, [
        { t: 'p', pts: [[10, 44], [11, 22], [25, 18], [33, 29], [50, 32], [57, 38], [58, 44]], c: 0x4fae78 },
        { t: 'rr', x: 7, y: 42, w: 53, h: 9, r: 4, c: 0xffffff },
      ]);
      g.fillStyle(0x3b8f60, 1).fillPoints(pts([[11, 22], [25, 18], [26, 24], [12, 28]]), true);
      line(g, 2.5, 0xffffff, 24, 30, 30, 27); line(g, 2.5, 0xffffff, 27, 34, 33, 31); line(g, 2.5, 0xffffff, 30, 38, 36, 35);
      line(g, 3, 0xf2b84b, 40, 42, 52, 36);
      line(g, 2, 0xd8cdbd, 10, 47, 58, 47);
    },
    headphones: function (g) {
      g.lineStyle(9, INK, 1).beginPath().arc(32, 36, 20, Math.PI, 0, false).strokePath();
      g.lineStyle(5, 0x6b6880, 1).beginPath().arc(32, 36, 20, Math.PI, 0, false).strokePath();
      shapes(g, [
        { t: 'rr', x: 6, y: 30, w: 14, h: 22, r: 6, c: 0x4fae78 },
        { t: 'rr', x: 44, y: 30, w: 14, h: 22, r: 6, c: 0x4fae78 },
      ]);
      g.fillStyle(0x3b8f60, 1).fillRoundedRect(15, 33, 5, 16, 2).fillRoundedRect(44, 33, 5, 16, 2);
      // music notes
      g.fillStyle(INK, 1).fillCircle(30, 22, 2.5); line(g, 1.5, INK, 32, 22, 32, 14);
    },
    snacks: function (g) {
      shapes(g, [
        { t: 'rr', x: 13, y: 18, w: 38, h: 40, r: 9, c: 0xe3f2f7 },
        { t: 'rr', x: 17, y: 9, w: 30, h: 10, r: 3, c: 0xe0645a },
      ]);
      var ck = [[23, 47], [36, 49], [29, 39], [42, 38], [21, 31]];
      ck.forEach(function (p) {
        g.fillStyle(0xc98a4b, 1).fillCircle(p[0], p[1], 6);
        g.fillStyle(0x6e4524, 1).fillCircle(p[0] - 2, p[1] - 1, 1.2).fillCircle(p[0] + 2, p[1] + 1.5, 1.2);
      });
      g.fillStyle(0xffffff, 0.7).fillRoundedRect(17, 22, 4, 16, 2);
      g.fillStyle(0xc4483f, 1).fillRect(17, 15, 30, 2);
    },
    meal: function (g) {
      // A bowl of good food with a bit of steam.
      shapes(g, [
        { t: 'p', pts: [[8, 34], [56, 34], [52, 46], [44, 54], [20, 54], [12, 46]], c: 0xffffff },
      ]);
      g.fillStyle(0x4fae78, 1).fillCircle(20, 31, 7).fillCircle(29, 28, 7);
      g.fillStyle(0xf28b3c, 1).fillCircle(39, 30, 6);
      g.fillStyle(0xfff4d6, 1).fillEllipse(47, 30, 12, 9);
      g.fillStyle(0xf2b84b, 1).fillCircle(47, 30, 3);
      line(g, 3, INK, 8, 34, 56, 34);
      g.fillStyle(0x4fae78, 1).fillRect(14, 42, 36, 4);
      g.lineStyle(2.5, 0x9ab0c0, 0.8);
      [24, 34].forEach(function (x) {
        g.beginPath(); g.moveTo(x, 20); g.lineTo(x + 3, 15); g.lineTo(x, 10); g.lineTo(x + 3, 5); g.strokePath();
      });
    },
    blanket: function (g) {
      shapes(g, [
        { t: 'rr', x: 8, y: 36, w: 48, h: 16, r: 6, c: 0x4f7fc4 },
        { t: 'rr', x: 10, y: 22, w: 44, h: 16, r: 6, c: 0x6c9ce0 },
        { t: 'rr', x: 13, y: 9, w: 38, h: 15, r: 6, c: 0x8ab4ee },
      ]);
      g.lineStyle(2, 0xffffff, 0.6);
      [22, 32, 42].forEach(function (x) { g.lineBetween(x, 10, x, 22); g.lineBetween(x, 23, x, 37); g.lineBetween(x, 37, x, 51); });
    },
    book: function (g) {
      shapes(g, [
        { t: 'rr', x: 14, y: 9, w: 38, h: 47, r: 4, c: 0xfffaf0 },
        { t: 'rr', x: 12, y: 8, w: 36, h: 47, r: 4, c: 0x5a8fd8 },
      ]);
      g.fillStyle(0x3f6fb5, 1).fillRect(12, 10, 7, 43);
      g.fillStyle(0xffffff, 1).fillRoundedRect(24, 18, 18, 8, 2);
      g.fillStyle(0xf2b84b, 1).fillCircle(33, 38, 5);
      g.fillStyle(0xe0645a, 1).fillRect(38, 50, 5, 10);
    },
    laptop: function (g) {
      shapes(g, [
        { t: 'rr', x: 11, y: 10, w: 42, h: 30, r: 4, c: 0x3a3848 },
        { t: 'p', pts: [[6, 40], [58, 40], [62, 50], [2, 50]], c: 0xc9ccd6 },
      ]);
      g.fillStyle(0xe8f4ff, 1).fillRoundedRect(14, 13, 36, 24, 2);
      g.fillStyle(0x4fae78, 1).fillRect(17, 17, 14, 3);
      g.fillStyle(0x5a8fd8, 1).fillRect(20, 23, 18, 3).fillRect(20, 29, 10, 3);
      g.fillStyle(0xf2b84b, 1).fillRect(33, 17, 8, 3);
      g.fillStyle(0x9a9eb0, 1).fillRect(26, 43, 12, 3);
    },
    postcard: function (g) {
      shapes(g, [{ t: 'p', pts: [[5, 20], [54, 11], [59, 43], [10, 52]], c: 0xfff6e8 }]);
      g.fillStyle(0xe0645a, 1).fillPoints(pts([[42, 16], [51, 14], [53, 24], [44, 26]]), true);
      g.lineStyle(2, 0xb9ad9c, 1).lineBetween(32, 19, 36, 45);
      g.lineStyle(2, 0x7a768a, 0.8).lineBetween(12, 27, 28, 24).lineBetween(13, 33, 29, 30).lineBetween(14, 39, 25, 37);
      g.fillStyle(0xe0645a, 1).fillCircle(41, 36, 3.2).fillCircle(46, 35, 3.2).fillTriangle(38, 37, 49, 35, 44.5, 43);
    },
    clock: function (g) {
      line(g, 7, INK, 18, 50, 13, 58); line(g, 7, INK, 46, 50, 51, 58);
      shapes(g, [
        { t: 'c', x: 17, y: 15, r: 8, c: 0xf2b84b },
        { t: 'c', x: 47, y: 15, r: 8, c: 0xf2b84b },
        { t: 'c', x: 32, y: 36, r: 20, c: 0x4fae78 },
      ]);
      g.fillStyle(0xffffff, 1).fillCircle(32, 36, 15);
      line(g, 3, INK, 32, 36, 32, 26); line(g, 3, INK, 32, 36, 39, 39);
      g.fillStyle(INK, 1).fillCircle(32, 36, 2.5);
      g.fillStyle(INK, 1).fillRect(31, 12, 2, 6);
    },
  };

  function ensureTextures(scene) {
    Object.keys(ICONS).forEach(function (id) {
      var key = 'icon_' + id;
      if (scene.textures.exists(key)) return;
      var g = scene.add.graphics();
      ICONS[id](g);
      g.generateTexture(key, 64, 64);
      g.destroy();
    });
    if (!scene.textures.exists('glow')) {
      var tex = scene.textures.createCanvas('glow', 256, 256);
      var cx = tex.getContext();
      var gr = cx.createRadialGradient(128, 128, 0, 128, 128, 128);
      gr.addColorStop(0, 'rgba(255,200,120,0.6)');
      gr.addColorStop(0.45, 'rgba(255,190,110,0.2)');
      gr.addColorStop(1, 'rgba(255,180,100,0)');
      cx.fillStyle = gr;
      cx.fillRect(0, 0, 256, 256);
      tex.refresh();
    }
    if (!scene.textures.exists('puff')) {
      var p = scene.add.graphics();
      p.fillStyle(0xffffff, 1).fillCircle(8, 8, 8);
      p.generateTexture('puff', 16, 16);
      p.destroy();
    }
  }

  // ---------- You (the main character) ----------
  // 34, claims analyst, a big guy in a comfy hoodie. Drawn with care, never as a joke.
  // Returns { root, body, eyes, top, mood(name), look(dx, dy), blink() }.
  // root's origin is the middle of the torso; `top` is the y of the top of the head.
  // Moods: neutral, happy, sad, tired, o (surprised/munching), content, sleep.
  var SKIN = 0xe3b08a, SKIN_D = 0xcf9670, HAIR = 0x4a3428, HOOD = 0x5b84b1, HOOD_D = 0x4c74a0, JEANS = 0x46506e;
  function makeHero(scene, x, y, r) {
    r = r || 24;
    var k = r / 24;
    var root = scene.add.container(x, y);
    var shadow = scene.add.ellipse(0, 40 * k, 64 * k, 11 * k, 0x000000, 0.13);
    var body = scene.add.container(0, 0);
    var g = scene.add.graphics();
    shapes(g, [
      { t: 'rr', x: -14 * k, y: 12 * k, w: 12 * k, h: 24 * k, r: 4 * k, c: JEANS },
      { t: 'rr', x: 2 * k, y: 12 * k, w: 12 * k, h: 24 * k, r: 4 * k, c: JEANS },
      { t: 'rr', x: -17 * k, y: 33 * k, w: 16 * k, h: 7 * k, r: 3 * k, c: 0x2f2d3a },
      { t: 'rr', x: 1 * k, y: 33 * k, w: 16 * k, h: 7 * k, r: 3 * k, c: 0x2f2d3a },
      { t: 'e', x: 0, y: 3 * k, w: 62 * k, h: 50 * k, c: HOOD },
      { t: 'rr', x: -37 * k, y: -11 * k, w: 12 * k, h: 29 * k, r: 6 * k, c: HOOD_D },
      { t: 'rr', x: 25 * k, y: -11 * k, w: 12 * k, h: 29 * k, r: 6 * k, c: HOOD_D },
      { t: 'c', x: -31 * k, y: 19 * k, r: 5 * k, c: SKIN },
      { t: 'c', x: 31 * k, y: 19 * k, r: 5 * k, c: SKIN },
      { t: 'c', x: -17 * k, y: -30 * k, r: 4 * k, c: SKIN_D },
      { t: 'c', x: 17 * k, y: -30 * k, r: 4 * k, c: SKIN_D },
      { t: 'c', x: 0, y: -30 * k, r: 17 * k, c: SKIN },
    ], 4 * k);
    g.fillStyle(0x6f97c4, 1).fillEllipse(0, 10 * k, 38 * k, 26 * k);
    g.fillStyle(HOOD_D, 1).fillRoundedRect(-12 * k, 10 * k, 24 * k, 9 * k, 3 * k);
    g.lineStyle(2 * k, 0xffffff, 0.8).lineBetween(-4 * k, -16 * k, -5 * k, -6 * k).lineBetween(4 * k, -16 * k, 5 * k, -6 * k);
    g.fillStyle(HOOD_D, 1).fillEllipse(0, -15 * k, 26 * k, 6 * k);
    g.fillStyle(HAIR, 1).fillEllipse(0, -43 * k, 32 * k, 12 * k).fillEllipse(-11 * k, -39 * k, 12 * k, 11 * k).fillEllipse(10 * k, -40 * k, 14 * k, 9 * k);
    g.fillStyle(0xff9fae, 0.35).fillEllipse(-10 * k, -25 * k, 7 * k, 4 * k).fillEllipse(10 * k, -25 * k, 7 * k, 4 * k);
    var eyes = scene.add.container(0, 0);
    var whites = [scene.add.ellipse(-6 * k, -31 * k, 8 * k, 9 * k, 0xffffff), scene.add.ellipse(6 * k, -31 * k, 8 * k, 9 * k, 0xffffff)];
    var pupils = [scene.add.circle(-6 * k, -31 * k, 2.4 * k, INK), scene.add.circle(6 * k, -31 * k, 2.4 * k, INK)];
    var lids = [scene.add.rectangle(-6 * k, -36 * k, 10 * k, 1, SKIN).setOrigin(0.5, 0), scene.add.rectangle(6 * k, -36 * k, 10 * k, 1, SKIN).setOrigin(0.5, 0)];
    var glasses = scene.add.graphics();
    glasses.lineStyle(1.8 * k, INK, 0.9).strokeCircle(-6 * k, -31 * k, 6 * k).strokeCircle(6 * k, -31 * k, 6 * k).lineBetween(0, -31 * k, 0, -31 * k);
    eyes.add(whites.concat(pupils, lids, [glasses]));
    var face = scene.add.graphics();
    body.add([g, eyes, face]);
    root.add([shadow, body]);

    var lidBase = 1;
    function setLids(h) { lids.forEach(function (l) { l.height = Math.max(1, h); }); }
    var hero = {
      root: root, body: body, eyes: eyes, r: r, top: -50 * k,
      mood: function (m) {
        face.clear();
        face.lineStyle(2.2 * k, INK, 1);
        var my = -22 * k;
        var brow = 0;
        lidBase = 1;
        if (m === 'happy') {
          face.beginPath(); face.arc(0, my - 2 * k, 4.5 * k, 0.15 * Math.PI, 0.85 * Math.PI, false); face.strokePath();
          brow = -0.5;
        } else if (m === 'sad' || m === 'tired') {
          face.beginPath(); face.arc(0, my + 4 * k, 4 * k, 1.2 * Math.PI, 1.8 * Math.PI, false); face.strokePath();
          brow = 2;
          if (m === 'tired') lidBase = 4.5 * k;
        } else if (m === 'o') {
          face.fillStyle(INK, 1).fillEllipse(0, my, 4.5 * k, 5.5 * k);
          brow = -1.5;
        } else if (m === 'content') {
          face.beginPath(); face.arc(0, my - 2.5 * k, 4 * k, 0.2 * Math.PI, 0.8 * Math.PI, false); face.strokePath();
          lidBase = 3.5 * k;
        } else if (m === 'sleep') {
          lidBase = 9 * k;
          face.fillStyle(INK, 1).fillEllipse(0, my, 3 * k, 2.5 * k);
        } else {
          face.lineBetween(-3 * k, my, 3 * k, my);
        }
        face.lineStyle(2.2 * k, HAIR, 1);
        face.lineBetween(-10 * k, -39 * k, -3 * k, -39 * k - brow * k);
        face.lineBetween(10 * k, -39 * k, 3 * k, -39 * k - brow * k);
        setLids(lidBase);
        return hero;
      },
      look: function (dx, dy) {
        pupils[0].setPosition(-6 * k + dx * 2 * k, -31 * k + dy * 2 * k);
        pupils[1].setPosition(6 * k + dx * 2 * k, -31 * k + dy * 2 * k);
        return hero;
      },
      blink: function () {
        if (lidBase >= 9 * k) return;
        var o = { h: lidBase };
        scene.tweens.add({ targets: o, h: 9 * k, duration: 70, yoyo: true, onUpdate: function () { setLids(o.h); }, onComplete: function () { setLids(lidBase); } });
      },
    };
    var blinkTimer = scene.time.addEvent({ delay: 2600, loop: true, callback: function () { if (Math.random() < 0.8) hero.blink(); } });
    root.once('destroy', function () { blinkTimer.remove(); });
    hero.mood('neutral');
    return hero;
  }

  // ---------- the apartment ----------
  var FLOOR_Y = 440;
  var WALLS = { door: 0xf3e6d3, hall: 0xeee2d2, kitchen: 0xe3efe7, living: 0xf6e4d6, bedroom: 0xe5e5f3 };
  var WOOD = 0xc49a6c, WOOD_D = 0xa47a50, WOOD_L = 0xdcb88e;

  // Draws walls, floor and furniture under the slots. Returns handles the
  // Play scene animates (front door, windows, lamps).
  function drawApartment(scene, room) {
    var W = SYL.WORLD;
    var top = room.top, bot = room.bottom, L = 30, R = 1250;
    var g = scene.add.graphics().setDepth(1);
    // Walls per zone
    W.zones.forEach(function (z, i) {
      var x0 = i === 0 ? L : z.x0, x1 = i === W.zones.length - 1 ? R : z.x1;
      g.fillStyle(WALLS[z.id], 1).fillRect(x0, top, x1 - x0, FLOOR_Y - top);
    });
    // Wallpaper details
    g.fillStyle(0xffffff, 0.35);
    for (var x = 980; x < R; x += 28) for (var y = top + 30; y < FLOOR_Y - 10; y += 28) g.fillCircle(x + ((y / 28) % 2) * 14, y, 2);
    for (var x2 = 700; x2 < 960; x2 += 22) g.fillRect(x2, top, 8, FLOOR_Y - top);
    // Kitchen splashback tiles
    g.lineStyle(1, 0xc9dccf, 1);
    for (var ty = 300; ty < 394; ty += 16) g.lineBetween(422, ty, 690, ty);
    // Floors
    W.zones.forEach(function (z, i) {
      var x0 = i === 0 ? L : z.x0, x1 = i === W.zones.length - 1 ? R : z.x1;
      if (z.id === 'kitchen') {
        for (var tx = x0; tx < x1; tx += 22) for (var ty2 = FLOOR_Y; ty2 < bot; ty2 += 22) {
          g.fillStyle(((tx - x0) / 22 + (ty2 - FLOOR_Y) / 22) % 2 ? 0xe4dccd : 0xf4efe6, 1).fillRect(tx, ty2, Math.min(22, x1 - tx), Math.min(22, bot - ty2));
        }
      } else if (z.id === 'bedroom') {
        g.fillStyle(0xcdc7e0, 1).fillRect(x0, FLOOR_Y, x1 - x0, bot - FLOOR_Y);
      } else {
        g.fillStyle(WOOD_L, 1).fillRect(x0, FLOOR_Y, x1 - x0, bot - FLOOR_Y);
        g.lineStyle(1.5, 0xc9a477, 1);
        for (var py = FLOOR_Y + 18; py < bot; py += 18) g.lineBetween(x0, py, x1, py);
        for (var px = x0 + ((z.x0 / 10) % 40); px < x1; px += 80) for (var r2 = 0; r2 < 5; r2++) g.lineBetween(px + (r2 % 2) * 40, FLOOR_Y + r2 * 18, px + (r2 % 2) * 40, FLOOR_Y + r2 * 18 + 18);
      }
    });
    // Rugs and mats
    g.fillStyle(0xe0645a, 0.55).fillRoundedRect(46, 448, 96, 14, 6);
    g.fillStyle(0xe8a87c, 0.6).fillEllipse(860, 480, 220, 44);
    g.lineStyle(3, 0xffffff, 0.4).strokeEllipse(860, 480, 190, 32);
    g.fillStyle(0xb7aed6, 0.8).fillRoundedRect(1050, 455, 120, 30, 10);
    // Skirting board
    g.fillStyle(0xffffff, 0.7).fillRect(L, FLOOR_Y - 8, R - L, 8);
    line(g, 2, 0xd8cdbd, L, FLOOR_Y, R, FLOOR_Y);
    // Interior walls between rooms
    W.zones.forEach(function (z, i) {
      if (i === 0) return;
      g.fillStyle(0xd8cdbd, 1).fillRect(z.x0 - 4, top, 8, FLOOR_Y - top - 150);
      g.fillStyle(0xcfc2b0, 1).fillRect(z.x0 - 4, top, 8, 6);
    });

    var f = scene.add.graphics().setDepth(2); // furniture

    // --- Front door zone: coat rail + shoe rack
    shapes(f, [{ t: 'rr', x: 122, y: 168, w: 76, h: 10, r: 4, c: WOOD }], 4);
    f.fillStyle(WOOD_D, 1).fillCircle(140, 182, 4).fillCircle(160, 182, 4).fillCircle(180, 182, 4);
    shapes(f, [
      { t: 'rr', x: 116, y: 424, w: 80, h: 10, r: 3, c: WOOD },
      { t: 'rr', x: 116, y: 434, w: 8, h: 8, r: 1, c: WOOD_D },
      { t: 'rr', x: 188, y: 434, w: 8, h: 8, r: 1, c: WOOD_D },
    ], 4);
    // --- Hallway: mirror, console table, wardrobe
    shapes(f, [{ t: 'e', x: 270, y: 225, w: 56, h: 76, c: 0xcfe6f2 }], 6);
    f.fillStyle(0xffffff, 0.6).fillEllipse(260, 210, 12, 30);
    shapes(f, [
      { t: 'rr', x: 226, y: 394, w: 9, h: 46, r: 2, c: WOOD_D },
      { t: 'rr', x: 305, y: 394, w: 9, h: 46, r: 2, c: WOOD_D },
      { t: 'rr', x: 220, y: 392, w: 100, h: 12, r: 4, c: WOOD },
      { t: 'rr', x: 324, y: 158, w: 86, h: 282, r: 6, c: 0xb68457 },
    ], 4);
    f.fillStyle(0xc99a6c, 1).fillRoundedRect(330, 166, 36, 266, 4).fillRoundedRect(368, 166, 36, 266, 4);
    f.fillStyle(INK, 1).fillCircle(360, 300, 3).fillCircle(374, 300, 3);
    // --- Kitchen: wall cupboard, counter, window, small table + chair
    shapes(f, [
      { t: 'rr', x: 440, y: 158, w: 106, h: 94, r: 6, c: 0x7fb6a4 },
      { t: 'rr', x: 432, y: 392, w: 122, h: 14, r: 4, c: 0xf4efe6 },
      { t: 'rr', x: 436, y: 406, w: 114, h: 34, r: 3, c: 0x7fb6a4 },
    ], 4);
    f.fillStyle(0x93c6b5, 1).fillRoundedRect(446, 164, 46, 82, 4).fillRoundedRect(494, 164, 46, 82, 4);
    f.fillStyle(INK, 1).fillRect(486, 196, 3, 16).fillRect(497, 196, 3, 16);
    f.fillStyle(0x93c6b5, 1).fillRoundedRect(441, 410, 50, 26, 3).fillRoundedRect(495, 410, 50, 26, 3);
    f.fillStyle(INK, 1).fillRect(484, 418, 3, 10).fillRect(499, 418, 3, 10);
    shapes(f, [
      { t: 'rr', x: 612, y: 404, w: 16, h: 36, r: 2, c: WOOD_D },
      { t: 'rr', x: 594, y: 436, w: 52, h: 6, r: 2, c: WOOD_D },
      { t: 'rr', x: 572, y: 394, w: 96, h: 12, r: 5, c: WOOD },
      { t: 'rr', x: 672, y: 340, w: 8, h: 100, r: 3, c: 0xe0645a },
      { t: 'rr', x: 650, y: 400, w: 30, h: 8, r: 3, c: 0xe0645a },
    ], 4);
    // --- Living room: picture, coffee table, couch
    shapes(f, [{ t: 'rr', x: 830, y: 170, w: 84, h: 60, r: 4, c: 0xfff6e8 }], 5);
    f.fillStyle(0x9ad1c2, 1).fillRect(836, 176, 72, 48);
    f.fillStyle(0x4fae78, 1).fillTriangle(836, 224, 862, 192, 888, 224);
    f.fillStyle(0x3b8f60, 1).fillTriangle(866, 224, 890, 198, 908, 224);
    f.fillStyle(0xf2b84b, 1).fillCircle(892, 186, 6);
    shapes(f, [
      { t: 'rr', x: 712, y: 428, w: 6, h: 12, r: 1, c: WOOD_D },
      { t: 'rr', x: 772, y: 428, w: 6, h: 12, r: 1, c: WOOD_D },
      { t: 'rr', x: 704, y: 420, w: 82, h: 10, r: 4, c: WOOD },
      { t: 'rr', x: 806, y: 432, w: 8, h: 9, r: 1, c: WOOD_D },
      { t: 'rr', x: 926, y: 432, w: 8, h: 9, r: 1, c: WOOD_D },
      { t: 'rr', x: 800, y: 326, w: 140, h: 66, r: 18, c: 0xd98c6a },
      { t: 'rr', x: 796, y: 382, w: 148, h: 52, r: 12, c: 0xe8a07e },
      { t: 'rr', x: 784, y: 358, w: 24, h: 76, r: 11, c: 0xd98c6a },
      { t: 'rr', x: 932, y: 358, w: 24, h: 76, r: 11, c: 0xd98c6a },
    ], 4);
    line(f, 2, 0xcf7f5d, 870, 386, 870, 430);
    // --- Bedroom: window, wall lamp, nightstand, bed, dresser
    shapes(f, [
      { t: 'rr', x: 996, y: 196, w: 18, h: 26, r: 4, c: 0xf2b84b },
      { t: 'rr', x: 975, y: 396, w: 60, h: 44, r: 4, c: WOOD },
    ], 4);
    f.fillStyle(WOOD_L, 1).fillRoundedRect(981, 404, 48, 14, 3);
    f.fillStyle(INK, 1).fillCircle(1005, 411, 2.5);
    shapes(f, [
      { t: 'rr', x: 1042, y: 330, w: 16, h: 112, r: 6, c: 0x8b7bb8 },
      { t: 'rr', x: 1142, y: 372, w: 12, h: 70, r: 5, c: 0x8b7bb8 },
      { t: 'rr', x: 1052, y: 396, w: 96, h: 30, r: 8, c: 0xffffff },
      { t: 'rr', x: 1088, y: 390, w: 62, h: 38, r: 9, c: 0xa99ad6 },
      { t: 'e', x: 1074, y: 392, w: 36, h: 16, c: 0xfffaf2 },
    ], 4);
    line(f, 2, 0x8b7bb8, 1100, 394, 1100, 426); line(f, 2, 0x8b7bb8, 1125, 394, 1125, 426);
    shapes(f, [{ t: 'rr', x: 1166, y: 318, w: 70, h: 122, r: 6, c: 0xb68457 }], 4);
    f.fillStyle(0xc99a6c, 1).fillRoundedRect(1172, 324, 58, 30, 3).fillRoundedRect(1172, 358, 58, 76, 3);
    f.fillStyle(INK, 1).fillRect(1194, 337, 14, 3).fillRect(1194, 394, 14, 3);

    // --- Animated bits
    var door = scene.add.container(42, 166).setDepth(3);
    var dg = scene.add.graphics();
    shapes(dg, [{ t: 'rr', x: 0, y: 0, w: 66, h: 274, r: 4, c: 0xb9855a }], 5);
    dg.fillStyle(0xc99a6c, 1).fillRoundedRect(8, 10, 50, 110, 4).fillRoundedRect(8, 130, 50, 134, 4);
    dg.fillStyle(0xcfe6f2, 1).fillRoundedRect(20, 24, 26, 34, 12);
    dg.fillStyle(0xf2b84b, 1).fillCircle(54, 150, 5);
    door.add(dg);

    // Windows: sky changes with time.
    var windows = [
      { x: 576, y: 150, w: 92, h: 96 },
      { x: 1068, y: 168, w: 74, h: 86 },
    ];
    var sky = scene.add.graphics().setDepth(1.5);
    var frames = scene.add.graphics().setDepth(2);
    windows.forEach(function (w) {
      frames.lineStyle(6, 0xffffff, 1).strokeRect(w.x, w.y, w.w, w.h);
      frames.lineStyle(4, 0xffffff, 1).lineBetween(w.x + w.w / 2, w.y, w.x + w.w / 2, w.y + w.h).lineBetween(w.x, w.y + w.h / 2, w.x + w.w, w.y + w.h / 2);
      frames.lineStyle(2, 0xd8cdbd, 1).strokeRect(w.x - 3, w.y - 3, w.w + 6, w.h + 6);
      frames.fillStyle(0xffffff, 1).fillRect(w.x - 8, w.y + w.h, w.w + 16, 6);
    });

    // Lamps: pendant lights + wall lamp; glows fade in as it gets dark.
    var lamps = [
      { x: 300, y: 150, cord: true, r: 120 },
      { x: 750, y: 150, cord: true, r: 120 },
      { x: 600, y: 260, cord: false, r: 0 }, // kitchen window spill (no fixture)
      { x: 1005, y: 210, cord: false, r: 110 },
      { x: 495, y: 262, cord: false, r: 90 }, // under-cupboard light
    ].filter(function (l) { return l.r > 0; });
    lamps.forEach(function (l) {
      if (!l.cord) return;
      line(f, 2, INK, l.x, top + 30, l.x, l.y);
      shapes(f, [{ t: 'p', pts: [[l.x - 18, l.y + 14], [l.x - 8, l.y], [l.x + 8, l.y], [l.x + 18, l.y + 14]], c: 0xf2b84b }], 4);
    });
    var dark = scene.add.rectangle(L, top, R - L, bot - top, 0x1b1e3a, 0).setOrigin(0, 0).setDepth(8);
    var glow = scene.add.container(0, 0).setDepth(8.5).setAlpha(0);
    lamps.forEach(function (l) {
      glow.add(scene.add.image(l.x, l.y + 30, 'glow').setDisplaySize(l.r * 2.4, l.r * 2.4).setBlendMode(Phaser.BlendModes.ADD));
    });

    function lerpColor(a, b, t) {
      var ca = Phaser.Display.Color.IntegerToColor(a), cb = Phaser.Display.Color.IntegerToColor(b);
      var c = Phaser.Display.Color.Interpolate.ColorWithColor(ca, cb, 100, Math.round(t * 100));
      return Phaser.Display.Color.GetColor(c.r, c.g, c.b);
    }
    var SKY = [[18 * 60, 0xffd59a], [19 * 60 + 30, 0xf0907a], [20 * 60 + 30, 0x6a5a9a], [21 * 60 + 30, 0x262a55], [24 * 60, 0x161a3a]];
    var lastT = -1;
    function setTime(t) {
      t = Math.round(t / 5) * 5;
      if (t === lastT) return;
      lastT = t;
      var c = SKY[SKY.length - 1][1];
      for (var i = 0; i < SKY.length - 1; i++) {
        if (t <= SKY[i + 1][0]) { c = lerpColor(SKY[i][1], SKY[i + 1][1], Math.max(0, (t - SKY[i][0]) / (SKY[i + 1][0] - SKY[i][0]))); break; }
      }
      var night = Phaser.Math.Clamp((t - 19 * 60) / (240), 0, 1);
      sky.clear();
      windows.forEach(function (w) {
        sky.fillStyle(c, 1).fillRect(w.x, w.y, w.w, w.h);
        if (night < 0.4) sky.fillStyle(0xffe9a8, 1 - night * 2).fillCircle(w.x + w.w * 0.7, w.y + w.h * (0.55 + night), 9);
        if (night > 0.4) {
          sky.fillStyle(0xfff6d8, Math.min(1, (night - 0.4) * 3)).fillCircle(w.x + w.w * 0.3, w.y + w.h * 0.3, 7);
          sky.fillStyle(c, 1).fillCircle(w.x + w.w * 0.3 + 4, w.y + w.h * 0.3 - 2, 6);
          sky.fillStyle(0xffffff, (night - 0.4) * 1.5);
          [[0.7, 0.2], [0.85, 0.6], [0.55, 0.75], [0.2, 0.8]].forEach(function (s) { sky.fillCircle(w.x + w.w * s[0], w.y + w.h * s[1], 1.4); });
        }
      });
      dark.setAlpha(night * 0.3);
      glow.setAlpha(night);
    }
    setTime(18 * 60);

    return { door: door, setTime: setTime, bedX: 1098, bedY: 382 };
  }

  SYL.art = { ensureTextures: ensureTextures, makeHero: makeHero, drawApartment: drawApartment, shapes: shapes, FLOOR_Y: FLOOR_Y };
})();
