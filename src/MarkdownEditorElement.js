import { html } from 'lit-element';
import ArcMarkedElement from "./ArcMarkedElement.js";
import { MarkdownEditor } from './lib/MarkdownEditor.js';
import editorStyles from './styles/MdEditor.js';

export const editorValue = Symbol('keyupHandler');
export const toolbarTemplate = Symbol('toolbarTemplate');
export const execAction = Symbol('execAction');

export default class MarkdownEditorElement extends ArcMarkedElement {
  static get properties() {
    return {
      /** 
       * When set it renders a toolbar with commands.
       */
      toolbar: { type: Boolean, reflect: true },
    };
  }

  constructor() {
    super();
    this[editorValue] = new MarkdownEditor();
    this[editorValue].debug = true;
    /** @type {boolean} */
    this.toolbar = undefined;
  }

  connectedCallback() {
    super.connectedCallback();
    if (!this.hasAttribute('contentEditable')) {
      this.setAttribute('contentEditable', 'true');
    }
    this.addEventListener('keydown', this[editorValue].keydownHandler);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('keydown', this[editorValue].keydownHandler);
  }

  /**
   * @param {Event} e
   */
  [execAction](e) {
    const ico = /** @type HTMLElement */ (e.target);
    const { cmd } = ico.dataset;
    switch (cmd) {
      case 'bold':
      case 'italic':
      case 'underline':
        document.execCommand(cmd, false);
        break;
      default: 
    }
  }

  render() {
    return html`
      <style>${this.styles}</style>
      <style>${editorStyles}</style>
      ${this[toolbarTemplate]()}
      <slot name="markdown-html"><div id="content"></div></slot>
    `;
  }

  [toolbarTemplate]() {
    if (!this.toolbar) {
      return '';
    }
    return html`
    <div class="toolbar" @click="${this[execAction]}">
      <img class="intLink" title="Bold" alt="" data-cmd="bold" src="data:image/gif;base64,R0lGODlhFgAWAID/AMDAwAAAACH5BAEAAAAALAAAAAAWABYAQAInhI+pa+H9mJy0LhdgtrxzDG5WGFVk6aXqyk6Y9kXvKKNuLbb6zgMFADs=" />
      <img class="intLink" title="Italic" alt="" data-cmd="italic" src="data:image/gif;base64,R0lGODlhFgAWAKEDAAAAAF9vj5WIbf///yH5BAEAAAMALAAAAAAWABYAAAIjnI+py+0Po5x0gXvruEKHrF2BB1YiCWgbMFIYpsbyTNd2UwAAOw==" />
      <img class="intLink" title="Underline" data-cmd="underline" alt="" src="data:image/gif;base64,R0lGODlhFgAWAKECAAAAAF9vj////////yH5BAEAAAIALAAAAAAWABYAAAIrlI+py+0Po5zUgAsEzvEeL4Ea15EiJJ5PSqJmuwKBEKgxVuXWtun+DwxCCgA7" />
    </div>
    `;
  }
}
