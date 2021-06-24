import { formatBold, formatItalic, formatUnderline, title } from "../EditorIcons.js";

const actions = [
  {
    title: 'Bold',
    icon: formatBold,
    execute: 'bold',
    activated: ['b', 'strong'],
  },
  {
    title: 'Italic',
    icon: formatItalic,
    execute: 'italic',
    activated: ['em', 'i'],
  },
  {
    title: 'Underline',
    icon: formatUnderline,
    execute: 'underline',
    activated: ['u'],
  },
  {
    title: 'Title',
    icon: title,
    execute: 'title-selector',
    activated: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
  },
  // {
  //   title: 'Insert link',
  //   icon: insertLink,
  //   execute: 'insert-link',
  //   activated: ['a'],
  // },
];
export default actions;
