/* eslint-disable class-methods-use-this */
import { html, css, LitElement } from 'lit-element';
import sanitizer from 'dompurify';
import marked from './MarkedImport.js';
import { PrismHighlighter } from './PrismHighlighter.js';

export const markdownValue = Symbol('markdownValue');
export const breaksValue = Symbol('breaksValue');
export const pedanticValue = Symbol('pedanticValue');
export const rendererValue = Symbol('rendererValue');
export const sanitizeValue = Symbol('sanitizeValue');
export const sanitizerValue = Symbol('sanitizerValue');
export const smartypants = Symbol('smartypants');
export const outputElement = Symbol('outputElement');
export const markdownElement = Symbol('markdownElement');
export const requestMarkdown = Symbol('requestMarkdown');
export const unindent = Symbol('unindent');
export const scriptAttributeHandler = Symbol('scriptAttributeHandler');
export const attachedValue = Symbol('attachedValue');
export const highlightMarkdown = Symbol('highlightMarkdown');
export const handleError = Symbol('handleError');

/**
Element wrapper for the [marked](https://github.com/chjj/marked) library.

`<marked-element>` accepts Markdown source and renders it to a child
element with the class `markdown-html`. This child element can be styled
as you would a normal DOM element. If you do not provide a child element
with the `markdown-html` class, the Markdown source will still be rendered,
but to a shadow DOM child that cannot be styled.

### Markdown Content

The Markdown source can be specified several ways:

#### Use the `markdown` attribute to bind markdown

```html
<marked-element markdown="`Markdown` is _awesome_!">
  <div slot="markdown-html"></div>
</marked-element>
```
#### Use `<script type="text/markdown">` element child to inline markdown

```html
<marked-element>
  <div slot="markdown-html"></div>
  <script type="text/markdown">
    Check out my markdown!
    We can even embed elements without fear of the HTML parser mucking up their
    textual representation:
  </script>
</marked-element>
```
#### Use `<script type="text/markdown" src="URL">` element child to specify remote markdown

```html
<marked-element>
  <div slot="markdown-html"></div>
  <script type="text/markdown" src="../guidelines.md"></script>
</marked-element>
```

Note that the `<script type="text/markdown">` approach is *static*. Changes to
the script content will *not* update the rendered markdown!

Though, you can data bind to the `src` attribute to change the markdown.

```html
<marked-element>
  <div slot="markdown-html"></div>
  <script type="text/markdown" src$="[[source]]"></script>
</marked-element>
<script>
  ...
  this.source = '../guidelines.md';
</script>
```

### Styling

If you are using a child with the `markdown-html` class, you can style it
as you would a regular DOM element:

```css
[slot="markdown-html"] p {
  color: red;
}
[slot="markdown-html"] td:first-child {
  padding-left: 24px;
}
```
 */
export default class ArcMarkedElement extends LitElement {
  get styles() {
    return css`
      :host {
        display: block;
        padding: var(--arc-marked-padding, 4px);
      }
    `;
  }

  static get properties() {
    return {
      /**
       * The markdown source to be rendered by this element.
       */
      markdown: { type: String },
      /**
       * Enable GFM line breaks (regular newlines instead of two spaces for
       * breaks)
       */
      breaks: { type: Boolean, reflect: true },
      /**
       * Conform to obscure parts of markdown.pl as much as possible. Don't fix
       * any of the original markdown bugs or poor behavior.
       */
      pedantic: { type: Boolean, reflect: true },
      /**
       * Function used to customize a renderer based on the [API specified in the
       * Marked
       * library](https://github.com/chjj/marked#overriding-renderer-methods).
       * It takes one argument: a marked renderer object, which is mutated by the
       * function.
       */
      renderer: { type: Function },
      /**
       * Sanitize the output. Ignore any HTML that has been input.
       */
      sanitize: { type: Boolean, reflect: true },
      /**
       * Function used to customize a sanitize behavior.
       * It takes one argument: element String without text Contents.
       *
       * e.g. `<div>` `<a href="/">` `</p>'.
       * Note: To enable this function, must set `sanitize` to true.
       * WARNING: If you are using this option to un-trusted text, you must to
       * prevent XSS Attacks.
       */
      sanitizer: { type: Function },
      /**
       * If true, disables the default sanitization of any markdown received by
       * a request and allows fetched un-sanitized markdown
       *
       * e.g. fetching markdown via `src` that has HTML.
       * Note: this value overrides `sanitize` if a request is made.
       */
      disableRemoteSanitization: { type: Boolean, reflect: true },
      /**
       * Use "smart" typographic punctuation for things like quotes and dashes.
       */
      smartypants: { type: Boolean, reflect: true }
    };
  }

  /**
   * @returns {string|undefined} The markdown source to be rendered by this element.
   */
  get markdown() {
    return this[markdownValue];
  }

  /**
   * @param {string|undefined} value The markdown source to be rendered by this element.
   */
  set markdown(value) {
    const old = this[markdownValue];
    if (old === value) {
      return;
    }
    this[markdownValue] = value;
    this.renderMarkdown();
    this.requestUpdate('markdown', old);
  }

  /**
   * @returns {boolean|undefined} Enable GFM line breaks (regular newlines instead of two spaces for
   * breaks)
   */
  get breaks() {
    return this[breaksValue];
  }

  set breaks(value) {
    const old = this[breaksValue];
    if (old === value) {
      return;
    }
    this[breaksValue] = value;
    this.renderMarkdown();
    this.requestUpdate('breaks', old);
  }

  get pedantic() {
    return this[pedanticValue];
  }

  set pedantic(value) {
    const old = this[pedanticValue];
    if (old === value) {
      return;
    }
    this[pedanticValue] = value;
    this.renderMarkdown();
    this.requestUpdate('pedantic', old);
  }

  get renderer() {
    return this[rendererValue];
  }

  set renderer(value) {
    const old = this[rendererValue];
    if (old === value) {
      return;
    }
    this[rendererValue] = value;
    this.renderMarkdown();
    this.requestUpdate('renderer', old);
  }

  get sanitize() {
    return this[sanitizeValue];
  }

  set sanitize(value) {
    const old = this[sanitizeValue];
    if (old === value) {
      return;
    }
    this[sanitizeValue] = value;
    this.renderMarkdown();
    this.requestUpdate('sanitize', old);
  }

  get sanitizer() {
    return this[sanitizerValue];
  }

  set sanitizer(value) {
    const old = this[sanitizerValue];
    if (old === value) {
      return;
    }
    this[sanitizerValue] = value;
    this.renderMarkdown();
    this.requestUpdate('sanitizer', old);
  }

  get smartypants() {
    return this[smartypants];
  }

  set smartypants(value) {
    const old = this[smartypants];
    if (old === value) {
      return;
    }
    this[smartypants] = value;
    this.renderMarkdown();
    this.requestUpdate('smartypants', old);
  }

  /**
   * @returns {HTMLElement}
   */
  get outputElement() {
    const slot = /** @type HTMLSlotElement */ (this.shadowRoot.querySelector('slot'));
    if (!slot) {
      return null;
    }
    const nodes = slot.assignedNodes();
    const child = /** @type HTMLElement */ (nodes.find((node) => node.nodeType === 1 && (/** @type HTMLElement */ (node)).getAttribute('slot') === 'markdown-html'));
    return child || /** @type HTMLElement */ (this.shadowRoot.querySelector('#content'));
  }

  constructor() {
    super();
    this.disableRemoteSanitization = false;
  }

  firstUpdated() {
    this[outputElement] = this.outputElement;
    if (this.markdown) {
      this.renderMarkdown();
      return;
    }

    // Use the Markdown from the first `<script>` descendant whose MIME type
    // starts with "text/markdown". Script elements beyond the first are
    // ignored.
    this[markdownElement] = /** @type HTMLScriptElement */ (this.querySelector('[type="text/markdown"]'));
    if (!this[markdownElement]) {
      return;
    }

    if (this[markdownElement].src) {
      this[requestMarkdown](this[markdownElement].src);
    }

    if (this[markdownElement].textContent.trim() !== '') {
      this.markdown = this[unindent](this[markdownElement].textContent);
    }

    const observer = new MutationObserver(this[scriptAttributeHandler].bind(this));
    observer.observe(this[markdownElement], { attributes: true });
  }

  connectedCallback() {
    super.connectedCallback();
    this[attachedValue] = true;
    this[outputElement] = this.outputElement;
    this.renderMarkdown();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this[attachedValue] = false;
  }

  /**
   * Un-indents the markdown source that will be rendered.
   *
   * @param {string} text
   * @return {string}
   */
  unindent(text) {
    return this[unindent](text);
  }

  /**
   * Renders `markdown` into this element's DOM.
   *
   * This is automatically called whenever the `markdown` property is changed.
   *
   * The only case where you should be calling this is if you are providing
   * markdown via `<script type="text/markdown">` after this element has been
   * constructed (or updating that markdown).
   * @event markedrendercomplete
   */
  renderMarkdown() {
    if (!this[attachedValue]) {
      return;
    }
    if (!this[outputElement]) {
      return;
    }

    if (!this.markdown) {
      this[outputElement].innerHTML = '';
      return;
    }
    const renderer = new marked.Renderer();
    if (this.renderer) {
      this.renderer(renderer);
    }
    const data = this.markdown;
    const opts = {
      renderer,
      highlight: this[highlightMarkdown].bind(this),
      breaks: this.breaks,
      pedantic: this.pedantic,
      smartypants: this.smartypants
    };
    let out = marked(data, opts);
    if (this.sanitize) {
      if (this.sanitizer) {
        out = this.sanitizer(out);
      } else {
        const result = sanitizer.sanitize(out);
        if (typeof result === 'string') {
          out = result;
        } else {
          // @ts-ignore
          out = result.toString();
        }
      }
    }
    this[outputElement].innerHTML = out;
    this.dispatchEvent(new CustomEvent('markedrendercomplete'));
  }

  /**
   * Fired when the content is being processed and before it is rendered.
   * Provides an opportunity to highlight code blocks based on the programming
   * language used. This is also known as syntax highlighting. One example would
   * be to use a prebuilt syntax highlighting library, e.g with
   * [highlightjs](https://highlightjs.org/).
   *
   * @param {string} code
   * @param {string} lang
   * @return {string}
   */
  [highlightMarkdown](code, lang) {
    const factory = new PrismHighlighter();
    const result = factory.tokenize(code, lang);
    return result;
  }

  /**
   * @param {string} text
   * @return {string}
   */
  [unindent](text) {
    if (!text) {
      return text;
    }
    const lines = text.replace(/\t/g, '  ').split('\n');
    const indent = /** @type number */ (lines.reduce((prev, line) => {
      if (/^\s*$/.test(line)) {
        return prev; // Completely ignore blank lines.
      }
      const lineIndent = line.match(/^(\s*)/)[0].length;
      if (prev === null) {
        return lineIndent;
      }
      // @ts-ignore
      return lineIndent < prev ? lineIndent : prev;
    }, null));

    return lines.map((l) => l.substr(indent)).join('\n');
  }

  /**
   * Fired when the XHR finishes loading
   *
   * @param {string} url
   * @event markedloaded
   */
  async [requestMarkdown](url) {
    try {
      const response = await fetch(url, {
        headers: { accept: 'text/markdown' },
      });
      const { status } = response;
      if (status === 0 || (status >= 200 && status < 300)) {
        this.sanitize = !this.disableRemoteSanitization;
        this.markdown = await response.text();
        this.dispatchEvent(new CustomEvent('markedloaded'));
      } else {
        throw new Error('Unable to download the data');
      }
    } catch (e) {
      this[handleError](e);
    }
  }

  /**
   * Fired when an error is received while fetching remote markdown content.
   *
   * @param {Error} e
   * @event markedloaderror
   * @fires markedloaderror
   */
  [handleError](e) {
    const evt = new CustomEvent('markedloaderror', {
      composed: true,
      bubbles: true,
      cancelable: true,
      detail: e
    });
    this.dispatchEvent(evt);
    if (!evt.defaultPrevented) {
      this.markdown = 'Failed loading markdown source';
    }
  }

  /**
   * @param {MutationRecord[]} mutation
   */
  [scriptAttributeHandler](mutation) {
    if (mutation[0].attributeName !== 'src') {
      return;
    }
    this[requestMarkdown](this[markdownElement].src);
  }

  render() {
    return html`
      <style>${this.styles}</style>
      <slot name="markdown-html"><div id="content"></div></slot>
    `;
  }
}
