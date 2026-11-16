// Campaigns: a world, its weeks, and the bits of presentation that differ
// between them. The base game registers 'home' (the flat). Expansions register
// their own with SYL.addCampaign(); the base game never refers to them by name.
var SYL = (globalThis.SYL = globalThis.SYL || {});

SYL.CAMPAIGNS = {};
SYL.CAMPAIGN_ORDER = [];

SYL.addCampaign = function (cp) {
  cp.sim = cp.sim || SYL.makeSim(cp.world);
  if (!SYL.CAMPAIGNS[cp.id]) SYL.CAMPAIGN_ORDER.push(cp.id);
  SYL.CAMPAIGNS[cp.id] = cp;
  return cp;
};

// The campaign being played right now.
SYL.campaign = function () {
  return SYL.CAMPAIGNS[(SYL.state && SYL.state.campaign) || 'home'];
};

SYL.addCampaign({
  id: 'home',
  name: 'Home',
  world: SYL.WORLD,
  levels: SYL.LEVELS,
  sim: SYL.sim,
  runLabel: 'Run evening',
  goalsHeading: "TONIGHT'S GOALS",
  resultHeading: 'TONIGHT',
  lastButton: 'Back to Dr Reyes',
  story: 'Story',
  ending: 'Ending',
  startTime: 18 * 60,
  habitRows: function () { return SYL.HABIT_ROWS; },
  drawWorld: function (scene, room) { return SYL.art.drawApartment(scene, room); },
  endLine: function (res) { return 'You fell asleep at ' + SYL.sim.fmt(res.asleepAt) + '.'; },
  healthWeek: function (res, kg) { return SYL.health.week(res, kg); },
  startKg: function () { return SYL.health.START.kg; },
  research: function (ctx) { return SYL.pickResearch(ctx); },
  goodPicks: ['run', 'eat', 'focus', 'call', 'read', 'rest', 'sleep'],
});
