import '@advanced-rest-client/arc-demo-helper/arc-demo-helper.js';
import '../prism-highlight.js';

async function init() {
  try {
    const response = await fetch(window.location.href);
    const data = await response.text();
    document.querySelector('#c3').code = `${data}\n`;
  } catch (e) {
    document.querySelector('#c3').code = e.message;
  }
}

window.customElements.whenDefined('arc-demo-helper').then(() => {
  setTimeout(() => init(), 1000);
});
