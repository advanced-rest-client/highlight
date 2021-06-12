import { LitElement, TemplateResult, CSSResult } from 'lit-element';
import { PrismHighlighter } from './PrismHighlighter';

export const rawTemplate: unique symbol;
export const highlightedTemplate: unique symbol;
export const handleLinks: unique symbol;
export const tokenizeResults: unique symbol;
export const outputElement: unique symbol;
export const highlight: unique symbol;
export const rawChanged: unique symbol;
export const highlighter: unique symbol;
export const highlightHandler: unique symbol;

/**
 * Syntax highlighting via Prism
 *
 * ### Example
 *
 * ```html
 * <prism-highlight id="c1" lang="markdown"></prism-highlight>
 * <script>
 *  document.querySelector('#c1').code = '# Test highlight';
 * &lt;/script>
 * ```
 *
 * The `lang` attribute is required and the component will not start parsing data without it.
 *
 * Changing the `lang` and `code` properties together, do it in less than 10 ms.
 * The element is set to commit changes after this time period. Otherwise it may display
 * old and new code due to the asynchronous nature of the code highlighter.
 */
export default class PrismHighlightElement extends LitElement {
  get styles(): CSSResult[];
  /**
   * A data to be highlighted and rendered.
   * @attribute
   */
  code: string;
  /**
  * Prism supported language.
  * @attribute
  */
  lang: string;
  /** 
  * When set it ignores syntax highlighting and only renders the code.
  * @attribute
  */
  raw: boolean;

  get [outputElement](): HTMLElement;

  [highlighter]: PrismHighlighter;

  constructor();

  // Resets the state of the display to initial state.
  reset(): void;
  
  [highlightHandler](code: string): void;

  [rawChanged](): Promise<void>;
  /**
   * Highlights the code.
   */
  [highlight](): void;

  /**
   * Handler for click events.
   * It dispatches `url-change-action` custom event when a link is clicked.
   */
  [handleLinks](e: MouseEvent): void;
  
  render(): TemplateResult;

  [highlightedTemplate](): TemplateResult;

  [rawTemplate](): TemplateResult;
}
