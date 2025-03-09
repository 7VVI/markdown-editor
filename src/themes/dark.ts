import type { Theme } from './index';

const darkTheme: Theme = {
  id: 'dark',
  name: '暗黑模式',
  cssFile: 'dark.css',
  description: '护眼的暗色主题',
  variables: {
    'heading-color': '#e1e1e1',
    'text-color': '#d4d4d4',
    'link-color': '#61afef',
    'code-bg': '#282c34',
    'blockquote-color': '#9e9e9e',
    'blockquote-border': '#4b4b4b',
    'table-border': '#4b4b4b',
    'table-header-bg': '#2c313a',
    'background-color': '#1e1e1e',
    'font-family': "'Consolas', 'Monaco', monospace",
  }
};

export default darkTheme; 