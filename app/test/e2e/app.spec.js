/**
 * UI reliability (E2E) tests: app launch and basic stability.
 * Runs Electron in a subprocess and asserts it stays alive; no Spectron/Playwright required.
 */
const assert = require('assert');
const path = require('path');
const { spawn } = require('child_process');

const APP_ROOT = path.join(__dirname, '../..');
const ELECTRON_MAIN = path.join(APP_ROOT, 'main-process/main.js');

describe('UI reliability (E2E)', function () {
  this.timeout(12000);
  let electronProcess = null;

  afterEach(function () {
    if (electronProcess && electronProcess.kill) {
      try {
        electronProcess.kill('SIGTERM');
      } catch (_) {}
      electronProcess = null;
    }
  });

  it('app launches and stays running for a few seconds', function (done) {
    const electronCli = path.join(APP_ROOT, 'node_modules', 'electron', 'cli.js');
    electronProcess = spawn(process.execPath, [electronCli, path.relative(APP_ROOT, ELECTRON_MAIN)], {
      cwd: APP_ROOT,
      stdio: 'ignore',
    });

    let settled = false;
    const finish = (err) => {
      if (settled) return;
      settled = true;
      if (electronProcess) {
        try { electronProcess.kill('SIGTERM'); } catch (_) {}
      }
      done(err);
    };

    electronProcess.on('error', (err) => finish(err));
    electronProcess.on('exit', (code, signal) => {
      if (code !== 0 && code !== null) finish(new Error(`Electron exited with code ${code}`));
      else if (signal === 'SIGTERM') finish(); // we killed it, ok
      else if (code === 0 && !signal) finish(new Error('Electron exited normally too early'));
      else finish();
    });

    // After 4s assume app is stable
    setTimeout(() => {
      if (settled) return;
      assert.ok(electronProcess && !electronProcess.killed, 'process should still be running');
      finish();
    }, 4000);
  });
});
