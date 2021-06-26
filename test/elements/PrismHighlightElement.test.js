import { fixture, assert, aTimeout, html } from '@open-wc/testing';
import sinon from 'sinon';
import { RequestEventTypes, WorkspaceEventTypes } from '@advanced-rest-client/arc-events';
import '../../prism-highlight.js';
import { outputElement } from '../../src/PrismHighlightElement.js';

/** @typedef {import('../..').PrismHighlightElement} PrismHighlightElement */

describe('PrismHighlightElement', () => {
  /**
   * @return {Promise<PrismHighlightElement>} 
   */
  async function markdownFixture() {
    return fixture(html`<prism-highlight lang="markdown"></prism-highlight>`);
  }

  /**
   * @return {Promise<PrismHighlightElement>} 
   */
  async function rawFixture() {
    return fixture(html`<prism-highlight raw lang="json" code='{"test": true}'></prism-highlight>`);
  }

  describe('anchors handling', () => {
    let element = /** @type PrismHighlightElement  */ (null);
    let code = '# Test highlight\nHello world!\n';
    code += '[link](https://domain.com/)';

    beforeEach(async () => {
      element = await markdownFixture();
      element.code = code;
      await aTimeout(2);
    });

    it('dispatches the default event', () => {
      const anchor = element[outputElement].querySelector('a');
      const spy = sinon.spy();
      element.addEventListener(RequestEventTypes.State.urlChange, spy)
      anchor.click();
      const e = spy.args[0][0];
      assert.equal(e.changedProperty, 'url', 'has the name of the changed property');
      assert.equal(e.changedValue, 'https://domain.com/', 'has the URL value');
    });

    it('dispatches the event when ctrl is set', () => {
      const anchor = element[outputElement].querySelector('a');
      const spy = sinon.spy();
      element.addEventListener(WorkspaceEventTypes.appendRequest, spy)
      anchor.dispatchEvent(new PointerEvent('click', {
        bubbles: true,
        cancelable: true,
        composed: true,
        ctrlKey: true,
      }));
      const e = spy.args[0][0];
      assert.deepEqual(e.detail, { request: { method: 'GET', url: 'https://domain.com/' } });
    });
  });

  describe('#raw', () => {
    let element = /** @type PrismHighlightElement  */ (null);
    beforeEach(async () => {
      element = await rawFixture();
    });

    it('renders the code without highlighting', () => {
      const pre = element.shadowRoot.querySelector('.raw-content');
      assert.ok(pre)
    });

    it('renders back the highlighted document', async () => {
      element.raw = false;
      await aTimeout(0);
      const pre = element.shadowRoot.querySelector('.parsed-content');
      assert.ok(pre)
    });
  });
});
