import { marked } from 'marked';

/** @typedef {import('marked').marked} Marked */

// @ts-ignore
if (!window.marked) {
  // For webpack support for the Polymer 3 version created by the Polymer
  // Modulizer More info:
  // https://github.com/PolymerElements/marked-element/issues/81
  // @ts-ignore
  window.marked = marked;
}

export default /** @type Marked */ (marked);
