import Logger from './Logger.js';

export const pluginsValue = Symbol('pluginsValue');
export const debugValue = Symbol('debugValue');
export const clearActions = Symbol('clearActions');

/** @typedef {import('./EditorPlugin').EditorPlugin} EditorPlugin */
/** @typedef {import('./ContentEditableEditor').ContentEditableEditor} ContentEditableEditor */
/** @typedef {import('./types').PluginExecuteOptions} PluginExecuteOptions */

export class EditorPluginsConsumer {
  /** 
   * @returns {boolean} When set it prints out some debug messages.
   */
  get debug() {
    return typeof this[debugValue] !== 'boolean' ? false : this[debugValue];
  }

  set debug(value) {
    let local = value;
    if (typeof local !== 'boolean') {
      local = Boolean(value);
    }
    this[debugValue] = local;
    this.logger.enabled = local;
  }

  constructor() {
    /** 
     * The list of currently registered plugins.
     * The key is the action name and the value is the list of plugins triggered by the action.
     * @type {Map<string, EditorPlugin[]>}
     */
    this[pluginsValue] = new Map();
    this.logger = new Logger();
  }

  /**
   * Adds a plugin to be called when an action happens.
   * @param {EditorPlugin} instance The instance of the plugin to use.
   */
  registerPlugin(instance) {
    const { actions } = instance;
    actions.forEach((action) => {
      if (!this[pluginsValue].has(action)) {
        this[pluginsValue].set(action, []);
      }
      this[pluginsValue].get(action).push(instance);
    });
  }

  /**
   * Tests whether a plugin has been registered or whether action has plugins.
   * 
   * @param {string} action The action that triggers the plugin.
   * @param {EditorPlugin=} instance When set it tests whether a particular plugin is registered. 
   * Otherwise it tells whether the action has any plugin.
   * @returns {boolean} True when the plugin is registered.
   */
  hasPlugin(action, instance) {
    if (!this[pluginsValue].has(action)) {
      return false;
    }
    const actions = this[pluginsValue].get(action);
    if (instance) {
      return actions.includes(instance);
    }
    return !!actions.length;
  }

  /**
   * Unregisters a plugin.
   * 
   * @param {EditorPlugin|string} actionOrInstance When an instance of a plugin is provided
   * then it unregisters specific plugin. When a name is provided then all plugins for the actions
   * are removed.
   */
  unregisterPlugin(actionOrInstance) {
    if (typeof actionOrInstance === 'string') {
      this[clearActions](actionOrInstance);
    } else {
      const { actions } = actionOrInstance;
      actions.forEach((action) => {
        if (this[pluginsValue].has(action)) {
          const index = this[pluginsValue].get(action).findIndex(i => i === actionOrInstance);
          actionOrInstance.destroy();
          this[pluginsValue].get(action).splice(index, 1);
        }
      });
    }
  }

  /**
   * Unregisters all previously registered plugins.
   */
  unregisterAllPlugins() {
    for (const action of this[pluginsValue].keys()) {
      this.unregisterPlugin(action);
    }
  }

  /**
   * Unregisters all plugins for an action
   * @param {string} name The action name
   */
  [clearActions](name) {
    if (this[pluginsValue].has(name)) {
      const plugins = this[pluginsValue].get(name);
      plugins.forEach((instance) => instance.destroy());
      this[pluginsValue].delete(name);
    }
  }

  /**
   * Runs plugins registered for the action.
   * 
   * @param {string} action
   * @param {HTMLElement} container A reference to the editor's outer-most container.
   * @param {ContentEditableEditor} editor
   * @param {DocumentOrShadowRoot} document A reference to the document object used for selection manipulation.
   * @param {any=} args The list of arguments passed to the plugin. Schema depends on the action.
   */
  executeAction(action, container, editor, document, args) {
    if (this[pluginsValue].has(action)) {
      const plugins = this[pluginsValue].get(action);
      const params = /** @type PluginExecuteOptions */ ({
        args,
        container,
        editor,
        logger: this.logger,
        document,
      });
      plugins.forEach((instance) => {
        try {
          instance.execute(params);
        } catch (e) {
          // 
        }
      });
    }
  }
}
