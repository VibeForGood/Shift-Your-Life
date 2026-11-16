#!/usr/bin/env node
// Smoke test: loads the game in headless Chromium, drags objects in Week 1,
// plays the base game to its ending, then the Office life expansion to its ending,
// checks the SHIFT view, runs every week to the ending, fails on any JS error.
// Screenshots go to tests/screenshots/.
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
      errors.push('State: ' + JSON.stringify(await page.evaluate(() => ({ scene: SYL.debug && SYL.debug.scene && SYL.debug.scene.key, week: SYL.debug && SYL.debug.level && SYL.debug.level.id, mode: SYL.debug && SYL.debug.mode })).catch((e2) => String(e2))));
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

  await page.goto('file://' + path.join(root, 'index.html'));
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(shots, '01-title.png') });

  await page.keyboard.down('Shift');
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(shots, '01b-title-shift.png') });
  await page.keyboard.up('Shift');
  await page.mouse.click(508, 630); // Start (the Office life button sits to its right)
  await page.waitForFunction(() => window.SYL.debug && window.SYL.debug.scene && window.SYL.debug.scene.key === 'Story');
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(shots, '01c-story.png') });
  for (var c = 0; c < 4; c++) { await page.keyboard.press('Space'); await page.waitForTimeout(450); }
  await page.screenshot({ path: path.join(shots, '01d-story-doctor.png') });
  await page.mouse.click(1170, 40); // Skip intro
  await page.waitForFunction(() => window.SYL.debug && window.SYL.debug.mode === 'brief');
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(shots, '01e-week1-card.png') });
  await page.mouse.click(640, 582); // Time to shift
  await page.waitForFunction(() => window.SYL.debug && window.SYL.debug.mode === 'plan');
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(shots, '02-week1-plan.png') });

  // Drag shoes from the closet to the shoe rack, phone from the hook to the bedside.
  async function drag(from, to) {
    await page.mouse.move(from[0], from[1]);
    await page.mouse.down();
    await page.mouse.move((from[0] + to[0]) / 2, (from[1] + to[1]) / 2, { steps: 5 });
    await page.mouse.move(to[0], to[1], { steps: 5 });
    await page.mouse.up();
    await page.waitForTimeout(300);
  }
  await drag([366, 300], [156, 392]);
  await drag([160, 214], [1005, 364]);
  var layout = await page.evaluate(() => window.SYL.debug.layout);
  if (layout.shoes !== 'shoe_rack' || layout.phone !== 'bedside') errors.push('Drag failed: ' + JSON.stringify(layout));

  await page.keyboard.down('Shift');
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(shots, '03-week1-shift.png') });
  await page.keyboard.up('Shift');

  // Speed 4x then run.
  await page.mouse.click(1200, 672);
  await page.mouse.click(1200, 672);
  await page.mouse.click(1140, 590);
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(shots, '04-week1-decision.png') });
  await page.waitForFunction(() => window.SYL.debug.mode === 'result', null, { timeout: 30000 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(shots, '05-week1-result.png') });
  var met = await page.evaluate(() => window.SYL.debug.result.allMet);
  if (!met) errors.push('Week 1 solution did not meet goals');

  // Play the remaining weeks with no changes, just to exercise the flow.
  var last = await page.evaluate(() => window.SYL.LEVELS.length);
  for (var w = 2; w <= last; w++) {
    await page.waitForTimeout(400); // let the result panel finish animating in
    await page.mouse.click(790, 585); // Next week
    await page.waitForFunction((n) => window.SYL.debug.level.week === n && window.SYL.debug.mode === 'brief', w);
    await page.waitForTimeout(350);
    if (w === 5) await page.screenshot({ path: path.join(shots, '06a-week5-card.png') });
    await page.mouse.click(640, 582); // Time to shift
    await page.waitForFunction(() => window.SYL.debug.mode === 'plan');
    await page.waitForTimeout(300);
    if (w === 5 || w === 6) await page.screenshot({ path: path.join(shots, '06-week' + w + '-plan.png') });
    await page.mouse.click(1140, 590);
    await page.waitForFunction(() => window.SYL.debug.mode === 'result', null, { timeout: 40000 });
  }
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(shots, '07-last-result.png') });
  await page.mouse.click(790, 585);
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(shots, '08-ending.png') });
  var homeKg = await page.evaluate(() => window.SYL.state.results.home && window.SYL.state.results.home.endKg);
  if (!homeKg) errors.push('Home results were not saved for the expansion');

  // ---------- Office life expansion ----------
  await page.mouse.click(640, 674); // Play again -> title
  await page.waitForFunction(() => window.SYL.game.scene.isActive('Title'));
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(shots, '09-title-with-office.png') });
  await page.mouse.click(772, 630); // Office life
  await page.waitForFunction(() => window.SYL.debug && window.SYL.debug.scene && window.SYL.debug.scene.key === 'Story');
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(shots, '10-office-story.png') });
  await page.mouse.click(1170, 40); // Skip intro
  await page.waitForFunction(() => window.SYL.debug && window.SYL.debug.mode === 'brief' && window.SYL.debug.level.id === 'o1');
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(shots, '11-office-week1-card.png') });
  var startKg = await page.evaluate(() => window.SYL.state.startKg);
  if (startKg !== homeKg) errors.push('Office start weight ' + startKg + ' did not carry over from home ' + homeKg);
  await page.mouse.click(640, 582); // Time to shift
  await page.waitForFunction(() => window.SYL.debug.mode === 'plan');
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(shots, '12-office-week1-plan.png') });

  // Phone from your bag into the locker (headphones swap into the bag), then headphones to the desk floor.
  await drag([225, 370], [290, 230]);
  await drag([225, 370], [640, 410]);
  var olayout = await page.evaluate(() => window.SYL.debug.layout);
  if (olayout.phone !== 'locker' || olayout.headphones !== 'floor') errors.push('Office drag failed: ' + JSON.stringify(olayout));
  await page.keyboard.down('Shift');
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(shots, '13-office-week1-shift.png') });
  await page.keyboard.up('Shift');
  await page.mouse.click(1140, 590); // Run workday
  await page.waitForTimeout(2500);
  await page.screenshot({ path: path.join(shots, '14-office-week1-decision.png') });
  await page.waitForFunction(() => window.SYL.debug.mode === 'result', null, { timeout: 60000 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(shots, '15-office-week1-result.png') });
  if (!(await page.evaluate(() => window.SYL.debug.result.allMet))) errors.push('Office week 1 solution did not meet goals');

  var olast = await page.evaluate(() => window.SYL.OFFICE_LEVELS.length);
  for (var ow = 2; ow <= olast; ow++) {
    await page.waitForTimeout(400);
    await page.mouse.click(790, 585); // Next week
    await page.waitForFunction((n) => window.SYL.debug.level.week === n && window.SYL.debug.mode === 'brief', ow);
    await page.waitForTimeout(350);
    await page.mouse.click(640, 582);
    await page.waitForFunction(() => window.SYL.debug.mode === 'plan');
    await page.waitForTimeout(300);
    if (ow === 3) await page.screenshot({ path: path.join(shots, '16-office-week3-plan.png') });
    await page.mouse.click(1140, 590);
    await page.waitForFunction(() => window.SYL.debug.mode === 'result', null, { timeout: 60000 });
  }
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(shots, '17-office-last-result.png') });
  await page.mouse.click(790, 585); // Back to Dr Reyes
  await page.waitForFunction(() => window.SYL.game.scene.isActive('OfficeEnding'));
  await page.waitForTimeout(2500);
  await page.screenshot({ path: path.join(shots, '18-office-ending.png') });

  await browser.close();
}
