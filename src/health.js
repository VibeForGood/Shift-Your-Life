// Health model: turns each week's evening into a weekly weigh-in, and seven
// weeks into Dr Reyes' retest. Pure logic (no Phaser), formulas carried over
// from Momentum (scr_body). The evening stands for the whole week: the flat
// stays set up the same way every night.
//
// Sources (SelfImprovement_Research.md):
//   7,700 kcal ~ 1 kg (Hall 2011, rough)       Short sleep: ~385 kcal more next day (Al Khatib 2017)
//   Ultra-processed vs whole food: ~500 kcal/day (Hall 2019)
//   ~1 mmHg per kg lost (Neter 2003)            Endurance exercise: ~3.5 mmHg systolic (Cornelissen 2013)
//   ~16% lower diabetes risk per kg (Hamman 2006); DPP placebo: ~29% over 3 years (Knowler 2002)
//   Sustainable loss: 0.5-1 kg a week (NHS)     150 active minutes a week (WHO)
var SYL = (globalThis.SYL = globalThis.SYL || {});

(function () {
  var H = {
    START: { kg: 118, sbp: 142, dbp: 91, a1c: 6.1, risk: 29, sleepH: 5, active: 0 },
    KCAL_PER_KG: 7700,
    WAKE: 7 * 60, // alarm at 07:00
    // Daily calories versus what your body uses, on an old-habits week: takeaway,
    // biscuits, late nights. Small surplus, so doing nothing slowly gains.
    OLD_SURPLUS: 300,
    DINNER: -450, // a proper meal instead of a takeaway
    NO_SNACK: -200, // the biscuit jar stays shut
    SLEEP: -275, // asleep on time most nights instead of short-sleep extra eating
    RUN: -210, // 3 x 50 min runs a week (MET ~6 at 118 kg), averaged per day
    RUN_MINS: 150, // active minutes a week when running is happening
  };

  // What one week's evening means for the week. Returns kcal/day, kg change, etc.
  H.week = function (res, kg) {
    var d = res.done;
    var kcal = H.OLD_SURPLUS;
    var parts = [], hurt = [];
    if (d.eat) { kcal += H.DINNER; parts.push('proper dinners'); } else hurt.push('takeaway dinners');
    if (!d.snack) { kcal += H.NO_SNACK; parts.push('no snacking'); } else hurt.push('snacking');
    var onTime = res.asleepAt <= 23 * 60;
    if (onTime) { kcal += H.SLEEP; parts.push('enough sleep'); } else hurt.push('late nights');
    if (d.run) { kcal += H.RUN * (kg / 118); parts.push('running'); }
    var dKg = (kcal * 7) / H.KCAL_PER_KG;
    dKg = Math.max(-1, Math.min(0.6, dKg)); // bodies don't move faster than this
    return {
      kcal: Math.round(kcal),
      dKg: Math.round(dKg * 10) / 10,
      active: d.run ? H.RUN_MINS : 0,
      sleepH: Math.max(4, (24 * 60 + H.WAKE - res.asleepAt) / 60),
      helped: parts,
      hurt: hurt,
    };
  };

  // The retest, from the list of weekly results.
  H.retest = function (weeks) {
    var S = H.START;
    var kg = S.kg + weeks.reduce(function (n, w) { return n + w.dKg; }, 0);
    var lost = Math.max(0, S.kg - kg);
    var last4 = weeks.slice(-4);
    var aero = last4.length ? Math.min(1, last4.reduce(function (n, w) { return n + w.active; }, 0) / last4.length / 150) : 0;
    var sleep = last4.length ? last4.reduce(function (n, w) { return n + w.sleepH; }, 0) / last4.length : S.sleepH;
    var active = last4.length ? last4.reduce(function (n, w) { return n + w.active; }, 0) / last4.length : 0;
    return {
      kg: Math.round(kg * 10) / 10,
      sbp: Math.round(S.sbp - 1.05 * lost - 4 * aero),
      dbp: Math.round(S.dbp - 0.92 * lost - 2.5 * aero),
      // Illustrative only: HbA1c reflects about 3 months, and no cited study models it this way.
      a1c: Math.round(Math.min(6.6, Math.max(5.2, S.a1c - 0.04 * lost - 0.15 * aero)) * 10) / 10,
      risk: Math.round(S.risk * Math.pow(0.84, Math.min(12, Math.max(-5, S.kg - kg)))),
      sleepH: Math.round(sleep * 10) / 10,
      active: Math.round(active),
    };
  };

  H.bpLabel = function (s, d) {
    if (s >= 140 || d >= 90) return 'High (stage 2)';
    if (s >= 130 || d >= 80) return 'High (stage 1)';
    if (s >= 120) return 'Elevated';
    return 'Normal';
  };
  H.a1cLabel = function (a) { return a >= 6.5 ? 'Diabetes range' : a >= 5.7 ? 'Prediabetes' : 'Normal'; };

  SYL.health = H;
})();
