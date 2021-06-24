export const pluginsValue = Symbol('pluginsValue');

/** @typedef {import('./EditorPlugin').EditorPlugin} EditorPlugin */

export class EditorPluginsConsumer {
  constructor() {
    /** 
     * The list of currently registered plugins.
     * The key is the action name and the value is the list of plugins triggered by the action.
     * @type {Map<string, EditorPlugin[]>}
     */
    this[pluginsValue] = new Map();
  }

  /**
   * Adds a plugin to be called when an action happens.
   * @param {string} action The action that triggers the plugin.
   * @param {EditorPlugin} instance The instance of the plugin to use.
   */
  registerPlugin(action, instance) {
    if (!this[pluginsValue].has(action)) {
      this[pluginsValue].set(action, []);
    }
    this[pluginsValue].get(action).push(instance);
  }

  /**
   * Tests whether a plugin has been registered.
   * @param {string} action The action that triggers the plugin.
   * @param {EditorPlugin} instance The instance of the plugin
   * @returns {boolean} True when the plugin is registered.
   */
  hasPlugin(action, instance) {
    if (!this[pluginsValue].has(action)) {
      return false;
    }
    return this[pluginsValue].get(action).includes(instance);
  }

  /**
   * Unregisters a plugin.
   * @param {string} action The action that triggers the plugin.
   * @param {EditorPlugin} instance
   */
  unregisterPlugin(action, instance) {
    if (this[pluginsValue].has(action)) {
      const index = this[pluginsValue].get('action').findIndex(i => i === instance);
      instance.destroy();
      this[pluginsValue].get('action').splice(index, 1);
    }
  }

  /**
   * Runs plugins registered for the action.
   * 
   * @param {string} action
   * @param {HTMLElement} container A reference to the editor's outer-most container.
   */
  executeAction(action, container) {
    if (this[pluginsValue].has(action)) {
      const plugins = this[pluginsValue].get(action);
      plugins.forEach((instance) => {
        try {
          instance.execute(container);
        } catch (e) {
          // 
        }
      });
    }
  }
}
