// One line of real research shown on the result screen, picked by what happened.
// Every line here must match SelfImprovement_Research.md.
var SYL = (globalThis.SYL = globalThis.SYL || {});

SYL.RESEARCH = [
  {
    id: 'bedscroll',
    when: function (c) { return c.res.done.bedscroll; },
    text: 'Phone use in bed is linked to later, poorer sleep. Staying engaged may matter more than blue light.',
    src: 'Exelmans & Van den Bulck, 2016',
  },
  {
    id: 'rough_rest',
    when: function (c) { return c.level.twist && c.level.twist.id === 'rough' && c.res.done.rest; },
    text: 'People with strong self-control often just meet fewer temptations, rather than resisting harder.',
    src: 'Hofmann et al., 2012',
  },
  {
    id: 'bundling',
    when: function (c) { return c.res.done.run && c.layout.headphones && SYL.sim.slotById[c.layout.headphones].zone === SYL.sim.slotById[c.layout.shoes].zone; },
    text: 'Pairing exercise with something enjoyable increased gym visits by up to 51%.',
    src: 'Milkman, Minson & Volpp, 2014',
  },
  {
    id: 'meal_in_reach',
    when: function (c) { return c.res.done.eat && c.level.twist && c.level.twist.id === 'overtime'; },
    text: 'What is within easy reach shapes what we eat. Put the good option where you will actually be.',
    src: 'Hollands et al., Cochrane Review, 2019',
  },
  {
    id: 'hidden_snacks',
    when: function (c) { return c.layout.snacks && !c.res.done.snack && SYL.sim.slotById[c.layout.snacks].kind === 'hidden'; },
    text: 'What is visible and available shapes what we eat. Changing your space beats relying on intentions.',
    src: 'Hollands et al., Cochrane Review, 2019',
  },
  {
    id: 'phone',
    when: function (c) { return c.res.done.scroll; },
    text: 'The mere presence of a smartphone can reduce available attention, even when it is not being used.',
    src: 'Ward et al., 2017',
  },
  {
    id: 'habit',
    when: function () { return true; },
    text: 'Habits took a median of 66 days to feel automatic. Missing one day did not reset them.',
    src: 'Lally et al., 2010',
  },
];

SYL.pickResearch = function (ctx) {
  for (var i = 0; i < SYL.RESEARCH.length; i++) {
    if (SYL.RESEARCH[i].when(ctx)) return SYL.RESEARCH[i];
  }
  return SYL.RESEARCH[SYL.RESEARCH.length - 1];
};
