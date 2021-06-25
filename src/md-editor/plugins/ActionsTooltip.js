import { html, render } from "lit-html";
import { EditorPlugin } from "../EditorPlugin.js";
import defaultActions from './DefaultActions.js';
import listStyles from './ActionsTooltip.styles.js';

/** @typedef {import('../types').PluginExecuteOptions} PluginExecuteOptions */

const createTimer = Symbol('createTimer');
const createTooltip = Symbol('createTooltip');
const createContainer = Symbol('createContainer');
const createActions = Symbol('createActions');
const tooltipValue = Symbol('tooltipValue');
const toggleArrows = Symbol('toggleArrows');
const makeVisible = Symbol('makeVisible');
const containerValue = Symbol('containerValue');
const setContainer = Symbol('setContainer');
const documentScrollHandler = Symbol('documentScrollHandler');
const containerMouseDownAction = Symbol('containerMouseDownAction');
const documentKeydownHandler = Symbol('documentKeydownHandler');
const renderTitleSelector = Symbol('renderTitleSelector');
const createTitleSelector = Symbol('createTitleSelector');
const updateActivated = Symbol('updateActivated');
const hideTitleSelector = Symbol('hideTitleSelector');

export class ActionsTooltip extends EditorPlugin {
  /**
   * @returns {string[]} A list of actions that this plugin support.
   */
   get actions() {
    return ['selection'];
  }

  constructor() {
    super();
    this.createTimeout = 200;
    this.stylesApplied = false;
    this.hidden = true;
    /** 
     * @type {HTMLElement}
     */
    this[containerValue] = undefined;
    this[documentScrollHandler] = this[documentScrollHandler].bind(this);
    this[containerMouseDownAction] = this[containerMouseDownAction].bind(this);
    this[documentKeydownHandler] = this[documentKeydownHandler].bind(this);
  }

  /**
   * @param {PluginExecuteOptions} params The execution parameters
   * @returns {void}
   */
  execute({container}) {
    this[setContainer](container);
    const selection = document.getSelection();
    if (selection.rangeCount === 0) {
      return;
    }
    const range = selection.getRangeAt(0);
    const { collapsed } = range;
    if (collapsed) {
      this.hide();
    } else if (this[tooltipValue]) {
      this.hidden = false;
      this.refit();
    } else {
      this.hidden = false;
      this.create();
    }
  }

  /**
   * Hides the tooltip in the view.
   * Prefer hiding the tooltip over destroying it as it is less expensive 
   * to keep it in the DOM than re-creating it all over.
   */
  hide() {
    this.hidden = true;
    const node = this[tooltipValue];
    if (!node) {
      return;
    }
    if (node.classList.contains('md-editor-tooltip-active')) {
      node.classList.remove('md-editor-tooltip-active');
    }
    if (!node.classList.contains('md-editor-tooltip-hidden')) {
      node.classList.add('md-editor-tooltip-hidden');
    }
    this[hideTitleSelector]();
  }

  /**
   * Destroys the current tooltip, if any.
   */
  destroy() {
    this.hidden = true;
    const node = this[tooltipValue];
    if (!node) {
      return;
    }
    const lists = Array.from(node.querySelectorAll('.md-editor-tooltip-list,.md-editor-tooltip-headers-list'));
    lists.forEach(list => list.removeEventListener('mousedown', this[containerMouseDownAction]));
    node.parentNode.removeChild(node);
    this[tooltipValue] = undefined;
  }

  /**
   * Creates a tooltip with context actions over the current selection.
   */
  create() {
    this[createTooltip]();
    if (this[createTimer]) {
      clearTimeout(this[createTimer]);
    }
    this[createTimer] = setTimeout(() => {
      this[createTimer] = undefined;
      this.refit();
    }, this.createTimeout);
  }

  /**
   * Repositions the container relative to the current selection and shows it when needed.
   */
  refit() {
    const container = this[tooltipValue];
    if (!container || this.hidden) {
      return;
    }
    const selection = document.getSelection();
    if (selection.rangeCount === 0 || !container) {
      return;
    }
    const range = selection.getRangeAt(0);
    // const { startContainer, endContainer } = range;
    const rangeRect = range.getBoundingClientRect();
    const listRect = container.getBoundingClientRect();

    // the x position of the tooltip center point
    const center = rangeRect.left + (rangeRect.width / 2);
    // move the tooltip to left by half of it's width relative to the center point.
    const left = center - (listRect.width / 2);
    container.style.left = `${left}px`;
    // render the list above the selection only when there's enough space to show it.
    const isAbove = rangeRect.top > listRect.height + 20; // + 20 as a padding
    /** @type number */
    let top;
    if (isAbove) {
      top = rangeRect.top - listRect.height - 20;
    } else {
      top = rangeRect.bottom + 20;
    }
    container.style.top = `${top}px`;
    this[toggleArrows](isAbove);
    this[updateActivated](selection);
    this[makeVisible]();
  }

  /**
   * @param {HTMLElement} container
   */
  [setContainer](container) {
    if (this[containerValue] === container) {
      return;
    }
    const opts = /** @type EventListenerOptions */ ({
      passive: true,
    });
    if (this[containerValue]) {
      const win = this[containerValue].ownerDocument.defaultView;
      win.removeEventListener('scroll', this[documentScrollHandler], opts);
      win.removeEventListener('keydown', this[documentKeydownHandler], opts);
    }
    this[containerValue] = container;
    const { defaultView } = container.ownerDocument;
    defaultView.addEventListener('scroll', this[documentScrollHandler], opts);
    defaultView.addEventListener('keydown', this[documentKeydownHandler], opts);
  }

  /**
   * Toggles the arrows position depending on the position of the tooltip
   * @param {boolean} isAbove
   */
  [toggleArrows](isAbove) {
    const node = this[tooltipValue];
    if (isAbove) {
      node.classList.add('md-editor-tooltip-arrow-under');
      if (node.classList.contains('md-editor-tooltip-arrow-over')) {
        node.classList.remove('md-editor-tooltip-arrow-over');
      }
    } else {
      node.classList.add('md-editor-tooltip-arrow-over');
      if (node.classList.contains('md-editor-tooltip-arrow-under')) {
        node.classList.remove('md-editor-tooltip-arrow-under');
      }
    }
  }

  /**
   * Makes the container visible.
   */
  [makeVisible]() {
    const node = this[tooltipValue];
    if (node.classList.contains('md-editor-tooltip-hidden')) {
      node.classList.remove('md-editor-tooltip-hidden');
    }
    if (!node.classList.contains('md-editor-tooltip-active')) {
      node.classList.add('md-editor-tooltip-active');
    }
  }

  /**
   * Adds styles to the current document for the actions positioning. 
   */
  applyStyles() {
    if (this.stylesApplied) {
      return;
    }
    this.stylesApplied = true;
    try {
      // @ts-ignore
      document.adoptedStyleSheets = document.adoptedStyleSheets.concat(listStyles.styleSheet);
    } catch (_) {
      /* istanbul ignore next */
      const s = document.createElement('style');
      s.innerHTML = listStyles.cssText;
      document.getElementsByTagName('head')[0].appendChild(s);
    }
  }

  /**
   * Creates a tooltip over the current selection
   */
  [createTooltip]() {
    if (this[tooltipValue]) {
      return;
    }
    const selection = document.getSelection();
    if (selection.rangeCount === 0) {
      return;
    }
    this.applyStyles();
    const list = this[createContainer]();
    this[createActions](list);
    this[createTitleSelector](this[tooltipValue]);
  }

  /**
   * Creates a container for the actions.
   * @returns {HTMLElement}
   */
  [createContainer]() {
    const container = document.createElement('div');
    container.classList.add('md-editor-tooltip-actions', 'md-editor-tooltip-hidden');
    const list = document.createElement('ul');
    list.classList.add('md-editor-tooltip-list');
    this[tooltipValue] = container;
    container.appendChild(list)
    document.body.appendChild(container);
    list.addEventListener('mousedown', this[containerMouseDownAction]);
    return list;
  }

  /**
   * Creates action for the current selection and appends them to the container.
   * @param {HTMLElement} parent
   */
  [createActions](parent) {
    defaultActions.forEach((action) => {
      const { execute, icon, title } = action;
      const item = document.createElement('li');
      item.classList.add('md-editor-tooltip-list-item');
      const content = html`<button title="${title}" data-cmd="${execute}" class="md-editor-tooltip-list-button">
        <span class="icon">${icon}</span>
      </button>`;
      render(content, item);
      parent.appendChild(item);
    });
  }

  /**
   * Creates a list of title selection options
   * @param {HTMLElement} parent
   */
  [createTitleSelector](parent) {
    const list = document.createElement('ol');
    list.classList.add('md-editor-tooltip-headers-list', 'hidden');
    const parts = [];
    [
      1, 2, 3, 4, 5, 6,
    ].forEach((no) => {
      parts.push(html`
      <li class="md-editor-tooltip-headers-list-item">
        <button title="Insert H${no}" data-arg="H${no}" data-cmd="formatBlock" class="md-editor-tooltip-list-button">H${no}</button>
      </li>
      `);
    });
    render(parts, list);
    parent.appendChild(list);
    list.addEventListener('mousedown', this[containerMouseDownAction]);
  }

  /**
   * Repositions the container on document scroll.
   */
  [documentScrollHandler]() {
    this.refit();
  }

  /**
   * @param {MouseEvent} e
   */
  [containerMouseDownAction](e) {
    const path = /** @type HTMLElement[] */ (e.composedPath());
    const target = path.find((node) => node.nodeType === Node.ELEMENT_NODE && node.dataset.cmd);
    if (!target) {
      return;
    }
    e.preventDefault();
    this.executeCommand(target.dataset.cmd, target.dataset.arg);
  }

  /**
   * @param {KeyboardEvent} e
   */
  [documentKeydownHandler](e) {
    if (e.code === 'Escape') {
      this.hide();
    }
  }

  /**
   * Executes editor command.
   * @param {string} cmd The command to execute.
   * @param {string=} arg Optional argument.
   */
  executeCommand(cmd, arg) {
    switch (cmd) {
      case 'bold':
      case 'italic':
      case 'underline':
        document.execCommand(cmd, false);
        this[containerValue].focus();
        break;
      case 'formatBlock':
        document.execCommand(cmd, false, arg);
        this[containerValue].focus();
        break;
      case 'title-selector':
        this[renderTitleSelector]();
        break;
      default: // console.log(cmd, arg);
    }
  }

  /**
   * Hides the main list and renders the titles selector.
   */
  [renderTitleSelector]() {
    const node = this[tooltipValue];
    if (!node) {
      return;
    }
    const mainList = node.querySelector('ul.md-editor-tooltip-list');
    mainList.classList.add('hidden');
    const titleList = node.querySelector('ol.md-editor-tooltip-headers-list');
    titleList.classList.remove('hidden');
  }

  /**
   * Hides the titles selector and renders the main list.
   */
  [hideTitleSelector]() {
    const node = this[tooltipValue];
    if (!node) {
      return;
    }
    const mainList = node.querySelector('ul.md-editor-tooltip-list');
    if (mainList.classList.contains('hidden')) {
      mainList.classList.remove('hidden');
    }
    const titleList = node.querySelector('ol.md-editor-tooltip-headers-list');
    if (!titleList.classList.contains('hidden')) {
      titleList.classList.add('hidden');
    }
  }

  /**
   * Updates the status of the current activated menu items from the current selection.
   * @param {Selection} selection
   */
  [updateActivated](selection) {
    const cnt = selection.rangeCount;
    if (!cnt) {
      return;
    }
    const range = selection.getRangeAt(0);
    const { startContainer, endContainer } = range;
    const nodes = [];
    if (startContainer === endContainer) {
      nodes.push(startContainer);
    } else {
      const parent = range.commonAncestorContainer;
      let capture = false;
      Array.from(parent.childNodes).forEach((node) => {
        if (node === startContainer) {
          capture = true;
        } else if (node === endContainer) {
          nodes.push(node);
          capture = true;
        }
        if (capture) {
          nodes.push(node);
        }
      });
    }
    const editor = this[containerValue];
    const actions = [];
    nodes.forEach((node) => {
      let current = node;
      // eslint-disable-next-line no-constant-condition
      while (true) {
        if (!current || current === editor) {
          break;
        }
        if (current.nodeType !== Node.ELEMENT_NODE) {
          current = current.parentNode;
          continue;
        }
        const elm = /** @type HTMLElement */ (current);
        const { localName } = elm;
        const active = defaultActions.filter((action) => action.activated.includes(localName));
        active.forEach((action) => {
          if (!actions.includes(action.execute)) {
            actions.push(action.execute);
          }
        });
        current = current.parentNode;
      }
    });
    const buttons = /** @type HTMLElement[] */ (Array.from(this[tooltipValue].querySelectorAll('.md-editor-tooltip-list button')));
    buttons.forEach(button => {
      const { cmd } = button.dataset;
      if (!cmd) {
        return;
      }
      const activated = actions.includes(cmd);
      if (activated && !button.classList.contains('md-editor-tooltip-list-active')) {
        button.classList.add('md-editor-tooltip-list-active');
      } else if (!activated && button.classList.contains('md-editor-tooltip-list-active')) {
        button.classList.remove('md-editor-tooltip-list-active');
      }
    });
  }
}
