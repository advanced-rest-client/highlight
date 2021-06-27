import { EditorPlugin } from "../EditorPlugin.js";

/** @typedef {import('../types').PluginExecuteOptions} PluginExecuteOptions */
/** @typedef {import('../ContentEditableEditor').ContentEditableEditor} ContentEditableEditor */
/** @typedef {import('../Logger').default} Logger */

export default class BackquotePlugin extends EditorPlugin {
  /**
   * @returns {string[]} A list of actions that this plugin support.
   */
  get actions() {
    return ['Backquote'];
  }

  /**
   * Inserts the Backquote into the current position in the editor.
   * 
   * @param {PluginExecuteOptions} params The execution parameters
   * @returns {void}
   */
  execute({editor, args, logger}) {
    const e = /** @type KeyboardEvent */ (args)
    if (this.codeBlockFromRange(editor, logger)) {
      e.preventDefault();
    }
  }

  /**
   * Surrounds contents of a range with a `code` block.
   * @param {ContentEditableEditor} helper
   * @param {Logger} logger
   * @returns {boolean} True when the code was surrounded with the code block.
   */
  codeBlockFromRange(helper, logger) {
    const range = helper.getRange();
    if (range.collapsed) {
      // this is handled by the Enter and Space plugin.
      return false;
    }
    return this.surroundCodeBlock(logger, range);
  }

  /**
   * Surrounds the selection with a `code` block.
   * @param {Logger} logger
   * @param {Range} range
   * @returns {boolean} True when the code was surrounded with the code block.
   */
  surroundCodeBlock(logger, range) {
    logger.debug('surrounding the selection with the code element');
    const code = document.createElement('code');
    range.surroundContents(code);
    return true;
  }

  destroy() {}
}
