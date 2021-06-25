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
      return this.codeBlockForSelection(helper, range, logger);
    }
    return this.surroundCodeBlock(logger, range);
  }

  /**
   * Surrounds the current selection with a `code` block.
   * @param {ContentEditableEditor} helper
   * @param {Range} range
   * @param {Logger} logger
   * @returns {boolean} True when the code was surrounded with the code block.
   */
  codeBlockForSelection(helper, range, logger) {
    const { startContainer, startOffset } = range;
    const { textContent } = startContainer;
    const isTextNode = startContainer.nodeType === Node.TEXT_NODE;
    const preContent = textContent.substr(0, startOffset);
    const index = preContent.indexOf('`');
    if (index === -1) {
      // this is the first "`" character in the range. Skip.
      logger.debug('Ignoring incomplete code block');
      return false;
    }
    const codeContent = preContent.substr(index + 1);
    if (!codeContent || codeContent === '`') {
      // don't create empty inline-code blocks as this may be part of creating a code block.
      return false;
    }
    const postContent = textContent.substr(startOffset);
    const beforeCodeContent = preContent.substr(0, index);
    // the result: 
    //   #text -> beforeCodeContent
    //   #code -> codeContent
    //   #text -> postContent
    const code = document.createElement('code');
    code.innerHTML = codeContent;
    if (isTextNode) {
      helper.replaceTextNodeContent(/** @type Text */ (startContainer), beforeCodeContent, code, postContent);
      helper.selectCollapsed(code.nextSibling);
    } else {
      logger.debug('Unsupported action code surround for an element node.');
    }
    return true
  }

  /**
   * Surrounds the selection with a `code` block.
   * @param {Logger} logger
   * @param {Range} range
   * @returns {boolean} True when the code was surrounded with the code block.
   */
  surroundCodeBlock(logger, range) {
    const { startContainer, endContainer } = range;
    if (startContainer !== endContainer) {
      logger.debug('Unable to surround a range with `code` as range spans over non text elements', range);
      return false;
    }
    const code = document.createElement('code');
    range.surroundContents(code);
    return true;
  }

  destroy() {}
}
