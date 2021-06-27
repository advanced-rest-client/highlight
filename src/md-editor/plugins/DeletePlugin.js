import { EditorPlugin } from "../EditorPlugin.js";

/** @typedef {import('../types').PluginExecuteOptions} PluginExecuteOptions */
/** @typedef {import('../ContentEditableEditor').ContentEditableEditor} ContentEditableEditor */
/** @typedef {import('../Logger').default} Logger */

export default class DeletePlugin extends EditorPlugin {
  /**
   * @returns {string[]}
   */
  get actions() {
    return ['Delete'];
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
    if (this.deleteFromRange(editor, logger)) {
      logger.debug(`Prohibiting Delete`);
      e.preventDefault();
    }
  }

  /**
   * A handler for the Space character. 
   * 
   * @param {ContentEditableEditor} editor
   * @param {Logger} logger
   * @returns {boolean} True when the action is performed.
   */
  deleteFromRange(editor, logger) {
    const range = editor.getRange();
    const { startContainer, endContainer, startOffset, endOffset } = range;
    if (startContainer === endContainer) {
      // removing the whole thing
      if (startOffset === 0 && startContainer.textContent.length === endOffset) {
        logger.debug('Removing a node.', startContainer);
        startContainer.parentNode.removeChild(startContainer);
        return true;
      }
    }
    return false;
  }

  destroy() {}
}
