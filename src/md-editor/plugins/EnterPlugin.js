import { EditorPlugin } from "../EditorPlugin.js";

/** @typedef {import('../types').PluginExecuteOptions} PluginExecuteOptions */
/** @typedef {import('../ContentEditableEditor').ContentEditableEditor} ContentEditableEditor */
/** @typedef {import('../Logger').default} Logger */

export default class EnterPlugin extends EditorPlugin {
  /**
   * @returns {string[]}
   */
  get actions() {
    return ['Enter'];
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
    if (this.enterFromRange(editor, e.shiftKey, logger)) {
      logger.debug(`Prohibiting Enter`);
      e.preventDefault();
    }
  }

  /**
   * Processes enter key press in the current range.
   * Usually it means to create a new line. However, depending on the caret position it may
   * move a content to the next line.
   * The next line is a `p` element, unless the current selection is inside a list or a table.
   * 
   * @param {ContentEditableEditor} editor
   * @param {boolean} shiftKey
   * @param {Logger} logger
   * @returns {boolean} True when the action is performed.
   */
  enterFromRange(editor, shiftKey, logger) {
    const range = editor.getRange();
    const { startContainer, endContainer, collapsed, startOffset } = range;
    if (startContainer !== endContainer) {
      logger.debug('Unable to process Enter key when multiple containers are selected.');
      return false;
    }
    if (collapsed) {
      const { textContent } = startContainer;
      const preContent = textContent.substr(0, startOffset).trim();
      if (/^```(\S+)?$/.test(preContent)) {
        editor.replaceCodeBlock(range);
        return true;
      }
    }
    const blockParent = editor.findParentNonTextElement(startContainer);
    if (!blockParent) {
      return false;
    }
    if (blockParent.localName === 'pre') {
      if (shiftKey) {
        return false;
      }
      const node = editor.insertNewLine(blockParent, true);
      editor.selectCollapsed(node);
      // TODO: reformat the code block.
      return true;
    }
    return false;
  }

  destroy() {}
}
