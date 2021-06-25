/* eslint-disable no-unused-vars */

/** @typedef {import('./types').PluginExecuteOptions} PluginExecuteOptions */

/**
 * A base class for editor plugins. Each plugin must extend this class.
 */
export class EditorPlugin {
  /**
   * @returns {string[]} A list of actions that this plugin support.
   */
  get actions() {
    return [];
  }

  /**
   * Main execute function called when an action has been called.
   * 
   * @param {PluginExecuteOptions} params The execution parameters
   * @returns {void}
   */
  execute(params) {
    // executed by a child class.
  }

  /**
   * Tells the plugin that it's about to be destroyed and it should do a cleanup.
   */
  destroy() {
    // executed by a child class.
  }
}
