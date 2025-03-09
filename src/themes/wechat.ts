import type { Theme } from './index';

const wechatTheme: Theme = {
  id: 'wechat',
  name: '微信公众号样式',
  cssFile: 'wechat.css',
  description: '适合微信公众号的排版风格',
  variables: {
    'heading-color': '#3f3f3f',
    'text-color': '#3f3f3f',
    'link-color': '#576b95',
    'code-bg': '#f8f8f8',
    'blockquote-color': '#888',
    'blockquote-border': '#e0e0e0',
    'table-border': '#e0e0e0',
    'table-header-bg': '#f8f8f8',
    'font-family': "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
    'font-size': '15px',
    'line-height': '1.7',
  }
};

export default wechatTheme; 