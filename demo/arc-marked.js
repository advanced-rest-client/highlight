/* eslint-disable no-param-reassign */
import '../arc-marked.js';
import { MarkdownStyles } from '../index.js';

function configChangedHandler(e) {
  const prop = e.target.id;
  const value = e.target.checked;
  const nodes = document.querySelectorAll('arc-marked');
  Array.from(nodes).forEach((node) => {
    node[prop] = value;
  });
}

const nodes = document.querySelectorAll('#config input[type="checkbox"]');
Array.from(nodes).forEach((node) => {
  node.addEventListener('change', configChangedHandler);
});


try {
  // @ts-ignore
  document.adoptedStyleSheets = document.adoptedStyleSheets.concat(MarkdownStyles.styleSheet);
} catch (_) {
  const s = document.createElement('style');
  s.innerHTML = MarkdownStyles.cssText;
  document.getElementsByTagName('head')[0].appendChild(s);
}
