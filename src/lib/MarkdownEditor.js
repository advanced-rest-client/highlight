/* eslint-disable no-param-reassign */
export const backQuoteHandler = Symbol('backQuoteHandler');
export const enterHandler = Symbol('enterHandler');
export const spaceHandler = Symbol('spaceHandler');
export const backSpaceHandler = Symbol('backSpaceHandler');
export const deleteHandler = Symbol('deleteHandler');

/**
 * A class that handles key events on a content editable element to add support for Markdown.
 * 
 * To initialize editing use the `keydownHandler` to bind it to the element's `keydown` event.
 */
export class MarkdownEditor {
  constructor() {
    this.keydownHandler = this.keydownHandler.bind(this);
    this.debug = false;
    document.execCommand("defaultParagraphSeparator", false, "p");
  }

  /**
   * Logs output when the debug is enabled.
   * @param {...any} messages
   */
  log(...messages) {
    if (!this.debug) {
      return;
    }
    // eslint-disable-next-line no-console
    console.log.apply(console.log, messages)
  }

  /**
   * A handler for the key down event.
   * @param {KeyboardEvent} e 
   */
  keydownHandler(e) {
    switch (e.code) {
      case 'Backquote': this[backQuoteHandler](e); break;
      case 'Enter': 
      case 'NumpadEnter': this[enterHandler](e); break;
      case 'Space': this[spaceHandler](e); break;
      case 'Backspace': this[backSpaceHandler](e); break;
      case 'Delete': this[deleteHandler](e); break;
      default: 
        // console.log('code', e.code)
    }
  }

  /**
   * A handler for the back quote character. Replaces text with code element.
   * @param {KeyboardEvent} e 
   */
  [backQuoteHandler](e) {
    const range = window.getSelection().getRangeAt(0);
    if (this.codeBlockFromRange(range)) {
      e.preventDefault();
    }
  }

  /**
   * Surrounds contents of a range with a `code` block.
   * @param {Range} range
   * @returns {boolean} True when the code was surrounded with the code block.
   */
  codeBlockFromRange(range) {
    if (range.collapsed) {
      return this.codeBlockForSelection(range);
    }
    return this.surroundCodeBlock(range);
  }

  /**
   * Surrounds the current selection with a `code` block.
   * @param {Range} range
   * @returns {boolean} True when the code was surrounded with the code block.
   */
  codeBlockForSelection(range) {
    const { startContainer, startOffset } = range;
    const { textContent } = startContainer;
    const isTextNode = startContainer.nodeType === Node.TEXT_NODE;
    const preContent = textContent.substr(0, startOffset);
    const index = preContent.indexOf('`');
    if (index === -1) {
      // this is the first "`" character in the range. Skip.
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
      this.replaceTextNodeContent(/** @type Text */ (startContainer), beforeCodeContent, code, postContent);
      this.selectCollapsed(code.nextSibling);
    } else {
      this.log('Unsupported action code surround for an element node.');
    }
    return true
  }

  /**
   * Surrounds the selection with a `code` block.
   * @param {Range} range
   * @returns {boolean} True when the code was surrounded with the code block.
   */
  surroundCodeBlock(range) {
    const { startContainer, endContainer } = range;
    if (startContainer !== endContainer) {
      this.log('Unable to surround a range with `code` as range spans over non text elements', range);
      return false;
    }
    const code = document.createElement('code');
    range.surroundContents(code);
    return true;
  }

  /**
   * A handler for the Enter character. Makes sure that the new line does not contain elements from the previous
   * line.
   * @param {KeyboardEvent} e 
   */
  [enterHandler](e) {
    const range = window.getSelection().getRangeAt(0);
    if (this.enterFromRange(range, e.shiftKey)) {
      this.log(`Prohibiting Enter`);
      e.preventDefault();
    }
  }

  /**
   * Processes enter key press in the current range.
   * Usually it means to create a new line. However, depending on the caret position it may
   * move a content to the next line.
   * The next line is a `p` element, unless the current selection is inside a list or a table.
   * 
   * @param {Range} range
   * @param {boolean} shiftKey
   * @returns {boolean} True when the action is performed.
   */
  enterFromRange(range, shiftKey) {
    const { startContainer, endContainer, collapsed, startOffset } = range;
    if (startContainer !== endContainer) {
      this.log('Unable to process Enter key when multiple containers are selected.');
      return false;
    }
    if (collapsed) {
      const { textContent } = startContainer;
      const preContent = textContent.substr(0, startOffset).trim();
      if (/^```(\S+)?$/.test(preContent)) {
        this.replaceCodeBlock(range);
        return true;
      }
    }
    const blockParent = this.findParentNonTextElement(startContainer);
    if (!blockParent) {
      return false;
    }
    if (blockParent.localName === 'pre') {
      if (shiftKey) {
        return false;
      }
      const node = this.insertNewLine(blockParent, true);
      this.selectCollapsed(node);
      // TODO: reformat the code block.
      return true;
    }
    return false;
  }

  /**
   * A handler for the Space character. 
   * Enables lists editing.
   * 
   * @param {KeyboardEvent} e 
   */
  [spaceHandler](e) {
    const range = window.getSelection().getRangeAt(0);
    const { startContainer, startOffset, collapsed } = range;
    if (!collapsed) {
      return;
    }
    const { textContent } = startContainer;
    const preContent = textContent.substr(0, startOffset).trim();
    if (preContent === '-') {
      e.preventDefault();
      const ul = document.createElement('ul');
      const li = document.createElement('li');
      ul.appendChild(li);
      this.replaceNode(startContainer, ul);
      this.selectCollapsed(li);
      return;
    } 
    if (preContent === '1.') {
      e.preventDefault();
      const ul = document.createElement('ol');
      const li = document.createElement('li');
      ul.appendChild(li);
      this.replaceNode(startContainer, ul);
      this.selectCollapsed(li);
      return;
    }
    if (['#', '##', '###', '####', '######', '######'].includes(preContent)) {
      e.preventDefault();
      const typedElement = /** @type HTMLElement */ (startContainer);
      const header = this.addHeadline(preContent.length, typedElement);
      typedElement.parentNode.removeChild(typedElement);
      this.selectCollapsed(header);
      return;
    }
    if (/^```(\S+)?$/.test(preContent)) {
      e.preventDefault();
      this.replaceCodeBlock(range);
    }
    // console.log(preContent);
  }

  /**
   * Replaces current line with a code block.
   * This is called when a "```" with optional language definition is detected.
   * @param {Range} range
   */
  replaceCodeBlock(range) {
    const { startContainer, startOffset } = range;
    const { textContent } = startContainer;
    const preContent = textContent.substr(0, startOffset).trim();
    const lang = preContent.replace('```', '').trim();

    const pre = document.createElement(`pre`);
    const code = document.createElement(`code`);
    code.classList.add(`language-${lang || 'none'}`);
    pre.appendChild(code);
    code.textContent = ' ';
    this.replaceNode(this.findParentBlockElement(startContainer), pre);
    this.selectContent(code.firstChild);
  }

  /**
   * A handler for the Back space character. 
   * 
   * @param {KeyboardEvent} e 
   */
  [backSpaceHandler](e) {
    const range = window.getSelection().getRangeAt(0);
    const { startContainer, startOffset, collapsed } = range;
    if (!collapsed) {
      return;
    }
    const isElement = startContainer.nodeType === Node.ELEMENT_NODE;
    const typedElement = /** @type HTMLElement */ (startContainer);
    if (['ul', 'ol'].includes(typedElement.localName)) {
      const item = /** @type Element */ (typedElement.childNodes[startOffset - 1]);
      if (item.nodeType !== Node.ELEMENT_NODE) {
        return;
      }
      e.preventDefault();
      const focusNode = item.previousElementSibling || item.nextElementSibling;
      if (!focusNode) {
        const line = this.insertNewLine(typedElement, true);
        typedElement.parentElement.removeChild(typedElement);
        this.selectCollapsed(line);
      } else {
        typedElement.removeChild(item);
        this.selectCollapsed(focusNode);
      }
      return;
    } 
    if (['li'].includes(typedElement.localName) && typedElement.textContent.trim() === '') {
      e.preventDefault();
      const focusNode = this.removeListItem(typedElement);
      // const line = this.insertNewLine(typedElement.parentElement, true)
      // typedElement.parentElement.removeChild(typedElement);
      this.selectCollapsed(focusNode);
      return;
    }
    if (isElement && typedElement.textContent.trim() === '') {
      e.preventDefault();
      typedElement.parentElement.removeChild(typedElement);
    }
  }

  /**
   * A handler for the delete character. 
   * 
   * @param {KeyboardEvent} e 
   */
  [deleteHandler](e) {
    const range = window.getSelection().getRangeAt(0);
    const { startContainer, endContainer, startOffset, endOffset } = range;
    if (startContainer === endContainer) {
      // removing the whole thing
      if (startOffset === 0 && startContainer.textContent.length === endOffset) {
        e.preventDefault();
        startContainer.parentElement.removeChild(startContainer);
      }
    }
  }

  /**
   * @param {Element} refNode
   * @param {boolean=} after When set it inserts the new paragraph after the reference node
   * @returns {HTMLParagraphElement} The created paragraph.
   */
  insertNewLine(refNode, after=false) {
    const p = document.createElement('p');
    p.innerHTML = '<br/>';
    const parent = refNode.parentElement;
    if (after) {
      if (parent.lastElementChild === refNode) {
        parent.appendChild(p);
      } else {
        parent.insertBefore(p, refNode.nextElementSibling);
      }
    } else {
      parent.insertBefore(p, refNode);
    }
    return p;
  }

  /**
   * Replaces a content in a text node.
   * @param {Text} node The text node to replace a content in.
   * @param {string} before The text to put before the replacement.
   * @param {Element} content The content to put after the text node
   * @param {string=} after The text node to put after the `content`.
   */
  replaceTextNodeContent(node, before, content, after='') {
    node.textContent = before;
    if (node.nextElementSibling) {
      node.nextElementSibling.insertAdjacentElement('beforebegin', content);
      if (after) {
        content.insertAdjacentText('afterend', after);
      } else {
        content.insertAdjacentHTML('afterend', '&nbsp;');
      }
    } else {
      const parent = node.parentElement;
      parent.appendChild(content);
      if (after) {
        parent.appendChild(new Text(after));
      } else {
        parent.insertAdjacentHTML('beforeend', '&nbsp;');
      }
    }
  }

  /** 
   * @param {Node} node
   * @returns {HTMLElement|null}
   */
  findParentBlockElement(node) {
    let target = node;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const typedElement = /** @type HTMLElement */ (target);
      if (target.nodeType === Node.ELEMENT_NODE && ['p', 'div'].includes(typedElement.localName)) {
        return typedElement;
      }
      const parent = target.parentElement;
      if (!parent) {
        return null;
      }
      target = parent;
    }
  }

  /** 
   * @param {Node} node
   * @returns {HTMLElement|null}
   */
  findParentNonTextElement(node) {
    let target = node;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const typedElement = /** @type HTMLElement */ (target);
      if (target.nodeType === Node.ELEMENT_NODE && !['span', 'code'].includes(typedElement.localName)) {
        return typedElement;
      }
      const parent = target.parentElement;
      if (!parent) {
        return null;
      }
      target = parent;
    }
  }

  /**
   * Appends a new list item to a list
   * @param {HTMLElement} previousListItem
   * @returns {HTMLElement|null} Created list item
   */
  appendListItem(previousListItem) {
    const list = previousListItem.parentElement;
    if (!['ul','ol'].includes(list.localName)) {
      return null;
    }
    const item = document.createElement(previousListItem.localName);
    if (list.lastElementChild === previousListItem) {
      list.appendChild(item);
    } else {
      list.insertBefore(item, previousListItem.nextElementSibling);
    }
    return /** @type HTMLLIElement */ (item);
  }

  /**
   * Replaces a node with another
   * @param {Node} node
   * @param {Node} replacement
   */
  replaceNode(node, replacement) {
    // const children = Array.from(node.parentElement.childNodes);
    const parent = node.parentElement;
    // if (children.length === 1) {
    //   parent.appendChild(replacement);
    //   parent.removeChild(node);
    //   return;
    // }
    // const i = children.findIndex((item) => item === /** @type any */ (node));
    parent.insertBefore(replacement, node);
    parent.removeChild(node);
  }

  /**
   * Sets caret position at the beginning of the node.
   * @param {Node} node
   */
  selectCollapsed(node) {
    const range = new Range();
    if (node.nodeType === Node.TEXT_NODE) {
      range.setStart(node, 1);
    } else {
      // range.selectNode(node);
      range.setStart(node, 0);
    }
    range.collapse();
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  }

  /**
   * Selects a content in the node and sets the position at the end of the selection.
   * @param {Node} node
   */
  selectContent(node) {
    const range = new Range();
    range.setStart(node, 1);
    range.setEndBefore(node);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  }

  /**
   * Adds a headline to the editor.
   * @param {number} weight The weight of the headline
   * @param {Element} refNode
   * @param {boolean} [after=false] When set it inserts the new headline after the reference node
   * @returns {HTMLElement} The created paragraph.
   */
  addHeadline(weight, refNode, after=false) {
    const p = document.createElement(`h${weight}`);
    p.innerHTML = '<br/>';
    const node = this.findParentNonTextElement(refNode); // parentElement;
    const parent = node.parentNode;
    this.log(parent)
    if (after) {
      if (parent.lastElementChild === node) {
        parent.appendChild(p);
      } else {
        parent.insertBefore(p, node.nextElementSibling);
      }
    } else {
      parent.insertBefore(p, node);
    }
    return p;
  }

  /**
   * Removes a list item from a list
   * @param {HTMLElement} item
   * @returns {HTMLElement} Created element
   */
  removeListItem(item) {
    const parentList = item.parentElement;
    parentList.removeChild(item);
    let parentItem;
    if (parentList.parentElement && parentList.parentElement.localName === 'li') {
      parentItem = parentList.parentElement;
    }
    let focusNode;
    if (!parentList.children.length) {
      focusNode = this.insertNewLine(parentList, true);
      // remove empty list.
      parentList.parentNode.removeChild(parentList);
    }
    if (parentItem) {
      focusNode = this.appendListItem(parentItem);
    } else if (!focusNode) {
      focusNode = this.insertNewLine(parentList, true);
    }
    return focusNode;
  }
}
