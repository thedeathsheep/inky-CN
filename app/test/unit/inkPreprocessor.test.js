const assert = require('assert');
const { preprocessChineseToInk } = require('../../main-process/inkPreprocessor.js');

describe('inkPreprocessor (Chinese syntax)', function () {
  it('returns empty or non-string as-is', function () {
    assert.strictEqual(preprocessChineseToInk(''), '');
    assert.strictEqual(preprocessChineseToInk(null), null);
    assert.strictEqual(preprocessChineseToInk(undefined), undefined);
  });

  it('converts 主段 to knot (===)', function () {
    assert.strictEqual(
      preprocessChineseToInk('主段 我们的一天'),
      '=== 我们的一天 ==='
    );
    assert.strictEqual(
      preprocessChineseToInk('  主段 测试'),
      '  === 测试 ==='
    );
  });

  it('converts 子段 to stitch (=)', function () {
    assert.strictEqual(
      preprocessChineseToInk('子段 上午'),
      '= 上午'
    );
    assert.strictEqual(
      preprocessChineseToInk('子段 下午'),
      '= 下午'
    );
  });

  it('converts 跳转 to divert (->)', function () {
    assert.strictEqual(preprocessChineseToInk('跳转 收束点'), '-> 收束点');
    assert.strictEqual(preprocessChineseToInk('    跳转 结束'), '    -> END');
    assert.strictEqual(preprocessChineseToInk('跳转 完成'), '-> DONE');
  });

  it('converts 选项 to choice (*)', function () {
    assert.strictEqual(
      preprocessChineseToInk('选项 上午'),
      '* 上午'
    );
    assert.strictEqual(
      preprocessChineseToInk('选项 你好'),
      '* 你好'
    );
  });

  it('converts 持久 to sticky choice (+)', function () {
    assert.strictEqual(
      preprocessChineseToInk('持久 一次'),
      '+ 一次'
    );
  });

  it('converts 收束 to gather (-)', function () {
    assert.strictEqual(
      preprocessChineseToInk('收束 这就是我们的一天。'),
      '- 这就是我们的一天。'
    );
  });

  it('converts 变量/临时/列表/常量/包含/外部 at line start', function () {
    assert.strictEqual(preprocessChineseToInk('变量 x = 5'), 'VAR x = 5');
    assert.strictEqual(preprocessChineseToInk('临时 t = 1'), 'temp t = 1');
    assert.strictEqual(preprocessChineseToInk('列表 L = a, b'), 'LIST L = a, b');
    assert.strictEqual(preprocessChineseToInk('常量 C = 1'), 'CONST C = 1');
    assert.strictEqual(preprocessChineseToInk('包含 other.ink'), 'INCLUDE other.ink');
    assert.strictEqual(preprocessChineseToInk('外部 myFunc('), 'EXTERNAL myFunc(');
  });

  it('replaces 跳转 结束/完成 at line start and -> 结束/完成 anywhere', function () {
    assert.ok(preprocessChineseToInk('跳转 结束').includes('-> END'));
    assert.ok(preprocessChineseToInk('跳转 完成').includes('-> DONE'));
    // Inline 跳转 is not converted; only line-start 跳转 is. So 某行 跳转 结束 stays as-is.
    assert.strictEqual(preprocessChineseToInk('某行 跳转 结束'), '某行 跳转 结束');
  });

  it('preserves empty lines and comments', function () {
    const input = '主段 x\n\n// comment\n子段 y';
    const out = preprocessChineseToInk(input);
    assert.ok(out.includes('=== x ==='));
    assert.ok(out.includes('// comment'));
    assert.ok(out.includes('= y'));
    assert.ok(out.split('\n')[1] === '');
  });

  it('preserves story text (no keyword)', function () {
    const input = '从前...\n某一天里，你跟我说';
    assert.strictEqual(preprocessChineseToInk(input), input);
  });

  it('preserves gather with label 收束 (label)', function () {
    const input = '收束 (收束点) 这就是我们的一天。';
    assert.strictEqual(preprocessChineseToInk(input), '- (收束点) 这就是我们的一天。');
  });

  it('does not convert keywords inside block comments', function () {
    const input = '/* 主段 注释 */';
    assert.strictEqual(preprocessChineseToInk(input), '/* 主段 注释 */');
  });

  it('converts 函数 in knot declaration to function', function () {
    const input = '=== 函数 myFunc() ===';
    assert.ok(preprocessChineseToInk(input).includes('=== function myFunc()'));
  });

  it('keeps indentation for choice and divert', function () {
    const input = '    选项 缩进选项\n    跳转 结束';
    const out = preprocessChineseToInk(input);
    assert.ok(out.startsWith('    * 缩进选项'));
    assert.ok(out.includes('    -> END'));
  });

  it('full example: 我们的一天', function () {
    const input = `主段 我们的一天
某一天里，你跟我说

选项 上午
你选择了上午
跳转 我们的一天.上午

收束 (收束点) 这就是我们的一天。
跳转 结束`;
    const out = preprocessChineseToInk(input);
    assert.ok(out.includes('=== 我们的一天 ==='));
    assert.ok(out.includes('* 上午'));
    assert.ok(out.includes('-> 我们的一天.上午'));
    assert.ok(out.includes('- (收束点) 这就是我们的一天。'));
    assert.ok(out.includes('-> END'));
  });
});
