// The game: one campaign of seven full days (work, then home). See DESIGN.md §10.
// Load after src/day.js, src/data/days.js and the office files.
var SYL = (globalThis.SYL = globalThis.SYL || {});

(function () {
  var C = SYL.C;
  var D = SYL.day;

  SYL.addCampaign({
    id: 'home',
    name: 'Shift Your Life',
    day: true,
    world: SYL.WORLD, // unused in day mode; kept for the single-world helpers
    sim: SYL.sim,
    levels: SYL.DAYS,
    startHabits: D.startHabits,
    runLabel: 'Run the day',
    goalsHeading: "THIS WEEK'S GOALS",
    resultHeading: 'TODAY',
    lastButton: 'Back to Dr Reyes',
    story: 'Story',
    ending: 'Ending',
    habitRows: function () {
      return [
        ['run', 'Run', C.good, 'Running'], ['scroll', 'Scroll', C.trap, 'Scrolling'],
        ['eat', 'Dinner', C.good, 'Proper dinners'], ['snack', 'Snack', C.trap, 'Snacking'],
        ['deep', 'Deep', C.good, 'Deep work'], ['stay', 'Late', C.trap, 'Staying late'],
        ['lunch', 'Lunch', C.good, 'Proper lunches'], ['stairs', 'Stairs', C.good, 'Taking the stairs'],
      ];
    },
    drawWorld: function (scene, room, phase) {
      return phase === 'work' ? SYL.art.drawOffice(scene, room) : SYL.art.drawApartment(scene, room);
    },
    endLine: function (res) {
      return 'Left work at ' + D.work.fmt(res.work.endAt) + ', asleep at ' + D.home.fmt(res.asleepAt) + '.';
    },
    healthWeek: function (res, kg) { return D.healthWeek(res, kg); },
    startKg: function () { return SYL.health.START.kg; },
    research: function (ctx) { return SYL.pickResearch(ctx); },
    goodPicks: ['run', 'eat', 'focus', 'call', 'read', 'rest', 'sleep', 'deep', 'stairs', 'lunch', 'lunchwalk', 'stand', 'water', 'leave'],
  });
})();
