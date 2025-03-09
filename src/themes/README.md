# Markdown编辑器主题系统

这是Markdown编辑器的主题系统，允许用户选择不同的主题样式，也支持开发者扩展自定义主题。

## 主题系统结构

```
themes/
├── index.ts          # 主题系统入口，定义主题接口和注册方法
├── register.ts       # 注册内置主题
├── default.ts        # 默认主题配置
├── elegant.ts        # 优雅主题配置
├── github.ts         # GitHub主题配置
├── wechat.ts         # 微信公众号主题配置
├── dark.ts           # 暗黑主题配置
├── custom-example.ts # 自定义主题示例
├── styles/           # 主题样式文件
│   ├── index.css     # 样式入口文件
│   ├── base.css      # 基础样式
│   ├── default.css   # 默认主题样式
│   ├── elegant.css   # 优雅主题样式
│   ├── github.css    # GitHub主题样式
│   ├── wechat.css    # 微信公众号主题样式
│   ├── dark.css      # 暗黑主题样式
│   └── custom.css    # 自定义主题样式示例
└── README.md         # 本文档
```

## 主题接口

每个主题都需要实现`Theme`接口：

```typescript
interface Theme {
  id: string;         // 主题ID，唯一标识
  name: string;       // 主题名称，显示在UI中
  cssFile: string;    // CSS文件名
  variables: Record<string, string>; // CSS变量
  description?: string; // 主题描述（可选）
}
```

## 如何添加新主题

1. **创建主题配置文件**

   创建一个新的TypeScript文件，例如`my-theme.ts`：

   ```typescript
   import type { Theme } from './index';

   const myTheme: Theme = {
     id: 'my-theme',
     name: '我的主题',
     cssFile: 'my-theme.css',
     description: '这是我的自定义主题',
     variables: {
       'heading-color': '#333',
       'text-color': '#444',
       'link-color': '#0366d6',
       // 添加更多CSS变量...
     }
   };

   export default myTheme;
   ```

2. **创建主题样式文件**

   在`styles`目录下创建对应的CSS文件，例如`my-theme.css`：

   ```css
   /* 我的主题样式 */
   .theme-my-theme {
     --heading-color: #333;
     --text-color: #444;
     --link-color: #0366d6;
     /* 添加更多CSS变量... */
     
     color: var(--text-color);
     font-family: Arial, sans-serif;
     line-height: 1.6;
   }

   /* 添加更多特定样式覆盖... */
   .theme-my-theme h1 {
     font-size: 2em;
     /* 自定义样式... */
   }
   ```

3. **在样式入口文件中导入**

   编辑`styles/index.css`，添加新主题样式的导入：

   ```css
   /* 导入各个主题样式 */
   @import './base.css';
   @import './default.css';
   /* ... 其他主题 ... */
   @import './my-theme.css';
   ```

4. **注册主题**

   在应用启动时注册主题，可以在`register.ts`中添加，或者在应用的其他地方：

   ```typescript
   import { registerTheme } from './index';
   import myTheme from './my-theme';

   // 注册主题
   registerTheme(myTheme);
   ```

## 主题变量

主题系统使用CSS变量来定义主题样式，以下是常用的变量：

- `--heading-color`: 标题颜色
- `--text-color`: 正文文本颜色
- `--link-color`: 链接颜色
- `--code-bg`: 代码背景色
- `--blockquote-color`: 引用文本颜色
- `--blockquote-border`: 引用边框颜色
- `--table-border`: 表格边框颜色
- `--table-header-bg`: 表格头部背景色

你可以在自定义主题中添加更多变量，并在CSS中使用`var(--variable-name)`引用。

## 使用示例

参考`custom-example.ts`和`styles/custom.css`了解如何创建和使用自定义主题。

## 最佳实践

1. 确保主题ID唯一，避免冲突
2. 使用CSS变量定义颜色和字体等样式，便于统一管理
3. 在基础样式上进行扩展，避免重复代码
4. 测试不同类型的Markdown内容，确保样式一致性
5. 考虑响应式设计，适配不同屏幕尺寸 