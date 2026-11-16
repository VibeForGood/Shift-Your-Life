// Pure simulation of your evening (or workday). Deterministic: same inputs, same result.
// No Phaser here, so the Node level checker can run it too.
//
// SYL.makeSim(world) builds a simulator for one world (the flat, the office...).
// SYL.sim is the base game's simulator for the flat (SYL.WORLD).
//
// World features (all optional, the flat uses none of the starred ones):
//   route: [{ zone, until*, waitUntil }]  visit order. Default: every zone once.
//       until:     a time block. Decisions repeat here until this time;
//                  choosing 'carry' leaves the block early.
//       waitUntil: idle here until this time before deciding (bedtime).
//   end: { type, zone }      the closing event ('sleep' in the bedroom by default).
//   startTime                when the run starts (18:00 by default).
//   fixed*: { objId: slotId }  things you can't move (vending machine...). Their
//       slots have fixed: true. A level's twist can add more with twist.fixed.
//   action.ends*             choosing it ends the run (leaving the office).
//   action.excludes*: [ids]  not available once any of these is done.
//   action.needs             an object id, or a list (any one of them will do).
var SYL = (globalThis.SYL = globalThis.SYL || {});

SYL.makeSim = function (W) {
  var slotById = {};
  W.slots.forEach(function (s) { slotById[s.id] = s; });
  var zoneIndex = {};
  W.zones.forEach(function (z, i) { zoneIndex[z.id] = i; });
  var route = W.route || W.zones.map(function (z) { return { zone: z.id }; });
  var endEvent = W.end || { type: 'sleep', zone: 'bedroom' };

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

  // Can this object go in this slot at all? Fixed slots never take objects.
  function allowed(objId, slotId) {
    var s = slotById[slotId];
    return !!s && !s.fixed && !(s.no && s.no.indexOf(objId) >= 0);
  }

  // The player's layout plus everything that can't be moved.
  function full(level, layout) {
    var tw = level.twist;
    if (!W.fixed && !(tw && tw.fixed)) return layout;
    return Object.assign({}, W.fixed || {}, (tw && tw.fixed) || {}, layout);
  }

  function habitKey(action) {
    return W.actions[action].habit || action;
  }

  function cueKey(action) {
    return W.actions[action].cueAs || action;
  }

  // Score one action at one zone. Returns { action, score, sources: [{ label, amount, kind }] }.
  function scoreAction(level, all, habits, zoneId, action) {
    var a = W.actions[action];
    var sources = [];
    var score = a.base;
    if (a.base) sources.push({ label: 'Default', amount: a.base, kind: 'base' });

    var ck = cueKey(action);
    Object.keys(all).forEach(function (objId) {
      var o = W.objects[objId];
      var c = o.cue[ck];
      if (!c) return;
      var r = reach(all[objId], zoneId);
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
        var where = all[tw.cancel.object];
        cancelled = where && reach(where, zoneId) >= 1;
      }
      if (!cancelled) {
        score += tw.mods[action];
        sources.push({ label: tw.label, amount: tw.mods[action], kind: 'twist' });
      }
    }
    return { action: action, score: Math.round(score * 100) / 100, sources: sources };
  }

  function hasNeed(a, all, zoneId) {
    if (!a.needs) return true;
    var list = Array.isArray(a.needs) ? a.needs : [a.needs];
    return list.some(function (o) { return all[o] && reach(all[o], zoneId) > 0; });
  }

  function decide(level, all, habits, zoneId, done) {
    var options = [];
    Object.keys(W.actions).forEach(function (action) {
      var a = W.actions[action];
      if (a.zones.indexOf(zoneId) < 0) return;
      if (a.once && done[action]) return;
      if (a.excludes && a.excludes.some(function (x) { return done[x]; })) return;
      if (!hasNeed(a, all, zoneId)) return;
      options.push(scoreAction(level, all, habits, zoneId, action));
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
      case 'didntAny': return !g.actions.some(function (a) { return res.done[a]; });
      case 'any': return g.actions.some(function (a) { return res.done[a]; });
      case 'asleepBy': return res.asleepAt <= g.time;
      case 'leftBy': return res.endAt <= g.time;
      case 'minutes': return (res.mins[g.action] || 0) >= g.min;
      case 'alarm': return res.alarmOk;
    }
    return false;
  }

  // Run the evening (or day). Returns a full event log for the Play scene to animate.
  function simulate(level, layout, habits) {
    var tw = level.twist;
    var t = (tw && tw.start) || W.startTime || 18 * 60;
    var events = [];
    var done = {};
    var mins = {};
    var all = full(level, layout);
    var prev = null;
    var ended = false;

    function act(z, chosen) {
      var a = W.actions[chosen];
      events.push({ type: 'act', zone: z, action: chosen, t0: t, t1: t + a.mins });
      done[chosen] = true;
      if (habitKey(chosen) !== chosen) done[habitKey(chosen)] = true;
      mins[chosen] = (mins[chosen] || 0) + a.mins;
      t += a.mins;
      if (a.ends) ended = true;
    }

    for (var i = 0; i < route.length && !ended; i++) {
      var stop = route[i];
      var z = stop.zone;
      if (prev !== null && prev !== z) {
        events.push({ type: 'walk', from: prev, to: z, t0: t, t1: t + W.walkMins });
        t += W.walkMins;
      }
      prev = z;
      if (stop.waitUntil && t < stop.waitUntil) {
        events.push({ type: 'idle', zone: z, t0: t, t1: stop.waitUntil });
        t = stop.waitUntil;
      }
      if (tw && tw.skip && tw.skip.indexOf(z) >= 0) {
        events.push({ type: 'skip', zone: z, t: t, reason: tw.skipReason || 'Skipping this room' });
        continue;
      }
      if (stop.until) {
        // Time block: keep deciding until the block ends, you carry on, or the day ends.
        while (t < stop.until && !ended) {
          var opts = decide(level, all, habits, z, done);
          if (!opts.length) break;
          var pick = opts[0].action;
          events.push({ type: 'decide', zone: z, t: t, options: opts, chosen: pick });
          if (pick === 'carry' || !W.actions[pick].mins) {
            if (pick !== 'carry') act(z, pick);
            break;
          }
          act(z, pick);
        }
        if (t < stop.until && !ended && stop.hold) t = stop.until; // e.g. lunch hour
        continue;
      }
      var options = decide(level, all, habits, z, done);
      var chosen = options[0].action;
      events.push({ type: 'decide', zone: z, t: t, options: options, chosen: chosen });
      if (chosen !== 'carry' && chosen !== 'sleep') act(z, chosen);
    }
    events.push({ type: endEvent.type, zone: endEvent.zone, t: t });

    var res = { events: events, done: done, mins: mins, endAt: t, asleepAt: t, alarmOk: alarmOk(layout) };
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

  // For the SHIFT view: every pull an object exerts on every zone (fixed things too).
  function pulls(level, layout) {
    var out = [];
    var all = full(level, layout);
    Object.keys(all).forEach(function (objId) {
      var o = W.objects[objId];
      Object.keys(o.cue).forEach(function (cue) {
        W.zones.forEach(function (z) {
          var usable = Object.keys(W.actions).some(function (a) {
            return cueKey(a) === cue && W.actions[a].zones.indexOf(z.id) >= 0;
          });
          if (!usable) return;
          var r = reach(all[objId], z.id);
          if (r > 0) out.push({ obj: objId, zone: z.id, action: cue, amount: o.cue[cue] * r, slot: all[objId] });
        });
      });
    });
    return out;
  }

  return {
    world: W,
    reach: reach,
    allowed: allowed,
    full: full,
    simulate: simulate,
    updateHabits: updateHabits,
    movesUsed: movesUsed,
    pulls: pulls,
    fmt: fmt,
    slotById: slotById,
  };
};

SYL.sim = SYL.makeSim(SYL.WORLD);
