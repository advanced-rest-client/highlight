/* eslint-disable no-cond-assign */
/* eslint-disable no-await-in-loop */
import { fixture, assert, html, nextFrame } from '@open-wc/testing';
import { executeServerCommand, sendKeys } from '@web/test-runner-commands';
import sinon from 'sinon';
import '../../markdown-editor.js';
import { editorValue } from '../../src/MarkdownEditorElement.js';
import { ContentEditableEditor } from '../../src/md-editor/ContentEditableEditor.js';

/** @typedef {import('../..').MarkdownEditorElement} MarkdownEditorElement */

describe('MarkdownEditorElement', () => {
  const contentEditor = new ContentEditableEditor();
  /**
   * @returns {Promise<MarkdownEditorElement>}
   */
  async function basicFixture() {
    return fixture(html`<markdown-editor markdown="# Test">
        <div id="output" slot="markdown-html"></div>
      </markdown-editor>`);
  }

  /**
   * @returns {Promise<MarkdownEditorElement>}
   */
  async function toolbarFixture() {
    const md = `# title

A paragraph

Other *formatted* paragraph.

https://domain.com

- list item 1
- list item 2
- list item 3
    1. sub 1
    2. sub 2
`;
    return fixture(html`<markdown-editor markdown="${md}" toolbar>
        <div class="output" slot="markdown-html"></div>
      </markdown-editor>`);
  }

  /**
   * @returns {Promise<MarkdownEditorElement>}
   */
  async function contextToolbarFixture() {
    const md = `# title

A paragraph

https://domain.com

- list item 1
- list item 2
- list item 3
`;
    return fixture(html`<markdown-editor markdown="${md}" contextToolbarEnabled>
        <div class="output" slot="markdown-html"></div>
      </markdown-editor>`);
  }

  /**
   * @returns {Promise<MarkdownEditorElement>}
   */
  async function debugFixture() {
    const md = `# title`;
    return fixture(html`<markdown-editor markdown="${md}" debug>
        <div class="output" slot="markdown-html"></div>
      </markdown-editor>`);
  }

  describe('Element initialization', () => {
    let element = /** @type MarkdownEditorElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('does not set contextToolbar by default', () => {
      assert.notOk(element.contextToolbar);
    });

    it('sets the contextToolbar when contextToolbarEnabled', () => {
      element.contextToolbarEnabled = true;
      assert.ok(element.contextToolbar);
    });

    it('sets the contextToolbar only once', () => {
      element.contextToolbarEnabled = true;
      const spy = sinon.spy(element, 'requestUpdate');
      element.contextToolbarEnabled = true;
      assert.isFalse(spy.called);
    });

    it('does not render the actions toolbar', () => {
      assert.notOk(element.shadowRoot.querySelector('.toolbar'));
    });

    it('renders the toolbar when enabled', async () => {
      element.toolbar = true;
      await nextFrame();
      assert.ok(element.shadowRoot.querySelector('.toolbar'));
    });

    it('has the content editable attribute', () => {
      assert.equal(element.getAttribute('contentEditable'), 'true');
    });

    it('registers the BackquotePlugin', () => {
      const editor = element[editorValue];
      assert.isTrue(editor.hasPlugin('Backquote'));
    });

    it('registers the DeletePlugin', () => {
      const editor = element[editorValue];
      assert.isTrue(editor.hasPlugin('Delete'));
    });

    it('registers the EnterPlugin', () => {
      const editor = element[editorValue];
      assert.isTrue(editor.hasPlugin('Enter'));
    });

    it('registers the SpacePlugin', () => {
      const editor = element[editorValue];
      assert.isTrue(editor.hasPlugin('Space'));
    });
  });

  describe('Context toolbar', () => {
    let element = /** @type MarkdownEditorElement */ (null);
    beforeEach(async () => {
      element = await contextToolbarFixture();
    });

    it('sets the contextToolbar property', () => {
      assert.ok(element.contextToolbar);
    });
  });

  describe('toMarkdown()', () => {
    let element = /** @type MarkdownEditorElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('generates the markdown', () => {
      const result = element.toMarkdown();
      assert.equal(result, '# Test\n\n');
    });
  });

  describe('#debug', () => {
    let element = /** @type MarkdownEditorElement */ (null);
    beforeEach(async () => {
      element = await debugFixture();
    });

    it('sets the debug flag on the editor', () => {
      assert.isTrue(element.editor.debug);
    });

    it('has the debug attribute', () => {
      assert.isTrue(element.hasAttribute('debug'));
    });

    it('turns the debug off', () => {
      element.debug = false;
      assert.isFalse(element.editor.debug);
    });

    it('changes the debug only once', () => {
      const spy = sinon.spy(element, 'requestUpdate');
      element.debug = true;
      assert.isFalse(spy.called);
    });
  });

  describe('toolbar actions', () => {
    let element = /** @type MarkdownEditorElement */ (null);
    /** @type HTMLElement */
    let output;
    beforeEach(async () => {
      element = await toolbarFixture();
      output = element.querySelector('.output');
    });

    it('executes the Bold command', async () => {
      await executeServerCommand('mouse', {
        click: {
          selector: 'p',
        },
      });
      const p = output.querySelector('p');
      contentEditor.selectNodeContent(p.firstChild);
      await executeServerCommand('mouse', {
        click: {
          selector: '[data-cmd="bold"]',
        },
      });
      assert.equal(p.firstElementChild.outerHTML.trim(), '<b>A paragraph</b>');
    });

    it('executes the Italic command', async () => {
      await executeServerCommand('mouse', {
        click: {
          selector: 'p',
        },
      });
      const p = output.querySelector('p');
      contentEditor.selectNodeContent(p.firstChild);
      await executeServerCommand('mouse', {
        click: {
          selector: '[data-cmd="italic"]',
        },
      });
      assert.equal(p.firstElementChild.outerHTML.trim(), '<i>A paragraph</i>');
    });

    it('executes the Underline command', async () => {
      await executeServerCommand('mouse', {
        click: {
          selector: 'p',
        },
      });
      const p = output.querySelector('p');
      contentEditor.selectNodeContent(p.firstChild);
      await executeServerCommand('mouse', {
        click: {
          selector: '[data-cmd="underline"]',
        },
      });
      assert.equal(p.firstElementChild.outerHTML.trim(), '<u>A paragraph</u>');
    });

    it('executes the Strike Through command', async () => {
      await executeServerCommand('mouse', {
        click: {
          selector: 'p',
        },
      });
      const p = output.querySelector('p');
      contentEditor.selectNodeContent(p.firstChild);
      await executeServerCommand('mouse', {
        click: {
          selector: '[data-cmd="strikeThrough"]',
        },
      });
      assert.equal(p.firstElementChild.outerHTML.trim(), '<strike>A paragraph</strike>');
    });

    it('executes the Remove Format command', async () => {
      await executeServerCommand('mouse', {
        click: {
          selector: 'xpath=//p[2]',
        },
      });
      const ps = output.querySelectorAll('p');
      contentEditor.selectNodeContent(ps[1]);
      await executeServerCommand('mouse', {
        click: {
          selector: '[data-cmd="removeFormat"]',
        },
      });
      assert.equal(ps[1].outerHTML.trim(), '<p>Other formatted paragraph.</p>');
    });

    it('executes the Indent command', async () => {
      await executeServerCommand('mouse', {
        click: {
          selector: 'xpath=//ul/li[2]',
          x: 60,
          y: 10,
        },
      });
      const items = output.querySelectorAll('ul li');
      contentEditor.selectNodeContent(items[1]);
      await executeServerCommand('mouse', {
        click: {
          selector: '[data-cmd="indent"]',
        },
      });
      assert.equal(output.querySelector('ul ul').outerHTML.trim(), '<ul><li>list item 2</li></ul>');
    });

    it('executes the Outdent command', async () => {
      await executeServerCommand('mouse', {
        click: {
          selector: 'xpath=//ol/li[2]',
          x: 60,
          y: 10,
        },
      });
      const items = output.querySelectorAll('ol li');
      contentEditor.selectNodeContent(items[1]);
      await executeServerCommand('mouse', {
        click: {
          selector: '[data-cmd="outdent"]',
        },
      });
      assert.equal(output.querySelector('ol').outerHTML.trim(), '<ol>\n<li>sub 1</li>\n</ol>');
    });

    it('executes the format block command with blockquote', async () => {
      await executeServerCommand('mouse', {
        click: {
          selector: 'p',
        },
      });
      const p = output.querySelector('p');
      contentEditor.selectNodeContent(p.firstChild);
      await executeServerCommand('mouse', {
        click: {
          selector: '[data-cmd="formatblock"][data-arg="blockquote"]',
        },
      });
      const blockquote = output.querySelector('blockquote');
      assert.ok(blockquote, 'blockquote element is inserted');
      // assert.equal(blockquote.outerHTML.trim(), '<blockquote>A paragraph</blockquote>');
    });

    /**
     * @param {string} txt
     */
    async function inputText(txt) {
      const input = Array.from(txt.toUpperCase());
      let letter;
      while ((letter = input.shift())) {
        await sendKeys({ press: `Key${letter}` });
      }
    }

    it('executes the createLink command for a link selection', async () => {
      await executeServerCommand('mouse', {
        click: {
          selector: 'p',
        },
      });
      const p = output.querySelector('p');
      contentEditor.selectNodeContent(p.firstChild);
      await inputText('https');
      await sendKeys({ down: 'Shift' });
      await sendKeys({ press: `Semicolon` });
      await sendKeys({ up: 'Shift' });
      await sendKeys({ press: `Slash` });
      await sendKeys({ press: `Slash` });
      await inputText('domain');
      await sendKeys({ press: `Period` });
      await inputText('com');
      await sendKeys({ press: `Slash` });
      await inputText('api');
      contentEditor.selectNodeContent(p.firstChild);
      await executeServerCommand('mouse', {
        click: {
          selector: '[data-cmd="createLink"]',
        },
      });
      assert.equal(p.outerHTML.trim(), '<p><a href="https://domain.com/api">https://domain.com/api</a></p>');
    });

    // this is to be changes in the future to create a link from the Text node
    it('ignores link without selection', async () => {
      await executeServerCommand('mouse', {
        click: {
          selector: 'p',
        },
      });
      const p = output.querySelector('p');
      contentEditor.selectNodeContent(p.firstChild);
      await inputText('https');
      await sendKeys({ down: 'Shift' });
      await sendKeys({ press: `Semicolon` });
      await sendKeys({ up: 'Shift' });
      await sendKeys({ press: `Slash` });
      await sendKeys({ press: `Slash` });
      await inputText('domain');
      await sendKeys({ press: `Period` });
      await inputText('com');
      await sendKeys({ press: `Slash` });
      await inputText('api');
      contentEditor.focusNode(p.firstChild, 'start');
      await executeServerCommand('mouse', {
        click: {
          selector: '[data-cmd="createLink"]',
        },
      });
      assert.equal(p.outerHTML.trim(), '<p>https://domain.com/api</p>');
    });
  });
});
