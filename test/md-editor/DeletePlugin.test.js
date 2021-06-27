import { fixture, assert, html, nextFrame } from '@open-wc/testing';
import { sendKeys } from '@web/test-runner-commands';
import { MarkdownEditor } from '../../src/md-editor/MarkdownEditor.js';
import DeletePlugin from '../../src/md-editor/plugins/DeletePlugin.js';

/** @typedef {import('lit-html').TemplateResult} TemplateResult */

describe('DeletePlugin', () => {
  /**
   * @returns {Promise<HTMLElement>}
   */
  async function paragraphFixture() {
    return fixture(html`<div contentEditable="true"><p>test</p></div>`);
  }

  describe('removing whole selection', () => {
    let editor = /** @type MarkdownEditor */ (null);
    let element = /** @type HTMLElement */ (null);

    beforeEach(async () => {
      element = await paragraphFixture();
      editor = new MarkdownEditor(element, document);
      editor.registerPlugin(new DeletePlugin());
      editor.listen();
    });
  
    afterEach(() => {
      editor.unlisten();
    });

    it('inserts the pre block from the direct child', async () => {
      await nextFrame();
      const p = element.querySelector('p');
      editor.editor.selectContent(p.firstChild);
      await sendKeys({
        press: 'Delete',
      });
      assert.dom.equal(element, '<div contentEditable="true"><p></p></div>');
    });

    it('ignores when selecting a part of the text', async () => {
      await nextFrame();
      const p = element.querySelector('p');
      const range = new Range();
      range.selectNodeContents(p.firstChild);
      range.setStart(p.firstChild, 2);
      const selection = editor.document.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      await sendKeys({
        press: 'Delete',
      });
      assert.dom.equal(element, '<div contentEditable="true"><p>te</p></div>');
    });
  });
});
