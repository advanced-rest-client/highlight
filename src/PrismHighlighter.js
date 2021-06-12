import 'prismjs/prism.js';
import 'prismjs/components/prism-json.min.js';
import 'prismjs/components/prism-javascript.js';
import 'prismjs/components/prism-markdown.js';
import 'prismjs/components/prism-markup.js';
import 'prismjs/components/prism-yaml.js';
import 'prismjs/components/prism-xml-doc.js';
import 'prismjs/plugins/autolinker/prism-autolinker.js';

/** @typedef {import('prismjs')} Prism */
/* global Prism */

export const listener = Symbol('listener');
export const debounceTimer = Symbol('debounceTimer');

export class PrismHighlighter {
  /**
   * @param {((code: string) => any)=} highlightListener The listener for the debounced code highlight
   */
  constructor(highlightListener) {
    this[listener] = highlightListener;
    /**
     * The number of milliseconds the library will wait before it runs the tokenizer.
     */
    this.debounceTimeout = 1;
  }

  /**
   * A function to be called to run the highlighter in a debouncer.
   * To use this library this way set the `highlightListener` in the constructor
   * which will be called when highlighting is done.
   * 
   * @param {string} code The code to highlight
   * @param {string=} lang The language to use.
   */
  debounce(code, lang) {
    if (!this[listener]) {
      throw new Error('The highlight listener is not set.')
    }
    if (this[debounceTimer]) {
      clearTimeout(this[debounceTimer]);
    }
    this[debounceTimer] = setTimeout(() => {
      this[debounceTimer] = undefined;
      const result = this.tokenize(code, lang);
      this[listener](result);
    }, this.debounceTimeout);
  }

  /**
   * @param {string} code
   * @param {string=} lang
   */
  tokenize(code, lang) {
    const grammar = this.detectLang(code, lang);
    const env = {
      code,
      grammar,
      language: lang
    };
    // @ts-ignore
    Prism.hooks.run('before-highlight', env);
    // @ts-ignore
    const result = Prism.highlight(code, grammar, lang);
    return result;
  }

  /**
   * Picks a Prism formatter based on the `lang` hint and `code`.
   *
   * @param {string} code The source being highlighted.
   * @param {string=} lang A language hint (e.g. ````LANG`).
   * @returns {Prism.Grammar}
   */
  detectLang(code, lang) {
    if (!lang) {
      // Stupid simple detection if we have no lang, courtesy of:
      // https://github.com/robdodson/mark-down/blob/ac2eaa/mark-down.html#L93-101
      // @ts-ignore
      return code.match(/^\s*</) ? Prism.languages.markup : Prism.languages.javascript;
    }
    // @ts-ignore
    if (Prism.languages[lang]) {
      // @ts-ignore
      return Prism.languages[lang];
    }
    switch (lang.substr(0, 2)) {
      case 'js':
      case 'es':
      case 'mj':
        // @ts-ignore
        return Prism.languages.javascript;
      case 'c':
        // @ts-ignore
        return Prism.languages.clike;
      default:
        // The assumption is that you're mostly documenting HTML when in HTML.
        // @ts-ignore
        return Prism.languages.markup;
    }
  }
}
