import type { Theme } from './index';
import { registerTheme } from './index';

/**
 * 自定义主题示例
 * 
 * 这是一个示例，展示如何创建和注册自定义主题
 * 要添加新主题，只需创建一个符合Theme接口的对象，然后调用registerTheme注册即可
 */

// 创建自定义主题
const customTheme: Theme = {
  id: 'custom',
  name: '自定义主题',
  cssFile: 'custom.css',
  description: '这是一个自定义主题示例',
  variables: {
    'heading-color': '#8e44ad',
    'text-color': '#2c3e50',
    'link-color': '#3498db',
    'code-bg': '#f9f9f9',
    'blockquote-color': '#7f8c8d',
    'blockquote-border': '#ecf0f1',
    'table-border': '#bdc3c7',
    'table-header-bg': '#ecf0f1',
    'font-family': "'Roboto', sans-serif",
    'line-height': '1.6',
  }
};

// 注册自定义主题
// registerTheme(customTheme);

/**
 * 使用方法：
 * 
 * 1. 创建主题对象，定义id、name、cssFile和variables
 * 2. 调用registerTheme注册主题
 * 3. 创建对应的CSS文件，放在themes/styles/目录下
 * 4. 在CSS文件中使用.theme-{id}选择器定义样式
 * 5. 在themes/styles/index.css中导入新的CSS文件
 * 
 * 注意：
 * - id必须唯一
 * - variables中的变量会被应用为CSS变量，可以在CSS中使用var(--variable-name)引用
 * - 主题切换时会自动应用对应的CSS类和变量
 */

export default customTheme; 