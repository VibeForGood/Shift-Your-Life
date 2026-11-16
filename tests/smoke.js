#!/usr/bin/env node
// Smoke test: loads the game in headless Chromium, plans Week 1 in both places
// (drags at work, switches to home, drags there), checks the SHIFT view, runs the
// full day (work, commute, evening), then plays every week to the ending.
// Fails on any JS error. Screenshots go to tests/screenshots/.
//
// Usage: node tests/smoke.js
var path = require('path');
var fs = require('fs');
var { chromium } = require('playwright');

var root = path.join(__dirname, '..');
var shots = path.join(__dirname, 'screenshots');
fs.mkdirSync(shots, { recursive: true });

(async function () {
  var errors = [];
  try { await run(errors); } catch (e) {
    errors.push(String(e.stack || e));
    if (page) {
      await page.screenshot({ path: path.join(shots, 'failure.png') });
      errors.push('State: ' + JSON.stringify(await page.evaluate(() => ({ scene: SYL.debug && SYL.debug.scene && SYL.debug.scene.key, week: SYL.debug && SYL.debug.level && SYL.debug.level.id, phase: SYL.debug && SYL.debug.phase, mode: SYL.debug && SYL.debug.mode })).catch((e2) => String(e2))));
    }
  }
  if (errors.length) {
    console.error('FAILED:\n' + errors.join('\n'));
    process.exit(1);
  }
  console.log('Smoke test passed. Screenshots in tests/screenshots/');
})();

var page;
async function run(errors) {
  // PW_CHANNEL=msedge (or chrome) uses an installed browser instead of a downloaded one.
  var browser = await chromium.launch(process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {});
  page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

  var inPlay = (phase, mode) => page.waitForFunction((a) => {
    var d = window.SYL.debug;
    return d && d.scene && d.scene.key === 'Play' && d.phase === a[0] && d.mode === a[1];
  }, [phase, mode], { timeout: 90000 });

  await page.goto('file://' + path.join(root, 'index.html'));
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(shots, '01-title.png') });

  await page.keyboard.down('Shift');
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(shots, '01b-title-shift.png') });
  await page.keyboard.up('Shift');
  await page.mouse.click(640, 630); // Start
  await page.waitForFunction(() => window.SYL.debug && window.SYL.debug.scene && window.SYL.debug.scene.key === 'Story');
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(shots, '01c-story.png') });
  for (var c = 0; c < 4; c++) { await page.keyboard.press('Space'); await page.waitForTimeout(450); }
  await page.screenshot({ path: path.join(shots, '01d-story-doctor.png') });
  await page.mouse.click(1170, 40); // Skip intro
  await inPlay('work', 'brief');
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(shots, '01e-week1-card.png') });
  await page.mouse.click(640, 612); // Time to shift
  await inPlay('work', 'plan');
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(shots, '02-week1-work-plan.png') });

  async function drag(from, to) {
    await page.mouse.move(from[0], from[1]);
    await page.mouse.down();
    await page.mouse.move((from[0] + to[0]) / 2, (from[1] + to[1]) / 2, { steps: 5 });
    await page.mouse.move(to[0], to[1], { steps: 5 });
    await page.mouse.up();
    await page.waitForTimeout(300);
  }
  // Work: trainers from the locker to the coat stand, the stairs reminder from the drawer to your bag.
  await drag([290, 230], [110, 250]);
  await drag([551, 406], [225, 370]);
  var wl = await page.evaluate(() => window.SYL.state.plan.layouts.work);
  if (wl.trainers !== 'coat_stand' || wl.note !== 'bag_hook') errors.push('Work drag failed: ' + JSON.stringify(wl));

  await page.keyboard.down('Shift');
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(shots, '03-week1-work-shift.png') });
  await page.keyboard.up('Shift');

  // Switch to home; the work plan must survive the switch.
  await page.mouse.click(935, 672); // Plan home
  await inPlay('home', 'plan');
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(shots, '04-week1-home-plan.png') });
  await drag([366, 300], [270, 360]); // shoes from the closet to the hall table
  var pl = await page.evaluate(() => window.SYL.state.plan.layouts);
  if (pl.home.shoes !== 'hall_table' || pl.work.trainers !== 'coat_stand') errors.push('Plan lost across switch: ' + JSON.stringify(pl));
  var moves = await page.evaluate(() => window.SYL.debug.movesUsed(window.SYL.debug.layout));
  if (moves !== 3) errors.push('Expected 3 moves across both places, got ' + moves);

  // Speed 4x, then run the day (from the home view: it should jump to work first).
  await page.mouse.click(1200, 672);
  await page.mouse.click(1200, 672);
  await page.mouse.click(1140, 590);
  await inPlay('work', 'run');
  await page.waitForTimeout(2500);
  await page.screenshot({ path: path.join(shots, '05-week1-work-run.png') });
  await inPlay('home', 'run');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(shots, '06-week1-home-run.png') });
  await inPlay('home', 'result');
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(shots, '07-week1-result.png') });
  var met = await page.evaluate(() => window.SYL.debug.result.allMet);
  if (!met) errors.push('Week 1 solution did not meet goals');

  // Play the remaining weeks with no changes, just to exercise the flow.
  var last = await page.evaluate(() => window.SYL.DAYS.length);
  for (var w = 2; w <= last; w++) {
    await page.waitForTimeout(400);
    await page.mouse.click(790, 585); // Next week
    await page.waitForFunction((n) => window.SYL.debug.level && window.SYL.debug.level.week === n && window.SYL.debug.mode === 'brief', w);
    await page.waitForTimeout(350);
    if (w === 2) await page.screenshot({ path: path.join(shots, '08-week2-card.png') });
    await page.mouse.click(640, 612);
    await inPlay('work', 'plan');
    await page.waitForTimeout(300);
    if (w === 4) await page.screenshot({ path: path.join(shots, '09-week4-work-plan.png') });
    await page.mouse.click(1140, 590);
    await inPlay('home', 'result');
  }
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(shots, '10-last-result.png') });
  await page.mouse.click(790, 585); // Back to Dr Reyes
  await page.waitForFunction(() => window.SYL.game.scene.isActive('Ending'));
  await page.waitForTimeout(2500);
  await page.screenshot({ path: path.join(shots, '11-ending.png') });

  await browser.close();
}
