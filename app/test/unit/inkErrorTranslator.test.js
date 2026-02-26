const assert = require('assert');
const { translateErrorToChinese } = require('../../main-process/inkErrorTranslator.js');

describe('inkErrorTranslator (error message translation)', function () {
  it('returns non-string or empty as-is', function () {
    assert.strictEqual(translateErrorToChinese(''), '');
    assert.strictEqual(translateErrorToChinese(null), null);
    assert.strictEqual(translateErrorToChinese(undefined), undefined);
  });

  it('translates loose end (generic)', function () {
    const en = "Apparent loose end exists where the flow runs out. Do you need a '-> DONE' statement, choice or divert?";
    const zh = translateErrorToChinese(en);
    assert.ok(zh.includes('流程在此处没有明确的后续'));
    assert.ok(zh.includes('-> DONE'));
  });

  it('translates loose end with next target hint', function () {
    const en = "Apparent loose end exists where the flow runs out. Do you need a '-> DONE' statement, choice or divert? Note that if you intend to enter 'someKnot' next, you need to divert to it explicitly.";
    const zh = translateErrorToChinese(en);
    assert.ok(zh.includes('流程在此处没有明确的后续'));
    assert.ok(zh.includes('someKnot'));
  });

  it('translates rename duplicate', function () {
    const en = "Rename 'myKnot' to something else - we already have a knot called that.";
    const zh = translateErrorToChinese(en);
    assert.ok(zh.includes('重命名'));
    assert.ok(zh.includes('myKnot'));
  });

  it('translates variable not assigned', function () {
    const en = "Variable 'x' has not been assigned a value before being used.";
    const zh = translateErrorToChinese(en);
    assert.ok(zh.includes('变量'));
    assert.ok(zh.includes('x'));
    assert.ok(zh.includes('赋值'));
  });

  it('translates could not find knot/stitch/target', function () {
    const en = "Could not find knot 'missing'";
    const zh = translateErrorToChinese(en);
    assert.ok(zh.includes('找不到'));
    assert.ok(zh.includes('missing'));
  });

  it('translates unexpected end of content', function () {
    const en = 'Unexpected end of content';
    const zh = translateErrorToChinese(en);
    assert.strictEqual(zh, '意外到达内容末尾。');
  });

  it('translates ran out of content', function () {
    const en = "ran out of content. Do you need a '-> DONE' or '-> END'?";
    const zh = translateErrorToChinese(en);
    assert.ok(zh.includes('流程已结束'));
  });

  it('translates runtime error', function () {
    const en = 'Runtime error: division by zero';
    const zh = translateErrorToChinese(en);
    assert.ok(zh.includes('运行时错误'));
    assert.ok(zh.includes('division by zero'));
  });

  it('returns unknown messages unchanged', function () {
    const en = 'Some unknown error message';
    assert.strictEqual(translateErrorToChinese(en), en);
  });
});
