// Campaigns: a set of weeks and the bits of presentation that differ between
// them. The game registers its campaign in src/game.js (one full-day campaign,
// id 'home'). A campaign with day: true plays SYL.day (work, then home);
// otherwise it plays a single world.
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
