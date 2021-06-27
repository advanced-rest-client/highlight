/* eslint-disable no-await-in-loop */
/* eslint-disable no-cond-assign */
/** @typedef {import('@web/test-runner').TestRunnerConfig} TestRunnerConfig */
/** @typedef {import('@web/test-runner-playwright').PlaywrightLauncher} PlaywrightLauncher */
/** @typedef {import('playwright').Page} Page */

/**
 * @param {Page} page
 * @param {*} payload
 */
async function executeMouseAction(page, payload) {
  if ('click' in payload) {
    const { x, y, selector } = payload.click;
    if (selector) {
      const opts = {};
      if (typeof x === 'number' && typeof y === 'number') {
        opts.position = {
          x, y,
        };
      }
      await page.click(selector, opts);
    } else {
      await page.mouse.click(x, y);
    }
  } else if ('move' in payload) {
    const { x=0, y=0 } = payload.move;
    await page.mouse.move(x, y);
  } else if (payload.down) {
    await page.mouse.down();
  } else if (payload.up) {
    await page.mouse.up();
  }
}

export default /** @type TestRunnerConfig */ ({
  plugins: [
    {
      name: 'native-mouse',
      async executeCommand({ command, payload, session }) {
        if (command !== 'mouse') {
          return false;
        }
        if (!payload) {
          throw new Error('You must provide a `MousePayload` object');
        }
        if (session.browser.type !== 'playwright') {
          throw new Error(`Only playwright is supported.`);
        }
        const page = /** @type PlaywrightLauncher */ (session.browser).getPage(session.id);
        if (Array.isArray(payload)) {
          const cp = [...payload];
          let cmd;
          while ((cmd = cp.shift())) {
            await executeMouseAction(page, cmd);
          }
        } else {
          await executeMouseAction(page, payload);
        }
        return true;
      },
    }
  ],
});
