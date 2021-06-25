export class ContentEditableEditor {
  /**
   * @return The current range from the current selection.
   */
  getRange(): Range;

  /**
   * Focuses on a first text node of the content editable element.
   * @param content A reference to the content editable element.
   * @param align Where to move the caret after focusing. Default to `end`.
   */
  focusFirstAvailable(content: HTMLElement, align?: 'end'|'start'): void;

  /**
   * Moves a caret to a specific node.
   * @param node The node to move rhe care to.
   * @param align Where to move the caret after focusing. Default to `end`.
   */
  focusNode(node: Node, align?: 'end'|'start'): void;

  /**
   * When possible it moves the caret to the next line relative to current selection.
   * @param align Where to align the caret.
   */
  nextLine(align?: 'end'|'start'): void;
  /**
   * When possible it moves the caret to the previous line relative to the current selection.
   * @param align Where to align the caret.
   */
  previousLine(align?: 'end'|'start'): void;

  /**
   * Finds a first Text element.
   * @param element The element to search for text nodes in.
   */
  findFirstText(element: Element): Text|null;

  /**
   * Selects the contents of a node.
   */
  selectNodeContent(element: Node): void;

  /**
   * Sets caret position at the beginning of the node.
   */
  selectCollapsed(node: Node): void;

  /**
   * Selects a content in the node and sets the position at the end of the selection.
   */
  selectContent(node: Node): void;

  /**
   * Replaces a content in a text node.
   * @param element The text node to replace a content in.
   * @param before The text to put before the replacement.
   * @param content The content to put after the text node
   * @param after The text node to put after the `content`.
   */
  replaceTextNodeContent(element: Text, before: string, content: Element, after?: string): void;

  /**
   * Replaces current line with a code block.
   * This is called when a "```" with optional language definition is detected.
   */
  replaceCodeBlock(range: Range): void;

  /**
   * Replaces a node with another
   */
  replaceNode(node: Node, replacement: Node): void;

  /**
   */
  findParentBlockElement(node: Node): HTMLElement|null;

  /** 
   */
  findParentNonTextElement(node: Node): HTMLElement|null;

  /**
   * @param refNode
   * @param after When set it inserts the new paragraph after the reference node
   * @returns The created paragraph.
   */
  insertNewLine(refNode: Element, after?: boolean): HTMLParagraphElement;

  /**
   * Adds a headline to the editor.
   * 
   * @param weight The weight of the headline
   * @param refNode
   * @param after When set it inserts the new headline after the reference node
   * @returns The created paragraph.
   */
  addHeadline(weight: number, refNode: Element, after?: boolean): HTMLElement;

  /**
   * Removes a list item from a list
   * @param item
   * @returns Created element
   */
  removeListItem(item: HTMLElement): HTMLElement;

  /**
   * Appends a new list item to a list
   * @param previousListItem
   * @returns Created list item
   */
  appendListItem(previousListItem: HTMLElement): HTMLElement|null;
}
