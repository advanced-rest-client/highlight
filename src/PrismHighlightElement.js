/* eslint-disable lit-a11y/click-events-have-key-events */
/**
@license
Copyright 2018 The Advanced REST Client authors
Licensed under the Apache License, Version 2.0 (the "License"); you may not
use this file except in compliance with the License. You may obtain a copy of
the License at
http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
License for the specific language governing permissions and limitations under
the License.
*/
import { LitElement, html } from 'lit-element';
import { WorkspaceEvents, RequestEvents } from '@advanced-rest-client/arc-events';
import prismStyles from './styles/PrismStyles.js';
import elementStyles from './styles/PrismHighlight.js';
import { PrismHighlighter } from './PrismHighlighter.js';

/** @typedef {import('prismjs')} Prism */

export const rawTemplate = Symbol('rawTemplate');
export const highlightedTemplate = Symbol('highlightedTemplate');
export const handleLinks = Symbol('handleLinks');
export const tokenizeResults = Symbol('tokenizeResults');
export const outputElement = Symbol('outputElement');
export const highlight = Symbol('highlight');
export const rawChanged = Symbol('rawChanged');
export const highlighter = Symbol('highlighter');
export const highlightHandler = Symbol('highlightHandler');

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
  get styles() {
    return [ prismStyles, elementStyles ];
  }

  static get properties() {
    return {
      /**
       * A data to be highlighted and rendered.
       */
      code: { type: String },
      /**
       * Prism supported language.
       */
      lang: { type: String },
      /** 
       * When set it ignores syntax highlighting and only renders the code.
       */
      raw: { type: Boolean },
    };
  }

  /**
   * @returns {HTMLElement}
   */
  get [outputElement]() {
    return this.shadowRoot.querySelector('code');
  }

  constructor() {
    super();
    /** @type string */ 
    this.raw = undefined;
    /** @type string */ 
    this.code = undefined;
    /** @type string */ 
    this.lang = undefined;
    this[highlighter] = new PrismHighlighter(this[highlightHandler].bind(this));
  }

  /**
   * @param {Map<string | number | symbol, unknown>} change 
   */
  update(change) {
    super.update(change);
    if (change.has('code') || change.has('lang')) {
      this[highlight]();
    }
    if (change.has('raw')) {
      this[rawChanged]();
    }
  }

  firstUpdated() {
    /* istanbul ignore if */
    if (this[tokenizeResults] && !this.raw) {
      this[outputElement].innerHTML += this[tokenizeResults];
      this[tokenizeResults] = undefined;
    }
  }

  // Resets the state of the render to initial state.
  reset() {
    const node = this[outputElement];
    if (node) {
      node.innerHTML = '';
    }
  }

  /**
   * @param {string} code 
   */
  [highlightHandler](code) {
    const node = this[outputElement];
    /* istanbul ignore else */
    if (node) {
      node.innerHTML += code;
    } else {
      this[tokenizeResults] = code;
    }
  }

  async [rawChanged]() {
    await this.requestUpdate();
    if (!this.raw) {
      this[highlight]();
    }
  }
  
  /**
   * Highlights the code.
   */
  [highlight]() {
    const { code, lang, raw } = this;
    if ((!code && lang) || raw) {
      return;
    }
    this.reset();
    this[highlighter].debounce(code, lang);
  }

  /**
   * Handler for click events.
   *
   * @param {MouseEvent} e
   */
  [handleLinks](e) {
    const el = /** @type HTMLAnchorElement */ (e.target);
    if (el.localName !== 'a') {
      return;
    }
    const newEntity = e.ctrlKey || e.metaKey;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    const url = el.href;
    if (newEntity) {
      WorkspaceEvents.appendRequest(this, {
        method: 'GET',
        url,
      });
    } else {
      RequestEvents.State.urlChange(this, url);
    }
  }

  render() {
    const { raw } = this;
    return html`
      <style>${this.styles}</style>
      ${raw ? this[rawTemplate]() : this[highlightedTemplate]()}
    `;
  }

  [highlightedTemplate]() {
    return html`
    <pre class="parsed-content">
      <code id="output" class="language-" @click="${this[handleLinks]}"></code>
    </pre>
    `;
  }

  [rawTemplate]() {
    return html`
    <pre class="raw-content">
      <code id="output" class="raw">${this.code}</code>
    </pre>
    `;
  }
}
