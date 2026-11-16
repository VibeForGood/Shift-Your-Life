#!/usr/bin/env node
// Brute-force checker for the full-day weeks (SYL.DAYS): work + home layouts under
// one move budget. For every week, tries every arrangement within the move limit.
//
// Habits AND last night's sleep carry between weeks, so each week is checked twice:
//   "good" = the player solved every earlier week (with a minimal solution)
//   "bad"  = the player changed nothing in every earlier week
//
// Usage: node tools/check-days.js [--verbose] [--week N]
var path = require('path');
['src/data/world.js', 'src/data/levels.js', 'src/sim.js', 'src/office/world.js', 'src/data/days.js', 'src/day.js']
  .forEach(function (f) { require(path.join(__dirname, '..', f)); });
var SYL = globalThis.SYL;
var D = SYL.day;
var verbose = process.argv.indexOf('--verbose') >= 0;
var wi = process.argv.indexOf('--week');
var onlyWeek = wi >= 0 ? +process.argv[wi + 1] : null;

var PLACES = { work: { sim: D.work, world: SYL.OFFICE_WORLD }, home: { sim: D.home, world: SYL.WORLD } };

function* arrangements(level) {
  var items = [];
  ['work', 'home'].forEach(function (p) {
    var part = level[p];
    Object.keys(part.layout).forEach(function (o) { items.push({ place: p, obj: o, start: part.layout[o], locked: part.locked.indexOf(o) >= 0 }); });
  });
  var cur = { work: Object.assign({}, level.work.layout), home: Object.assign({}, level.home.layout) };
  var slots = {
    work: SYL.OFFICE_WORLD.slots.filter(function (s) { return !s.fixed; }).map(function (s) { return s.id; }),
    home: SYL.WORLD.slots.map(function (s) { return s.id; }),
  };
  function ok() {
    for (var p in cur) { var used = {}; for (var k in cur[p]) { if (used[cur[p][k]]) return false; used[cur[p][k]] = 1; } }
    return true;
  }
  function* rec(i, moved) {
    if (i === items.length) { if (ok()) yield { work: Object.assign({}, cur.work), home: Object.assign({}, cur.home) }; return; }
    var it = items[i];
    yield* rec(i + 1, moved);
    if (moved >= level.moves || it.locked) return;
    var sim = PLACES[it.place].sim;
    for (var s of slots[it.place]) {
      if (s === it.start || !sim.allowed(it.obj, s)) continue;
      cur[it.place][it.obj] = s;
      yield* rec(i + 1, moved + 1);
    }
    cur[it.place][it.obj] = it.start;
  }
  yield* rec(0, 0);
}

function analyse(level, habits, night) {
  var byMoves = {}, best = null, total = 0;
  for (var lay of arrangements(level)) {
    total++;
    var res = D.simulate(level, lay, habits, night);
    if (!res.allMet) continue;
    var m = D.movesUsed(level, lay);
    byMoves[m] = (byMoves[m] || 0) + 1;
    if (!best || m < best.m) best = { m: m, layout: lay, res: res };
  }
  return { byMoves: byMoves, best: best, total: total };
}

function describe(level, lay) {
  var out = [];
  ['work', 'home'].forEach(function (p) {
    Object.keys(lay[p]).forEach(function (o) { if (lay[p][o] !== level[p].layout[o]) out.push(p + ':' + o + ' -> ' + lay[p][o]); });
  });
  return out.join(', ') || '(no moves)';
}

function trace(res) {
  function t(r) {
    return r.events.filter(function (e) { return e.type === 'decide'; }).map(function (e) {
      return e.zone + ':' + e.chosen + '(' + e.options.slice(0, 3).map(function (o) { return o.action + ' ' + o.score; }).join(' / ') + ')';
    }).join('  ');
  }
  var fx = function (list) { return list.map(function (f) { return f.label; }).join(', ') || 'none'; };
  return '      night: ' + fx(res.night.effects) + '\n      WORK  ' + t(res.work) + '  left ' + D.work.fmt(res.work.endAt) +
    '\n      evening: ' + fx(res.evening.effects) + '\n      HOME  ' + t(res.home) + '  asleep ' + D.home.fmt(res.asleepAt) +
    '\n      goals: ' + res.goals.map(function (g) { return (g.met ? 'OK ' : 'NO ') + g.label; }).join(' | ');
}

var problems = 0;
var paths = { good: { habits: Object.assign({}, D.startHabits), night: null }, bad: { habits: Object.assign({}, D.startHabits), night: null } };

SYL.DAYS.forEach(function (level) {
  var show = !onlyWeek || onlyWeek === level.week;
  if (show) console.log('\n=== ' + level.title + ' · ' + level.topic.name + ' (moves allowed: ' + level.moves + ') ===');
  ['work', 'home'].forEach(function (p) {
    var seen = {};
    Object.keys(level[p].layout).forEach(function (o) {
      var s = level[p].layout[o];
      var sim = PLACES[p].sim;
      if (!sim.slotById[s]) { console.log('    !! ' + p + ':' + o + ' starts in unknown slot ' + s); problems++; }
      else if (!sim.allowed(o, s)) { console.log('    !! ' + p + ':' + o + ' starts in a slot it is not allowed in: ' + s); problems++; }
      if (seen[s]) { console.log('    !! ' + p + ':' + o + ' and ' + seen[s] + ' both start in ' + s); problems++; }
      seen[s] = o;
    });
  });
  ['good', 'bad'].forEach(function (name) {
    var P = paths[name];
    var zero = D.simulate(level, { work: level.work.layout, home: level.home.layout }, P.habits, P.night);
    var a = show || name === 'good' ? analyse(level, P.habits, P.night) : null;
    if (show) {
      var counts = [];
      for (var m = 0; m <= level.moves; m++) counts.push(m + ' moves: ' + (a.byMoves[m] || 0));
      var sols = Object.keys(a.byMoves).reduce(function (n, k) { return n + a.byMoves[k]; }, 0);
      console.log('  [' + name + '] ' + counts.join(' | ') + '   (of ' + a.total + ', ' + (100 * sols / a.total).toFixed(2) + '% solve it)');
      if (!a.best) { console.log('    !! UNSOLVABLE'); problems++; }
      else {
        console.log('    min solution: ' + describe(level, a.best.layout));
        if (verbose) console.log(trace(a.best.res));
        if (a.byMoves[0]) { console.log('    !! solvable with zero moves'); problems++; }
      }
      if (verbose) console.log('    start layout:\n' + trace(zero));
    }
    var res = name === 'good' && a.best ? a.best.res : zero;
    P.habits = D.updateHabits(P.habits, res.done);
    P.night = res.nextNight;
  });
});

console.log(problems ? '\n' + problems + ' problem(s) found.' : '\nAll full-day weeks OK.');
process.exit(problems ? 1 : 0);
