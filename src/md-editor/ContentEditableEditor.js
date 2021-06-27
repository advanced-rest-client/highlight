/**
 * A helper class to manipulate the content of a contentEditable.
 */
export class ContentEditableEditor {
  /**
   * @return {Range|null} The current range from the current selection.
   */
  getRange() {
    const selection = window.getSelection();
    if (!selection.rangeCount) {
      return null;
    }
    return selection.getRangeAt(0);
  }

  /**
   * Focuses on a first text node of the content editable element.
   * @param {HTMLElement} content A reference to the content editable element.
   * @param {'end'|'start'=} align Where to move the caret after focusing. Default to `end`.
   */
  focusFirstAvailable(content, align) {
    content.focus();
    const node = this.findFirstText(content);
    if (!node) {
      const selection = window.getSelection();
      selection.removeAllRanges();
      return;
    }
    this.focusNode(node, align);
  }

  /**
   * Moves a caret to a specific node.
   * @param {Node} node The node to move rhe care to.
   * @param {'end'|'start'=} [align='end'] Where to move the caret after focusing. Default to `end`.
   */
  focusNode(node, align='end') {
    const range = new Range();
    // this matches the behavior with Safari.
    const txt = this.findFirstText(/** @type Element */ (node));
    const selectable = txt || node;
    if (align === 'start') {
      range.setStart(selectable, 0);
    } else {
      range.selectNodeContents(selectable);
    }
    range.collapse();
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  }

  /**
   * Finds a first Text element.
   * @param {Element} element The element to search for text nodes in.
   * @returns {Text|null}
   */
  findFirstText(element) {
    if (!element.hasChildNodes()) {
      return null;
    }
    const nodes = Array.from(element.childNodes);
    for (let i = 0, len = nodes.length; i < len; i++) {
      const node = nodes[i];
      if (node.nodeType === Node.TEXT_NODE) {
        return /** @type Text */(node);
      }
      if (node.nodeType !== Node.ELEMENT_NODE) {
        continue;
      }
      const deepSearch = this.findFirstText(/** @type Element */(node));
      if (deepSearch) {
        return deepSearch;
      }
    }
    return null;
  }

  /**
   * When possible it moves the caret to the next line relative to the current selection.
   * @param {'end'|'start'=} align Where to align the caret.
   */
  nextLine(align) {
    const range = this.getRange();
    if (!range) {
      return;
    }
    const { endContainer } = range;
    const block = this.findParentBlockElement(endContainer);
    if (!block) {
      return;
    }
    if (!block.nextElementSibling) {
      return;
    }
    const txt = this.findFirstText(block.nextElementSibling);
    const node = txt || block.nextElementSibling;
    this.focusNode(node, align);
  }

  /**
   * When possible it moves the caret to the previous line relative to the current selection.
   * @param {'end'|'start'=} align Where to align the caret.
   */
  previousLine(align) {
    const range = this.getRange();
    if (!range) {
      return;
    }
    const { endContainer } = range;
    const block = this.findParentBlockElement(endContainer);
    if (!block) {
      return;
    }
    if (!block.previousElementSibling) {
      return;
    }
    const txt = this.findFirstText(block.previousElementSibling);
    const node = txt || block.previousElementSibling;
    this.focusNode(node, align);
  }

  /**
   * Sets caret position at the beginning of the node.
   * @param {Node} node
   */
  selectCollapsed(node) {
    if (![Node.TEXT_NODE, Node.ELEMENT_NODE].includes(node.nodeType)) {
      return;
    }
    const range = new Range();
    if (node.nodeType === Node.TEXT_NODE) {
      range.setStart(node, 0);
    } else {
      // this matches the behaviour with Safari that selects the text node.
      const txt = this.findFirstText(/** @type Element */ (node));
      const selectable = txt || node;
      range.setStart(selectable, 0);
    }
    range.collapse();
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  }

  /**
   * Selects the contents of a node.
   * @param {Node} node
   */
  selectContent(node) {
    const range = new Range();
    range.selectNodeContents(node);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  }

  // /**
  //  * Replaces a content in a text node.
  //  * @param {Text} element The text node to replace a content in.
  //  * @param {string} before The text to put before the replacement.
  //  * @param {Element} content The content to put after the text node
  //  * @param {string=} after The text node to put after the `content`.
  //  */
  // replaceTextNodeContent(element, before, content, after='&nbsp;') {
  //   const node = element;
  //   node.textContent = before;
  //   if (node.nextElementSibling) {
  //     node.nextElementSibling.insertAdjacentElement('beforebegin', content);
  //     content.insertAdjacentText('afterend', after);
  //   } else {
  //     const parent = node.parentElement;
  //     parent.appendChild(content);
  //     if (after) {
  //       parent.appendChild(new Text(after));
  //     } else {
  //       parent.insertAdjacentHTML('beforeend', '&nbsp;');
  //     }
  //   }
  // }

  /**
   * Replaces current line with a code block.
   * This is called when a "```" with optional language definition is detected.
   * @param {Range} range
   */
  replaceCodeBlock(range) {
    const { startContainer, startOffset } = range;
    const { textContent } = startContainer;
    const preContent = textContent.substr(0, startOffset).trim();
    let lang = preContent.replace('```', '').trim();
    if (!lang && startContainer.nextSibling && startContainer.nextSibling.nodeType === Node.TEXT_NODE) {
      const txt = /** @type Text */ (startContainer.nextSibling);
      const contents = txt.textContent.trim();
      if (contents) {
        lang = contents;
      }
    }
    const pre = document.createElement(`pre`);
    const code = document.createElement(`code`);
    code.classList.add(`language-${lang || 'none'}`);
    pre.appendChild(code);
    code.textContent = ' ';
    const parent = this.findParentBlockElement(startContainer);
    if (parent.contentEditable === 'true') {
      parent.insertBefore(pre, startContainer);
      parent.removeChild(startContainer);
    } else {
      this.replaceNode(parent, pre);
    }
    this.selectContent(code.firstChild);
  }

  /**
   * Replaces a node with another
   * @param {Node} node
   * @param {Node} replacement
   */
  replaceNode(node, replacement) {
    const parent = node.parentElement;
    parent.insertBefore(replacement, node);
    parent.removeChild(node);
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
      if (target.nodeType === Node.ELEMENT_NODE && !['span', 'code', 'font', 'b', 'i', 'u', 'em', 'del', 'sup', 'sub'].includes(typedElement.localName)) {
        return typedElement;
      }
      const parent = target.parentElement;
      if (!parent) {
        return null;
      }
      if (parent.getAttribute('contentEditable') === 'true') {
        return parent;
      }
      target = parent;
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
   * Adds a headline to the editor.
   * @param {number} weight The weight of the headline
   * @param {Element} refNode
   * @param {boolean} [after=false] When set it inserts the new headline after the reference node
   * @returns {HTMLElement} The created paragraph.
   */
  addHeadline(weight, refNode, after=false) {
    const title = document.createElement(`h${weight}`);
    title.innerHTML = '<br/>';
    const node = this.findParentNonTextElement(refNode); // parentElement;
    if (node.contentEditable === 'true') {
      // simply replace the text node that has been direct child of the content editable.
      node.insertBefore(title, refNode);
      return title;
    }
    const parent = node.parentNode;
    if (after) {
      if (parent.lastElementChild === node) {
        parent.appendChild(title);
      } else {
        parent.insertBefore(title, node.nextElementSibling);
      }
    } else {
      parent.insertBefore(title, node);
    }
    return title;
  }

  // /**
  //  * Removes a list item from a list
  //  * @param {HTMLElement} item
  //  * @returns {HTMLElement} Created element
  //  */
  // removeListItem(item) {
  //   const parentList = item.parentElement;
  //   parentList.removeChild(item);
  //   let parentItem;
  //   if (parentList.parentElement && parentList.parentElement.localName === 'li') {
  //     parentItem = parentList.parentElement;
  //   }
  //   let focusNode;
  //   if (!parentList.children.length) {
  //     focusNode = this.insertNewLine(parentList, true);
  //     // remove empty list.
  //     parentList.parentNode.removeChild(parentList);
  //   }
  //   if (parentItem) {
  //     focusNode = this.appendListItem(parentItem);
  //   } else if (!focusNode) {
  //     focusNode = this.insertNewLine(parentList, true);
  //   }
  //   return focusNode;
  // }

  // /**
  //  * Appends a new list item to a list
  //  * @param {HTMLElement} previousListItem
  //  * @returns {HTMLElement|null} Created list item
  //  */
  // appendListItem(previousListItem) {
  //   const list = previousListItem.parentElement;
  //   if (!['ul','ol'].includes(list.localName)) {
  //     return null;
  //   }
  //   const item = document.createElement(previousListItem.localName);
  //   if (list.lastElementChild === previousListItem) {
  //     list.appendChild(item);
  //   } else {
  //     list.insertBefore(item, previousListItem.nextElementSibling);
  //   }
  //   return /** @type HTMLLIElement */ (item);
  // }
}
