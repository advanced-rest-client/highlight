import { html } from 'lit-element';
import HtmlMd from '@pawel-up/html.md';
import '@anypoint-web-components/anypoint-button/anypoint-icon-button.js';
import ArcMarkedElement, { outputElement } from "./ArcMarkedElement.js";
import { MarkdownEditor } from './lib/MarkdownEditor.js';
import editorStyles from './styles/MdEditor.js';
import { formatBold, formatClear, formatIndentDecrease, formatIndentIncrease, formatItalic, formatListBulleted, formatListNumbered, formatQuote, formatStrikeThrough, formatUnderline, horizontalRule, insertLink } from './EditorIcons.js';
import { MarkdownSelection } from './lib/MarkdownSelection.js';
import { ActionsTooltip } from './plugins/ActionsTooltip.js';

/** @typedef {import('lit-html').TemplateResult} TemplateResult */
/** @typedef {import('./lib/EditorPlugin').EditorPlugin} EditorPlugin */

export const editorValue = Symbol('keyupHandler');
export const toolbarTemplate = Symbol('toolbarTemplate');
export const execAction = Symbol('execAction');
export const inputHandler = Symbol('inputHandler');
export const createLinkAction = Symbol('createLinkAction');
export const selectionValue = Symbol('selectionValue');
export const toolbarValue = Symbol('toolbarValue');

export default class MarkdownEditorElement extends ArcMarkedElement {
  /**
   * Registers a context selection toolbar plugin
   * @param {EditorPlugin} value
   */
  set contextToolbar(value) {
    const old = this[toolbarValue];
    if (old === value) {
      return;
    }
    if (old) {
      this[selectionValue].unregisterPlugin('selection', old);
    }
    this[toolbarValue] = value;
    this[selectionValue].registerPlugin('selection', value);
  }

  /**
   * @returns {EditorPlugin|undefined}
   */
  get contextToolbar() {
    return this[toolbarValue];
  }

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
    this[selectionValue] = new MarkdownSelection(this);
    /** @type {boolean} */
    this.toolbar = undefined;
  }

  connectedCallback() {
    super.connectedCallback();
    if (!this.hasAttribute('contentEditable')) {
      this.setAttribute('contentEditable', 'true');
    }
    this.addEventListener('keydown', this[editorValue].keydownHandler);
    this[selectionValue].listen(this.ownerDocument);
    this.contextToolbar = new ActionsTooltip();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('keydown', this[editorValue].keydownHandler);
    this[selectionValue].unlisten(this.ownerDocument);
    this.contextToolbar = undefined;
  }

  /**
   * Generates markdown content from the current editor.
   * @returns {string} 
   */
  toMarkdown() {
    const factory = new HtmlMd();
    return factory.generate(this[outputElement]);
  }

  /**
   * @param {Event} e
   */
  [execAction](e) {
    const button = /** @type HTMLElement[] */ (e.composedPath()).find((node) => node.localName === 'anypoint-icon-button');
    if (!button) {
      return;
    }
    e.preventDefault();
    const { cmd } = button.dataset;
    switch (cmd) {
      case 'bold':
      case 'italic':
      case 'underline':
      case 'removeFormat':
      case 'insertorderedlist':
      case 'insertunorderedlist':
      case 'indent':
      case 'outdent':
      case 'strikeThrough':
      case 'insertHorizontalRule':
        document.execCommand(cmd, false);
        this[outputElement].focus();
        break;
      case 'formatblock':
        document.execCommand(cmd, false, button.dataset.arg);
        this[outputElement].focus();
      break;
      case 'createLink':
        this[createLinkAction]();
        break;
      default:
    }
  }

  /**
   * Handles the create link action from the toolbar.
   */
  [createLinkAction]() {
    const range = window.getSelection().getRangeAt(0);
    const { startContainer, endContainer, startOffset, endOffset, collapsed } = range;
    if (collapsed) {
      // todo: render UI to ask for the link
      // todo2: when the current container is Text and the whole container has an URL then exec this as the link
      return;
    }
    if (startContainer !== endContainer) {
      // I am not sure what should happen here.
      return;
    }
    const { textContent } = startContainer;
    const value = textContent.substr(startOffset, endOffset);
    if (!value) {
      return;
    }
    if (value.startsWith('http:') || value.startsWith('https:')) {
      document.execCommand('createLink', false, value);
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

  /**
   * @returns {TemplateResult|string} The template for the toolbar.
   */
  [toolbarTemplate]() {
    if (!this.toolbar) {
      return '';
    }
    return html`
    <div class="toolbar" @mousedown="${this[execAction]}">
      <slot name="pre-toolbar"></slot>

      <anypoint-icon-button title="Bold" data-cmd="bold" tabindex="-1">
        <span class="icon">${formatBold}</span>
      </anypoint-icon-button>
      <anypoint-icon-button title="Italic" data-cmd="italic" tabindex="-1">
        <span class="icon">${formatItalic}</span>
      </anypoint-icon-button>
      <anypoint-icon-button title="Underline" data-cmd="underline" tabindex="-1">
        <span class="icon">${formatUnderline}</span>
      </anypoint-icon-button>
      <anypoint-icon-button title="Strike through" data-cmd="strikeThrough" tabindex="-1">
        <span class="icon">${formatStrikeThrough}</span>
      </anypoint-icon-button>
      <anypoint-icon-button title="Remove formatting" data-cmd="removeFormat" tabindex="-1">
        <span class="icon">${formatClear}</span>
      </anypoint-icon-button>
      <anypoint-icon-button title="Insert ordered list" data-cmd="insertorderedlist" tabindex="-1">
        <span class="icon">${formatListNumbered}</span>
      </anypoint-icon-button>
      <anypoint-icon-button title="Insert bullet list" data-cmd="insertunorderedlist" tabindex="-1">
        <span class="icon">${formatListBulleted}</span>
      </anypoint-icon-button>

      <anypoint-icon-button title="Decrease indent" data-cmd="outdent" tabindex="-1">
        <span class="icon">${formatIndentDecrease}</span>
      </anypoint-icon-button>
      <anypoint-icon-button title="Increase indent" data-cmd="indent" tabindex="-1">
        <span class="icon">${formatIndentIncrease}</span>
      </anypoint-icon-button>

      <anypoint-icon-button title="Insert quote" data-cmd="formatblock" data-arg="blockquote" tabindex="-1">
        <span class="icon">${formatQuote}</span>
      </anypoint-icon-button>

      <anypoint-icon-button title="Insert horizontal rule" data-cmd="insertHorizontalRule" tabindex="-1">
        <span class="icon">${horizontalRule}</span>
      </anypoint-icon-button>
      <anypoint-icon-button title="Insert link from selection" data-cmd="createLink" tabindex="-1">
        <span class="icon">${insertLink}</span>
      </anypoint-icon-button>

      <slot name="post-toolbar"></slot>
    </div>
    `;
  }
}
