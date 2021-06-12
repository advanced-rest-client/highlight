import { TemplateResult, CSSResult, LitElement } from 'lit-element';

export declare const markdownValue: unique symbol;
export declare const breaksValue: unique symbol;
export declare const pedanticValue: unique symbol;
export declare const rendererValue: unique symbol;
export declare const sanitizeValue: unique symbol;
export declare const sanitizerValue: unique symbol;
export declare const smartypants: unique symbol;
export declare const outputElement: unique symbol;
export declare const markdownElement: unique symbol;
export declare const requestMarkdown: unique symbol;
export declare const unindent: unique symbol;
export declare const scriptAttributeHandler: unique symbol;
export declare const attachedValue: unique symbol;
export declare const highlightMarkdown: unique symbol;
export declare const handleError: unique symbol;

/**
Element wrapper for the [marked](https://github.com/chjj/marked) library.

Based on Polymer's `marked-element`.

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
@fires marked-render-complete
@fires markedrendercomplete
@fires marked-loadend
@fires markedloaded
@fires syntax-highlight
@fires markedloaderror
 */
export default class ArcMarkedElement extends LitElement {
  [markdownValue]: string;
  [breaksValue]: boolean;
  [pedanticValue]: boolean;
  [rendererValue]: Function;
  [sanitizeValue]: boolean;
  [sanitizerValue]: Function;
  [smartypants]: boolean;
  [outputElement]: HTMLElement;
  [markdownElement]: HTMLElement;

  get styles(): CSSResult | CSSResult[];

  /**
   * The markdown source that should be rendered by this element.
   * @attribute
   */
  markdown: string;
  /**
   * Enable GFM line breaks (regular newlines instead of two spaces for breaks)
   * @attribute
   */
  breaks: boolean;
  /**
   * Conform to obscure parts of markdown.pl as much as possible. Don't fix
   * any of the original markdown bugs or poor behavior.
   * @attribute
   */
  pedantic: boolean;
  /**
   * Function used to customize a renderer based on the [API specified in the
   * Marked
   * library](https://github.com/chjj/marked#overriding-renderer-methods).
   * It takes one argument: a marked renderer object, which is mutated by the function.
   */
  renderer: Function;
  /**
   * Sanitize the output. Ignore any HTML that has been input.
   * @attribute
   */
  sanitize: boolean;
  /**
   * Function used to customize a sanitize behavior.
   * It takes one argument: element String without text Contents.
   *
   * e.g. `<div>` `<a href="/">` `</p>'.
   * Note: To enable this function, must set `sanitize` to true.
   * WARNING: If you are using this option to un-trusted text, you must to
   * prevent XSS Attacks.
   */
  sanitizer: Function;
  /**
   * If true, disables the default sanitization of any markdown received by
   * a request and allows fetched un-sanitized markdown
   *
   * e.g. fetching markdown via `src` that has HTML.
   * Note: this value overrides `sanitize` if a request is made.
   * @attribute
   */
  disableRemoteSanitization: boolean;
  /**
   * Use "smart" typographic punctuation for things like quotes and dashes.
   * @attribute
   */
  smartypants: boolean;

  get outputElement(): HTMLElement;

  constructor();

  firstUpdated(): void;

  connectedCallback(): void;

  disconnectedCallback(): void;

  /**
   * Un-indents the markdown source that will be rendered.
   */
  unindent(text: string): string;

  /**
   * Renders `markdown` into this element's DOM.
   *
   * This is automatically called whenever the `markdown` property is changed.
   *
   * The only case where you should be calling this is if you are providing
   * markdown via `<script type="text/markdown">` after this element has been
   * constructed (or updating that markdown).
   */
  renderMarkdown(): void;

  /**
   * Fired when the content is being processed and before it is rendered.
   * Provides an opportunity to highlight code blocks based on the programming
   * language used. This is also known as syntax highlighting. One example would
   * be to use a prebuilt syntax highlighting library, e.g with
   * [highlightjs](https://highlightjs.org/).
   */
  [highlightMarkdown](code: string, lang: string): string;

  [unindent](text: string): string;

  /**
   * Fired when the XHR finishes loading
   *
   * @param {string} url
   * @event marked-loadend
   * @event markedloaded
   */
  [requestMarkdown](url: string): Promise<void>;

  /**
   * Fired when an error is received while fetching remote markdown content.
   *
   * @event markedloaderror
   * @fires markedloaderror
   */
  [handleError](e:Error): void;

  [scriptAttributeHandler](mutation: MutationRecord[]): void;

  render(): TemplateResult;
}
