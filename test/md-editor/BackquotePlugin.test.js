import { fixture, assert, html } from '@open-wc/testing';
import { sendKeys } from '@web/test-runner-commands';
import { MarkdownEditor } from '../../src/md-editor/MarkdownEditor.js';
import BackquotePlugin from '../../src/md-editor/plugins/BackquotePlugin.js';

/** @typedef {import('lit-html').TemplateResult} TemplateResult */

describe('BackquotePlugin', () => {
  /**
   * @returns {Promise<HTMLElement>}
   */
  async function paragraphFixture() {
    return fixture(html`<div contentEditable="true"><p>&nbsp;</p></div>`);
  }

  describe('inline code', () => {
    let editor = /** @type MarkdownEditor */ (null);
    let element = /** @type HTMLElement */ (null);

    beforeEach(async () => {
      element = await paragraphFixture();
      editor = new MarkdownEditor(element);
      editor.registerPlugin(new BackquotePlugin());
      editor.listen();
    });
  
    afterEach(() => {
      editor.unlisten();
    });

    it('does nothing when putting a single marker', async () => {
      // remove the <br/>
      editor.editor.focusNode(element.firstElementChild);
      await sendKeys({ press: 'Delete' });
      // send Backquote
      await sendKeys({ press: 'Backquote' });
      assert.dom.equal(element.firstElementChild, '<p>`</p>');
    });

    it('does nothing when putting the second marker', async () => {
      // remove the <br/>
      editor.editor.focusNode(element.firstElementChild);
      await sendKeys({ press: 'Delete' });
      // send Backquote
      await sendKeys({ press: 'Backquote' });
      await sendKeys({ press: 'Backquote' });
      assert.dom.equal(element.firstElementChild, '<p>``</p>');
    });

    it('does nothing when putting the third marker', async () => {
      // remove the <br/>
      editor.editor.focusNode(element.firstElementChild);
      await sendKeys({ press: 'Delete' });
      // send Backquote
      await sendKeys({ press: 'Backquote' });
      await sendKeys({ press: 'Backquote' });
      await sendKeys({ press: 'Backquote' });
      assert.dom.equal(element.firstElementChild, '<p>```</p>');
    });

    it('surrounds the selection with the code element', async () => {
      editor.editor.focusNode(element.firstElementChild);
      await sendKeys({ press: 'Delete' });
      
      await sendKeys({ press: 'KeyT' });
      await sendKeys({ press: 'KeyE' });
      await sendKeys({ press: 'KeyS' });
      await sendKeys({ press: 'KeyT' });
      editor.editor.selectContent(element.firstElementChild);
      await sendKeys({ press: 'Backquote' });
      assert.dom.equal(element.firstElementChild, '<p><code>test</code></p>');
    });
  });
});
