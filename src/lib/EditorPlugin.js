/* eslint-disable no-unused-vars */
/**
 * A base class for editor plugins. Each plugin must extend this class.
 */
export class EditorPlugin {
  /**
   * Main execute function called when an action has been called.
   * 
   * @param {HTMLElement} container A reference to the editor's outer-most container.
   * @returns {void}
   */
  execute(container) {
    // executed by a child class.
  }

  /**
   * Tells the plugin that it's about to be destroyed and it should do a cleanup.
   */
  destroy() {
    // executed by a child class.
  }
}
