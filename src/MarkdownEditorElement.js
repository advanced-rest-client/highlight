import { html } from 'lit-element';
import HtmlMd from '@pawel-up/html.md';
import '@anypoint-web-components/awc/anypoint-icon-button.js';
import ArcMarkedElement, { outputElement } from "./ArcMarkedElement.js";
import { MarkdownEditor } from './md-editor/MarkdownEditor.js';
import editorStyles from './styles/MdEditor.js';
import { formatBold, formatClear, formatIndentDecrease, formatIndentIncrease, formatItalic, formatListBulleted, formatListNumbered, formatQuote, formatStrikeThrough, formatUnderline, horizontalRule, insertLink } from './EditorIcons.js';
import { ActionsTooltip } from './md-editor/plugins/ActionsTooltip.js';
import DeletePlugin from './md-editor/plugins/DeletePlugin.js';
import BackquotePlugin from './md-editor/plugins/BackquotePlugin.js';
import EnterPlugin from './md-editor/plugins/EnterPlugin.js';
import SpacePlugin from './md-editor/plugins/SpacePlugin.js';

/** @typedef {import('lit-html').TemplateResult} TemplateResult */
/** @typedef {import('./md-editor/EditorPlugin').EditorPlugin} EditorPlugin */

export const editorValue = Symbol('keyupHandler');
export const toolbarTemplate = Symbol('toolbarTemplate');
export const execAction = Symbol('execAction');
export const inputHandler = Symbol('inputHandler');
export const createLinkAction = Symbol('createLinkAction');
export const toolbarValue = Symbol('toolbarValue');
export const registerPlugins = Symbol('registerPlugins');
export const contextToolbarEnabledValue = Symbol('contextToolbarEnabledValue');
export const documentValue = Symbol('documentValue');

export default class MarkdownEditorElement extends ArcMarkedElement {
  /**
   * @returns {DocumentOrShadowRoot} A reference to the document object used for selection manipulation.
   */
  get document() {
    return this[documentValue] || this.ownerDocument;
  }

  /**
   * @param {DocumentOrShadowRoot} value A reference to the document object used for selection manipulation.
   */
  set document(value) {
    const old = this[documentValue];
    if (old === value) {
      return;
    }
    this[documentValue] = value;
    this[editorValue].document = this.document;
  }

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
      this[editorValue].unregisterPlugin(old);
    }
    this[toolbarValue] = value;
    if (value) {
      this[editorValue].registerPlugin(value);
    }
  }

  /**
   * @returns {EditorPlugin|undefined}
   */
  get contextToolbar() {
    return this[toolbarValue];
  }

  /**
   * Registers a context selection toolbar plugin
   * @param {boolean} value
   */
  set contextToolbarEnabled(value) {
    const old = this[contextToolbarEnabledValue];
    if (old === value) {
      return;
    }
    this[contextToolbarEnabledValue] = value;
    this.requestUpdate('contextToolbarEnabled', old);
    if (value) {
      this.contextToolbar = new ActionsTooltip();
    }
  }

  /**
   * @returns {boolean|undefined}
   */
  get contextToolbarEnabled() {
    return this[contextToolbarEnabledValue];
  }

  /**
   * @returns {boolean} Whether the editor is in the debug mode.
   */
  get debug() {
    return this[editorValue].debug;
  }

  /**
   * @param {boolean} value Whether the editor is in the debug mode.
   */
  set debug(value) {
    const old = this.debug;
    if (old === value) {
      return;
    }
    this[editorValue].debug = value;
    this.requestUpdate('debug', old);
  }

  /**
   * @returns {MarkdownEditor} A reference to the MarkdownEditor instance.
   */
  get editor() {
    return this[editorValue];
  }

  static get properties() {
    return {
      /** 
       * When set it renders a toolbar with commands.
       */
      toolbar: { type: Boolean, reflect: true },
      /** 
       * When set it registers the default text context tooltip.
       */
      contextToolbarEnabled: { type: Boolean, reflect: true },
      /**  
       * Whether the editor is in the debug mode.
       */
      debug: { type: Boolean, reflect: true },
    };
  }

  constructor() {
    super();
    this[editorValue] = new MarkdownEditor(this, this.document);
    // this[editorValue].debug = true;
    /** @type {boolean} */
    this.toolbar = undefined;
  }

  connectedCallback() {
    super.connectedCallback();
    if (!this.hasAttribute('contentEditable')) {
      this.setAttribute('contentEditable', 'true');
    }
    if (this.contextToolbarEnabled) {
      this.contextToolbar = new ActionsTooltip();
    }
    this[editorValue].listen();
    this[registerPlugins]();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.contextToolbar = undefined;
    this[editorValue].unlisten();
    this[editorValue].unregisterAllPlugins();
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
   * Registers editor plugins.
   */
  [registerPlugins]() {
    const ed = this[editorValue];
    ed.registerPlugin(new BackquotePlugin());
    ed.registerPlugin(new DeletePlugin());
    ed.registerPlugin(new EnterPlugin());
    ed.registerPlugin(new SpacePlugin());
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
    const doc = /** @type Document */ (this.document);
    const range = doc.getSelection().getRangeAt(0);
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
