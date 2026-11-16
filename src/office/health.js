// The workday half of the weekly weigh-in: constants used by SYL.day.healthWeek (src/day.js).
// Pure logic (no Phaser). Reuses the base game's model and constants (src/health.js):
// the workday stands for the whole working week, on top of the old-habits surplus.
//
// Illustrative numbers, same spirit as the base game. Before shipping, check each
// against SelfImprovement_Research.md:
//   proper lunch instead of a vending-machine lunch: smaller version of the base
//     game's proper-dinner saving (ultra-processed vs whole food, Hall 2019)
//   no snacking: same as the base game
//   lunchtime walk: 30 min brisk walking on 5 days = 150 active minutes (WHO)
var SYL = (globalThis.SYL = globalThis.SYL || {});

(function () {
  var H = SYL.health;
  var O = {
    DEFAULT_START_KG: 114.5, // day 49 at Dr Reyes' half-a-kilo-a-week pace (home weeks not played)
    LUNCH: -300, // a proper lunch instead of crisps and a fizzy drink
    NO_SNACK: H.NO_SNACK, // the biscuit tin and the cake stay shut
    WALK: -100, // 5 x 30 min brisk walks a week, averaged per day (MET ~3.5 at ~115 kg, net)
    WALK_MINS: 150,
    STAIRS_MINS: 25, // 5 x 5 min a week
  };

  // What one workday means for the week. Same shape as SYL.health.week().
  O.week = function (res, kg) {
    var d = res.done;
    var kcal = H.OLD_SURPLUS;
    var helped = [], hurt = [];
    if (d.lunch) { kcal += O.LUNCH; helped.push('proper lunches'); } else if (d.vending) hurt.push('vending machine lunches');
    if (!d.snack) { kcal += O.NO_SNACK; helped.push('no snacking'); } else hurt.push('snacking');
    if (d.lunchwalk) { kcal += O.WALK * (kg / 115); helped.push('lunchtime walks'); }
    if (d.stairs) helped.push('taking the stairs');
    if (d.stand) helped.push('less sitting');
    if (d.stay) hurt.push('staying late');
    if (d.takehome) hurt.push('work email at home');
    var dKg = (kcal * 7) / H.KCAL_PER_KG;
    dKg = Math.max(-1, Math.min(0.6, dKg));
    return {
      kcal: Math.round(kcal),
      dKg: Math.round(dKg * 10) / 10,
      active: (d.lunchwalk ? O.WALK_MINS : 0) + (d.stairs ? O.STAIRS_MINS : 0),
      sleepH: H.START.sleepH, // evenings aren't modelled here
      deepMins: res.mins.deep || 0,
      leftAt: res.endAt,
      helped: helped,
      hurt: hurt,
    };
  };

  SYL.officeHealth = O;
})();
