// Sound effects and a music loop, all synthesised with the Web Audio API.
// No audio files, so nothing to license. Browsers only allow sound after a
// click or key press, so the context starts on the first input.
var SYL = (globalThis.SYL = globalThis.SYL || {});

(function () {
  var ctx = null, master = null, sfxBus = null, musicBus = null;
  var muted = false;
  try { muted = localStorage.getItem('syl_muted') === '1'; } catch (e) {}

  function init() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
    var AC = globalThis.AudioContext || globalThis.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = muted ? 0 : 0.8;
    master.connect(ctx.destination);
    sfxBus = ctx.createGain(); sfxBus.gain.value = 0.55; sfxBus.connect(master);
    musicBus = ctx.createGain(); musicBus.gain.value = 0.22; musicBus.connect(master);
    if (wantMusic) startMusic();
  }
  if (globalThis.addEventListener) {
    ['pointerdown', 'keydown', 'touchstart'].forEach(function (ev) {
      globalThis.addEventListener(ev, init, { passive: true });
    });
  }

  function midi(n) { return 440 * Math.pow(2, (n - 69) / 12); }

  // One synth voice: oscillator -> optional lowpass -> envelope.
  // o: { f, f2 (glide to), type, t (offset s), a, d (decay s), v (volume), lp (filter Hz), bus }
  function tone(o) {
    if (!ctx || muted) return;
    var t0 = ctx.currentTime + (o.t || 0);
    var osc = ctx.createOscillator();
    var g = ctx.createGain();
    osc.type = o.type || 'triangle';
    osc.frequency.setValueAtTime(o.f, t0);
    if (o.f2) osc.frequency.exponentialRampToValueAtTime(o.f2, t0 + (o.glide || o.d));
    var a = o.a || 0.005, d = o.d || 0.2, v = o.v === undefined ? 0.5 : o.v;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(v, t0 + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + d);
    var node = osc;
    if (o.lp) {
      var f = ctx.createBiquadFilter();
      f.type = 'lowpass'; f.frequency.value = o.lp;
      osc.connect(f); node = f;
    }
    node.connect(g);
    g.connect(o.bus || sfxBus);
    osc.start(t0);
    osc.stop(t0 + a + d + 0.05);
  }

  // Filtered noise burst (crunch, whoosh, rustle).
  function noise(o) {
    if (!ctx || muted) return;
    var t0 = ctx.currentTime + (o.t || 0);
    var len = Math.ceil(ctx.sampleRate * (o.d + 0.05));
    var buf = ctx.createBuffer(1, len, ctx.sampleRate);
    var data = buf.getChannelData(0);
    for (var i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    var src = ctx.createBufferSource();
    src.buffer = buf;
    var f = ctx.createBiquadFilter();
    f.type = o.ftype || 'bandpass';
    f.frequency.setValueAtTime(o.f, t0);
    if (o.f2) f.frequency.exponentialRampToValueAtTime(o.f2, t0 + o.d);
    f.Q.value = o.q || 1;
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(o.v || 0.4, t0 + (o.a || 0.01));
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + (o.a || 0.01) + o.d);
    src.connect(f); f.connect(g); g.connect(sfxBus);
    src.start(t0); src.stop(t0 + o.d + 0.1);
  }

  function arp(notes, step, o) {
    notes.forEach(function (n, i) { tone(Object.assign({ f: midi(n), t: i * step }, o)); });
  }

  var SFX = {
    click: function () { tone({ f: 660, type: 'sine', d: 0.06, v: 0.3 }); },
    pickup: function () { tone({ f: 380, f2: 620, type: 'sine', d: 0.09, v: 0.35 }); },
    drop: function () { tone({ f: 520, f2: 300, type: 'triangle', d: 0.1, v: 0.4 }); noise({ f: 900, d: 0.04, v: 0.12 }); },
    hidden: function () { tone({ f: 300, f2: 180, type: 'sine', d: 0.16, v: 0.35, lp: 900 }); },
    swap: function () { tone({ f: 440, f2: 660, type: 'sine', d: 0.07, v: 0.3 }); tone({ f: 660, f2: 440, type: 'sine', d: 0.07, v: 0.3, t: 0.07 }); },
    deny: function () { tone({ f: 200, type: 'square', d: 0.08, v: 0.15, lp: 1200 }); tone({ f: 160, type: 'square', d: 0.12, v: 0.15, lp: 1200, t: 0.09 }); },
    shiftOn: function () { tone({ f: 220, f2: 440, type: 'sine', d: 0.18, v: 0.25, glide: 0.15 }); },
    shiftOff: function () { tone({ f: 440, f2: 220, type: 'sine', d: 0.14, v: 0.18, glide: 0.12 }); },
    step: function () { tone({ f: 140 + Math.random() * 30, type: 'sine', d: 0.05, v: 0.18, lp: 600 }); },
    think: function () { arp([72, 76], 0.06, { type: 'sine', d: 0.12, v: 0.2 }); },
    bar: function (i) { tone({ f: midi(67 + i * 4), type: 'triangle', d: 0.08, v: 0.15 }); },
    choose: function (good) {
      if (good) arp([72, 79], 0.07, { type: 'triangle', d: 0.2, v: 0.3 });
      else arp([67, 63], 0.09, { type: 'triangle', d: 0.22, v: 0.28 });
    },
    // Per-action stings
    run: function () { noise({ f: 400, f2: 2500, d: 0.35, v: 0.25, q: 0.7 }); arp([67, 71, 74, 79], 0.05, { type: 'triangle', d: 0.1, v: 0.2, t: 0.1 }); },
    scroll: function () { for (var i = 0; i < 4; i++) tone({ f: 1200 + i * 90, type: 'sine', d: 0.03, v: 0.12, t: i * 0.11 }); },
    snack: function () { for (var i = 0; i < 3; i++) noise({ f: 2500, d: 0.05, v: 0.3, q: 2, t: i * 0.13 }); },
    eat: function () { arp([64, 67, 72], 0.08, { type: 'sine', d: 0.2, v: 0.25 }); },
    rest: function () { tone({ f: 330, f2: 196, type: 'sine', d: 0.6, v: 0.25, glide: 0.5 }); noise({ f: 500, ftype: 'lowpass', d: 0.5, v: 0.08, a: 0.2 }); },
    read: function () { noise({ f: 3000, d: 0.12, v: 0.15, q: 0.8 }); noise({ f: 2600, d: 0.12, v: 0.12, q: 0.8, t: 0.25 }); },
    sleep: function () { arp([76, 72, 67, 60], 0.18, { type: 'sine', d: 0.5, v: 0.22 }); },
    goal: function (met) { if (met) tone({ f: midi(84), type: 'sine', d: 0.15, v: 0.25 }); else tone({ f: midi(55), type: 'triangle', d: 0.2, v: 0.2 }); },
    win: function () { arp([60, 64, 67, 72, 76], 0.09, { type: 'triangle', d: 0.35, v: 0.3 }); tone({ f: midi(84), type: 'sine', t: 0.5, d: 0.8, v: 0.2 }); },
    fail: function () { arp([67, 65, 62, 60], 0.14, { type: 'triangle', d: 0.35, v: 0.25, lp: 2000 }); },
    star: function (i) { tone({ f: midi(79 + i * 2), type: 'sine', d: 0.25, v: 0.25 }); },
  };

  // ---------- Music: a slow, warm loop, generated note by note ----------
  // I - vi - IV - V style progression in F, soft triangle pad + pluck melody.
  var BPM = 84;
  var CHORDS = [
    [53, 57, 60, 64], // Fmaj7
    [50, 53, 57, 60], // Dm7
    [46, 50, 53, 57], // Bbmaj7
    [48, 52, 55, 58], // C7
  ];
  // Melody per bar, in eighth-note steps (null = rest). Gentle, a bit wistful.
  var MELODY = [
    [72, null, 69, null, 67, 69, null, null],
    [69, null, 65, null, 62, null, 65, null],
    [65, null, 67, 69, null, 70, 69, null],
    [67, null, null, 64, 67, null, 72, null],
  ];
  var wantMusic = false, timer = null, nextTime = 0, step = 0;

  function scheduleStep(s, t) {
    var bar = Math.floor(s / 8) % 4;
    var e = s % 8;
    var chord = CHORDS[bar];
    var eighth = 60 / BPM / 2;
    if (e === 0) {
      // Pad: whole bar
      chord.forEach(function (n) { voice(midi(n), t, eighth * 8, 0.06, 'triangle', 1400); });
      voice(midi(chord[0] - 12), t, eighth * 7, 0.12, 'sine', 600); // bass
    }
    if (e === 4) voice(midi(chord[0] - 12 + 7), t, eighth * 3, 0.08, 'sine', 600);
    var m = MELODY[bar][e];
    // Every other pass the melody rests, so the loop breathes.
    if (m !== null && Math.floor(s / 32) % 2 === 0) voice(midi(m), t, eighth * 1.6, 0.09, 'sine', 3000);
    // Soft hat
    if (e % 2 === 1) hat(t);
  }

  function voice(f, t, d, v, type, lp) {
    var osc = ctx.createOscillator(), g = ctx.createGain(), fl = ctx.createBiquadFilter();
    osc.type = type; osc.frequency.value = f;
    fl.type = 'lowpass'; fl.frequency.value = lp;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(v, t + Math.min(0.08, d * 0.2));
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    osc.connect(fl); fl.connect(g); g.connect(musicBus);
    osc.start(t); osc.stop(t + d + 0.05);
  }

  var hatBuf = null;
  function hat(t) {
    if (!hatBuf) {
      hatBuf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * 0.05), ctx.sampleRate);
      var d = hatBuf.getChannelData(0);
      for (var i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
    }
    var src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    src.buffer = hatBuf; f.type = 'highpass'; f.frequency.value = 7000; g.gain.value = 0.05;
    src.connect(f); f.connect(g); g.connect(musicBus);
    src.start(t);
  }

  function startMusic() {
    wantMusic = true;
    if (!ctx || timer) return;
    nextTime = ctx.currentTime + 0.1;
    step = 0;
    timer = setInterval(function () {
      var eighth = 60 / BPM / 2;
      while (nextTime < ctx.currentTime + 0.4) {
        scheduleStep(step, nextTime);
        nextTime += eighth;
        step++;
      }
    }, 100);
  }

  function setMuted(m) {
    muted = m;
    try { localStorage.setItem('syl_muted', m ? '1' : '0'); } catch (e) {}
    if (master) master.gain.setTargetAtTime(m ? 0 : 0.8, ctx.currentTime, 0.05);
  }

  // Duck the music under big moments (result screen).
  function duck(on) {
    if (musicBus) musicBus.gain.setTargetAtTime(on ? 0.08 : 0.22, ctx.currentTime, 0.2);
  }

  SYL.audio = {
    play: function (name, arg) { try { if (SFX[name]) SFX[name](arg); } catch (e) {} },
    startMusic: startMusic,
    duck: duck,
    isMuted: function () { return muted; },
    toggleMute: function () { setMuted(!muted); return muted; },
  };
})();
