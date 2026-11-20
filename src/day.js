// A full day: the workday at the office, the commute, the evening at home, sleep.
// Pure logic (no Phaser), so the Node level checker can run it too.
//
// The two halves feed each other (DESIGN.md §10.2):
//   last night -> today's work: Rested / Tired / Overslept
//   today's work -> this evening: get home later, Hungry, Frazzled, Work email, Already moving
// Each effect is a twist-like { id, label, desc, mods } the simulators already understand.
var SYL = (globalThis.SYL = globalThis.SYL || {});

(function () {
  var D = {
    COMMUTE: 30,
    LATE_START: 9 * 60 + 45, // overslept: in at 09:45
    // Week 1's "last night": your old habits (asleep after midnight, phone as the alarm).
    OLD_NIGHT: { asleepAt: 25 * 60, alarmOk: true },
  };

  D.work = SYL.makeSim(SYL.OFFICE_WORLD);
  D.home = SYL.sim; // the flat

  // One habit set for the whole day. Scrolling and snacking are shared.
  D.startHabits = Object.assign({}, SYL.WORLD.startHabits, SYL.OFFICE_WORLD.startHabits, {
    scroll: SYL.WORLD.startHabits.scroll,
    snack: SYL.WORLD.startHabits.snack,
  });

  // Last night -> today's work.
  D.nightEffects = function (night) {
    night = night || D.OLD_NIGHT;
    var fx = [];
    var out = { effects: fx, start: null, skipStops: null };
    if (night.asleepAt <= 23 * 60) fx.push({ id: 'rested', label: 'Rested', desc: 'Deep work +1', mods: { deep: 1 } });
    else fx.push({ id: 'tired', label: 'Tired', desc: 'Deep work -2, Snack +1, Scroll +1, Stairs -1', mods: { deep: -2, snack: 1, scroll: 1, stairs: -1 } });
    if (!night.alarmOk) {
      fx.push({ id: 'overslept', label: 'Overslept', desc: 'In at 09:45, no time for the stairs', mods: {} });
      out.start = D.LATE_START;
      out.skipStops = ['arrive'];
    }
    return out;
  };

  // What can carry from work into the evening, for the home plan before the day has
  // run. Keep in step with eveningEffects below.
  D.EVENING_HINTS = [
    { id: 'moving', when: 'Stairs or lunch walk', label: 'Already moving', desc: 'Run +1' },
    { id: 'hungry', when: 'No proper lunch', label: 'Hungry', desc: 'Snack +2' },
    { id: 'frazzled', when: 'Under 1h deep work', label: 'Frazzled', desc: 'Rest +1, Scroll +1' },
    { id: 'workemail', when: 'Laptop comes home', label: 'Work email', desc: 'Scroll +1, Sleep -1' },
  ];

  // Today's work -> this evening.
  D.eveningEffects = function (work) {
    var d = work.done;
    var fx = [];
    if (!d.lunch) fx.push({ id: 'hungry', label: 'Hungry', desc: 'Snack +2 (no proper lunch)', mods: { snack: 2 } });
    if ((work.mins.deep || 0) < 60) fx.push({ id: 'frazzled', label: 'Frazzled', desc: 'Rest +1, Scroll +1 (no deep work)', mods: { rest: 1, scroll: 1 } });
    if (d.takehome) fx.push({ id: 'workemail', label: 'Work email', desc: 'Scroll +1, Sleep -1 (laptop came home)', mods: { scroll: 1, bedscroll: 1, sleep: -1 } });
    if (d.stairs || d.lunchwalk) fx.push({ id: 'moving', label: 'Already moving', desc: 'Run +1', mods: { run: 1 } });
    return { effects: fx, start: Math.max(18 * 60, work.endAt + D.COMMUTE) };
  };

  // Everything you did, both halves together (for whole-day goals and the weigh-in).
  function merge(work, home) {
    var done = Object.assign({}, work.done, home.done);
    var mins = Object.assign({}, work.mins);
    Object.keys(home.mins).forEach(function (k) { mins[k] = (mins[k] || 0) + home.mins[k]; });
    return { done: done, mins: mins, endAt: home.endAt, asleepAt: home.asleepAt, alarmOk: home.alarmOk, leftWorkAt: work.endAt };
  }

  // The carry-overs are taught one at a time: a week can switch them off with
  // carries: { night: false, alarm: false, evening: false } (see src/data/days.js).
  //   night:   last night's sleep -> Rested / Tired at work
  //   alarm:   no alarm in the bedroom last night -> Overslept
  //   evening: today's work -> Hungry / Frazzled / Work email / Already moving at home
  D.carries = function (level, which) { return !level.carries || level.carries[which] !== false; };

  // Last night -> this level's workday (nothing if this week doesn't use it yet).
  D.nightFor = function (level, night) {
    if (!D.carries(level, 'night')) return { effects: [], start: null, skipStops: null };
    if (night && !D.carries(level, 'alarm')) night = Object.assign({}, night, { alarmOk: true });
    return D.nightEffects(night);
  };

  // Today's work -> this level's evening. You still get home after the commute.
  D.eveningFor = function (level, work) {
    var e = D.eveningEffects(work);
    if (!D.carries(level, 'evening')) e.effects = [];
    return e;
  };

  // Run one day. level: an entry of SYL.DAYS. layouts: { work: {...}, home: {...} }.
  // night: last night's { asleepAt, alarmOk } (null in week 1).
  D.simulate = function (level, layouts, habits, night) {
    var n = D.nightFor(level, night);
    var wl = { twist: level.work.twist, goals: [], effects: n.effects, start: n.start, skipStops: n.skipStops };
    var work = D.work.simulate(wl, layouts.work, habits);
    var e = D.eveningFor(level, work);
    var hl = { twist: level.home.twist, goals: [], effects: e.effects, start: e.start };
    var home = D.home.simulate(hl, layouts.home, habits);
    var day = merge(work, home);
    var goals = level.goals.map(function (g) {
      var res = g.at === 'work' ? work : g.at === 'home' ? home : day;
      var sim = g.at === 'work' ? D.work : D.home;
      return { label: g.label, at: g.at, met: sim.evalGoal(g, res) };
    });
    return {
      work: work, home: home, done: day.done, mins: day.mins, day: day,
      night: n, evening: e,
      goals: goals, allMet: goals.every(function (g) { return g.met; }),
      asleepAt: home.asleepAt, endAt: home.endAt,
      nextNight: { asleepAt: home.asleepAt, alarmOk: home.alarmOk },
    };
  };

  D.updateHabits = function (habits, done) {
    var out = {};
    Object.keys(D.startHabits).forEach(function (k) {
      var h = habits[k] || 0;
      if (done[k]) h = h + (1 - h) * 0.35;
      else h = Math.max(0, h - 0.05);
      out[k] = Math.round(h * 1000) / 1000;
    });
    return out;
  };

  // Objects moved from their starting spots, across both places (one move budget).
  D.movesUsed = function (level, layouts) {
    return D.work.movesUsed(level.work, layouts.work) + D.home.movesUsed(level.home, layouts.home);
  };

  // The weekly weigh-in for a whole day (needs src/health.js and src/office/health.js).
  // Home as in the base game; work adds a proper lunch and lunchtime walks.
  // Snacking anywhere counts once.
  D.healthWeek = function (res, kg) {
    var H = SYL.health, O = SYL.officeHealth;
    var hw = H.week({ done: res.done, asleepAt: res.asleepAt }, kg); // dinner, snacking (whole day), sleep, running
    var kcal = hw.kcal;
    var helped = hw.helped.slice(), hurt = hw.hurt.slice();
    var d = res.work.done;
    if (d.lunch) { kcal += O.LUNCH; helped.unshift('proper lunches'); } else if (d.vending) hurt.unshift('vending machine lunches');
    if (d.lunchwalk) { kcal += O.WALK * (kg / 115); helped.push('lunchtime walks'); }
    if (d.stairs) helped.push('the stairs');
    if (d.stay) hurt.push('staying late');
    if (d.takehome) hurt.push('work email at home');
    var dKg = Math.max(-1, Math.min(0.6, (kcal * 7) / H.KCAL_PER_KG));
    return {
      kcal: Math.round(kcal),
      dKg: Math.round(dKg * 10) / 10,
      active: Math.min(300, hw.active + (d.lunchwalk ? O.WALK_MINS : 0) + (d.stairs ? O.STAIRS_MINS : 0)),
      sleepH: hw.sleepH,
      helped: helped,
      hurt: hurt,
    };
  };

  SYL.day = D;
})();
