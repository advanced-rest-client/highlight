/* eslint-disable no-param-reassign */
import { nextFrame, fixture, expect, assert, aTimeout, html } from '@open-wc/testing';
import sinon from 'sinon';
import '../../arc-marked.js';
import {
  markdownValue,
  breaksValue,
  pedanticValue,
  rendererValue,
  sanitizeValue,
  sanitizerValue,
  smartypants,
} from '../../src/ArcMarkedElement.js';

/** @typedef {import('../..').ArcMarkedElement} ArcMarkedElement */

describe('ArcMarkedElement', () => {
  /**
   * @returns {Promise<ArcMarkedElement>}
   */
  async function basicFixture() {
    return fixture(html`<arc-marked>
        <div id="output" slot="markdown-html"></div>
        <script type="text/markdown">
        # Test
        </script>
      </arc-marked>`);
  }

  /**
   * @returns {Promise<ArcMarkedElement>}
   */
  async function propertyMarkdownFixture() {
    return fixture(html`<arc-marked markdown="# Test">
        <div id="output" slot="markdown-html"></div>
      </arc-marked>`);
  }
  /**
   * @returns {Promise<ArcMarkedElement>}
   */
  async function noContentFixture() {
    return fixture(html`<arc-marked>
        <div id="output" slot="markdown-html"></div>
        <script type="text/markdown">

        </script>
      </arc-marked>`);
  }

  /**
   * @returns {Promise<ArcMarkedElement>}
   */
  async function camelCaseHTMLFixture() {
    return fixture(html`<arc-marked>
        <div id="output" slot="markdown-html"></div>
        <script type="text/markdown">
\`\`\`html
<div camelCase></div>
\`\`\`
        </script>
      </arc-marked>`);
  }
  /**
   * @returns {Promise<ArcMarkedElement>}
   */
  async function badHTMLFixture() {
    return fixture(html`<arc-marked>
        <div id="output" slot="markdown-html"></div>
        <script type="text/markdown">
\`\`\`html
<p><div></p></div>
\`\`\`
        </script>
      </arc-marked>`);
  }
  /**
   * @returns {Promise<ArcMarkedElement>}
   */
  async function camelCaseHTMLWithoutChildFixture() {
    return fixture(html`<arc-marked>
        <script type="text/markdown">
\`\`\`html
<div camelCase></div>
\`\`\`
        </script>
      </arc-marked>`);
  }
  /**
   * @returns {Promise<ArcMarkedElement>}
   */
  async function badHTMLWithoutChildFixture() {
    return fixture(html`<arc-marked>
        <script type="text/markdown">
\`\`\`html
<p><div></p></div>
\`\`\`
        </script>
      </arc-marked>`);
  }
  /**
   * @returns {Promise<ArcMarkedElement>}
   */
  async function rendererFixture() {
    return fixture(html`<arc-marked>
        <div id="output" slot="markdown-html"></div>
        <script type="text/markdown">
          [Link](http://url.com)
        </script>
      </arc-marked>`);
  }
  /**
   * @returns {Promise<ArcMarkedElement>}
   */
  async function sanitizerFixture() {
    return fixture(html`<arc-marked sanitize>
        <div id="output" slot="markdown-html"></div>
        <script type="text/markdown">
[Link](http://url.com" onclick="alert(1)")
<a href="http://url.com" onclick="alert(1)">Link</a>
\`\`\`html
<a href="http://url.com" onclick="alert(1)">Link</a>
\`\`\`
        </script>
      </arc-marked>`);
  }
  /**
   * @returns {Promise<ArcMarkedElement>}
   */
  async function remoteContentFixture() {
    return fixture(html`<arc-marked>
        <div id="output" slot="markdown-html"></div>
        <script type="text/markdown" src="test/elements/test.md">
          # Loading
          Please wait...
        </script>
      </arc-marked>`);
  }
  /**
   * @returns {Promise<ArcMarkedElement>}
   */
  async function badRemoteContentFixture() {
    return fixture(html`<arc-marked>
        <div id="output" slot="markdown-html"></div>
        <script type="text/markdown" src="test/elements/test3.md"></script>
      </arc-marked>`);
  }
  /**
   * @returns {Promise<ArcMarkedElement>}
   */
  async function sanitizedRemoteContentFixture() {
    return fixture(html`<arc-marked>
        <div id="output" slot="markdown-html"></div>
        <script type="text/markdown" src="test/elements/remoteSanitization.md"></script>
      </arc-marked>`);
  }
   
  /**
   * @returns {Promise<ArcMarkedElement>}
   */
  async function unsanitizedRemoteContentFixture() {
    return fixture(html`<arc-marked disableRemoteSanitization>
        <div id="output" slot="markdown-html"></div>
        <script type="text/markdown" src="test/elements/remoteSanitization.md"></script>
      </arc-marked>`);
  }

  /**
   * @returns {Promise<ArcMarkedElement>}
   */
  async function markedOptionsFixture() {
    return fixture(html`<arc-marked sanitize pedantic breaks smartypants>
        <div id="output" slot="markdown-html"></div>
        <script type="text/markdown" src="test/elements/remoteSanitization.md"></script>
      </arc-marked>`);
  }

  // Thanks IE10.
  function isHidden(element) {
    const rect = element.getBoundingClientRect();
    return rect.width === 0 && rect.height === 0;
  }

  // // Replace reserved HTML characters with their character entity equivalents to
  // // match the transform done by Markdown.
  // //
  // // The Marked library itself is not used because it wraps code blocks in
  // // `<code><pre>`, which is superfluous for testing purposes.
  // function escapeHTML(string) {
  //   const span = document.createElement('span');
  //   span.textContent = string;
  //   return span.innerHTML;
  // }

  describe('Property setters', () => {
    let element = /** @type ArcMarkedElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
    });

    [
      ['markdown', markdownValue, 'test'],
      ['breaks', breaksValue, true],
      ['pedantic', pedanticValue, true],
      ['renderer', rendererValue, () => {}],
      ['sanitize', sanitizeValue, true],
      ['sanitizer', sanitizerValue, () => {}],
      ['smartypants', smartypants, true]
    ].forEach((item) => {
      const prop = String(item[0]);
      const key = /** @type symbol */ (item[1]);
      const value = item[2];

      // @ts-ignore
      it(`sets the ${prop} property`, () => {
        element[key] = value;
        assert.equal(element[prop], value, 'getter has the value');
        assert.equal(element[key], value, 'sets the private property');
      });

      it(`triggers the renderMarkdown() when setting ${prop} property`, () => {
        const spy = sinon.spy(element, 'renderMarkdown');
        element[prop] = value;
        assert.isTrue(spy.called);
      });

      it(`ignores renderMarkdown() when setting the same value for ${prop} property`, () => {
        element[prop] = value;
        const spy = sinon.spy(element, 'renderMarkdown');
        element[prop] = value;
        assert.isFalse(spy.called);
      });
    });
  });

  describe('<arc-marked> renders markdown from property setter', () => {
    let outputElement = /** @type HTMLDivElement */ (null);
    beforeEach(async () => {
      await propertyMarkdownFixture();
      outputElement = /** @type HTMLDivElement */ (document.getElementById('output'));
    });

    it('Renders the code', () => {
      assert.equal(outputElement.innerHTML, '<h1 id="test">Test</h1>\n');
    });
  });

  describe('<arc-marked> has options of marked library', () => {
    let markedElement = /** @type ArcMarkedElement */ (null);
    beforeEach(async () => {
      markedElement = await markedOptionsFixture();
    });

    it('has sanitize', () => {
      expect(markedElement.sanitize).to.equal(true);
    });

    it('has sanitizer', () => {
      expect(markedElement.sanitizer).to.equal(undefined);
    });

    it('has pedantic', () => {
      expect(markedElement.pedantic).to.equal(true);
    });

    it('has breaks', () => {
      expect(markedElement.breaks).to.equal(true);
    });

    it('has smartypants', () => {
      expect(markedElement.smartypants).to.equal(true);
    });
  });

  describe('<arc-marked> with .markdown-html child', () => {
    describe('ignores no content', () => {
      let markedElement = /** @type ArcMarkedElement */ (null);
      let outputElement = /** @type HTMLDivElement */ (null);
      let proofElement;
      beforeEach(async () => {
        markedElement = await noContentFixture();
        proofElement = document.createElement('div');
        outputElement = /** @type HTMLDivElement */ (document.getElementById('output'));
      });

      it('in code blocks', () => {
        proofElement.innerHTML = '';
        assert.equal(outputElement, markedElement.outputElement);
        assert.isTrue(isHidden(markedElement.shadowRoot.querySelector('#content')));
        assert.equal(markedElement.markdown, undefined);
        assert.equal(outputElement.innerHTML, proofElement.innerHTML);
      });
    });

    describe('respects camelCased HTML', () => {
      let markedElement = /** @type ArcMarkedElement */ (null);
      let outputElement = /** @type HTMLDivElement */ (null);
      let proofElement;

      beforeEach(async () => {
        markedElement = await camelCaseHTMLFixture();
        proofElement = document.createElement('div');
        outputElement = /** @type HTMLDivElement */ (document.getElementById('output'));
      });

      it('in code blocks', () => {
        proofElement.innerHTML = '<div camelCase></div>';
        expect(outputElement).to.equal(markedElement.outputElement);
        assert.isTrue(isHidden(markedElement.shadowRoot.querySelector('#content')));
        // If Markdown content were put into a `<template>` or directly into the
        // DOM, it would be rendered as DOM and be converted from camelCase to
        // lowercase per HTML parsing rules. By using `<script>` descendants,
        // content is interpreted as plain text.
        expect(proofElement.innerHTML).to.eql('<div camelcase=""></div>');
      });
    });

    describe('respects bad HTML', () => {
      let markedElement = /** @type ArcMarkedElement */ (null);
      let proofElement;
      let outputElement = /** @type HTMLDivElement */ (null);

      beforeEach(async () => {
        markedElement = await badHTMLFixture();
        proofElement = document.createElement('div');
        outputElement = /** @type HTMLDivElement */ (document.getElementById('output'));
      });

      it('in code blocks', () => {
        proofElement.innerHTML = '<p><div></p></div>';
        expect(outputElement).to.equal(markedElement.outputElement);
        assert.isTrue(isHidden(markedElement.shadowRoot.querySelector('#content')));
        // If Markdown content were put into a `<template>` or directly into the
        // DOM, it would be rendered as DOM and close unbalanced tags. Because
        // they are in code blocks they should remain as typed. Turns out, however
        // IE and everybody else have slightly different opinions about how the
        // incorrect HTML should be fixed. It seems that: IE says:
        // <p><div></p></div> -> <p><div><p></p></div> Chrome/FF say:
        // <p><div></p></div> -> <p></p><div><p></p></div>. So that's cool.
        const isEqualToOneOfThem =
          proofElement.innerHTML === '<p><div><p></p></div>' || proofElement.innerHTML === '<p></p><div><p></p></div>';
        assert.isTrue(isEqualToOneOfThem);
        expect(outputElement.innerHTML).to.include('<span class="token punctuation">&lt;</span>p</span>');
      });
    });
  });

  describe('<arc-marked> without .markdown-html child', () => {
    describe('respects camelCased HTML', () => {
      let markedElement = /** @type ArcMarkedElement */ (null);
      let proofElement;
      beforeEach(async () => {
        markedElement = await camelCaseHTMLWithoutChildFixture();
        proofElement = document.createElement('div');
      });

      it('in code blocks', async () => {
        proofElement.innerHTML = '<div camelCase></div>';
        expect(markedElement.shadowRoot.querySelector('#content')).to.equal(markedElement.outputElement);
        await nextFrame();
        assert.isFalse(isHidden(markedElement.shadowRoot.querySelector('#content')));
        // If Markdown content were put into a `<template>` or directly into the
        // DOM, it would be rendered as DOM and be converted from camelCase to
        // lowercase per HTML parsing rules. By using `<script>` descendants,
        // content is interpreted as plain text.
        expect(proofElement.innerHTML).to.eql('<div camelcase=""></div>');
        // expect(markedElement.shadowRoot.querySelector('#content').innerHTML).to.include(escapeHTML('<div camelCase>'));
      });
    });

    describe('respects bad HTML', () => {
      let markedElement = /** @type ArcMarkedElement */ (null);
      let proofElement;

      beforeEach(async () => {
        markedElement = await badHTMLWithoutChildFixture();
        proofElement = document.createElement('div');
      });

      it('in code blocks', async () => {
        proofElement.innerHTML = '<p><div></p></div>';
        expect(markedElement.shadowRoot.querySelector('#content')).to.equal(markedElement.outputElement);
        await nextFrame();
        assert.isFalse(isHidden(markedElement.shadowRoot.querySelector('#content')));
        // If Markdown content were put into a `<template>` or directly into the
        // DOM, it would be rendered as DOM and close unbalanced tags. Because
        // they are in code blocks they should remain as typed. Turns out, however
        // IE and everybody else have slightly different opinions about how the
        // incorrect HTML should be fixed. It seems that: IE says:
        // <p><div></p></div> -> <p><div><p></p></div> Chrome/FF say:
        // <p><div></p></div> -> <p></p><div><p></p></div>. So that's cool.
        const isEqualToOneOfThem =
          proofElement.innerHTML === '<p><div><p></p></div>' || proofElement.innerHTML === '<p></p><div><p></p></div>';
        assert.isTrue(isEqualToOneOfThem);
        // expect(markedElement.shadowRoot.querySelector('#content').innerHTML).to.include(
        //   escapeHTML('<p><div></p></div>')
        // );
      });
    });
  });

  describe('<arc-marked> with custom sanitizer', () => {
    let markedElement = /** @type ArcMarkedElement */ (null);
    let outputElement = /** @type HTMLDivElement */ (null);
    let proofElement;

    beforeEach(async () => {
      markedElement = await sanitizerFixture();
      outputElement = /** @type HTMLDivElement */ (document.getElementById('output'));
      proofElement = document.createElement('div');
    });

    it('takes custom sanitizer', () => {
      markedElement.sanitizer = (input) => input.replace(/ onclick="[^"]+"/gim, '');

      proofElement.innerHTML =
        '<p>[Link](<a href="http://url.com&quot;">http://url.com"</a> onclick="alert(1)")\n' +
        '<a href="http://url.com">Link</a></p>\n<pre><code class="language-html">&lt;a ' +
        'href="http://url.com" onclick="alert(1)"&gt;Link&lt;/a&gt;\n</code></pre>\n';
      const cp = '<p>[Link](<a href="http://url.com&quot;">http://url.com"</a> onclick="alert(1)")\n<a href="http://url.com">Link</a></p>\n<pre><code class="language-html"><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>a</span> <span class="token attr-name">href</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span><a class="token url-link" href="http://url.com">http://url.com</a><span class="token punctuation">"</span></span> <span class="token attr-name">onclick</span><span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span>alert(1)<span class="token punctuation">"</span></span><span class="token punctuation">&gt;</span></span>Link<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>a</span><span class="token punctuation">&gt;</span></span>\n</code></pre>\n';
      expect(outputElement.innerHTML).to.include(cp);
    });
  });

  describe('<arc-marked> with custom renderer', () => {
    let markedElement = /** @type ArcMarkedElement */ (null);
    let outputElement = /** @type HTMLDivElement */ (null);
    let proofElement;

    beforeEach(async () => {
      markedElement = await rendererFixture();
      outputElement = /** @type HTMLDivElement */ (document.getElementById('output'));
      proofElement = document.createElement('div');
    });

    it('takes custom link renderer', () => {
      markedElement.renderer = (renderer) => {
        renderer.link = (href, title, text) => `<a href="${href}" target="_blank">${text}</a>`;
      };
      proofElement.innerHTML = '<a href="http://url.com" target="_blank">Link</a>';
      expect(outputElement.innerHTML).to.include(proofElement.innerHTML);
    });
  });

  describe('<arc-marked> with remote content', () => {
    let markedElement = /** @type ArcMarkedElement */ (null);
    let outputElement = /** @type HTMLDivElement */ (null);
    let proofElement;

    describe('successful fetch', () => {
      beforeEach(async () => {
        markedElement = await remoteContentFixture();
        outputElement = /** @type HTMLDivElement */ (document.getElementById('output'));
        proofElement = document.createElement('div');
      });

      it('renders remote content', (done) => {
        proofElement.innerHTML = '<h1 id="test">Test</h1>\n<p><a href="http://url.com/">Link</a></p>\n';
        markedElement.addEventListener('markedloaded', () => {
          expect(outputElement.innerHTML).to.equal(proofElement.innerHTML);
          done();
        });
      });

      it('renders content while remote content is loading', () => {
        proofElement.innerHTML = '<h1 id="loading">Loading</h1>\n<p>Please wait...</p>\n';
        expect(outputElement.innerHTML).to.equal(proofElement.innerHTML);
      });

      it('renders new remote content when src changes', (done) => {
        markedElement.addEventListener('markedloaded', function firstCheck() {
          markedElement.removeEventListener('markedloaded', firstCheck);
          proofElement.innerHTML = '<h1 id="test-2">Test 2</h1>\n';
          // @ts-ignore
          markedElement.querySelector('[type="text/markdown"]').src = 'test/elements/test2.md';
          markedElement.addEventListener('markedloaded', () => {
            expect(outputElement.innerHTML).to.equal(proofElement.innerHTML);
            done();
          });
        });
      });
    });

    describe('fails to load', () => {
      beforeEach(async () => {
        markedElement = await badRemoteContentFixture();
        outputElement = /** @type HTMLDivElement */ (document.getElementById('output'));
        proofElement = document.createElement('div');
      });

      it('renders error message', (done) => {
        proofElement.innerHTML = '<p>Failed loading markdown source</p>\n';
        markedElement.addEventListener('markedloaderror', async () => {
          await aTimeout(0);
          expect(outputElement.innerHTML).to.equal(proofElement.innerHTML);
          done();
        });
      });

      it("Doesn't render error message when default is prevented", (done) => {
        proofElement.innerHTML = '';
        markedElement.addEventListener('markedloaderror', (e) => {
          e.preventDefault();
          nextFrame().then(() => {
            expect(outputElement.innerHTML).to.equal(proofElement.innerHTML);
            done();
          });
        });
      });
    });

    describe('sanitizing remote content', () => {
      describe('sanitized', () => {
        beforeEach(async () => {
          markedElement = await sanitizedRemoteContentFixture();
        });

        it('sanitizes remote content', (done) => {
          outputElement = markedElement.querySelector('#output');
          proofElement = document.createElement('div');
          proofElement.innerHTML = '<div></div>\n';
          markedElement.addEventListener('markedloaded', () => {
            assert.isTrue(markedElement.sanitize);
            assert.isNotTrue(markedElement.disableRemoteSanitization);
            expect(outputElement.innerHTML).to.equal(proofElement.innerHTML);
            done();
          });
        });
      });

      describe('unsanitized', () => {
        beforeEach(async () => {
          markedElement = await unsanitizedRemoteContentFixture();
        });

        it('Does not sanitize remote content', (done) => {
          outputElement = markedElement.querySelector('#output');
          proofElement = document.createElement('div');
          proofElement.innerHTML = '<div></div>\n';
          markedElement.addEventListener('markedloaded', () => {
            assert.isNotTrue(markedElement.sanitize);
            assert.isTrue(markedElement.disableRemoteSanitization);
            expect(outputElement.innerHTML).to.equal(proofElement.innerHTML);
            done();
          });
        });
      });
    });
  });

  describe('events', () => {
    let markedElement = /** @type ArcMarkedElement */ (null);
    let outputElement = /** @type HTMLDivElement */ (null);
    beforeEach(async () => {
      markedElement = await camelCaseHTMLFixture();
      outputElement = /** @type HTMLDivElement */ (document.getElementById('output'));
    });

    it('render() fires markedrendercomplete', (done) => {
      markedElement.addEventListener('markedrendercomplete', () => {
        expect(outputElement.innerHTML).to.not.equal('');
        done();
      });
      markedElement.renderMarkdown();
    });
  });
});
