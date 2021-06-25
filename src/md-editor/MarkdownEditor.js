import { EditorPluginsConsumer } from "./EditorPluginsConsumer.js";
import { ContentEditableEditor } from "./ContentEditableEditor.js";

export const keydownHandler = Symbol('keydownHandler');
export const selectionChangeHandler = Symbol('selectionChangeHandler');

export class MarkdownEditor extends EditorPluginsConsumer {
  /**
   * @param {HTMLElement} root The top most container of the editor, 
   * usually the one that is marked as `contentEditable`.
   */
  constructor(root) {
    super();
    this.root = root;

    /** 
     * A reference to a helper class that manages the selection in the editor.
     */
    this.editor = new ContentEditableEditor();

    document.execCommand("defaultParagraphSeparator", false, "p");
    this[keydownHandler] = this[keydownHandler].bind(this);
    this[selectionChangeHandler] = this[selectionChangeHandler].bind(this);
  }

  /**
   * Initializes the events required for the editor to work.
   * The events are registered on the `root` element.
   */
  listen() {
    const { root } = this;
    root.addEventListener('keydown', this[keydownHandler]);
    root.ownerDocument.addEventListener('selectionchange', this[selectionChangeHandler]);
  }

  /**
   * Stops listening for the events. This removes any functionality of the editor
   * leaving out the `root` elements as a regular `contentEditable`.
   */
  unlisten() {
    const { root } = this;
    root.removeEventListener('keydown', this[keydownHandler]);
    root.ownerDocument.removeEventListener('selectionchange', this[selectionChangeHandler]);
  }

  /**
   * @param {KeyboardEvent} e
   */
  [keydownHandler](e) {
    this.executeAction('keydown', this.root, this.editor, e);
    switch (e.code) {
      case 'Backquote':
      case 'Enter': 
      case 'Space':
      case 'Backspace':
      case 'Delete':
        this.executeAction(e.code, this.root, this.editor, e);
        break;
      case 'NumpadEnter':
        this.executeAction('Enter', this.root, this.editor, e);
        break;
      default: 
        // console.log('code', e.code)
    }
  }

  /**
   * @param {Event} e
   */
  [selectionChangeHandler](e) {
    const ct = /** @type Document */ (e.currentTarget);
    if (ct && ct.activeElement) {
      const ae = ct.activeElement;
      // checks whether the active element of the document is either the editor or its child.
      if (ae === this.root || this.root.contains(ae)) {
        this.executeAction('selection', this.root, this.editor);
      }
    }
  }
}
