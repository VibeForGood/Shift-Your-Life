// Pure simulation of your evening. Deterministic: same inputs, same result.
// No Phaser here, so the Node level checker can run it too.
var SYL = (globalThis.SYL = globalThis.SYL || {});

(function () {
  var W = SYL.WORLD;
  var slotById = {};
  W.slots.forEach(function (s) { slotById[s.id] = s; });
  var zoneIndex = {};
  W.zones.forEach(function (z, i) { zoneIndex[z.id] = i; });

  // How much an object in `slotId` reaches a decision made in `zoneId` (0..1).
  function reach(slotId, zoneId) {
    var s = slotById[slotId];
    if (!s) return 0;
    var d = Math.abs(zoneIndex[s.zone] - zoneIndex[zoneId]);
    var mul = s.kind === 'hidden' ? W.reach.hidden : s.kind === 'far' ? W.reach.far : 1;
    if (d === 0) return W.reach.same * mul;
    if (d === 1 && s.kind !== 'hidden') return W.reach.adjacent * mul;
    return 0;
  }

  // Can this object go in this slot at all?
  function allowed(objId, slotId) {
    var s = slotById[slotId];
    return !!s && !(s.no && s.no.indexOf(objId) >= 0);
  }

  function habitKey(action) {
    return W.actions[action].habit || action;
  }

  function cueKey(action) {
    return W.actions[action].cueAs || action;
  }

  // Score one action at one zone. Returns { action, score, sources: [{ label, amount, kind }] }.
  function scoreAction(level, layout, habits, zoneId, action) {
    var a = W.actions[action];
    var sources = [];
    var score = a.base;
    if (a.base) sources.push({ label: 'Default', amount: a.base, kind: 'base' });

    var ck = cueKey(action);
    Object.keys(layout).forEach(function (objId) {
      var o = W.objects[objId];
      var c = o.cue[ck];
      if (!c) return;
      var r = reach(layout[objId], zoneId);
      if (r <= 0) return;
      var amt = c * r;
      score += amt;
      sources.push({ label: o.label, amount: amt, kind: 'object', obj: objId });
    });

    var h = habits[habitKey(action)] || 0;
    if (h > 0 && action !== 'carry' && action !== 'sleep') {
      var hv = h * W.habitWeight;
      score += hv;
      sources.push({ label: 'Habit', amount: hv, kind: 'habit' });
    }

    var tw = level.twist;
    if (tw && tw.mods && tw.mods[action]) {
      var cancelled = false;
      if (tw.cancel && tw.cancel.action === action) {
        var where = layout[tw.cancel.object];
        cancelled = where && reach(where, zoneId) >= 1;
      }
      if (!cancelled) {
        score += tw.mods[action];
        sources.push({ label: tw.label, amount: tw.mods[action], kind: 'twist' });
      }
    }
    return { action: action, score: Math.round(score * 100) / 100, sources: sources };
  }

  function decide(level, layout, habits, zoneId, done) {
    var options = [];
    Object.keys(W.actions).forEach(function (action) {
      var a = W.actions[action];
      if (a.zones.indexOf(zoneId) < 0) return;
      if (a.once && done[action]) return;
      if (a.needs && !(layout[a.needs] && reach(layout[a.needs], zoneId) > 0)) return;
      options.push(scoreAction(level, layout, habits, zoneId, action));
    });
    options.sort(function (x, y) {
      if (y.score !== x.score) return y.score - x.score;
      return W.priority.indexOf(x.action) - W.priority.indexOf(y.action);
    });
    return options;
  }

  function alarmOk(layout) {
    return Object.keys(layout).some(function (objId) {
      if (!W.objects[objId].alarm) return false;
      var s = slotById[layout[objId]];
      return s && s.zone === 'bedroom' && s.kind !== 'hidden';
    });
  }

  function fmt(t) {
    var h = Math.floor(t / 60) % 24;
    var m = t % 60;
    return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m;
  }

  function evalGoal(g, res) {
    switch (g.type) {
      case 'did': return !!res.done[g.action];
      case 'didnt': return !res.done[g.action];
      case 'any': return g.actions.some(function (a) { return res.done[a]; });
      case 'asleepBy': return res.asleepAt <= g.time;
      case 'alarm': return res.alarmOk;
    }
    return false;
  }

  // Run the evening. Returns a full event log for the Run scene to animate.
  function simulate(level, layout, habits) {
    var t = (level.twist && level.twist.start) || 18 * 60;
    var events = [];
    var done = {};
    var zones = W.zones;

    for (var i = 0; i < zones.length; i++) {
      var z = zones[i].id;
      if (i > 0) {
        events.push({ type: 'walk', from: zones[i - 1].id, to: z, t0: t, t1: t + W.walkMins });
        t += W.walkMins;
      }
      if (z === 'bedroom' && t < W.bedtime) {
        events.push({ type: 'idle', zone: z, t0: t, t1: W.bedtime });
        t = W.bedtime;
      }
      if (level.twist && level.twist.skip && level.twist.skip.indexOf(z) >= 0) {
        events.push({ type: 'skip', zone: z, t: t, reason: level.twist.skipReason || 'Skipping this room' });
        continue;
      }
      var options = decide(level, layout, habits, z, done);
      var chosen = options[0].action;
      events.push({ type: 'decide', zone: z, t: t, options: options, chosen: chosen });
      var mins = W.actions[chosen].mins;
      if (chosen !== 'carry' && chosen !== 'sleep') {
        events.push({ type: 'act', zone: z, action: chosen, t0: t, t1: t + mins });
        done[chosen] = true;
        if (habitKey(chosen) !== chosen) done[habitKey(chosen)] = true;
        t += mins;
      }
    }
    events.push({ type: 'sleep', zone: 'bedroom', t: t });

    var res = { events: events, done: done, asleepAt: t, alarmOk: alarmOk(layout) };
    res.goals = level.goals.map(function (g) {
      return { label: g.label, met: evalGoal(g, res) };
    });
    res.allMet = res.goals.every(function (g) { return g.met; });
    return res;
  }

  function updateHabits(habits, done) {
    var out = {};
    Object.keys(W.startHabits).forEach(function (k) {
      var h = habits[k] || 0;
      if (done[k]) h = h + (1 - h) * 0.35; // fast early, levels off
      else h = Math.max(0, h - 0.05); // a missed week only dents it
      out[k] = Math.round(h * 1000) / 1000;
    });
    return out;
  }

  // Number of objects not in their starting slot.
  function movesUsed(level, layout) {
    return Object.keys(layout).filter(function (o) { return layout[o] !== level.layout[o]; }).length;
  }

  // For the SHIFT view: every pull an object exerts on every zone.
  function pulls(level, layout) {
    var out = [];
    Object.keys(layout).forEach(function (objId) {
      var o = W.objects[objId];
      Object.keys(o.cue).forEach(function (cue) {
        W.zones.forEach(function (z) {
          var usable = Object.keys(W.actions).some(function (a) {
            return cueKey(a) === cue && W.actions[a].zones.indexOf(z.id) >= 0;
          });
          if (!usable) return;
          var r = reach(layout[objId], z.id);
          if (r > 0) out.push({ obj: objId, zone: z.id, action: cue, amount: o.cue[cue] * r });
        });
      });
    });
    return out;
  }

  SYL.sim = {
    reach: reach,
    allowed: allowed,
    simulate: simulate,
    updateHabits: updateHabits,
    movesUsed: movesUsed,
    pulls: pulls,
    fmt: fmt,
    slotById: slotById,
  };
})();
