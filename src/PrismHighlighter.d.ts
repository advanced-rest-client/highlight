import Prism from 'prismjs';

export const listener: unique symbol;
export const debounceTimer: unique symbol;

export declare class PrismHighlighter {
  /**
   * The number of milliseconds the library will wait before it runs the tokenizer.
   */
  debounceTimeout: number;
  [listener]?: (code: string) => any;
  [debounceTimer]?: any;
  /**
   * @param {()=} highlightListener The listener for the debounced code highlight
   */
  constructor(highlightListener?: (code: string) => any);

  /**
   * A function to be called to run the highlighter in a debouncer.
   * To use this library this way set the `highlightListener` in the constructor
   * which will be called when highlighting is done.
   * 
   * @param code The code to highlight
   * @param lang The language to use.
   */
  debounce(code: string, lang?: string): void;

  tokenize(code: string, lang?: string): string;

  /**
   * Picks a Prism formatter based on the `lang` hint and `code`.
   *
   * @param code The source being highlighted.
   * @param lang A language hint (e.g. ````LANG`).
   */
  detectLang(code: string, lang?: string): Prism.Grammar;
}
