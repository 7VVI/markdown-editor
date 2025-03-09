# Markdown编辑器

一个基于Vue3和TypeScript的Web版Markdown编辑器，支持复制到微信公众号并保留样式，提供多种文档样式选择。

## 功能特点

- 实时预览Markdown渲染效果
- 支持多种文档样式主题（默认、优雅、GitHub、微信公众号、暗黑模式）
- 支持常用Markdown语法（标题、粗体、斜体、链接、图片、列表、代码块等）
- **增强的微信公众号复制功能**：自动转换为带样式的富文本，保留格式直接粘贴到公众号编辑器
- 全屏编辑模式
- 响应式设计，适配不同设备

## 技术栈

- Vue 3
- TypeScript
- Element Plus
- Marked (Markdown解析)
- Highlight.js (代码高亮)
- Pinia (状态管理)

## 安装与运行

1. 克隆项目

```bash
git clone https://github.com/yourusername/markdown-editor.git
cd markdown-editor
```

2. 安装依赖

```bash
npm install
```

3. 开发模式运行

```bash
npm run dev
```

4. 构建生产版本

```bash
npm run build
```

## 使用方法

1. 在左侧编辑区域输入Markdown文本
2. 右侧实时预览渲染效果
3. 使用顶部工具栏插入常用Markdown语法
4. 从下拉菜单选择不同的文档样式主题
5. 点击"复制到微信公众号"按钮，将内容复制到剪贴板
6. 直接粘贴到微信公众号编辑器中
7. 检查并调整格式（如有必要）

## 微信公众号复制功能说明

本编辑器特别优化了微信公众号的复制功能，通过以下技术手段保留样式：

1. **Markdown转富文本**：自动将Markdown内容转换为带样式的富文本格式
2. **内联样式**：为HTML元素添加内联样式，确保复制到微信公众号时保留格式
3. **优化的复制方法**：使用document.execCommand方法复制富文本内容，最大程度保留样式
4. **微信兼容性优化**：针对微信公众号编辑器的特性进行了专门优化

### 使用建议

- 复制前选择"微信公众号样式"主题获得最佳效果
- 使用Chrome或Edge等现代浏览器进行复制操作
- 复杂表格和代码块可能需要在微信公众号编辑器中进行微调
- 图片需要在微信公众号后台单独上传

## 自定义主题

可以通过修改`src/assets/themes.css`文件来自定义或添加新的主题样式。

## 许可证

MIT
