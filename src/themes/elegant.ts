import type { Theme } from './index';

const elegantTheme: Theme = {
  id: 'elegant',
  name: '优雅样式',
  cssFile: 'elegant.css',
  description: '优雅的排版风格，适合阅读长文章',
  variables: {
    'heading-color': '#2c3e50',
    'text-color': '#34495e',
    'link-color': '#3498db',
    'code-bg': '#f8f8f8',
    'blockquote-color': '#6a737d',
    'blockquote-border': '#dfe2e5',
    'table-border': '#dfe2e5',
    'table-header-bg': '#f8f8f8',
    'font-family': "'Georgia', serif",
    'line-height': '1.8',
  }
};

export default elegantTheme; 