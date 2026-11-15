// The main scene: week card -> plan (drag objects) -> run (watch your evening) -> result.
var SYL = (globalThis.SYL = globalThis.SYL || {});

(function () {
  var C = SYL.C;
  var W = SYL.WORLD;
  var ROOM = { top: 104, bottom: 530 };
  var WALK_Y = 470;
  var CAT_COLOR = { good: C.good, trap: C.trap, rest: C.rest };
  var ACTION_COLOR = { run: C.good, eat: C.good, focus: C.good, call: C.good, read: C.rest, rest: C.rest, sleep: C.rest, scroll: C.trap, bedscroll: C.trap, snack: C.trap, carry: C.inkSoft };

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
      SYL.muteButton(this);

      SYL.debug = this; // handy for automated tests
    }

    // ---------- drawing ----------

    drawRoom() {
      this.add.rectangle(640, 360, 1280, 720, C.paper);
      SYL.art.ensureTextures(this);
      this.add.graphics().fillStyle(0x000000, 0.08).fillRoundedRect(34, ROOM.top + 6, 1220, ROOM.bottom - ROOM.top, 10);
      this.apt = SYL.art.drawApartment(this, ROOM);
      var g = this.add.graphics().setDepth(9);
      g.lineStyle(5, C.ink, 0.85).strokeRoundedRect(30, ROOM.top, 1220, ROOM.bottom - ROOM.top, 6);
      W.zones.forEach((z) => {
        SYL.text(this, (z.x0 + z.x1) / 2, ROOM.top + 8, z.label.toUpperCase(), 12, C.inkSoft, {
          fontStyle: 'bold', backgroundColor: '#fffaf2cc', padding: { x: 6, y: 2 },
        }).setOrigin(0.5, 0).setDepth(9);
      });
      // Walking route on the floor
      var r = this.add.graphics().setDepth(3);
      for (var x = 60; x < 1220; x += 24) r.fillStyle(0xffffff, 0.45).fillRoundedRect(x, WALK_Y + 18, 12, 4, 2);
      W.zones.forEach((z) => r.fillStyle(0xffffff, 0.7).fillEllipse(z.wx, WALK_Y + 20, 22, 9));

      // Slots: faint outlines + small name tags
      this.slotViews = {};
      W.slots.forEach((s) => {
        var sg = this.add.graphics().setDepth(3);
        if (s.kind === 'hidden') sg.lineStyle(2, 0xffffff, 0.7).strokeRoundedRect(s.x - 34, s.y - 34, 68, 68, 10);
        else sg.lineStyle(2, C.ink, 0.14).strokeRoundedRect(s.x - 34, s.y - 34, 68, 68, 10);
        var lbl = s.label + (s.kind === 'hidden' ? ' · hidden' : '');
        SYL.text(this, s.x, s.y + 36, lbl, 11, C.inkSoft, { backgroundColor: '#fffaf2cc', padding: { x: 4, y: 1 } }).setOrigin(0.5, 0).setDepth(9);
        this.slotViews[s.id] = sg;
      });
    }

    drawHeader() {
      var L = this.level;
      SYL.text(this, 40, 18, L.title + '  ·  ' + L.topic.name, 40, C.ink, { fontStyle: 'bold' });
      SYL.text(this, 40, 68, L.brief, 18, C.inkSoft);
      if (L.twist) {
        var tw = SYL.text(this, 1240, 22, L.twist.label + ':  ' + L.twist.desc, 18, 0xffffff, {
          backgroundColor: SYL.hex(C.trap), padding: { x: 10, y: 6 }, fontStyle: 'bold',
        }).setOrigin(1, 0);
        this.twistText = tw;
      }
      this.movesText = SYL.text(this, 1240, 66, '', 22, C.ink, { fontStyle: 'bold' }).setOrigin(1, 0);
      this.clockText = SYL.text(this, 1236, ROOM.bottom - 46, '', 24, C.ink, { fontStyle: 'bold', backgroundColor: '#fffaf2', padding: { x: 10, y: 4 } }).setOrigin(1, 0).setDepth(9);
      this.setClock((L.twist && L.twist.start) || 18 * 60);
    }

    drawBottomBar() {
      // Goals
      SYL.text(this, 40, 548, 'GOALS', 14, C.inkSoft, { fontStyle: 'bold' });
      this.goalTexts = this.level.goals.map((g, i) => SYL.text(this, 40, 570 + i * 30, '○  ' + g.label, 22, C.ink));

      // Habits
      SYL.text(this, 470, 548, 'YOUR HABITS', 14, C.inkSoft, { fontStyle: 'bold' });
      var rows = SYL.HABIT_ROWS;
      rows.forEach((r, i) => {
        var x = 470 + (i % 2) * 190;
        var y = 576 + Math.floor(i / 2) * 26;
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
        var halo = this.add.ellipse(0, 27, 52, 12, CAT_COLOR[o.cat], 0.45);
        var img = this.add.image(0, 0, 'icon_' + id);
        c.add([halo, img]);
        if (this.level.locked.indexOf(id) >= 0) {
          c.add(SYL.text(this, 0, -40, 'LOCKED', 11, C.ink, { fontStyle: 'bold', backgroundColor: SYL.hex(C.accent), padding: { x: 4, y: 1 } }).setOrigin(0.5));
        } else {
          c.setSize(64, 64).setInteractive({ draggable: true, useHandCursor: true });
        }
        c.on('pointerover', () => this.showTip(id));
        c.on('pointerout', () => this.hideTip());
        c.objId = id;
        this.objViews[id] = c;
        this.placeObject(id, false);
      });
    }

    createPip() {
      this.pipArt = SYL.art.makeHero(this, W.zones[0].wx - 70, WALK_Y - 6, 24);
      this.pip = this.pipArt.root.setDepth(15);
      this.pipBody = this.pipArt.body;
      this.pipEyes = this.pipArt.eyes;
      this.pipLabel = SYL.text(this, 0, 0, '', 16, C.ink, { fontStyle: 'bold', backgroundColor: '#ffffffdd', padding: { x: 8, y: 3 } }).setOrigin(0.5).setDepth(30).setVisible(false);
      this.idleTween = this.tweens.add({ targets: this.pipBody, scaleY: 1.06, scaleX: 0.96, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      this.tipText = SYL.text(this, 0, 0, '', 14, 0xffffff, { fontStyle: 'bold', backgroundColor: SYL.hex(C.ink), padding: { x: 7, y: 3 } }).setOrigin(0.5, 1).setDepth(45).setVisible(false);
    }

    showTip(id) {
      if (this.mode !== 'plan' || this.dragging) return;
      var v = this.objViews[id];
      var o = W.objects[id];
      var what = { good: 'healthy pull', trap: 'temptation', rest: 'restful' }[o.cat];
      this.tipText.setText(o.label + '  ·  ' + what).setPosition(v.x, v.y - 38).setVisible(true);
    }

    hideTip() { this.tipText.setVisible(false); }

    puff(x, y, tint) {
      for (var i = 0; i < 6; i++) {
        var a = Math.PI + (i / 5) * Math.PI;
        var p = this.add.image(x, y, 'puff').setDepth(11).setTint(tint || 0xffffff).setAlpha(0.9).setScale(0.35);
        this.tweens.add({ targets: p, x: x + Math.cos(a) * 30, y: y + Math.sin(a) * 10 - 4, scale: 0.8, alpha: 0, duration: 380, ease: 'Quad.out', onComplete: (tw, targets) => targets[0].destroy() });
      }
    }

    // ---------- planning ----------

    setupInput() {
      this.input.on('dragstart', (p, obj) => {
        if (this.mode !== 'plan') return;
        obj.setDepth(40);
        this.dragging = true;
        this.hideTip();
        SYL.audio.play('pickup');
        this.tweens.add({ targets: obj, scale: 1.15, alpha: 1, angle: -6, duration: 100 });
        this.showSlotHints(true);
      });
      this.input.on('drag', (p, obj, x, y) => {
        if (this.mode !== 'plan') return;
        obj.x = x; obj.y = y;
        this.highlightSlot(this.nearestSlot(x, y));
      });
      this.input.on('dragend', (p, obj) => {
        this.highlightSlot(null);
        this.showSlotHints(false);
        this.dragging = false;
        obj.setDepth(10);
        obj.angle = 0;
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

    showSlotHints(on) {
      if (this.hints) { this.hints.destroy(); this.hints = null; }
      if (!on) return;
      this.hints = this.add.graphics().setDepth(9);
      W.slots.forEach((s) => this.hints.lineStyle(2, C.accent, 0.8).strokeRoundedRect(s.x - 34, s.y - 34, 68, 68, 10));
    }

    highlightSlot(id) {
      if (this.hl) this.hl.destroy();
      this.hl = null;
      if (!id) return;
      var s = SYL.sim.slotById[id];
      this.hl = this.add.graphics().setDepth(9);
      this.hl.fillStyle(C.accent, 0.25).fillRoundedRect(s.x - 36, s.y - 36, 72, 72, 12);
      this.hl.lineStyle(4, C.accent, 1).strokeRoundedRect(s.x - 36, s.y - 36, 72, 72, 12);
    }

    occupant(slotId) {
      return Object.keys(this.layout).find((o) => this.layout[o] === slotId);
    }

    tryMove(objId, slotId) {
      var from = this.layout[objId];
      if (!slotId || slotId === from) { SYL.audio.play('drop'); this.placeObject(objId, true); return; }
      var other = this.occupant(slotId);
      if (!SYL.sim.allowed(objId, slotId) || (other && !SYL.sim.allowed(other, from))) {
        SYL.audio.play('deny');
        this.toast("That doesn't really go there.");
        this.placeObject(objId, true);
        return;
      }
      if (other && this.level.locked.indexOf(other) >= 0) {
        SYL.audio.play('deny');
        this.toast("That one's stuck there.");
        this.placeObject(objId, true);
        return;
      }
      var next = Object.assign({}, this.layout);
      next[objId] = slotId;
      if (other) next[other] = from; // swap
      if (SYL.sim.movesUsed(this.level, next) > this.level.moves) {
        SYL.audio.play('deny');
        this.toast('Out of moves. Put something back first (or Reset).');
        this.placeObject(objId, true);
        return;
      }
      this.layout = next;
      SYL.audio.play(other ? 'swap' : SYL.sim.slotById[slotId].kind === 'hidden' ? 'hidden' : 'drop');
      this.placeObject(objId, true);
      if (other) this.placeObject(other, true);
      var ss = SYL.sim.slotById[slotId];
      this.time.delayedCall(140, () => this.puff(ss.x, ss.y + 30));
      this.refresh();
    }

    placeObject(id, animate) {
      var s = SYL.sim.slotById[this.layout[id]];
      var v = this.objViews[id];
      var hid = s.kind === 'hidden';
      var alpha = hid ? 0.45 : 1, scale = hid ? 0.8 : 1;
      if (animate) this.tweens.add({ targets: v, x: s.x, y: s.y, alpha: alpha, scale: scale, duration: 180, ease: 'Back.out' });
      else v.setPosition(s.x, s.y).setAlpha(alpha).setScale(scale);
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

    // The week card: which shift this is, what it's about, and the goals.
    showBrief() {
      var L = this.level;
      SYL.state.briefSeen = SYL.state.briefSeen || {};
      if (SYL.state.briefSeen[L.id]) return; // not again on retry
      SYL.state.briefSeen[L.id] = true;
      this.mode = 'brief';
      var dim = this.add.rectangle(640, 360, 1280, 720, 0x1b1e3a, 0.55).setDepth(60).setInteractive();
      var p = this.add.container(640, 360).setDepth(61);
      var g = this.add.graphics();
      g.fillStyle(0x000000, 0.2).fillRoundedRect(-380, -262, 760, 530, 22);
      g.fillStyle(C.paper, 1).fillRoundedRect(-380, -270, 760, 530, 22);
      g.fillStyle(C.accent, 1).fillRoundedRect(-380, -270, 760, 64, { tl: 22, tr: 22, bl: 0, br: 0 });
      p.add(g);
      p.add(SYL.text(this, 0, -238, 'SHIFT ' + L.week + ' OF ' + SYL.LEVELS.length, 24, C.ink, { fontStyle: 'bold' }).setOrigin(0.5));
      p.add(this.add.image(-250, -130, 'icon_' + L.topic.icon).setScale(1.5));
      p.add(SYL.text(this, -170, -165, L.title, 20, C.inkSoft, { fontStyle: 'bold' }));
      p.add(SYL.text(this, -170, -140, L.topic.name, 48, C.ink, { fontStyle: 'bold' }));
      p.add(SYL.text(this, -330, -70, L.brief, 20, C.ink, { wordWrap: { width: 660 } }));
      var y = -10;
      if (L.twist) {
        p.add(SYL.text(this, -330, y, L.twist.label + ':  ' + L.twist.desc, 16, 0xffffff, { backgroundColor: SYL.hex(C.trap), padding: { x: 8, y: 4 }, fontStyle: 'bold' }));
        y += 40;
      }
      p.add(SYL.text(this, -330, y, 'TONIGHT\'S GOALS', 14, C.inkSoft, { fontStyle: 'bold' }));
      L.goals.forEach((gl, i) => p.add(SYL.text(this, -330, y + 22 + i * 28, '○  ' + gl.label, 20, C.ink)));
      var gy = y + 22 + L.goals.length * 28 + 10;
      var how = L.week === 1
        ? 'You can only move ' + L.moves + ' things. Drag them to new spots, hold SHIFT to see what pulls you, then press Run evening.'
        : 'You can move ' + L.moves + ' things. The habits you built last week come with you.';
      p.add(SYL.text(this, -330, gy, how, 17, C.inkSoft, { wordWrap: { width: 660 }, fontStyle: 'italic' }));
      var close = () => {
        if (this.mode !== 'brief') return;
        this.mode = 'plan';
        this.tweens.add({ targets: [p, dim], alpha: 0, duration: 200, onComplete: () => { p.destroy(); dim.destroy(); } });
      };
      p.add(SYL.button(this, 0, 222, 240, 56, 'Time to shift', close));
      this.input.keyboard.once('keydown-ENTER', close);
      p.setScale(0.85).setAlpha(0);
      this.tweens.add({ targets: p, scale: 1, alpha: 1, duration: 260, ease: 'Back.out' });
    }

    // ---------- SHIFT view ----------

    updateOverlay() {
      var on = !!(this.pullToggle || (this.shiftKey && this.shiftKey.isDown));
      if (this.overlayOn !== undefined && on !== this.overlayOn) SYL.audio.play(on ? 'shiftOn' : 'shiftOff');
      this.overlayOn = on;
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
        var t = SYL.text(this, tx, ty - 14 - (off - 1) * 21, W.actions[p.action].short + ' +' + p.amount.toFixed(1), 14, 0xffffff, {
          backgroundColor: SYL.hex(col), padding: { x: 5, y: 1 }, fontStyle: 'bold',
        }).setOrigin(0.5, 1).setDepth(21);
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
      if (this.apt) this.apt.setTime(t);
    }

    animateClock(t1, ms) {
      var o = { t: this.clockT };
      return SYL.tween(this, { targets: o, t: t1, duration: ms, onUpdate: () => this.setClock(o.t) });
    }

    say(text, color) {
      this.pipLabel.setText(text).setVisible(true).setPosition(this.pip.x, this.pip.y + this.pipArt.top - 18);
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
        [0, 200, 400].forEach((ms) => this.time.delayedCall(ms, () => SYL.audio.play('step')));
        this.pipArt.look(this.pip.scaleX, 0);
        this.tweens.add({ targets: this.pipBody, y: -7, duration: 108, yoyo: true, repeat: 2, ease: 'Quad.out' });
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
        this.pipBody.setScale(1);
        SYL.audio.play('sleep');
        this.pip.list[0].setVisible(false); // floor shadow
        await SYL.tween(this, { targets: this.pip, x: this.apt.bedX, y: this.apt.bedY, duration: 500, ease: 'Quad.out' });
        this.pipArt.mood('sleep').look(0, 0);
        await SYL.tween(this, { targets: this.pipBody, angle: -80, duration: 400, ease: 'Back.out' });
        this.pipLabel.setPosition(this.pip.x, this.pip.y - 50);
        this.zzz = SYL.text(this, this.pip.x + 26, this.pip.y - 44, 'z z z', 22, C.rest, { fontStyle: 'bold' }).setDepth(30);
        this.tweens.add({ targets: this.zzz, y: '-=12', alpha: 0.4, duration: 800, yoyo: true, repeat: -1 });
      }
    }

    async showDecision(e) {
      var opts = e.options.slice(0, 3);
      var maxScore = Math.max.apply(null, opts.map((o) => o.score).concat([1]));
      var bw = 300, rowH = 46, bh = 24 + opts.length * rowH;
      var bx = Phaser.Math.Clamp(this.pip.x, 40 + bw / 2, 1240 - bw / 2);
      var by = this.pip.y + this.pipArt.top - 24 - bh;
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
        var topSrc = o.sources.filter((s) => s.kind === 'object').sort((a2, b2) => b2.amount - a2.amount)[0];
        if (topSrc) b.add(this.add.image(-bw / 2 + 22, y + 9, 'icon_' + topSrc.obj).setScale(0.36));
        var name = SYL.text(this, -bw / 2 + (topSrc ? 40 : 12), y, W.actions[o.action].label, 15, C.ink, { fontStyle: 'bold' });
        var barBg = this.add.rectangle(-bw / 2 + 12, y + 24, bw - 70, 10, C.line).setOrigin(0, 0.5);
        var bar = this.add.rectangle(-bw / 2 + 12, y + 24, 0, 10, col).setOrigin(0, 0.5);
        var val = SYL.text(this, bw / 2 - 12, y + 24, o.score.toFixed(1), 14, C.inkSoft).setOrigin(1, 0.5);
        var why = o.sources.filter((s) => s.amount !== 0).map((s) => s.label + (s.amount > 0 ? ' +' : ' ') + s.amount.toFixed(1)).join(' · ');
        var whyT = SYL.text(this, bw / 2 - 12, y, why, 11, C.inkSoft).setOrigin(1, 0);
        b.add([name, barBg, bar, val, whyT]);
        rows.push({ o: o, bar: bar, name: name, w: (bw - 70) * Math.max(0, o.score) / maxScore });
      });
      SYL.audio.play('think');
      var top = e.options[0].sources.filter((s) => s.kind === 'object').sort((a, b) => b.amount - a.amount)[0];
      if (top) {
        var sx = SYL.sim.slotById[this.layout[top.obj]].x;
        this.pipArt.look(Phaser.Math.Clamp((sx - this.pip.x) / 120, -1, 1) * this.pip.scaleX, -0.6);
      }
      await SYL.tween(this, { targets: b, scale: 1, alpha: 1, duration: 200, ease: 'Back.out' });
      rows.forEach((r, i) => this.time.delayedCall(i * 90, () => SYL.audio.play('bar', i)));
      await Promise.all(rows.map((r) => SYL.tween(this, { targets: r.bar, width: r.w, duration: 500, ease: 'Cubic.out' })));
      await SYL.wait(this, 450);
      rows.forEach((r) => { if (r.o.action !== e.chosen) r.name.setAlpha(0.4); });
      var win = rows.find((r) => r.o.action === e.chosen);
      var goodPick = ['run', 'eat', 'focus', 'call', 'read', 'rest', 'sleep'].indexOf(e.chosen) >= 0;
      if (e.chosen !== 'carry') {
        SYL.audio.play('choose', goodPick);
        this.pipArt.mood(goodPick ? 'happy' : 'o');
        if (!goodPick) this.cameras.main.shake(160, 0.004);
      }
      if (win) await SYL.tween(this, { targets: win.name, scale: 1.15, duration: 150, yoyo: true });
      await SYL.wait(this, 500);
      await SYL.tween(this, { targets: b, alpha: 0, duration: 150 });
      b.destroy();
      this.pipArt.look(0, 0);
    }

    async playAction(e) {
      var a = W.actions[e.action];
      this.say(a.verb + '…', ACTION_COLOR[e.action]);
      SYL.audio.play(e.action === 'bedscroll' ? 'scroll' : e.action);
      var clock = this.animateClock(e.t1, 1200);
      var body = this.pipBody;
      var P = this.pipArt;
      var prop = null, glow = null;
      var holding = (icon) => {
        prop = this.add.image(this.pip.x + 18 * this.pip.scaleX, this.pip.y + 8, 'icon_' + icon).setScale(0.42).setDepth(16);
      };
      if (e.action === 'run') {
        var home = this.pip.x;
        P.mood('happy').look(-1, 0);
        this.pip.scaleX = -1;
        this.tweens.add({ targets: this.apt.door, scaleX: 0.15, duration: 200 });
        await SYL.tween(this, { targets: this.pip, x: -40, duration: 450, ease: 'Quad.in' });
        this.tweens.add({ targets: this.apt.door, scaleX: 1, duration: 200 });
        this.pipLabel.setPosition(140, this.pip.y + this.pipArt.top - 18);
        await SYL.wait(this, 300);
        this.tweens.add({ targets: this.apt.door, scaleX: 0.15, duration: 150 });
        this.pip.scaleX = 1;
        P.look(1, 0);
        await SYL.tween(this, { targets: this.pip, x: home, duration: 450, ease: 'Quad.out' });
        this.tweens.add({ targets: this.apt.door, scaleX: 1, duration: 200 });
        this.puff(this.pip.x, this.pip.y + 22);
        this.say('Ran! (60 min)', C.good);
        await SYL.tween(this, { targets: body, y: -18, duration: 160, yoyo: true, repeat: 1, ease: 'Quad.out' });
      } else if (e.action === 'scroll' || e.action === 'bedscroll') {
        holding('phone');
        glow = this.add.ellipse(this.pip.x + 6 * this.pip.scaleX, this.pip.y, 54, 46, 0x8fd8ff, 0.35).setDepth(16).setBlendMode(Phaser.BlendModes.ADD);
        P.mood('neutral').look(0.6 * this.pip.scaleX, 1);
        await SYL.tween(this, { targets: body, angle: 10 * this.pip.scaleX, duration: 200 });
        this.tweens.add({ targets: glow, alpha: 0.15, duration: 180, yoyo: true, repeat: 4 });
        await SYL.wait(this, 700);
        P.mood('tired');
        await SYL.tween(this, { targets: body, angle: 0, duration: 200 });
      } else if (e.action === 'snack') {
        holding('snacks');
        for (var i = 0; i < 3; i++) {
          P.mood('o');
          await SYL.wait(this, 140);
          P.mood('neutral');
          this.puff(this.pip.x, this.pip.y + 10, 0xc98a4b);
          await SYL.wait(this, 140);
        }
        P.mood('sad');
      } else if (e.action === 'eat') {
        holding('meal');
        P.mood('content');
        await SYL.tween(this, { targets: body, y: -8, duration: 200, yoyo: true, repeat: 2 });
        P.mood('happy');
      } else if (e.action === 'rest') {
        P.mood('tired');
        await SYL.tween(this, { targets: body, scaleY: 0.86, scaleX: 1.08, y: 6, angle: -6, duration: 400, yoyo: true, hold: 500 });
        P.mood('content');
      } else if (e.action === 'focus') {
        holding('laptop');
        P.mood('content').look(0.5 * this.pip.scaleX, 0.6);
        await SYL.tween(this, { targets: body, y: -3, duration: 120, yoyo: true, repeat: 5 });
        P.mood('happy');
      } else if (e.action === 'call') {
        holding('phone');
        P.mood('happy');
        await SYL.tween(this, { targets: body, angle: 6 * this.pip.scaleX, duration: 300, yoyo: true, repeat: 1 });
        this.puff(this.pip.x, this.pip.y - 40, 0xff9fae);
      } else if (e.action === 'read') {
        holding('book');
        P.mood('content').look(0.5 * this.pip.scaleX, 0.8);
        await SYL.wait(this, 900);
        P.mood('happy');
      } else {
        await SYL.tween(this, { targets: body, y: -14, duration: 160, yoyo: true, repeat: 2 });
      }
      await clock;
      if (prop) prop.destroy();
      if (glow) glow.destroy();
      P.look(0, 0);
      body.y = 0;
      body.setScale(1);
      body.angle = 0;
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
      this.stars = res.goals.filter((g) => g.met).length;
      this.maxStars = res.goals.length;

      this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.45).setDepth(60).setInteractive();
      var p = this.add.container(640, 360).setDepth(61);
      var g = this.add.graphics();
      g.fillStyle(C.paper, 1).fillRoundedRect(-460, -290, 920, 580, 20);
      // "Try this in your life" panel
      g.fillStyle(0xe3f1e8, 1).fillRoundedRect(-10, -200, 450, 330, 16);
      g.lineStyle(3, C.good, 1).strokeRoundedRect(-10, -200, 450, 330, 16);
      p.add(g);
      p.add(SYL.text(this, 0, -262, L.title + ' · ' + L.topic.name + (res.allMet ? ': nailed it' : ': not quite'), 34, C.ink, { fontStyle: 'bold' }).setOrigin(0.5, 0));

      // Left: what happened tonight
      var starStr = '';
      for (var i = 0; i < this.maxStars; i++) starStr += i < this.stars ? '★' : '☆';
      p.add(SYL.text(this, -430, -200, starStr, 34, C.accent));
      res.goals.forEach((gl, i) => {
        p.add(SYL.text(this, -430, -145 + i * 32, (gl.met ? '✓  ' : '✗  ') + gl.label, 21, gl.met ? C.good : C.trap));
      });
      var by = -145 + res.goals.length * 32 + 8;
      p.add(SYL.text(this, -430, by, 'You fell asleep at ' + SYL.sim.fmt(res.asleepAt) + '.', 17, C.inkSoft));
      // Weekly weigh-in: this evening, every evening this week
      var kg0 = SYL.currentKg();
      this.healthWeek = SYL.health.week(res, kg0);
      var dk = this.healthWeek.dKg;
      var kgCol = dk < 0 ? C.good : dk > 0 ? C.trap : C.inkSoft;
      p.add(SYL.text(this, -430, by + 26, 'Weigh-in: ' + (kg0 + dk).toFixed(1) + ' kg  (' + (dk > 0 ? '+' : '') + dk.toFixed(1) + ' this week)', 19, kgCol, { fontStyle: 'bold' }));
      var hw = this.healthWeek;
      var why = (hw.helped.length ? 'Helped: ' + hw.helped.join(', ') : 'Nothing helped yet') + (hw.hurt.length ? '.  Held back by: ' + hw.hurt.join(', ') : '') + '.';
      p.add(SYL.text(this, -430, by + 52, why, 14, C.inkSoft, { wordWrap: { width: 400 } }));
      by += 76;
      var r = SYL.pickResearch({ res: res, level: L, layout: this.layout });
      p.add(SYL.text(this, -430, by + 36, 'TONIGHT', 12, C.inkSoft, { fontStyle: 'bold' }));
      p.add(SYL.text(this, -430, by + 54, r.text, 15, C.ink, { wordWrap: { width: 390 }, fontStyle: 'italic' }));
      p.add(SYL.text(this, -430, by + 54 + 64, r.src, 12, C.inkSoft));

      // Right: the real-life takeaway
      p.add(this.add.image(390, -160, 'icon_' + L.topic.icon).setScale(0.7));
      p.add(SYL.text(this, 14, -182, 'TRY THIS IN YOUR LIFE', 15, C.good, { fontStyle: 'bold' }));
      p.add(SYL.text(this, 14, -150, L.tip.do, 20, C.ink, { fontStyle: 'bold', wordWrap: { width: 405 } }));
      p.add(SYL.text(this, 14, -40, L.tip.why, 16, C.ink, { wordWrap: { width: 405 } }));
      p.add(SYL.text(this, 14, 100, L.tip.src, 12, C.inkSoft, { wordWrap: { width: 405 } }));

      var last = SYL.state.levelIndex >= SYL.LEVELS.length - 1;
      p.add(SYL.button(this, -150, 225, 240, 56, 'Try again', () => { SYL.audio.duck(false); this.scene.restart(); }, { fill: 0xe7dfd2 }));
      p.add(SYL.button(this, 150, 225, 240, 56, last ? 'Back to Dr Reyes' : 'Next week', () => this.nextWeek()));
      p.setScale(0.8).setAlpha(0);
      this.tweens.add({ targets: p, scale: 1, alpha: 1, duration: 250, ease: 'Back.out' });
      SYL.audio.duck(true);
      SYL.audio.play(res.allMet ? 'win' : 'fail');
      for (var si = 0; si < this.stars; si++) ((k) => this.time.delayedCall(700 + k * 160, () => SYL.audio.play('star', k)))(si);
    }

    nextWeek() {
      SYL.audio.duck(false);
      var st = SYL.state;
      st.habits = SYL.sim.updateHabits(st.habits, this.result.done);
      st.healthWeeks.push(this.healthWeek);
      st.history.push({ week: this.level.week, level: this.level, met: this.result.allMet, stars: this.stars, maxStars: this.maxStars, done: this.result.done });
      st.levelIndex++;
      if (st.levelIndex >= SYL.LEVELS.length) this.scene.start('Ending');
      else this.scene.restart();
    }
  };
})();
