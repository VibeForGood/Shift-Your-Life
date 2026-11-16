// Office life expansion: registers the 'office' campaign with the base game.
// Load after the base game's scripts (see index.html). Remove the office script
// tags and the base game runs exactly as before.
var SYL = (globalThis.SYL = globalThis.SYL || {});

(function () {
  var C = SYL.C;
  var OH = SYL.officeHealth;

  // Research lines for the result card. Only lines already checked for the base
  // game (src/research.js) until the office sources are verified.
  function research(c) {
    var lay = c.layout;
    var sim = SYL.CAMPAIGNS.office.sim;
    if (c.res.done.scroll) return SYL.RESEARCH.find(function (r) { return r.id === 'phone'; });
    if (lay.biscuits && !c.res.done.snack && sim.slotById[lay.biscuits].kind === 'hidden') return SYL.RESEARCH.find(function (r) { return r.id === 'hidden_snacks'; });
    return SYL.RESEARCH.find(function (r) { return r.id === 'habit'; });
  }

  var HABIT_ROWS = [
    ['deep', 'Deep', C.good, 'Deep work'], ['scroll', 'Scroll', C.trap, 'Scrolling'],
    ['stairs', 'Stairs', C.good, 'Taking the stairs'], ['snack', 'Snack', C.trap, 'Snacking'],
    ['lunch', 'Lunch', C.good, 'Proper lunches'], ['vending', 'Vending', C.trap, 'Vending machine'],
    ['lunchwalk', 'Walk', C.good, 'Lunchtime walks'], ['stay', 'Late', C.trap, 'Staying late'],
  ];

  // Intro cards (drawn by the base game's Story scene).
  var CARDS = [
    {
      draw: function (s, c) {
        var h = SYL.art.makeHero(s, 640, 250, 44);
        h.mood('happy');
        c.add(h.root);
        SYL.storyPill(s, c, 400, 200, 'Day 49', C.ink);
        SYL.storyPill(s, c, 880, 200, 'Evenings: sorted', C.good);
      },
      text: "Day 49. Dr Reyes looks at your results and nods. 'Good. Your evenings are working for you now. But you spend most of your waking hours at work.'",
    },
    {
      draw: function (s, c) {
        var h = SYL.art.makeHero(s, 640, 250, 44);
        h.mood('tired').look(0.8, 0.4);
        c.add(h.root);
        [['vending', 450, 210], ['laptop', 830, 210], ['biscuits', 450, 320], ['phone', 830, 320]].forEach(function (o) {
          c.add(s.add.image(o[1], o[2], 'icon_' + o[0]));
        });
        SYL.storyPill(s, c, 330, 210, 'Vending lunch', C.trap);
        SYL.storyPill(s, c, 955, 210, 'Email all day', C.inkSoft);
        SYL.storyPill(s, c, 330, 320, 'The biscuit tin', C.trap);
        SYL.storyPill(s, c, 955, 320, 'Home at eight', C.trap);
      },
      text: 'Halcyon Insurance. You sit most of the day. Lunch comes out of a machine. Your inbox never stops, and neither does Sam.',
    },
    {
      draw: function (s, c) {
        var h = SYL.art.makeHero(s, 640, 250, 44);
        h.mood('content');
        c.add(h.root);
        SYL.storyPill(s, c, 640, 140, 'Follow-up: day 84', C.accent);
      },
      text: "'Same idea as at home,' says Dr Reyes. 'You can't change the job. But you can change your desk. I'll see you on day 84.'",
    },
    {
      draw: function (s, c) {
        var L = SYL.OFFICE_LEVELS;
        L.forEach(function (lv, i) {
          var x = 640 + (i - (L.length - 1) / 2) * 170;
          var img = s.add.image(x, 220, 'icon_' + lv.topic.icon).setScale(1.1).setAlpha(0);
          var t = SYL.text(s, x, 270, lv.topic.name, 17, C.ink, { fontStyle: 'bold' }).setOrigin(0.5).setAlpha(0);
          var n = SYL.text(s, x, 296, 'Week ' + lv.week, 13, C.inkSoft).setOrigin(0.5).setAlpha(0);
          c.add([img, t, n]);
          s.tweens.add({ targets: [img, t, n], alpha: 1, y: '-=8', duration: 300, delay: 150 + i * 180 });
        });
      },
      text: 'Five working weeks, five shifts, one workday at a time.',
      last: true,
    },
  ];

  SYL.addCampaign({
    id: 'office',
    name: 'Office life',
    titleButton: 'Office life',
    titleFill: 0xd9e6f7,
    world: SYL.OFFICE_WORLD,
    levels: SYL.OFFICE_LEVELS,
    runLabel: 'Run workday',
    goalsHeading: "TODAY'S GOALS",
    resultHeading: 'TODAY',
    lastButton: 'Back to Dr Reyes',
    story: 'Story',
    storyCards: CARDS,
    ending: 'OfficeEnding',
    habitRows: function () { return HABIT_ROWS; },
    drawWorld: function (scene, room) { return SYL.art.drawOffice(scene, room); },
    endLine: function (res) {
      return 'You left the office at ' + SYL.sim.fmt(res.endAt) + (res.done.takehome ? ', laptop in your bag.' : '.');
    },
    healthWeek: function (res, kg) { return OH.week(res, kg); },
    // Weight carries over from the home weeks, if they were played this session.
    startKg: function () {
      var home = SYL.state.results && SYL.state.results.home;
      return home ? home.endKg : OH.DEFAULT_START_KG;
    },
    research: research,
    goodPicks: ['deep', 'stairs', 'lunch', 'lunchwalk', 'stand', 'water', 'leave'],
  });
})();
