import Element from './src/MarkdownEditorElement.js';

declare global {
  interface HTMLElementTagNameMap {
    "markdown-editor": Element;
  }
}
