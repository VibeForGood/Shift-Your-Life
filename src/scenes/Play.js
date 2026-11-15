// The main scene: plan (drag objects) -> run (watch Pip's evening) -> result.
var SYL = (globalThis.SYL = globalThis.SYL || {});

(function () {
  var C = SYL.C;
  var W = SYL.WORLD;
  var ROOM = { top: 104, bottom: 530 };
  var WALK_Y = 470;
  var CAT_COLOR = { good: C.good, trap: C.trap, rest: C.rest };
  var ACTION_COLOR = { run: C.good, eat: C.good, read: C.rest, rest: C.rest, sleep: C.rest, scroll: C.trap, bedscroll: C.trap, snack: C.trap, carry: C.inkSoft };

  SYL.PlayScene = class extends Phaser.Scene {
    constructor() { super('Play'); }

    create() {
      this.level = SYL.LEVELS[SYL.state.levelIndex];
      this.layout = Object.assign({}, this.level.layout);
      this.mode = 'plan';
      this.objViews = {};
      this.applySpeed();

      this.drawRoom();
      this.drawHeader();
      this.drawBottomBar();
      this.createObjects();
      this.createPip();
      this.overlay = this.add.graphics().setDepth(20);
      this.overlayTexts = [];
      this.setupInput();
      this.refresh();
      this.showBrief();

      SYL.debug = this; // handy for automated tests
    }

    // ---------- drawing ----------

    drawRoom() {
      this.add.rectangle(640, 360, 1280, 720, C.paper);
      var g = this.add.graphics();
      g.fillStyle(C.floor, 1).fillRoundedRect(30, ROOM.top, 1220, ROOM.bottom - ROOM.top, 18);
      g.lineStyle(3, C.line, 1).strokeRoundedRect(30, ROOM.top, 1220, ROOM.bottom - ROOM.top, 18);
      W.zones.forEach((z, i) => {
        if (i > 0) g.lineStyle(2, C.line, 1).lineBetween(z.x0, ROOM.top + 8, z.x0, ROOM.bottom - 8);
        SYL.text(this, (z.x0 + z.x1) / 2, ROOM.top + 10, z.label.toUpperCase(), 14, C.inkSoft, { fontStyle: 'bold' }).setOrigin(0.5, 0);
        g.fillStyle(C.line, 1).fillCircle(z.wx, WALK_Y, 7);
      });
      // Walking route
      for (var x = 60; x < 1220; x += 24) g.fillStyle(C.line, 1).fillRect(x, WALK_Y - 1, 12, 3);
      // Front door
      g.fillStyle(0xc49a6c, 1).fillRect(30, WALK_Y - 50, 10, 70);

      // Slots
      this.slotViews = {};
      W.slots.forEach((s) => {
        var sg = this.add.graphics();
        if (s.kind === 'hidden') {
          sg.fillStyle(C.hidden, 0.5).fillRoundedRect(s.x - 38, s.y - 38, 76, 76, 10);
          sg.lineStyle(2, C.hidden, 1).strokeRoundedRect(s.x - 38, s.y - 38, 76, 76, 10);
          sg.lineStyle(2, C.hidden, 1).lineBetween(s.x, s.y - 34, s.x, s.y + 34);
        } else {
          sg.lineStyle(2, C.line, 1).strokeRoundedRect(s.x - 38, s.y - 38, 76, 76, 10);
        }
        var lbl = s.label + (s.kind === 'hidden' ? ' (hidden)' : '');
        SYL.text(this, s.x, s.y + 42, lbl, 13, C.inkSoft).setOrigin(0.5, 0);
        this.slotViews[s.id] = sg;
      });
    }

    drawHeader() {
      var L = this.level;
      SYL.text(this, 40, 18, L.title, 40, C.ink, { fontStyle: 'bold' });
      SYL.text(this, 40, 68, L.brief, 18, C.inkSoft);
      if (L.twist) {
        var tw = SYL.text(this, 1240, 22, L.twist.label + ':  ' + L.twist.desc, 18, 0xffffff, {
          backgroundColor: SYL.hex(C.trap), padding: { x: 10, y: 6 }, fontStyle: 'bold',
        }).setOrigin(1, 0);
        this.twistText = tw;
      }
      this.movesText = SYL.text(this, 1240, 66, '', 22, C.ink, { fontStyle: 'bold' }).setOrigin(1, 0);
      this.clockText = SYL.text(this, 1236, ROOM.bottom - 40, '', 26, C.ink, { fontStyle: 'bold' }).setOrigin(1, 0);
      this.setClock((L.twist && L.twist.start) || 18 * 60);
    }

    drawBottomBar() {
      // Goals
      SYL.text(this, 40, 548, 'GOALS', 14, C.inkSoft, { fontStyle: 'bold' });
      this.goalTexts = this.level.goals.map((g, i) => SYL.text(this, 40, 570 + i * 30, '○  ' + g.label, 22, C.ink));

      // Habits
      SYL.text(this, 470, 548, "PIP'S HABITS", 14, C.inkSoft, { fontStyle: 'bold' });
      var rows = [['run', 'Run', C.good], ['eat', 'Dinner', C.good], ['read', 'Read', C.rest], ['scroll', 'Scroll', C.trap], ['snack', 'Snack', C.trap], ['rest', 'Rest', C.rest]];
      rows.forEach((r, i) => {
        var x = 470 + (i % 2) * 190;
        var y = 580 + Math.floor(i / 2) * 32;
        var v = SYL.state.habits[r[0]] || 0;
        SYL.text(this, x, y, r[1], 16, C.ink).setOrigin(0, 0.5);
        this.add.rectangle(x + 62, y, 100, 12, C.line).setOrigin(0, 0.5);
        this.add.rectangle(x + 62, y, 100 * v, 12, r[2]).setOrigin(0, 0.5);
      });

      // Buttons
      this.runBtn = SYL.button(this, 1140, 590, 190, 64, 'Run evening', () => this.startRun(), { size: 24 });
      this.resetBtn = SYL.button(this, 1080, 672, 120, 46, 'Reset', () => this.resetLayout(), { size: 18, fill: 0xe7dfd2 });
      this.speedBtn = SYL.button(this, 1200, 672, 90, 46, SYL.state.speed + '×', () => this.cycleSpeed(), { size: 18, fill: 0xe7dfd2 });
      this.pullBtn = SYL.button(this, 935, 590, 150, 64, 'Pulls (SHIFT)', () => { this.pullToggle = !this.pullToggle; this.updateOverlay(); }, { size: 17, fill: 0xd9e6f7 });

      this.toastText = SYL.text(this, 640, ROOM.top + 40, '', 20, 0xffffff, { backgroundColor: SYL.hex(C.ink), padding: { x: 12, y: 6 } }).setOrigin(0.5).setDepth(50).setAlpha(0);
    }

    createObjects() {
      Object.keys(this.layout).forEach((id) => {
        var o = W.objects[id];
        var c = this.add.container(0, 0).setDepth(10);
        var g = this.add.graphics();
        var col = CAT_COLOR[o.cat];
        g.fillStyle(0x000000, 0.15).fillRoundedRect(-31, -27, 62, 62, 12);
        g.fillStyle(col, 1).fillRoundedRect(-31, -31, 62, 62, 12);
        var t = SYL.text(this, 0, 0, o.label, 12, 0xffffff, { fontStyle: 'bold', align: 'center', wordWrap: { width: 58, useAdvancedWrap: true } }).setOrigin(0.5);
        c.add([g, t]);
        if (this.level.locked.indexOf(id) >= 0) {
          c.add(SYL.text(this, 0, -40, 'LOCKED', 11, C.ink, { fontStyle: 'bold', backgroundColor: SYL.hex(C.accent), padding: { x: 4, y: 1 } }).setOrigin(0.5));
        } else {
          c.setSize(62, 62).setInteractive({ draggable: true, useHandCursor: true });
        }
        c.objId = id;
        this.objViews[id] = c;
        this.placeObject(id, false);
      });
    }

    createPip() {
      var p = this.add.container(W.zones[0].wx - 70, WALK_Y - 6).setDepth(15);
      this.pipBody = this.add.container(0, 0);
      this.pipBody.add(this.add.ellipse(0, 22, 44, 10, 0x000000, 0.12));
      this.pipBody.add(this.add.circle(0, 0, 24, C.pip));
      this.pipEyes = this.add.container(0, 0);
      this.pipEyes.add([this.add.circle(-8, -5, 6, 0xffffff), this.add.circle(8, -5, 6, 0xffffff), this.add.circle(-6, -4, 3, C.ink), this.add.circle(10, -4, 3, C.ink)]);
      this.pipBody.add(this.pipEyes);
      p.add(this.pipBody);
      this.pip = p;
      this.pipLabel = SYL.text(this, 0, 0, '', 16, C.ink, { fontStyle: 'bold', backgroundColor: '#ffffffdd', padding: { x: 8, y: 3 } }).setOrigin(0.5).setDepth(30).setVisible(false);
      this.idleTween = this.tweens.add({ targets: this.pipBody, scaleY: 1.06, scaleX: 0.96, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    }

    // ---------- planning ----------

    setupInput() {
      this.input.on('dragstart', (p, obj) => {
        if (this.mode !== 'plan') return;
        obj.setDepth(40);
        this.tweens.add({ targets: obj, scale: 1.12, duration: 100 });
      });
      this.input.on('drag', (p, obj, x, y) => {
        if (this.mode !== 'plan') return;
        obj.x = x; obj.y = y;
        this.highlightSlot(this.nearestSlot(x, y));
      });
      this.input.on('dragend', (p, obj) => {
        this.highlightSlot(null);
        obj.setDepth(10);
        this.tweens.add({ targets: obj, scale: 1, duration: 100 });
        if (this.mode !== 'plan') { this.placeObject(obj.objId, true); return; }
        this.tryMove(obj.objId, this.nearestSlot(obj.x, obj.y));
      });

      this.shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
      this.shiftKey.on('down', () => this.updateOverlay());
      this.shiftKey.on('up', () => this.updateOverlay());
    }

    nearestSlot(x, y) {
      var best = null, bd = 70;
      W.slots.forEach((s) => {
        var d = Phaser.Math.Distance.Between(x, y, s.x, s.y);
        if (d < bd) { bd = d; best = s.id; }
      });
      return best;
    }

    highlightSlot(id) {
      if (this.hl) this.hl.destroy();
      this.hl = null;
      if (!id) return;
      var s = SYL.sim.slotById[id];
      this.hl = this.add.graphics().setDepth(9);
      this.hl.lineStyle(4, C.accent, 1).strokeRoundedRect(s.x - 40, s.y - 40, 80, 80, 12);
    }

    occupant(slotId) {
      return Object.keys(this.layout).find((o) => this.layout[o] === slotId);
    }

    tryMove(objId, slotId) {
      var from = this.layout[objId];
      if (!slotId || slotId === from) { this.placeObject(objId, true); return; }
      var other = this.occupant(slotId);
      if (other && this.level.locked.indexOf(other) >= 0) {
        this.toast("That one's stuck there.");
        this.placeObject(objId, true);
        return;
      }
      var next = Object.assign({}, this.layout);
      next[objId] = slotId;
      if (other) next[other] = from; // swap
      if (SYL.sim.movesUsed(this.level, next) > this.level.moves) {
        this.toast('Out of moves. Put something back first (or Reset).');
        this.placeObject(objId, true);
        return;
      }
      this.layout = next;
      this.placeObject(objId, true);
      if (other) this.placeObject(other, true);
      this.refresh();
    }

    placeObject(id, animate) {
      var s = SYL.sim.slotById[this.layout[id]];
      var v = this.objViews[id];
      var alpha = s.kind === 'hidden' ? 0.55 : 1;
      if (animate) this.tweens.add({ targets: v, x: s.x, y: s.y, alpha: alpha, duration: 180, ease: 'Back.out' });
      else v.setPosition(s.x, s.y).setAlpha(alpha);
    }

    resetLayout() {
      if (this.mode !== 'plan') return;
      this.layout = Object.assign({}, this.level.layout);
      Object.keys(this.layout).forEach((id) => this.placeObject(id, true));
      this.refresh();
    }

    refresh() {
      var used = SYL.sim.movesUsed(this.level, this.layout);
      this.movesText.setText('Moves: ' + used + ' / ' + this.level.moves);
      this.movesText.setColor(SYL.hex(used >= this.level.moves ? C.trap : C.ink));
      this.updateOverlay();
    }

    toast(msg) {
      this.toastText.setText(msg).setAlpha(1);
      this.tweens.killTweensOf(this.toastText);
      this.tweens.add({ targets: this.toastText, alpha: 0, delay: 1800, duration: 400 });
    }

    showBrief() {
      if (this.level.week === 1 && !SYL.state.seenTutorial) {
        SYL.state.seenTutorial = true;
        this.toast('Drag objects to new spots. Hold SHIFT to see what pulls Pip. Then press Run.');
        this.tweens.killTweensOf(this.toastText);
        this.tweens.add({ targets: this.toastText, alpha: 0, delay: 5000, duration: 600 });
      }
    }

    // ---------- SHIFT view ----------

    updateOverlay() {
      var on = this.pullToggle || (this.shiftKey && this.shiftKey.isDown);
      this.overlay.clear();
      this.overlayTexts.forEach((t) => t.destroy());
      this.overlayTexts = [];
      if (!on) {
        Object.keys(this.objViews).forEach((id) => this.objViews[id].setDepth(10));
        return;
      }
      this.overlay.fillStyle(C.ink, 0.35).fillRoundedRect(30, ROOM.top, 1220, ROOM.bottom - ROOM.top, 18);
      var zoneX = {};
      W.zones.forEach((z) => { zoneX[z.id] = z.wx; });
      var labelled = {};
      SYL.sim.pulls(this.level, this.layout).forEach((p) => {
        var s = SYL.sim.slotById[this.layout[p.obj]];
        var col = CAT_COLOR[W.objects[p.obj].cat];
        var tx = zoneX[p.zone], ty = WALK_Y;
        this.overlay.lineStyle(Math.max(2, p.amount * 2.2), col, 0.9).lineBetween(s.x, s.y, tx, ty);
        this.overlay.fillStyle(col, 1).fillCircle(tx, ty, 9);
        var off = (labelled[p.zone] = (labelled[p.zone] || 0) + 1);
        var t = SYL.text(this, tx, ty - 8 + off * 20, W.actions[p.action].short + ' +' + p.amount.toFixed(1), 14, 0xffffff, {
          backgroundColor: SYL.hex(col), padding: { x: 5, y: 1 }, fontStyle: 'bold',
        }).setOrigin(0.5, 0).setDepth(21);
        this.overlayTexts.push(t);
      });
      Object.keys(this.objViews).forEach((id) => this.objViews[id].setDepth(22));
    }

    // ---------- speed ----------

    applySpeed() {
      this.time.timeScale = SYL.state.speed;
      this.tweens.timeScale = SYL.state.speed;
    }

    cycleSpeed() {
      SYL.state.speed = SYL.state.speed === 1 ? 2 : SYL.state.speed === 2 ? 4 : 1;
      this.speedBtn.setLabel(SYL.state.speed + '×');
      this.applySpeed();
    }

    // ---------- run ----------

    setClock(t) {
      this.clockT = t;
      this.clockText.setText(SYL.sim.fmt(Math.round(t)));
    }

    animateClock(t1, ms) {
      var o = { t: this.clockT };
      return SYL.tween(this, { targets: o, t: t1, duration: ms, onUpdate: () => this.setClock(o.t) });
    }

    say(text, color) {
      this.pipLabel.setText(text).setVisible(true).setPosition(this.pip.x, this.pip.y - 56);
      if (color !== undefined) this.pipLabel.setBackgroundColor(SYL.hex(color)).setColor('#ffffff');
      else this.pipLabel.setBackgroundColor('#ffffffdd').setColor(SYL.hex(C.ink));
    }

    async startRun() {
      if (this.mode !== 'plan') return;
      this.mode = 'run';
      this.pullToggle = false;
      this.updateOverlay();
      this.runBtn.setEnabled(false);
      this.resetBtn.setEnabled(false);
      this.result = SYL.sim.simulate(this.level, this.layout, SYL.state.habits);
      for (var e of this.result.events) await this.playEvent(e);
      await SYL.wait(this, 500);
      this.showResult();
    }

    zoneX(id) { return W.zones.find((z) => z.id === id).wx; }

    async playEvent(e) {
      if (e.type === 'walk') {
        this.pipLabel.setVisible(false);
        var x = this.zoneX(e.to);
        this.pip.scaleX = x >= this.pip.x ? 1 : -1;
        await Promise.all([
          SYL.tween(this, { targets: this.pip, x: x, duration: 650, ease: 'Sine.inOut' }),
          this.animateClock(e.t1, 650),
        ]);
      } else if (e.type === 'idle') {
        this.say('Pottering about…');
        await this.animateClock(e.t1, 700);
      } else if (e.type === 'skip') {
        this.say(e.reason + '…', C.inkSoft);
        await SYL.wait(this, 700);
      } else if (e.type === 'decide') {
        if (this.pip.x < this.zoneX(e.zone) - 1) {
          await SYL.tween(this, { targets: this.pip, x: this.zoneX(e.zone), duration: 500 });
        }
        await this.showDecision(e);
      } else if (e.type === 'act') {
        await this.playAction(e);
      } else if (e.type === 'sleep') {
        this.say('Asleep at ' + SYL.sim.fmt(e.t), C.rest);
        this.idleTween.pause();
        await SYL.tween(this, { targets: this.pipBody, angle: -90, y: 8, duration: 500, ease: 'Back.out' });
        this.zzz = SYL.text(this, this.pip.x + 20, this.pip.y - 40, 'z z z', 22, C.rest, { fontStyle: 'bold' }).setDepth(30);
        this.tweens.add({ targets: this.zzz, y: '-=12', alpha: 0.4, duration: 800, yoyo: true, repeat: -1 });
      }
    }

    async showDecision(e) {
      var opts = e.options.slice(0, 3);
      var maxScore = Math.max.apply(null, opts.map((o) => o.score).concat([1]));
      var bw = 300, rowH = 46, bh = 24 + opts.length * rowH;
      var bx = Phaser.Math.Clamp(this.pip.x, 40 + bw / 2, 1240 - bw / 2);
      var by = this.pip.y - 60 - bh;
      var b = this.add.container(bx, by).setDepth(35).setScale(0.6).setAlpha(0);
      var g = this.add.graphics();
      g.fillStyle(0x000000, 0.18).fillRoundedRect(-bw / 2, 4, bw, bh, 14);
      g.fillStyle(0xffffff, 1).fillRoundedRect(-bw / 2, 0, bw, bh, 14);
      g.fillTriangle(this.pip.x - bx - 10, bh, this.pip.x - bx + 10, bh, this.pip.x - bx, bh + 14);
      b.add(g);
      var rows = [];
      opts.forEach((o, i) => {
        var y = 12 + i * rowH;
        var col = ACTION_COLOR[o.action] || C.inkSoft;
        var name = SYL.text(this, -bw / 2 + 12, y, W.actions[o.action].label, 15, C.ink, { fontStyle: 'bold' });
        var barBg = this.add.rectangle(-bw / 2 + 12, y + 24, bw - 70, 10, C.line).setOrigin(0, 0.5);
        var bar = this.add.rectangle(-bw / 2 + 12, y + 24, 0, 10, col).setOrigin(0, 0.5);
        var val = SYL.text(this, bw / 2 - 12, y + 24, o.score.toFixed(1), 14, C.inkSoft).setOrigin(1, 0.5);
        var why = o.sources.filter((s) => s.amount !== 0).map((s) => s.label + (s.amount > 0 ? ' +' : ' ') + s.amount.toFixed(1)).join(' · ');
        var whyT = SYL.text(this, bw / 2 - 12, y, why, 11, C.inkSoft).setOrigin(1, 0);
        b.add([name, barBg, bar, val, whyT]);
        rows.push({ o: o, bar: bar, name: name, w: (bw - 70) * Math.max(0, o.score) / maxScore });
      });
      await SYL.tween(this, { targets: b, scale: 1, alpha: 1, duration: 200, ease: 'Back.out' });
      await Promise.all(rows.map((r) => SYL.tween(this, { targets: r.bar, width: r.w, duration: 500, ease: 'Cubic.out' })));
      await SYL.wait(this, 450);
      rows.forEach((r) => { if (r.o.action !== e.chosen) r.name.setAlpha(0.4); });
      var win = rows.find((r) => r.o.action === e.chosen);
      if (win) await SYL.tween(this, { targets: win.name, scale: 1.15, duration: 150, yoyo: true });
      await SYL.wait(this, 500);
      await SYL.tween(this, { targets: b, alpha: 0, duration: 150 });
      b.destroy();
    }

    async playAction(e) {
      var a = W.actions[e.action];
      this.say(a.verb + '…', ACTION_COLOR[e.action]);
      var clock = this.animateClock(e.t1, 1200);
      var body = this.pipBody;
      if (e.action === 'run') {
        var home = this.pip.x;
        this.pip.scaleX = -1;
        await SYL.tween(this, { targets: this.pip, x: -40, duration: 450, ease: 'Quad.in' });
        this.pipLabel.setPosition(110, this.pip.y - 56);
        await SYL.wait(this, 300);
        this.pip.scaleX = 1;
        await SYL.tween(this, { targets: this.pip, x: home, duration: 450, ease: 'Quad.out' });
        this.say('Ran! (60 min)', C.good);
      } else if (e.action === 'scroll' || e.action === 'bedscroll') {
        await SYL.tween(this, { targets: body, angle: 12, duration: 200 });
        await SYL.tween(this, { targets: this.pipEyes, y: 5, duration: 600, yoyo: true, repeat: 0 });
        await SYL.tween(this, { targets: body, angle: 0, duration: 200 });
      } else if (e.action === 'rest') {
        await SYL.tween(this, { targets: body, scaleY: 0.6, scaleX: 1.3, y: 10, duration: 400, yoyo: true, hold: 300 });
      } else {
        await SYL.tween(this, { targets: body, y: -14, duration: 160, yoyo: true, repeat: 2 });
      }
      await clock;
      body.y = 0;
      await SYL.wait(this, 200);
    }

    // ---------- result ----------

    showResult() {
      this.mode = 'result';
      var res = this.result;
      var L = this.level;
      res.goals.forEach((g, i) => {
        this.goalTexts[i].setText((g.met ? '✓  ' : '✗  ') + g.label).setColor(SYL.hex(g.met ? C.good : C.trap));
      });
      var met = res.goals.filter((g) => g.met).length;
      var used = SYL.sim.movesUsed(L, this.layout);
      var bonus = res.allMet && used < L.moves ? 1 : 0;
      this.stars = met + bonus;
      this.maxStars = res.goals.length + 1;

      var dim = this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.45).setDepth(60).setInteractive();
      var p = this.add.container(640, 360).setDepth(61);
      var g = this.add.graphics();
      g.fillStyle(C.paper, 1).fillRoundedRect(-330, -250, 660, 500, 20);
      p.add(g);
      p.add(SYL.text(this, 0, -220, L.title + (res.allMet ? ': nailed it' : ': not quite'), 36, C.ink, { fontStyle: 'bold' }).setOrigin(0.5, 0));
      var starStr = '';
      for (var i = 0; i < this.maxStars; i++) starStr += i < this.stars ? '★' : '☆';
      p.add(SYL.text(this, 0, -170, starStr, 40, C.accent).setOrigin(0.5, 0));
      res.goals.forEach((gl, i) => {
        p.add(SYL.text(this, -230, -110 + i * 32, (gl.met ? '✓  ' : '✗  ') + gl.label, 22, gl.met ? C.good : C.trap));
      });
      var by = -110 + res.goals.length * 32 + 6;
      p.add(SYL.text(this, -230, by, (bonus ? '✓  ' : '·  ') + 'Bonus: solved with moves to spare', 18, bonus ? C.good : C.inkSoft));
      p.add(SYL.text(this, -230, by + 28, 'Pip fell asleep at ' + SYL.sim.fmt(res.asleepAt) + '.', 18, C.inkSoft));

      var r = SYL.pickResearch({ res: res, level: L, layout: this.layout });
      p.add(SYL.text(this, 0, 90, r.text, 18, C.ink, { align: 'center', wordWrap: { width: 560 }, fontStyle: 'italic' }).setOrigin(0.5, 0));
      p.add(SYL.text(this, 0, 150, r.src, 13, C.inkSoft).setOrigin(0.5, 0));

      var last = SYL.state.levelIndex >= SYL.LEVELS.length - 1;
      p.add(SYL.button(this, -140, 205, 220, 54, 'Try again', () => this.scene.restart(), { fill: 0xe7dfd2 }));
      p.add(SYL.button(this, 140, 205, 220, 54, last ? 'See how Pip did' : 'Next week', () => this.nextWeek()));
      p.setScale(0.8).setAlpha(0);
      this.tweens.add({ targets: p, scale: 1, alpha: 1, duration: 250, ease: 'Back.out' });
    }

    nextWeek() {
      var st = SYL.state;
      st.habits = SYL.sim.updateHabits(st.habits, this.result.done);
      st.history.push({ week: this.level.week, stars: this.stars, maxStars: this.maxStars, done: this.result.done });
      st.levelIndex++;
      if (st.levelIndex >= SYL.LEVELS.length) this.scene.start('Ending');
      else this.scene.restart();
    }
  };
})();
