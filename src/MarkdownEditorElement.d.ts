import { TemplateResult } from 'lit-element';
import ArcMarkedElement from "./ArcMarkedElement.js";
import { MarkdownEditor } from './md-editor/MarkdownEditor.js';
import { EditorPlugin } from './md-editor/EditorPlugin.js';

/** @typedef {import('lit-html').TemplateResult} TemplateResult */
/** @typedef {import('./md-editor/EditorPlugin').EditorPlugin} EditorPlugin */

export const editorValue: unique symbol;
export const toolbarTemplate: unique symbol;
export const execAction: unique symbol;
export const inputHandler: unique symbol;
export const createLinkAction: unique symbol;
export const toolbarValue: unique symbol;
export const registerPlugins: unique symbol;

export default class MarkdownEditorElement extends ArcMarkedElement {
  /**
   * A reference to the document object used for selection manipulation.
   */
  document: DocumentOrShadowRoot;
  [toolbarValue]: EditorPlugin;
  /**
   * Registers a context selection toolbar plugin
   */
  contextToolbar: EditorPlugin;
  /** 
   * When set it renders a toolbar with commands.
   * @attribute
   */
  toolbar: boolean;
  /** 
   * When set it registers the default text context tooltip.
   * @attribute
   */
  contextToolbarEnabled: boolean;
  /**  
   * Whether the editor is in the debug mode.
   * @attribute
   */
  debug: boolean;
  [editorValue]: MarkdownEditor;

  /**
   * @returns A reference to the MarkdownEditor instance.
   */
  get editor(): MarkdownEditor;

  constructor();

  connectedCallback(): void;

  disconnectedCallback(): void;

  /**
   * Generates markdown content from the current editor.
   */
  toMarkdown(): string;

  /**
   * Registers editor plugins.
   */
  [registerPlugins](): void;

  [execAction](e: Event): void;

  /**
   * Handles the create link action from the toolbar.
   */
  [createLinkAction](): void;

  render(): TemplateResult;

  /**
   * @returns The template for the toolbar.
   */
  [toolbarTemplate](): TemplateResult|string;
}
