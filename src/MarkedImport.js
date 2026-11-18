import { marked, Renderer } from 'marked';

/** @typedef {import('marked').marked} Marked */

const compatibleMarked = (source, options) => marked.parse(source, options);
compatibleMarked.Renderer = Renderer;

// @ts-ignore
if (!window.marked) {
  // For webpack support for the Polymer 3 version created by the Polymer
  // Modulizer More info:
  // https://github.com/PolymerElements/marked-element/issues/81
  // @ts-ignore
  window.marked = compatibleMarked;
}

export default /** @type Marked */ (compatibleMarked);
