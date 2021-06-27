import { ContentEditableEditor } from "./ContentEditableEditor.js";
import { EditorPluginsConsumer } from "./EditorPluginsConsumer.js";

export const keydownHandler: unique symbol;
export const selectionChangeHandler: unique symbol;

export class MarkdownEditor extends EditorPluginsConsumer {
  root: HTMLElement;
  editor: ContentEditableEditor;
  /**
   * @param root The top most container of the editor, 
   * usually the one that is marked as `contentEditable`.
   */
  constructor(root: HTMLElement);

  /**
   * Initializes the events required for the editor to work.
   * The events are registered on the `root` element.
   */
  listen(): void;

  /**
   * Stops listening for the events. This removes any functionality of the editor
   * leaving out the `root` elements as a regular `contentEditable`.
   */
  unlisten(): void;

  [keydownHandler](e: KeyboardEvent): void;

  [selectionChangeHandler](e: Event): void;
}
