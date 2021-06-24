import { html } from 'lit-html';
import { DemoPage } from '@advanced-rest-client/arc-demo-helper';
import '@advanced-rest-client/arc-demo-helper/arc-interactive-demo.js';
import '@anypoint-web-components/anypoint-button/anypoint-button.js';
import '../markdown-editor.js';
import { MarkdownStyles } from '../index.js';

class ComponentPage extends DemoPage {
  constructor() {
    super();
    this.initObservableProperties(['markdown', 'result']);
    this.componentName = 'markdown-editor';
    this.demoStates = ['Material'];

    this.markdown = `
# This is an example markdown

This \`code\` value id editable.

**Focus** on the text and start editing.

More info: [google.com](google.com/?q=markdown)

__Underline__ value.

## Lists:

- list item 1
- list item 2

1. Ordered 1
2. Ordered 2

## A code block

\`\`\`html
<a href="http://google.com">Google</a>
\`\`\`

## A table

| var | default value | desc |
| --- | --- | --- |
| debug | \`false\` | Enabled the debug messages |


It's very easy to make some words **bold** and other words *italic* with Markdown. You can even [link to Google!](http://google.com)


Sometimes you want numbered lists:

1. One
2. Two
3. Three

Sometimes you want bullet points:

* Start a line with a star
* Profit!

Alternatively,

- Dashes work just as well
- And if you have sub points, put two spaces before the dash or star:
  - Like this
  - And this

If you want to embed images, this is how you do it:

![Image of Yaktocat](https://octodex.github.com/images/yaktocat.png)



# Structured documents

Sometimes it's useful to have different levels of headings to structure your documents. Start lines with a \`#\` to create headings. Multiple \`##\` in a row denote smaller heading sizes.

### This is a third-tier heading

You can use one \`#\` all the way up to \`######\` six for different heading sizes.

If you'd like to quote someone, use the > character before the line:

> Coffee. The finest organic suspension ever devised... I beat the Borg with it.
> - Captain Janeway

There are many different ways to style code with GitHub's markdown. If you have inline code blocks, wrap them in backticks: \`var example = true\`.  If you've got a longer block of code, you can indent with four spaces:

    if (isAwesome){
      return true
    }

GitHub also supports something called code fencing, which allows for multiple lines without indentation:

\`\`\`
if (isAwesome){
  return true
}
\`\`\`

And if you'd like to use syntax highlighting, include the language:

\`\`\`javascript
if (isAwesome){
  return true
}
\`\`\`


GitHub supports many extras in Markdown that help you reference and link to people. If you ever want to direct a comment at someone, you can prefix their name with an @ symbol: Hey @kneath — love your sweater!

But I have to admit, tasks lists are my favorite:

- [x] This is a complete item
- [ ] This is an incomplete item

When you include a task list in the first comment of an Issue, you will see a helpful progress bar in your list of issues. It works in Pull Requests, too!

And, of course emoji!


## Emphasis

*This text will be italic*
_This will also be italic_

**This text will be bold**
__This will also be bold__

_You **can** combine them_

### Unordered list

* Item 1
* Item 2
  * Item 2a
  * Item 2b

### Ordered list 
1. Item 1
1. Item 2
1. Item 3
   1. Item 3a
   1. Item 3b

### Mixed list 

1. Item 1
1. Item 2
1. Item 3
   * Item 3a
   * Item 3b
   * Item 3c

`;
  }

  generatePreview() {
    const element = document.querySelector('markdown-editor');
    this.result = element.toMarkdown();
  }

  _demoTemplate() {
    const { demoStates, darkThemeActive, markdown } = this;
    return html`
    <section class="documentation-section">
      <h3>Interactive demo</h3>
      <p>
        This demo lets you preview the element with various configuration options.
      </p>

      <arc-interactive-demo
        .states="${demoStates}"
        @state-changed="${this._demoStateHandler}"
        ?dark="${darkThemeActive}"
      >
        <markdown-editor .markdown="${markdown}" slot="content" toolbar>
          <div slot="markdown-html"></div>
          <anypoint-button slot="post-toolbar" style="margin-left: auto" @click="${this.generatePreview}">Save</anypoint-button>
        </markdown-editor>
      </arc-interactive-demo>
    </section>
    `;
  }

  _previewTemplate() {
    const { result } = this;
    if (!result) {
      return '';
    }
    return html`
    <pre class="result"><code>${result}</code></pre>
    `;
  }

  contentTemplate() {
    return html`
    <h2 class="centered main">Markdown editor</h2>
    ${this._demoTemplate()}
    ${this._previewTemplate()}
    `;
  }
}
const instance = new ComponentPage();
instance.render();

try {
  // @ts-ignore
  document.adoptedStyleSheets = document.adoptedStyleSheets.concat(MarkdownStyles.styleSheet);
} catch (_) {
  const s = document.createElement('style');
  s.innerHTML = MarkdownStyles.cssText;
  document.getElementsByTagName('head')[0].appendChild(s);
}
