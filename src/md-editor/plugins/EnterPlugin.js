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
    if (blockParent.localName === 'pre') {
      if (shiftKey) {
        // Chrome and Safari copies the current node to the new line.
        // This may be a text block processed by Prism library with generated
        // syntax highlighting. We don't want that and therefore we focus on the code itself.
        // const el = this.elementBeforeCode(startContainer);
        // console.log(el, el.nextSibling);
        // if (el && el.nextSibling && el.nextSibling.nodeType === Node.TEXT_NODE && el.nextSibling.nodeValue.trim()) {
        //   // insert a text node in between and focus there.
        //   const txt = new Text();
        //   el.parentNode.insertBefore(txt, el.nextSibling);
        //   editor.focusNode(txt);
        // } else {
        //   editor.focusNode(blockParent);
        // }
        return false;
      }
      const node = editor.insertNewLine(blockParent, true);
      editor.selectCollapsed(node);
      // TODO: reformat the code block.
      return true;
    }
    return false;
  }

  // /**
  //  * Finds a parent element that is a direct child of the `<code>` element.
  //  * @param {Node} node
  //  * @returns {Node}
  //  */
  // elementBeforeCode(node) {
  //   let last = null;
  //   let current = node;
  //   // eslint-disable-next-line no-constant-condition
  //   while (true) {
  //     if (!current) {
  //       return null;
  //     }
  //     if (current.nodeName === 'CODE') {
  //       return last;
  //     }
  //     last = current;
  //     current = current.parentNode;
  //   }
  // }

  destroy() {}
}
