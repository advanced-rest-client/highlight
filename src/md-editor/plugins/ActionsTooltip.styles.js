import { css } from "lit-element";

export default css`
html {
  --md-editor-tooltip-background-color: #242424;
  --md-editor-tooltip-background-gradient: linear-gradient(to bottom, #242424, rgba(36, 36, 36, 0.75));
  --md-editor-tooltip-box-shadow: 0 0 3px #000;
  --md-editor-tooltip-border-color: #000;

  --md-editor-tooltip-active-background-color: #000;
  --md-editor-tooltip-active-background-gradient: linear-gradient(to bottom, #242424, rgba(0, 0, 0, 0.89));
  --md-editor-tooltip-button-background-gradient: linear-gradient(to bottom, #242424, rgba(36, 36, 36, 0.89));
  --md-editor-tooltip-button-border-left-color: rgba(255, 255, 255, 0.1);
  --md-editor-tooltip-button-border-right-color: #000;
  --md-editor-tooltip-button-color: #fff;
  --md-editor-tooltip-active-color: yellow;
}

.md-editor-tooltip-actions {
  position: fixed;
  background-color: var(--md-editor-tooltip-background-color);
  background: var(--md-editor-tooltip-background-gradient);
  border: 1px solid var(--md-editor-tooltip-border-color);
  border-radius: 6px;
  box-shadow: var(--md-editor-tooltip-box-shadow);
  z-index: 2000;
}

.md-editor-tooltip-hidden {
  visibility: hidden;
}

.md-editor-tooltip-active {
  visibility: visible;
  animation: md-editor-pop-upwards 160ms forwards linear;
}

.md-editor-tooltip-list,
.md-editor-tooltip-headers-list {
  margin: 0;
  padding: 0;
  display: flex;
  align-items: center;
}

.md-editor-tooltip-list.hidden,
.md-editor-tooltip-headers-list.hidden {
  display: none;
}

.md-editor-tooltip-list-button.md-editor-tooltip-list-active {
  background-color: var(--md-editor-tooltip-active-background-color);
  background: var(--md-editor-tooltip-active-background-gradient);
  color: #fff;
}

.md-editor-tooltip-list-item,
.md-editor-tooltip-headers-list-item {
  list-style: none;
  margin: 0;
  padding: 0;
}

.md-editor-tooltip-list-button {
  width: 52px;
  height: 52px;
  box-sizing: border-box;
  cursor: pointer;
  display: block;
  margin: 0;
  padding: 15px;

  background-color: var(--md-editor-tooltip-background-color);
  background: var(--md-editor-tooltip-button-background-gradient);
  border: 0;
  border-right: 1px solid var(--md-editor-tooltip-button-border-right-color);
  border-left: 1px solid var(--md-editor-tooltip-button-border-left-color);
  /* box-shadow: 0 2px 2px rgb(0 0 0 / 30%); */
  color: var(--md-editor-tooltip-button-color);
  transition: background-color 0.2s ease-in;

  font-size: 1.1rem;
  line-height: 1.33;
  font-weight: 600;
}

.md-editor-tooltip-list-button:hover {
  background-color: var(--md-editor-tooltip-active-background-color);
  color: var(--md-editor-tooltip-active-color);
}

.md-editor-tooltip-actions .icon {
  width: 24px;
  height: 24px;
  fill: currentColor;
}

.md-editor-tooltip-arrow-under:after {
  border-color: var(--md-editor-tooltip-background-color) transparent transparent transparent;
  top: 53px;
  border-width: 8px 8px 0 8px;
}

.md-editor-tooltip-arrow-over:before {
  border-width: 0 8px 8px 8px;
  border-color: transparent transparent var(--md-editor-tooltip-background-color) transparent;
  top: -8px;
}

.md-editor-tooltip-arrow-under:after,
.md-editor-tooltip-arrow-over:before {
  border-style: solid;
  content: "";
  display: block;
  height: 0;
  left: 50%;
  margin-left: -8px;
  position: absolute;
  width: 0;
}

@keyframes md-editor-pop-upwards {
  0% {
    opacity: 0;
    transform: matrix(0.97, 0, 0, 1, 0, 12);
  }
  20% {
    opacity: 0.7;
    transform: matrix(0.99, 0, 0, 1, 0, 2);
  }
  40% {
    opacity: 1;
    transform: matrix(1, 0, 0, 1, 0, -1);
  }
  100% {
    transform: matrix(1, 0, 0, 1, 0, 0);
  }
}
`;
