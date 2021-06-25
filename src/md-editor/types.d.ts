import Logger from "./Logger";
import { ContentEditableEditor } from "./ContentEditableEditor";

export interface PluginExecuteOptions {
  /**
   * A reference to the editor's outer-most container.
   */
  container: HTMLElement;
  /**
   * A reference to content-editable editor helper.
   * This is to be used instead initializing selection manager in each plugin separately. 
   */
  editor: ContentEditableEditor;
  /**
   * The logger to use to print out debug messages.
   * Note, the editor may disable to output messages.
   */
  logger: Logger;
  /**
   * The list of arguments passed to the plugin. The schema depends on the action.
   */
  args: any;
}
