import type { Theme } from './index';

const githubTheme: Theme = {
  id: 'github',
  name: 'GitHub样式',
  cssFile: 'github.css',
  description: '类似GitHub的Markdown渲染风格',
  variables: {
    'heading-color': '#24292e',
    'text-color': '#24292e',
    'link-color': '#0366d6',
    'code-bg': '#f6f8fa',
    'blockquote-color': '#6a737d',
    'blockquote-border': '#dfe2e5',
    'table-border': '#dfe2e5',
    'table-header-bg': '#f6f8fa',
    'font-family': "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
    'font-size': '16px',
    'line-height': '1.5',
  }
};

export default githubTheme; 