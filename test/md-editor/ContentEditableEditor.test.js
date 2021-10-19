import { fixture, assert, html } from '@open-wc/testing';
import { ContentEditableEditor } from '../../src/md-editor/ContentEditableEditor.js';

/** @typedef {import('lit-html').TemplateResult} TemplateResult */
/** 
 * @typedef CreateResult 
 * @property {ContentEditableEditor} editor
 * @property {HTMLElement} element
 */

describe('ContentEditableEditor', () => {
  /**
   * @returns {Promise<HTMLElement>}
   */
  async function paragraphFixture() {
    return fixture(html`<div contentEditable="true"><p>test</p></div>`);
  }

  /**
   * @param {TemplateResult} content
   * @returns {Promise<HTMLElement>}
   */
  async function contentFixture(content) {
    return fixture(html`<div contentEditable="true">${content}</div>`);
  }

  /**
   * @param {TemplateResult} content
   * @returns {Promise<CreateResult>}
   */
  async function create(content) {
    const element = await contentFixture(content);
    const editor = new ContentEditableEditor();
    return {
      element,
      editor,
    };
  }

  describe('getRange()', () => {
    /** @type ContentEditableEditor */
    let editor;
    /** @type HTMLElement */
    let element;
    beforeEach(async () => {
      element = await paragraphFixture();
      editor = new ContentEditableEditor();
    });

    it('returns null when no selection', () => {
      const selection = /** @type Document */ (editor.document).getSelection();
      selection.removeAllRanges();
      const range = editor.getRange();
      assert.equal(range, null);
    });

    it('returns the current range when has a selection', () => {
      editor.focusFirstAvailable(element);
      const range = editor.getRange();
      assert.typeOf(range, 'range');
    });
  });

  describe('focusFirstAvailable()', () => {
    it('focuses at the end of the text node', async () => {
      const created = await create(html`<p>text</p>`);
      created.editor.focusFirstAvailable(created.element);
      const range = created.editor.getRange();
      assert.equal(range.startContainer.nodeType, Node.TEXT_NODE, 'focused is a text node');
      assert.equal(range.startContainer.textContent, 'text', 'focused is the first node');
      assert.equal(range.startOffset, 4, 'focused at the end of the node');
      assert.isTrue(range.collapsed, 'there is no selection');
    });

    it('focuses at the start of the text node', async () => {
      const created = await create(html`<p>text</p>`);
      created.editor.focusFirstAvailable(created.element, 'start');
      const range = created.editor.getRange();
      assert.equal(range.startContainer.nodeType, Node.TEXT_NODE, 'focused is a text node');
      assert.equal(range.startContainer.textContent, 'text', 'focused is the first node');
      assert.equal(range.startOffset, 0, 'focused at the end of the node');
      assert.isTrue(range.collapsed, 'there is no selection');
    });

    it('focuses on the text node of a non-empty paragraph', async () => {
      const created = await create(html`<p></p><p>Focusable</p><p>Other</p>`);
      created.editor.focusFirstAvailable(created.element);
      const range = created.editor.getRange();
      assert.equal(range.startContainer.nodeType, Node.TEXT_NODE, 'focused is a text node');
      assert.equal(range.startContainer.textContent, 'Focusable', 'focused is the first node');
    });

    it('does nothing when there\'s no text node', async () => {
      const created = await create(html`<p></p>`);
      created.editor.focusFirstAvailable(created.element);
      const range = created.editor.getRange();
      assert.equal(range, null, 'no selection is created');
    });
  });

  describe('focusNode()', () => {
    it('focuses at the end of the text node', async () => {
      const created = await create(html`<p>text</p>`);
      created.editor.focusNode(created.element.children[0].firstChild);
      const range = created.editor.getRange();
      assert.equal(range.startContainer.nodeType, Node.TEXT_NODE, 'focused is a text node');
      assert.equal(range.startContainer.textContent, 'text', 'focused is the first node');
      assert.equal(range.startOffset, 4, 'focused at the end of the node');
      assert.isTrue(range.collapsed, 'there is no selection');
    });

    it('focuses at the beginning of the text node', async () => {
      const created = await create(html`<p>text</p>`);
      created.editor.focusNode(created.element.children[0].firstChild, 'start');
      const range = created.editor.getRange();
      assert.equal(range.startContainer.nodeType, Node.TEXT_NODE, 'focused is a text node');
      assert.equal(range.startContainer.textContent, 'text', 'focused is the first node');
      assert.equal(range.startOffset, 0, 'focused at the start of the node');
      assert.isTrue(range.collapsed, 'there is no selection');
    });

    it('focuses at the end of the text node of an element node', async () => {
      const created = await create(html`<p><!-- comment -->text</p>`);
      created.editor.focusNode(created.element.children[0]);
      const range = created.editor.getRange();
      assert.equal(range.startContainer.nodeType, Node.TEXT_NODE, 'focused is an element node');
      assert.equal(range.startOffset, 4, 'focused at the text node');
      assert.isTrue(range.collapsed, 'there is no selection');
    });

    it('focuses at the beginning of the text node of an element node', async () => {
      const created = await create(html`<p><!-- comment -->text</p>`);
      created.editor.focusNode(created.element.children[0], 'start');
      const range = created.editor.getRange();
      assert.equal(range.startContainer.nodeType, Node.TEXT_NODE, 'focused is an element node');
      assert.equal(range.startOffset, 0, 'focused at the start of the node');
      assert.isTrue(range.collapsed, 'there is no selection');
    });
  });

  describe('findFirstText()', () => {
    it('finds a text in an element', async () => {
      const created = await create(html`<p>text</p>`);
      const result = created.editor.findFirstText(created.element.children[0]);
      assert.ok(result, 'has the result');
      assert.equal(result.textContent, 'text', 'has the text node')
    });

    it('finds a text deeply', async () => {
      const created = await create(html`<p><span>text</span></p>`);
      const result = created.editor.findFirstText(created.element.children[0]);
      assert.ok(result, 'has the result');
      assert.equal(result.textContent, 'text', 'has the text node')
    });

    it('returns null when not found', async () => {
      const created = await create(html`<p></p>`);
      const result = created.editor.findFirstText(created.element.children[0]);
      assert.notOk(result, 'has no result');
    });
  });

  describe('nextLine()', () => {
    it('focuses on the next line at the beginning', async () => {
      const created = await create(html`<p>l1</p><p>l2</p>`);
      created.editor.focusNode(created.element.children[0].firstChild);
      created.editor.nextLine();
      const range = created.editor.getRange();
      assert.equal(range.startContainer.nodeType, Node.TEXT_NODE, 'has the selected node');
      assert.equal(range.startContainer.textContent, 'l2', 'selects the next text node');
      assert.isTrue(range.collapsed, 'the range is collapsed');
      assert.equal(range.startOffset, 2, 'focuses at the end');
    });

    it('focuses on the next line at the end', async () => {
      const created = await create(html`<p>l1</p><p>l2</p>`);
      created.editor.focusNode(created.element.children[0].firstChild);
      created.editor.nextLine('start');
      const range = created.editor.getRange();
      assert.equal(range.startContainer.nodeType, Node.TEXT_NODE, 'has the selected node');
      assert.equal(range.startContainer.textContent, 'l2', 'selects the next text node');
      assert.isTrue(range.collapsed, 'the range is collapsed');
      assert.equal(range.startOffset, 0, 'focuses at the beginning');
    });
  });

  describe('previousLine()', () => {
    it('focuses on the next line at the beginning', async () => {
      const created = await create(html`<p>l1</p><p>l2</p>`);
      created.editor.focusNode(created.element.children[1].firstChild);
      created.editor.previousLine();
      const range = created.editor.getRange();
      assert.equal(range.startContainer.nodeType, Node.TEXT_NODE, 'has the selected node');
      assert.equal(range.startContainer.textContent, 'l1', 'selects the next text node');
      assert.isTrue(range.collapsed, 'the range is collapsed');
      assert.equal(range.startOffset, 2, 'focuses at the end');
    });

    it('focuses on the next line at the end', async () => {
      const created = await create(html`<p>l1</p><p>l2</p>`);
      created.editor.focusNode(created.element.children[1].firstChild);
      created.editor.previousLine('start');
      const range = created.editor.getRange();
      assert.equal(range.startContainer.nodeType, Node.TEXT_NODE, 'has the selected node');
      assert.equal(range.startContainer.textContent, 'l1', 'selects the next text node');
      assert.isTrue(range.collapsed, 'the range is collapsed');
      assert.equal(range.startOffset, 0, 'focuses at the beginning');
    });
  });

  describe('selectCollapsed()', () => {
    it('Selects a text node', async () => {
      const created = await create(html`<p>text</p>`);
      created.editor.selectCollapsed(created.element.children[0].firstChild);
      const range = created.editor.getRange();
      assert.equal(range.startContainer.nodeType, Node.TEXT_NODE, 'has the selected node');
      assert.isTrue(range.collapsed, 'the range is collapsed');
      assert.equal(range.startOffset, 0, 'sets the selection at the beginning');
    });

    // Safari seems to be selecting the text node regardless
    it('Selects a text node from an element', async () => {
      const created = await create(html`<p>text</p>`);
      created.editor.selectCollapsed(created.element.children[0]);
      const range = created.editor.getRange();
      assert.equal(range.startContainer.nodeType, Node.TEXT_NODE, 'has the selected node');
      assert.isTrue(range.collapsed, 'the range is collapsed');
      assert.equal(range.startOffset, 0, 'sets the selection at the beginning');
    });
  });

  describe('selectContent()', () => {
    it('creates the selection', async () => {
      const created = await create(html`<p>text</p>`);
      created.editor.selectContent(created.element.children[0].firstChild);
      const range = created.editor.getRange();
      assert.equal(range.startContainer, created.element.children[0].firstChild, 'has the selected node');
      assert.isFalse(range.collapsed, 'the range is not collapsed');
    });
  });
});
