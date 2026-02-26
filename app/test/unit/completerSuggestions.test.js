const assert = require('assert');
const {
  getFunctionSuggestions,
  getSyntaxSuggestions,
} = require('../../renderer/inkCompleter.js');

describe('completer suggestions (function & syntax)', function () {
  describe('getFunctionSuggestions', function () {
    it('returns same count for en and zh-CN', function () {
      const en = getFunctionSuggestions('en');
      const zh = getFunctionSuggestions('zh-CN');
      assert.strictEqual(en.length, zh.length);
    });

    it('returns expected ink function names for en', function () {
      const list = getFunctionSuggestions('en');
      const captions = list.map((x) => x.caption);
      assert.ok(captions.includes('CHOICE_COUNT()'));
      assert.ok(captions.includes('TURNS()'));
      assert.ok(captions.includes('TURNS_SINCE(-> knot)'));
      assert.ok(captions.includes('SEED_RANDOM()'));
      assert.ok(captions.includes('RANDOM(min, max)'));
      assert.ok(captions.includes('LIST_VALUE(list, value)'));
    });

    it('uses meta "函数" for zh-CN and "Function" for en', function () {
      const en = getFunctionSuggestions('en');
      const zh = getFunctionSuggestions('zh-CN');
      assert.strictEqual(en[0].meta, 'Function');
      assert.strictEqual(zh[0].meta, '函数');
    });

    it('value is insertable (no extra space in caption-only)', function () {
      const list = getFunctionSuggestions('en');
      list.forEach((item) => {
        assert.ok(typeof item.caption === 'string' && item.caption.length > 0);
        assert.ok(typeof item.value === 'string' && item.value.length > 0);
        assert.ok(typeof item.meta === 'string');
      });
    });
  });

  describe('getSyntaxSuggestions', function () {
    it('zh-CN includes 主段/子段/跳转/收束/选项', function () {
      const list = getSyntaxSuggestions('zh-CN');
      const captions = list.map((x) => x.caption);
      assert.ok(captions.some((c) => c.includes('主段')));
      assert.ok(captions.some((c) => c.includes('子段')));
      assert.ok(captions.some((c) => c.includes('跳转')));
      assert.ok(captions.some((c) => c.includes('收束')));
      assert.ok(captions.some((c) => c.includes('选项')));
    });

    it('en includes -> / === / = / - / * / VAR / function', function () {
      const list = getSyntaxSuggestions('en');
      const values = list.map((x) => x.value);
      assert.ok(values.some((v) => v.startsWith('-> ')));
      assert.ok(values.some((v) => v.startsWith('=== ')));
      assert.ok(values.some((v) => v.startsWith('= ')));
      assert.ok(values.some((v) => v.startsWith('- ')));
      assert.ok(values.some((v) => v.startsWith('* ')));
      assert.ok(values.some((v) => v.startsWith('VAR ')));
      assert.ok(values.some((v) => v.startsWith('function ')));
    });

    it('zh-CN syntax values are Chinese keywords for insertion', function () {
      const list = getSyntaxSuggestions('zh-CN');
      const 主段 = list.find((x) => x.caption.includes('主段'));
      const 跳转 = list.find((x) => x.caption.includes('跳转'));
      assert.ok(主段 && 主段.value.startsWith('主段 '));
      assert.ok(跳转 && 跳转.value.startsWith('跳转 '));
    });

    it('both languages have same number of syntax items', function () {
      const en = getSyntaxSuggestions('en');
      const zh = getSyntaxSuggestions('zh-CN');
      assert.strictEqual(en.length, zh.length);
    });
  });
});
