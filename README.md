# highlight

A set of tools to work with markdown content and other syntax highlighting.

This library replaces the old modules of:

- @advanced-rest-client/markdown-styles
- @advanced-rest-client/arc-marked
- @advanced-rest-client/prism-highlight

[![Published on NPM](https://img.shields.io/npm/v/@advanced-rest-client/highlight.svg)](https://www.npmjs.com/package/@advanced-rest-client/highlight)

[![Tests and publishing](https://github.com/advanced-rest-client/highlight/actions/workflows/deployment.yml/badge.svg)](https://github.com/advanced-rest-client/highlight/actions/workflows/deployment.yml)

## Usage

### Installation

```sh
npm install --save @advanced-rest-client/highlight
```

### MarkdownStyles

This should be used whenever the `arc-marked` is used.

```javascript
import { MarkdownStyles } from '@advanced-rest-client/highlight';

export default class AnElement extends LitElement {
  get styles() {
    return [
      MarkdownStyles,
      css`
        ...
      `
    ];
  }
  ...
}
```

### arc-marked

An element that specializes in markdown rendering.

```html
<arc-marked markdown="***Bold and italic***">
  <div slot="markdown-html" class="markdown-html custom"></div>
</arc-marked>
```

```html
<arc-marked>
  <div slot="markdown-html"></div>
  <script type="text/markdown">
    ## Markdown Renderer

    ...
  </script>
</arc-marked>
```

## Development

```sh
git clone https://github.com/advanced-rest-client/arc-headers
cd arc-headers
npm install
```

### Running the demo locally

```sh
npm start
```

### Running the tests

```sh
npm test
```
