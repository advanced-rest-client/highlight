import { assert } from '@open-wc/testing';
import { PrismHighlighter } from '../src/PrismHighlighter.js';

/* global Prism */

describe('PrismHighlighter', () => {
  describe('detectLang()', () => {
    let instance = /** @type PrismHighlighter  */ (null);
    beforeEach(() => {
      instance = new PrismHighlighter();
    });

    it('Returns JS grammar when no lang', () => {
      const result = instance.detectLang('{}');
      // @ts-ignore
      assert.isTrue(result === Prism.languages.javascript);
    });

    it('Returns Markup grammar when no lang', () => {
      const result = instance.detectLang('<html>');
      // @ts-ignore
      assert.isTrue(result === Prism.languages.markup);
    });

    ['js', 'esm', 'mj'].forEach((item) => {
      it(`Returns JS grammar for ${  item}`, () => {
        const result = instance.detectLang('{}', item);
        // @ts-ignore
        assert.isTrue(result === Prism.languages.javascript);
      });
    });

    ['c'].forEach((item) => {
      it(`Returns C grammar for ${  item}`, () => {
        const result = instance.detectLang('{}', item);
        // @ts-ignore
        assert.isTrue(result === Prism.languages.clike);
      });
    });

    it('Returns default grammar', () => {
      const result = instance.detectLang('<html>', 'test');
      // @ts-ignore
      assert.isTrue(result === Prism.languages.markup);
    });
  });

  describe('Parsing', () => {
    let instance = /** @type PrismHighlighter  */ (null);
    beforeEach(() => {
      instance = new PrismHighlighter();
    });

    it('parses XML', () => {
      const code = '<Person>true</Person>';
      const result = instance.tokenize(code, 'xml');
      let compare = '<span class="token tag"><span class="token tag">';
      compare += '<span class="token punctuation">&lt;</span>Person</span>';
      compare += '<span class="token punctuation">></span></span>true';
      compare += '<span class="token tag"><span class="token tag">';
      compare += '<span class="token punctuation">&lt;/</span>';
      compare += 'Person</span><span class="token punctuation">></span></span>';
      assert.equal(result, compare);
    });

    it('renders predefined json', () => {
      const code = '{"test": true}';
      const result = instance.tokenize(code, 'json');
      const c =
        '<span class="token punctuation">{</span><span class="token property">"test"</span>' +
        '<span class="token operator">:</span> <span class="token boolean">true</span>' +
        '<span class="token punctuation">}</span>';
      assert.equal(result, c);
    });

    it('renders code with no language', async () => {
      const code = '007';
      const result = instance.tokenize(code);
      const c = '<span class="token number">007</span>' ;
      assert.equal(result, c);
    });
  });

  describe('debounce()', () => {
    it('eventually returns the parse result', (done) => {
      const code = '{"test": true}';
      const c =
        '<span class="token punctuation">{</span><span class="token property">"test"</span>' +
        '<span class="token operator">:</span> <span class="token boolean">true</span>' +
        '<span class="token punctuation">}</span>';
      const instance = new PrismHighlighter((result) => {
        assert.equal(result, c);
        done();
      });
      instance.debounce(code, 'json');
    });
  });
});
