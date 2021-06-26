import { fixture, assert, html } from '@open-wc/testing';
import { executeServerCommand } from '@web/test-runner-commands';
import sinon from 'sinon';
import { MarkdownEditor } from '../../src/md-editor/MarkdownEditor.js';

describe('MarkdownEditorElement', () => {
  /**
   * @returns {Promise<HTMLElement>}
   */
  async function containerFixture() {
    return fixture(html`<div contentEditable="true"><p>This is content</p></div>`);
  }

  /**
   * @returns {Promise<HTMLElement>}
   */
  async function documentFixture() {
    return fixture(html`
    <section class="doc">
      <h1>This is only a test!</h1>
      <div id="editor" contentEditable="true"><p>This is content</p></div>
    </section>
    `);
  }

  describe('constructor()', () => {
    let element = /** @type HTMLElement */ (null);
    beforeEach(async () => {
      element = await containerFixture();
    });

    it('sets the #root', () => {
      const editor = new MarkdownEditor(element);
      assert.isTrue(editor.root === element);
    });

    it('sets the #editor', () => {
      const editor = new MarkdownEditor(element);
      assert.ok(editor.editor, 'has the editor');
      assert.equal(editor.editor.constructor.name, 'ContentEditableEditor');
    });
  });

  describe('event listeners', () => {
    describe('keydown event', () => {
      let editor = /** @type MarkdownEditor */ (null);
      let element = /** @type HTMLElement */ (null);
      beforeEach(async () => {
        element = await containerFixture();
        editor = new MarkdownEditor(element);
        editor.listen();
      });

      afterEach(() => {
        editor.unlisten();
      });

      [
        'Backquote',
        'Enter',
        'Space',
        'Backspace',
        'Delete',
      ].forEach((code) => {
        it(`Executes actions on ${code}`, () => {
          const spy = sinon.spy(editor, 'executeAction');
          const e = new KeyboardEvent('keydown', {
            code,
            bubbles: true,
            cancelable: true,
            composed: true,
          });
          element.dispatchEvent(e);
          // 2 because each time the `keydown` action is also called
          assert.strictEqual(spy.callCount, 2, 'the action is called');
          const [reportedCode, reportedRoot, reportedEditor, reportedArgs] = spy.args[1];
          assert.equal(reportedCode, code, 'The plugin name is reported');
          assert.equal(reportedRoot, element, 'The root is reported');
          assert.equal(reportedEditor, editor.editor, 'The editor is reported');
          assert.equal(reportedArgs, e, 'The args is reported');
        });
      });

      it(`Executes actions on NumpadEnter`, () => {
        const spy = sinon.spy(editor, 'executeAction');
        const e = new KeyboardEvent('keydown', {
          code: 'NumpadEnter',
          bubbles: true,
          cancelable: true,
          composed: true,
        });
        element.dispatchEvent(e);
        // 2 because each time the `keydown` action is also called
        assert.strictEqual(spy.callCount, 2, 'the action is called');
        const [reportedCode, reportedRoot, reportedEditor, reportedArgs] = spy.args[1];
        assert.equal(reportedCode, 'Enter', 'The plugin name is reported');
        assert.equal(reportedRoot, element, 'The root is reported');
        assert.equal(reportedEditor, editor.editor, 'The editor is reported');
        assert.equal(reportedArgs, e, 'The args is reported');
      });

      it(`Executes actions on keydown`, () => {
        const spy = sinon.spy(editor, 'executeAction');
        const e = new KeyboardEvent('keydown', {
          code: 'KeyA',
          bubbles: true,
          cancelable: true,
          composed: true,
        });
        element.dispatchEvent(e);
        assert.strictEqual(spy.callCount, 1, 'the action is called');
        const [reportedCode, reportedRoot, reportedEditor, reportedArgs] = spy.args[0];
        assert.equal(reportedCode, 'keydown', 'The plugin name is reported');
        assert.equal(reportedRoot, element, 'The root is reported');
        assert.equal(reportedEditor, editor.editor, 'The editor is reported');
        assert.equal(reportedArgs, e, 'The args is reported');
      });
    });

    describe('selection event', () => {
      let editor = /** @type MarkdownEditor */ (null);
      let element = /** @type HTMLElement */ (null);
      beforeEach(async () => {
        const doc = await documentFixture();
        element = doc.querySelector('div');
        editor = new MarkdownEditor(element);
        editor.listen();
      });

      afterEach(() => {
        editor.unlisten();
      });

      it('executes the selection action when selection change inside the root', async () => {
        const spy = sinon.spy(editor, 'executeAction');
        await executeServerCommand('mouse', {
          click: {
            selector: 'p',
          },
        });
        assert.strictEqual(spy.callCount, 1, 'the action is called');
        const [reportedAction, reportedRoot, reportedEditor, reportedArgs] = spy.args[0];
        assert.equal(reportedAction, 'selection', 'The plugin name is reported');
        assert.equal(reportedRoot, element, 'The root is reported');
        assert.equal(reportedEditor, editor.editor, 'The editor is reported');
        assert.isUndefined(reportedArgs, 'The args is not reported');
      });

      it('executes the selection action when selection change on the root', async () => {
        const spy = sinon.spy(editor, 'executeAction');
        await executeServerCommand('mouse', {
          click: {
            selector: '#editor',
          },
        });
        assert.isTrue(spy.called, 'the action is called');
        const [reportedAction, reportedRoot, reportedEditor, reportedArgs] = spy.args[0];
        assert.equal(reportedAction, 'selection', 'The plugin name is reported');
        assert.equal(reportedRoot, element, 'The root is reported');
        assert.equal(reportedEditor, editor.editor, 'The editor is reported');
        assert.isUndefined(reportedArgs, 'The args is not reported');
      });

      it('ignores the selection action when selection change outside', async () => {
        const spy = sinon.spy(editor, 'executeAction');
        await executeServerCommand('mouse', {
          click: {
            selector: 'h1',
          },
        });
        assert.isFalse(spy.called, 'the action is not called');
      });
    });
  });
});
