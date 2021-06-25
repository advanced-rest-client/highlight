import { EditorPlugin } from "../EditorPlugin.js";

/** @typedef {import('../types').PluginExecuteOptions} PluginExecuteOptions */
/** @typedef {import('../ContentEditableEditor').ContentEditableEditor} ContentEditableEditor */
/** @typedef {import('../Logger').default} Logger */

export default class SpacePlugin extends EditorPlugin {
  /**
   * @returns {string[]}
   */
  get actions() {
    return ['Space'];
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
    if (this.spaceFromRange(editor, logger)) {
      logger.debug(`Prohibiting Space`);
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
  spaceFromRange(editor, logger) {
    const range = editor.getRange();
    const { startContainer, startOffset, collapsed } = range;
    if (!collapsed) {
      return false;
    }
    const { textContent } = startContainer;
    const preContent = textContent.substr(0, startOffset).trim();
    if (preContent === '-') {
      logger.debug('Creating an unordered list');
      const ul = document.createElement('ul');
      const li = document.createElement('li');
      ul.appendChild(li);
      editor.replaceNode(startContainer, ul);
      editor.selectCollapsed(li);
      return true;
    } 
    if (preContent === '1.') {
      logger.debug('Creating an ordered list');
      const ul = document.createElement('ol');
      const li = document.createElement('li');
      ul.appendChild(li);
      editor.replaceNode(startContainer, ul);
      editor.selectCollapsed(li);
      return true;
    }
    if (['#', '##', '###', '####', '######', '######'].includes(preContent)) {
      logger.debug('Creating a header', `H${preContent.length}`);
      const typedElement = /** @type HTMLElement */ (startContainer);
      const header = editor.addHeadline(preContent.length, typedElement);
      typedElement.parentNode.removeChild(typedElement);
      editor.selectCollapsed(header);
      return true;
    }
    if (/^```(\S+)?$/.test(preContent)) {
      logger.debug('Inserting a code block.', `H${preContent.length}`);
      editor.replaceCodeBlock(range);
      return true;
    }
    return false;
  }

  destroy() {}
}
