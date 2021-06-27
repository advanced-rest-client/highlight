import { fixture, assert, html } from '@open-wc/testing';
import { sendKeys } from '@web/test-runner-commands';
import { MarkdownEditor } from '../../src/md-editor/MarkdownEditor.js';
import SpacePlugin from '../../src/md-editor/plugins/SpacePlugin.js';

/** @typedef {import('lit-html').TemplateResult} TemplateResult */

describe('SpacePlugin', () => {
  /**
   * @param {TemplateResult} content
   * @returns {Promise<HTMLElement>}
   */
  async function containerFixture(content) {
    return fixture(html`<div contentEditable="true">${content}</div>`);
  }

  describe('unordered list', () => {
    let editor = /** @type MarkdownEditor */ (null);
    let element = /** @type HTMLElement */ (null);
    beforeEach(async () => {
      element = await containerFixture(html`-`);
      editor = new MarkdownEditor(element);
      editor.registerPlugin(new SpacePlugin());
      editor.listen();
    });
  
    afterEach(() => {
      editor.unlisten();
    });

    it('inserts an unordered list', async () => {
      editor.editor.focusFirstAvailable(element);
      await sendKeys({
        press: 'Space',
      });
      assert.ok(element.querySelector('ul'));
    });

    it('inserts a single list item', async () => {
      editor.editor.focusFirstAvailable(element);
      await sendKeys({
        press: 'Space',
      });
      const items = element.querySelectorAll('ul li');
      assert.lengthOf(items, 1, 'has a single item');
    });

    it('removes the previous content', async () => {
      editor.editor.focusFirstAvailable(element);
      await sendKeys({
        press: 'Space',
      });
      const list = element.querySelector('ul');
      assert.notEqual(list.previousSibling.nodeType, Node.TEXT_NODE);
    });

    it('selects the list item', async () => {
      editor.editor.focusFirstAvailable(element);
      await sendKeys({
        press: 'Space',
      });
      const range = editor.editor.getRange();
      assert.equal(range.startContainer.nodeName, 'LI');
    });
  });

  describe('ordered list', () => {
    let editor = /** @type MarkdownEditor */ (null);
    let element = /** @type HTMLElement */ (null);
    beforeEach(async () => {
      element = await containerFixture(html`1.`);
      editor = new MarkdownEditor(element);
      editor.registerPlugin(new SpacePlugin());
      editor.listen();
    });
  
    afterEach(() => {
      editor.unlisten();
    });

    it('inserts an ordered list', async () => {
      editor.editor.focusFirstAvailable(element);
      await sendKeys({
        press: 'Space',
      });
      assert.ok(element.querySelector('ol'));
    });

    it('inserts a single list item', async () => {
      editor.editor.focusFirstAvailable(element);
      await sendKeys({
        press: 'Space',
      });
      const items = element.querySelectorAll('ol li');
      assert.lengthOf(items, 1, 'has a single item');
    });

    it('removes the previous content', async () => {
      editor.editor.focusFirstAvailable(element);
      await sendKeys({
        press: 'Space',
      });
      const list = element.querySelector('ol');
      assert.notEqual(list.previousSibling.nodeType, Node.TEXT_NODE);
    });

    it('selects the list item', async () => {
      editor.editor.focusFirstAvailable(element);
      await sendKeys({
        press: 'Space',
      });
      const range = editor.editor.getRange();
      assert.equal(range.startContainer.nodeName, 'LI');
    });
  });

  [
    1, 2, 3, 4, 5, 6,
  ].forEach((level) => {
    describe(`Header ${level}`, () => {
      let editor = /** @type MarkdownEditor */ (null);
      let element = /** @type HTMLElement */ (null);
      const headerName = `H${level}`;

      beforeEach(async () => {
        element = await containerFixture(html`<p>${new Array(level).fill('#').join('')}</p>`);
        editor = new MarkdownEditor(element);
        editor.registerPlugin(new SpacePlugin());
        editor.listen();
      });
    
      afterEach(() => {
        editor.unlisten();
      });

      it('inserts the header', async () => {
        editor.editor.focusFirstAvailable(element);
        await sendKeys({
          press: 'Space',
        });
        
        assert.ok(element.querySelector(headerName));
      });

      it('removes the previous content', async () => {
        editor.editor.focusFirstAvailable(element);
        await sendKeys({
          press: 'Space',
        });
        const list = element.querySelector(headerName);
        assert.notEqual(list.previousSibling.nodeType, Node.TEXT_NODE);
      });

      it('selects the contents', async () => {
        editor.editor.focusFirstAvailable(element);
        await sendKeys({
          press: 'Space',
        });
        const range = editor.editor.getRange();
        assert.equal(range.startContainer.nodeName, headerName);
      });

      it('inserts the header as a direct child', async () => {
        editor.unlisten();
        element = await containerFixture(html`${new Array(level).fill('#').join('')}`);
        editor = new MarkdownEditor(element);
        editor.registerPlugin(new SpacePlugin());
        editor.listen();
        editor.editor.focusFirstAvailable(element);
        await sendKeys({
          press: 'Space',
        });
        
        assert.ok(element.querySelector(headerName));
      });
    });
  });

  describe('code block', () => {
    let editor = /** @type MarkdownEditor */ (null);
    let element = /** @type HTMLElement */ (null);

    const mark = '```';
  
    afterEach(() => {
      editor.unlisten();
    });

    /**
     * @param {TemplateResult} content
     */
    async function setupEditor(content) {
      element = await containerFixture(content);
      editor = new MarkdownEditor(element);
      editor.registerPlugin(new SpacePlugin());
      editor.listen();
    }

    it('inserts the pre block from the direct child', async () => {
      await setupEditor(html`${mark}`);
      editor.editor.focusFirstAvailable(element);
      await sendKeys({
        press: 'Space',
      });
      assert.ok(element.querySelector('pre'));
    });

    it('inserts the pre block from the container', async () => {
      await setupEditor(html`<p>${mark}</p>`);
      editor.editor.focusFirstAvailable(element);
      await sendKeys({
        press: 'Space',
      });
      assert.ok(element.querySelector('pre'));
    });

    it('adds the language definition with comment node', async () => {
      await setupEditor(html`<p>${mark}javascript</p>`);
      editor.editor.focusFirstAvailable(element);
      await sendKeys({
        press: 'Space',
      });
      assert.isTrue(element.querySelector('code').classList.contains('language-javascript'));
    });

    it('adds the language definition without comment node', async () => {
      await setupEditor(html`<p>\`\`\`javascript</p>`);
      editor.editor.focusFirstAvailable(element);
      await sendKeys({
        press: 'Space',
      });
      assert.isTrue(element.querySelector('code').classList.contains('language-javascript'));
    });

    it('adds the default language definition', async () => {
      await setupEditor(html`<p>\`\`\`</p>`);
      editor.editor.focusFirstAvailable(element);
      await sendKeys({
        press: 'Space',
      });
      assert.isTrue(element.querySelector('code').classList.contains('language-none'));
    });

    it('inserts the code block', async () => {
      await setupEditor(html`${mark}`);
      editor.editor.focusFirstAvailable(element);
      await sendKeys({
        press: 'Space',
      });
      assert.ok(element.querySelector('pre code'));
    });

    it('removes the previous content', async () => {
      await setupEditor(html`${mark}`);
      editor.editor.focusFirstAvailable(element);
      await sendKeys({
        press: 'Space',
      });
      const list = element.querySelector('pre');
      assert.notEqual(list.previousSibling.nodeType, Node.TEXT_NODE);
    });

    it('selects the code block', async () => {
      await setupEditor(html`${mark}`);
      editor.editor.focusFirstAvailable(element);
      await sendKeys({
        press: 'Space',
      });
      const range = editor.editor.getRange();
      let node;
      if (range.startContainer.nodeType === Node.TEXT_NODE) {
        node = range.startContainer.parentElement;
      } else {
        node = range.startContainer;
      }
      assert.equal(node.nodeName, 'CODE');
    });
  });

  describe('Ignored', () => {
    let editor = /** @type MarkdownEditor */ (null);
    let element = /** @type HTMLElement */ (null);
  
    afterEach(() => {
      editor.unlisten();
    });

    /**
     * @param {TemplateResult} content
     */
    async function setupEditor(content) {
      element = await containerFixture(content);
      editor = new MarkdownEditor(element);
      editor.registerPlugin(new SpacePlugin());
      editor.listen();
    }

    it('ignores for not handled content', async () => {
      await setupEditor(html`<p>Test</p>`);
      editor.editor.focusFirstAvailable(element);
      await sendKeys({
        press: 'Space',
      });
      assert.dom.equal(element.querySelector('p'), '<p>Test&nbsp;</p>', {
        ignoreTags: ['br'],
      });
    });

    it('ignores when the range is not collapsed', async () => {
      await setupEditor(html`<p>Test</p>`);
      editor.editor.selectContent(element.querySelector('p'));
      await sendKeys({
        press: 'Space',
      });
      assert.dom.equal(element.querySelector('p'), '<p>&nbsp;</p>', {
        ignoreTags: ['br'],
      });
    });
  });
});
