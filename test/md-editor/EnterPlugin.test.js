import { fixture, assert, html } from '@open-wc/testing';
import { sendKeys, executeServerCommand } from '@web/test-runner-commands';
import { MarkdownEditor } from '../../src/md-editor/MarkdownEditor.js';
import EnterPlugin from '../../src/md-editor/plugins/EnterPlugin.js';

/** @typedef {import('lit-html').TemplateResult} TemplateResult */

describe('EnterPlugin', () => {
  /**
   * @param {TemplateResult} content
   * @returns {Promise<HTMLElement>}
   */
  async function containerFixture(content) {
    return fixture(html`<div contentEditable="true">${content}</div>`);
  }

  /**
   * @returns {Promise<HTMLElement>}
   */
  async function preContentFixture() {
    return fixture(html`<div contentEditable="true"><pre><code>test</code></pre></div>`);
  }

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
      editor = new MarkdownEditor(element, document);
      editor.registerPlugin(new EnterPlugin());
      editor.listen();
    }

    it('inserts the pre block from the direct child', async () => {
      await setupEditor(html`${mark}`);
      editor.editor.focusFirstAvailable(element);
      await sendKeys({
        press: 'Enter',
      });
      assert.ok(element.querySelector('pre'));
    });

    it('inserts the pre block from the container', async () => {
      await setupEditor(html`<p>${mark}</p>`);
      editor.editor.focusFirstAvailable(element);
      await sendKeys({
        press: 'Enter',
      });
      assert.ok(element.querySelector('pre'));
    });

    it('adds the language definition with comment node', async () => {
      await setupEditor(html`<p>${mark}javascript</p>`);
      editor.editor.focusFirstAvailable(element);
      await sendKeys({
        press: 'Enter',
      });
      assert.isTrue(element.querySelector('code').classList.contains('language-javascript'));
    });

    it('adds the language definition without comment node', async () => {
      await setupEditor(html`<p>\`\`\`javascript</p>`);
      editor.editor.focusFirstAvailable(element);
      await sendKeys({
        press: 'Enter',
      });
      assert.isTrue(element.querySelector('code').classList.contains('language-javascript'));
    });

    it('adds the default language definition', async () => {
      await setupEditor(html`<p>\`\`\`</p>`);
      editor.editor.focusFirstAvailable(element);
      await sendKeys({
        press: 'Enter',
      });
      assert.isTrue(element.querySelector('code').classList.contains('language-none'));
    });

    it('inserts the code block', async () => {
      await setupEditor(html`${mark}`);
      editor.editor.focusFirstAvailable(element);
      await sendKeys({
        press: 'Enter',
      });
      assert.ok(element.querySelector('pre code'));
    });

    it('removes the previous content', async () => {
      await setupEditor(html`${mark}`);
      editor.editor.focusFirstAvailable(element);
      await sendKeys({
        press: 'Enter',
      });
      const list = element.querySelector('pre');
      assert.notEqual(list.previousSibling.nodeType, Node.TEXT_NODE);
    });

    it('selects the code block', async () => {
      await setupEditor(html`${mark}`);
      editor.editor.focusFirstAvailable(element);
      await sendKeys({
        press: 'Enter',
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

  describe('exiting code block', () => {
    let editor = /** @type MarkdownEditor */ (null);
    let element = /** @type HTMLElement */ (null);

    beforeEach(async () => {
      element = await preContentFixture();
      editor = new MarkdownEditor(element, document);
      editor.registerPlugin(new EnterPlugin());
      editor.listen();
    });
  
    afterEach(() => {
      editor.unlisten();
    });

    it('inserts a new line with a paragraph', async () => {
      const code = element.querySelector('code');
      editor.editor.focusNode(code);
      await sendKeys({ press: 'Enter' });
      const paragraph = element.querySelector('p');
      assert.ok(paragraph, 'has the paragraph');
    });

    it('does not add a new paragraph with shift', async () => {
      const code = element.querySelector('code');
      editor.editor.focusNode(code);
      await sendKeys({ down: 'Shift' });
      await sendKeys({ press: 'Enter' });
      await sendKeys({ up: 'Shift' });
      const paragraph = element.querySelector('p');
      assert.notOk(paragraph, 'has no paragraph');
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
      editor = new MarkdownEditor(element, document);
      editor.registerPlugin(new EnterPlugin());
      editor.listen();
    }

    it('ignores different ranges', async () => {
      await setupEditor(html`<p id="t1">test 1</p><p id="t2">test 2</p>`);
      const t1 = document.getElementById('t1');
      const box1 = t1.getBoundingClientRect();
      const t2 = document.getElementById('t2');
      const box2 = t2.getBoundingClientRect();
      await executeServerCommand('mouse', [
        { move: { x: box1.x + 2, y: box1.y + 5 }, },
        { down: true },
        { move: { x: box2.x + box2.width, y: box2.y + 5 }, },
        { up: true },
      ]);
      const r = editor.editor.getRange();
      assert.notEqual(r.startContainer, r.endContainer, 'range has different containers');
      await sendKeys({
        press: 'Enter',
      });
      assert.dom.equal(element, '<div contentEditable="true"><p></p><p></p></div>', {
        ignoreTags: ['br'],
        ignoreAttributes: ['id']
      });
    });

    it('ignores regular enter', async () => {
      await setupEditor(html`<p>test 1</p>`);
      editor.editor.focusFirstAvailable(element);
      await sendKeys({
        press: 'Enter',
      });
      assert.dom.equal(element, '<div contentEditable="true"><p>test 1</p><p></p></div>', {
        ignoreTags: ['br'],
        ignoreAttributes: ['id']
      });
    });
  });
});
