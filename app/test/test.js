/**
 * Inky test suite.
 * - Unit tests live in test/unit/*.test.js (e.g. inkPreprocessor).
 * - Legacy E2E tests using Spectron were removed (Spectron is deprecated).
 *   For UI tests, consider Playwright or manual testing after packaging.
 */
const assert = require('assert');

describe('Inky', function () {
  it('has a placeholder so root test file does not fail', function () {
    assert.strictEqual(1, 1);
  });
});
