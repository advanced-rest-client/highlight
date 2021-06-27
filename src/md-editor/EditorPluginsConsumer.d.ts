import Logger from './Logger.js';
import { ContentEditableEditor } from "./ContentEditableEditor.js";
import { EditorPlugin } from './EditorPlugin.js';

export const pluginsValue: unique symbol;
export const debugValue: unique symbol;
export const clearActions: unique symbol;

/** @typedef {import('./EditorPlugin').EditorPlugin} EditorPlugin */
/** @typedef {import('./types').PluginExecuteOptions} PluginExecuteOptions */

export class EditorPluginsConsumer {
  /** 
   * When set it prints out some debug messages.
   */
  debug: boolean;
  /** 
   * The list of currently registered plugins.
   * The key is the action name and the value is the list of plugins triggered by the action.
   */
  [pluginsValue]: Map<string, EditorPlugin[]>;
  logger: Logger;

  constructor();

  /**
   * Adds a plugin to be called when an action happens.
   * @param instance The instance of the plugin to use.
   */
  registerPlugin(instance: EditorPlugin): void;

  /**
   * Tests whether a plugin has been registered or whether action has plugins.
   * 
   * @param action The action that triggers the plugin.
   * @param instance When set it tests whether a particular plugin is registered. 
   * Otherwise it tells whether the action has any plugin.
   * @returns True when the plugin is registered.
   */
  hasPlugin(action: string, instance?: EditorPlugin): boolean;

  /**
   * Unregisters a plugin.
   * 
   * @param actionOrInstance When an instance of a plugin is provided
   * then it unregisters specific plugin. When a name is provided then all plugins for the actions
   * are removed.
   */
  unregisterPlugin(actionOrInstance: EditorPlugin|string): void;

  /**
   * Unregisters all previously registered plugins.
   */
  unregisterAllPlugins(): void;

  /**
   * Unregisters all plugins for an action
   * @param {string} name The action name
   */
  [clearActions](name: string): void;

  /**
   * Runs plugins registered for the action.
   * 
   * @param action
   * @param container A reference to the editor's outer-most container.
   * @param editor
   * @param document A reference to the document object used for selection manipulation.
   * @param args The list of arguments passed to the plugin. Schema depends on the action.
   */
  executeAction(action: string, container: HTMLElement, editor: ContentEditableEditor, document: DocumentOrShadowRoot, args?: any): void;
}
