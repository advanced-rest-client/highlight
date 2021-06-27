import { PluginExecuteOptions } from './types';

/**
 * A base class for editor plugins. Each plugin must extend this class.
 */
export declare abstract class EditorPlugin {
  /**
   * @returns A list of actions that this plugin support.
   */
  abstract get actions(): string[];
  /**
   * Main execute function called when an action has been called.
   * 
   * @param params The execution parameters
   */
  abstract execute(params: PluginExecuteOptions): void;

  /**
   * Tells the plugin that it's about to be destroyed and it should do a cleanup.
   */
  abstract destroy(): void
}
