#!/usr/bin/env node
// Brute-force level checker. For every week, tries every arrangement within the
// move limit and reports how many solve all goals at each move count.
//
// Habits carry between weeks, so each week is checked twice:
//   "good" = the player solved every earlier week (with a minimal solution)
//   "bad"  = the player changed nothing in every earlier week
//
// Checks the seven evening-only home weeks. The full-day game (tools/check-days.js)
// builds on their flat layouts, twists and tips.
//
// Usage: node tools/check-levels.js [--verbose]
var path = require('path');
require(path.join(__dirname, '../src/data/world.js'));
require(path.join(__dirname, '../src/data/levels.js'));
require(path.join(__dirname, '../src/sim.js'));
var SYL = globalThis.SYL;
var W, SIM;
var verbose = process.argv.indexOf('--verbose') >= 0;

function* arrangements(level) {
  var objs = Object.keys(level.layout);
  var slots = W.slots.map(function (s) { return s.id; });
  var cur = Object.assign({}, level.layout);
  function* rec(i, displaced) {
    if (i === objs.length) {
      var used = {};
      for (var k in cur) { if (used[cur[k]]) return; used[cur[k]] = 1; }
      yield Object.assign({}, cur);
      return;
    }
    var o = objs[i];
    yield* rec(i + 1, displaced);
    if (displaced >= level.moves || level.locked.indexOf(o) >= 0) return;
    var start = level.layout[o];
    for (var s of slots) {
      if (s === start || !SIM.allowed(o, s)) continue;
      cur[o] = s;
      yield* rec(i + 1, displaced + 1);
    }
    cur[o] = start;
  }
  yield* rec(0, 0);
}

function analyse(level, habits) {
  var byMoves = {};
  var best = null;
  var total = 0;
  for (var lay of arrangements(level)) {
    total++;
    var res = SIM.simulate(level, lay, habits);
    if (!res.allMet) continue;
    var m = SIM.movesUsed(level, lay);
    byMoves[m] = (byMoves[m] || 0) + 1;
    if (!best || m < best.m) best = { m: m, layout: lay, res: res };
  }
  return { byMoves: byMoves, best: best, total: total };
}

function describe(level, lay) {
  return Object.keys(lay).filter(function (o) { return lay[o] !== level.layout[o]; })
    .map(function (o) { return o + ' -> ' + lay[o]; }).join(', ') || '(no moves)';
}

function trace(res) {
  return res.events.filter(function (e) { return e.type === 'decide'; }).map(function (e) {
    return e.zone + ':' + e.chosen + '(' + e.options.slice(0, 3).map(function (o) { return o.action + ' ' + o.score; }).join(' / ') + ')';
  }).join('  ');
}

var problems = 0;

function checkCampaign(name, world, levels, endWord) {
  W = world;
  SIM = SYL.makeSim(world);
  console.log('\n##### ' + name + ' #####');
  var good = Object.assign({}, W.startHabits);
  var bad = Object.assign({}, W.startHabits);

  levels.forEach(function (level) {
    console.log('\n=== ' + level.title + ' (moves allowed: ' + level.moves + ') ===');
    var seen = {};
    Object.keys(level.layout).forEach(function (o) {
      var s = level.layout[o];
      if (!SIM.slotById[s]) { console.log('    !! ' + o + ' starts in unknown slot ' + s); problems++; }
      else if (!SIM.allowed(o, s)) { console.log('    !! ' + o + ' starts in a slot it is not allowed in: ' + s); problems++; }
      if (seen[s]) { console.log('    !! ' + o + ' and ' + seen[s] + ' both start in ' + s); problems++; }
      seen[s] = o;
    });
    [['good', good], ['bad', bad]].forEach(function (pair) {
      var name = pair[0], habits = pair[1];
      var a = analyse(level, habits);
      var counts = [];
      for (var m = 0; m <= level.moves; m++) counts.push(m + ' moves: ' + (a.byMoves[m] || 0));
      var sols = Object.keys(a.byMoves).reduce(function (n, k) { return n + a.byMoves[k]; }, 0);
      console.log('  [' + name + ' habits] ' + counts.join(' | ') + '   (of ' + a.total + ' arrangements, ' + (100 * sols / a.total).toFixed(2) + '% solve it)');
      if (!a.best) { console.log('    !! UNSOLVABLE'); problems++; }
      else {
        console.log('    min solution: ' + describe(level, a.best.layout));
        if (verbose) console.log('    ' + trace(a.best.res));
        if (a.byMoves[0]) { console.log('    !! solvable with zero moves'); problems++; }
      }
      var zero = SIM.simulate(level, level.layout, habits);
      if (verbose) console.log('    start layout: ' + trace(zero) + '  ' + endWord + ' ' + SIM.fmt(zero.endAt));
    });
    var g = analyse(level, good);
    good = SIM.updateHabits(good, g.best ? g.best.res.done : SIM.simulate(level, level.layout, good).done);
    bad = SIM.updateHabits(bad, SIM.simulate(level, level.layout, bad).done);
    if (verbose) console.log('  habits after (good): ' + JSON.stringify(good) + '\n  habits after (bad):  ' + JSON.stringify(bad));
  });
}

checkCampaign('Home weeks (the flat)', SYL.WORLD, SYL.LEVELS, 'asleep');

console.log(problems ? '\n' + problems + ' problem(s) found.' : '\nAll levels OK.');
process.exit(problems ? 1 : 0);
