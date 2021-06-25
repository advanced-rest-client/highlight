import { EditorPlugin } from "../EditorPlugin.js";

/** @typedef {import('../types').PluginExecuteOptions} PluginExecuteOptions */
/** @typedef {import('../ContentEditableEditor').ContentEditableEditor} ContentEditableEditor */
/** @typedef {import('../Logger').default} Logger */

export default class BackspacePlugin extends EditorPlugin {
  /**
   * @returns {string[]}
   */
  get actions() {
    return ['Backspace'];
  }

  /**
   * Makes sure that the new line does not contain elements from the previous
   * line.
   * 
   * @param {PluginExecuteOptions} params The execution parameters
   * @returns {void}
   */
  execute({editor, args, logger}) {
    const e = /** @type KeyboardEvent */ (args);
    if (this.backspaceFromRange(editor, logger)) {
      logger.debug(`Prohibiting Backspace`);
      e.preventDefault();
    }
  }

  /**
   * A handler for the Back space character.
   * 
   * @param {ContentEditableEditor} editor
   * @param {Logger} logger
   * @returns {boolean} True when the action is performed.
   */
  backspaceFromRange(editor, logger) {
    const range = editor.getRange();
    const { startContainer, startOffset, collapsed } = range;
    if (!collapsed) {
      return false;
    }
    const isElement = startContainer.nodeType === Node.ELEMENT_NODE;
    const typedElement = /** @type HTMLElement */ (startContainer);
    if (['ul', 'ol'].includes(typedElement.localName)) {
      const item = /** @type Element */ (typedElement.childNodes[startOffset - 1]);
      if (item.nodeType !== Node.ELEMENT_NODE) {
        return false;
      }
      const focusNode = item.previousElementSibling || item.nextElementSibling;
      if (!focusNode) {
        logger.debug('Removing a list item and adding new line.');
        const line = editor.insertNewLine(typedElement, true);
        typedElement.parentElement.removeChild(typedElement);
        editor.selectCollapsed(line);
      } else {
        logger.debug('Removing a list item.');
        typedElement.removeChild(item);
        editor.selectCollapsed(focusNode);
      }
      return true;
    } 
    if (['li'].includes(typedElement.localName) && typedElement.textContent.trim() === '') {
      logger.debug('Removing a list item.');
      const focusNode = editor.removeListItem(typedElement);
      editor.selectCollapsed(focusNode);
      return true;
    }
    if (isElement && typedElement.textContent.trim() === '') {
      typedElement.parentElement.removeChild(typedElement);
      return true;
    }
    return false;
  }

  destroy() {}
}
