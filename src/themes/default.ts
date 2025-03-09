import type { Theme } from './index';

const defaultTheme: Theme = {
  id: 'default',
  name: '默认样式',
  cssFile: 'default.css',
  description: '简洁清晰的默认样式',
  variables: {
    'heading-color': '#333',
    'text-color': '#333',
    'link-color': '#0366d6',
    'code-bg': '#f6f8fa',
    'blockquote-color': '#6a737d',
    'blockquote-border': '#dfe2e5',
    'table-border': '#dfe2e5',
    'table-header-bg': '#f6f8fa',
  }
};

export default defaultTheme; 