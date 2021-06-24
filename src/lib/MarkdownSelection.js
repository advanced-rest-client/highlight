import { EditorPluginsConsumer } from "./EditorPluginsConsumer.js";

export const selectionChangeHandler = Symbol('selectionChangeHandler');

/**
 * A class that manages the selection state in the markdown editor.
 * This class is responsible for controlling actions flow when selection change.
 */
export class MarkdownSelection extends EditorPluginsConsumer {
  /**
   * @param {HTMLElement} root The root element of the editor. Used to determine whether selection ocurred inside the editor.
   */
  constructor(root) {
    super();
    this.root = root;
    this[selectionChangeHandler] = this[selectionChangeHandler].bind(this);
  }

  /**
   * Initializes the library by listening to the selection events.
   * @param {Document} doc The document to listen to events on
   */
  listen(doc) {
    doc.addEventListener('selectionchange', this[selectionChangeHandler]);
  }

  /**
   * Clears previously registered listeners.
   * @param {Document} doc The document to remove listeners from.
   */
  unlisten(doc) {
    doc.removeEventListener('selectionchange', this[selectionChangeHandler]);
  }

  /**
   * @param {Event} e
   */
  [selectionChangeHandler](e) {
    const ct = /** @type Document */ (e.currentTarget);
    if (ct && ct.activeElement) {
      const ae = ct.activeElement;
      if (ae === this.root || this.root.contains(ae)) {
        this.executeAction('selection', this.root);
      }
    }
  }
}
