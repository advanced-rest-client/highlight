import { css } from 'lit-element';

export default css`
:host {
  display: block;
}

pre {
  user-select: text;
  margin: 8px;
}

.worker-error {
  color: var(--error-color);
}

.token a {
  color: inherit;
}

.raw-content {
  overflow: hidden;
}

.raw {
  overflow: hidden;
  white-space: break-spaces;
}
`;
