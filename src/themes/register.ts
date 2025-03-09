import { registerTheme } from './index';
import defaultTheme from './default';
import elegantTheme from './elegant';
import githubTheme from './github';
import wechatTheme from './wechat';
import darkTheme from './dark';

// 注册所有内置主题
export function registerBuiltinThemes(): void {
  registerTheme(defaultTheme);
  registerTheme(elegantTheme);
  registerTheme(githubTheme);
  registerTheme(wechatTheme);
  registerTheme(darkTheme);
}

// 默认导出注册函数
export default registerBuiltinThemes; 