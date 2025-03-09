<template>
  <div class="markdown-editor" :class="{ 'fullscreen': isFullscreen }">
    <!-- 标题栏 -->
    <div class="editor-header">
      <div class="header-left">
        <h2>Markdown编辑器</h2>
      </div>
      <div class="header-right">
        <el-select v-model="currentTheme" placeholder="选择主题" @change="changeTheme">
          <el-option
            v-for="theme in themes"
            :key="theme.id"
            :label="theme.name"
            :value="theme.id"
          />
        </el-select>
        <el-button @click="togglePreview" title="切换预览">
          <el-icon><View /></el-icon>
        </el-button>
        <el-button @click="toggleFullscreen" title="全屏编辑">
          <el-icon v-if="!isFullscreen"><FullScreen /></el-icon>
          <el-icon v-else><Close /></el-icon>
        </el-button>
        <el-button @click="debugRenderedHtml" title="调试HTML">
          <el-icon><InfoFilled /></el-icon>
        </el-button>
        <el-button @click="debugPreviewState" title="调试预览状态">
          <el-icon><View /></el-icon>
        </el-button>
        <el-button type="success" @click="showWechatGuide" title="复制到微信公众号">
          <el-icon><Document /></el-icon>
          复制到公众号文章
        </el-button>
      </div>
    </div>
    
    <!-- Markdown工具栏 -->
    <div class="markdown-toolbar">
      <div class="toolbar-left">
        <el-button-group>
          <el-button @click="insertText('# ')" title="标题1">H1</el-button>
          <el-button @click="insertText('## ')" title="标题2">H2</el-button>
          <el-button @click="insertText('### ')" title="标题3">H3</el-button>
          <el-button @click="insertText('#### ')" title="标题4">H4</el-button>
          <el-button @click="insertText('##### ')" title="标题5">H5</el-button>
          <el-button @click="insertText('**粗体**')" title="粗体">
            <el-icon><Bold /></el-icon>
          </el-button>
          <el-button @click="insertText('*斜体*')" title="斜体">
            <el-icon><Italic /></el-icon>
          </el-button>
          <el-button @click="insertText('~~删除线~~')" title="删除线">
            <el-icon><DeleteFilled /></el-icon>
          </el-button>
          <el-button @click="insertText('[链接文字](链接URL)')" title="链接">
            <el-icon><Link /></el-icon>
          </el-button>
          <el-button @click="insertText('![图片描述](图片URL)')" title="图片">
            <el-icon><Picture /></el-icon>
          </el-button>
          <el-button @click="insertText('> 引用文字')" title="引用">
            <el-icon><ChatDotRound /></el-icon>
          </el-button>
          <el-button @click="insertText('- 列表项')" title="无序列表">
            <el-icon><List /></el-icon>
          </el-button>
          <el-button @click="insertText('1. 列表项')" title="有序列表">
            <el-icon><Finished /></el-icon>
          </el-button>
          <el-button @click="insertText('```\n代码块\n```')" title="代码块">
            <el-icon><Cpu /></el-icon>
          </el-button>
          <el-button @click="insertText('| 表头1 | 表头2 |\n| ------ | ------ |\n| 单元格1 | 单元格2 |')" title="表格">
            <el-icon><Grid /></el-icon>
          </el-button>
          <el-dropdown trigger="click" @command="handleColorCommand">
            <el-button title="文字颜色">
              <el-icon><Brush /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="red">
                  <span class="color-preview" style="background-color: red;"></span>红色
                </el-dropdown-item>
                <el-dropdown-item command="blue">
                  <span class="color-preview" style="background-color: blue;"></span>蓝色
                </el-dropdown-item>
                <el-dropdown-item command="green">
                  <span class="color-preview" style="background-color: green;"></span>绿色
                </el-dropdown-item>
                <el-dropdown-item command="orange">
                  <span class="color-preview" style="background-color: orange;"></span>橙色
                </el-dropdown-item>
                <el-dropdown-item command="purple">
                  <span class="color-preview" style="background-color: purple;"></span>紫色
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-dropdown trigger="click" @command="handleBgColorCommand">
            <el-button title="背景颜色">
              <el-icon><Brush /></el-icon>
              <span>BG</span>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="red">
                  <span class="color-preview" style="background-color: red;"></span>红色背景
                </el-dropdown-item>
                <el-dropdown-item command="blue">
                  <span class="color-preview" style="background-color: blue;"></span>蓝色背景
                </el-dropdown-item>
                <el-dropdown-item command="green">
                  <span class="color-preview" style="background-color: green;"></span>绿色背景
                </el-dropdown-item>
                <el-dropdown-item command="yellow">
                  <span class="color-preview" style="background-color: yellow;"></span>黄色背景
                </el-dropdown-item>
                <el-dropdown-item command="gray">
                  <span class="color-preview" style="background-color: gray;"></span>灰色背景
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </el-button-group>
      </div>
    </div>
    
    <div class="editor-content" ref="editorContent" :class="{ 'show-divider': showPreview }">
      <div class="editor-input" :class="{ 'full-width': !showPreview }">
        <textarea
          ref="editorTextarea"
          v-model="content"
          @input="updateContent"
          @scroll="handleEditorScroll"
          @contextmenu="showContextMenu"
          @keydown="handleKeyDown"
          placeholder="请输入Markdown内容..."
        ></textarea>
      </div>
      <!-- 预览区域 - 始终显示 -->
      <div class="editor-preview" :style="{ display: showPreview ? 'block' : 'none' }">
        <div v-html="renderedContent"></div>
      </div>
    </div>
    
    <!-- 右键菜单 -->
    <div v-show="contextMenuVisible" class="context-menu" :style="contextMenuStyle">
      <div class="context-menu-item" @click="applyHeading(1)">标题 1</div>
      <div class="context-menu-item" @click="applyHeading(2)">标题 2</div>
      <div class="context-menu-item" @click="applyHeading(3)">标题 3</div>
      <div class="context-menu-item" @click="applyHeading(4)">标题 4</div>
      <div class="context-menu-item" @click="applyHeading(5)">标题 5</div>
      <div class="context-menu-divider"></div>
      <div class="context-menu-item" @click="applyStyle('bold')">粗体</div>
      <div class="context-menu-item" @click="applyStyle('italic')">斜体</div>
      <div class="context-menu-item" @click="applyStyle('strikethrough')">删除线</div>
      <div class="context-menu-divider"></div>
      <div class="context-menu-item" @click="showTextColorPicker">文字颜色</div>
      <div class="context-menu-item" @click="showBgColorPicker">背景颜色</div>
    </div>
    
    <!-- 颜色选择器弹窗 -->
    <el-dialog
      v-model="colorPickerVisible"
      :title="colorPickerTitle"
      width="350px"
      align-center
      destroy-on-close
    >
      <div class="color-picker-dialog">
        <el-color-picker
          v-model="pickerColor"
          show-alpha
          :predefine="colorPresets"
        ></el-color-picker>
        <div class="color-presets">
          <div 
            v-for="color in colorPresets" 
            :key="color"
            class="color-preset-item"
            :style="{ backgroundColor: color }"
            @click="pickerColor = color"
          ></div>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="colorPickerVisible = false">取消</el-button>
          <el-button type="primary" @click="applyPickerColor">
            应用
          </el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 微信公众号复制指南 -->
    <WechatGuide 
      v-model:visible="guideVisible" 
      @dontShowAgain="setDontShowGuide"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted, nextTick } from 'vue'
import { marked } from 'marked'
import hljs from 'highlight.js'
import 'highlight.js/styles/vs2015.css'  // 直接在组件中再次引入样式，确保加载
import { useEditorStore } from '../stores/editor'
import { ElMessage } from 'element-plus'
import WechatGuide from './WechatGuide.vue'

const editorStore = useEditorStore()

// 从store获取状态
const content = computed({
  get: () => editorStore.content,
  set: (value) => editorStore.setContent(value)
})
const currentTheme = computed({
  get: () => editorStore.currentTheme,
  set: (value) => editorStore.setTheme(value)
})
const themes = computed(() => editorStore.themes)
const showPreview = computed(() => editorStore.showPreview)
const isFullscreen = computed(() => editorStore.isFullscreen)
const scrollToLineNumber = computed(() => editorStore.scrollToLineNumber)

// 编辑器和预览区域的引用
const editorTextarea = ref(null)
const previewDiv = ref(null)
const editorContent = ref(null)

// 滚动条状态（添加缺失的变量）
const thumbPosition = ref(0)
const thumbHeight = ref(100)
const isDragging = ref(false)
const lastY = ref(0)
const scrollbarThumb = ref(null)

// 指南对话框状态
const guideVisible = ref(false)
const dontShowGuide = ref(localStorage.getItem('dontShowWechatGuide') === 'true')

// 右键菜单状态
const contextMenuVisible = ref(false)
const contextMenuStyle = ref({})

// 颜色选择器状态
const colorPickerVisible = ref(false)
const colorPickerTitle = ref('选择颜色')
const pickerColor = ref('#000000')
const currentTextColor = ref('#ff0000')
const currentBgColor = ref('#ffff00')
const colorPickerType = ref('text') // 'text' 或 'bg'
const colorPresets = ref([
  '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#000000', '#ffffff',
  '#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4',
  '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'
])

// 窗口大小变化监听函数
const handleResize = () => {
  // 窗口大小变化时的处理
};

// 配置marked
onMounted(() => {
  // 添加一些初始内容用于测试
  if (!content.value) {
    editorStore.setContent(`# 欢迎使用Markdown编辑器

这是一个简单的测试内容。

## 代码示例

\`\`\`java
@Override
public UserDetails loadUserByUsername(String username) {
    //获取用户信息
    UmsAdmin admin = getAdminUsername(username);
    if (admin != null) {
        List<UmsResource> resourceList = umsResourceService.getResourceList(admin.getId());
        return new AdminUserDetails(admin,resourceList);
    }
    throw new UsernameNotFoundException("用户名或密码错误");
}
\`\`\`

## 列表示例

- 项目1
- 项目2
- 项目3

## 表格示例

| 表头1 | 表头2 |
| ----- | ----- |
| 内容1 | 内容2 |
| 内容3 | 内容4 |
`);
  }

  // 在控制台打印highlight.js的支持语言，确认Java在其中
  console.log('highlight.js支持的语言:', hljs.listLanguages());
  
  // 测试highlight.js是否能够正确高亮Java代码
  const testCode = `
  @Override
  public void test() {
    System.out.println("Hello");
  }`;
  try {
    const result = hljs.highlight(testCode, { language: 'java' }).value;
    console.log('测试Java代码高亮结果:', result);
  } catch (e) {
    console.error('测试Java代码高亮失败:', e);
  }

  // 配置marked，添加代码高亮功能
  marked.setOptions({
    gfm: true,
    breaks: true,
    langPrefix: 'hljs language-',
    highlight: function(code, lang) {
      console.log('正在高亮语言:', lang);
      try {
        if (lang && hljs.getLanguage(lang)) {
          console.log(`高亮${lang}代码`);
          // 使用highlight.js处理代码
          const result = hljs.highlight(code, { language: lang }).value;
          
          // 对Java代码特殊处理，确保所有注解正确高亮
          if (lang.toLowerCase() === 'java') {
            console.log('处理Java代码');
            // 处理所有Java注解，而不仅仅是@Override
            return result.replace(/(@\w+)/g, '<span class="hljs-meta">$1</span>');
          }
          
          return result;
        } else {
          console.log('找不到语言:', lang, '使用自动检测');
          return hljs.highlightAuto(code).value;
        }
      } catch (e) {
        console.error('代码高亮错误:', e);
        return code;
      }
    }
  });

  // 初始化时触发一次大纲更新
  updateOutline();
  
  // 添加光标位置变化监听
  if (editorTextarea.value) {
    editorTextarea.value.addEventListener('click', handleCursorChange);
    editorTextarea.value.addEventListener('keyup', handleCursorChange);
  }
  
  // 添加窗口大小变化监听
  window.addEventListener('resize', handleResize);
});

// 监听滚动行号的变化
watch(scrollToLineNumber, (newLineNumber) => {
  if (newLineNumber > 0) {
    scrollToLine(newLineNumber)
  }
})

// 监听预览状态变化
watch(showPreview, () => {
  // 预览状态变化时的处理
})

// 更新滚动条高度和位置
function updateScrollbarThumb() {
  if (!editorTextarea.value || !editorContent.value || !scrollbarThumb.value || !showPreview.value) return
  
  const editorHeight = editorContent.value.clientHeight
  const contentHeight = editorTextarea.value.scrollHeight
  
  // 计算滚动条高度比例
  const ratio = editorHeight / contentHeight
  thumbHeight.value = Math.max(30, editorHeight * ratio)
  
  // 更新滚动条位置
  updateThumbPosition()
}

// 更新滚动条位置
function updateThumbPosition() {
  if (!editorTextarea.value || !editorContent.value || !scrollbarThumb.value || !showPreview.value) return
  
  const editorHeight = editorContent.value.clientHeight
  const contentHeight = editorTextarea.value.scrollHeight
  const scrollTop = editorTextarea.value.scrollTop
  
  // 计算滚动条位置
  const maxScrollTop = contentHeight - editorHeight
  const scrollRatio = scrollTop / maxScrollTop
  const maxThumbTop = editorHeight - thumbHeight.value
  
  thumbPosition.value = maxThumbTop * scrollRatio
}

// 处理编辑器滚动
function handleEditorScroll() {
  // 简化实现，不再同步预览区域滚动
}

// 处理预览区域滚动
function handlePreviewScroll() {
  // 简化实现，不再同步编辑器滚动
}

// 开始拖动滚动条
function startDrag(e) {
  isDragging.value = true
  lastY.value = e.clientY
  
  // 防止选中文本
  e.preventDefault()
}

// 处理鼠标移动
function handleMouseMove(e) {
  if (!isDragging.value || !showPreview.value) return
  
  const deltaY = e.clientY - lastY.value
  lastY.value = e.clientY
  
  // 更新滚动条位置
  const editorHeight = editorContent.value.clientHeight
  const maxThumbTop = editorHeight - thumbHeight.value
  
  thumbPosition.value = Math.max(0, Math.min(maxThumbTop, thumbPosition.value + deltaY))
  
  // 计算滚动比例
  const scrollRatio = thumbPosition.value / maxThumbTop
  
  // 同步编辑器和预览区域滚动
  if (editorTextarea.value) {
    const maxScrollTop = editorTextarea.value.scrollHeight - editorTextarea.value.clientHeight
    editorTextarea.value.scrollTop = maxScrollTop * scrollRatio
  }
  
  if (previewDiv.value) {
    const maxScrollTop = previewDiv.value.scrollHeight - previewDiv.value.clientHeight
    previewDiv.value.scrollTop = maxScrollTop * scrollRatio
  }
}

// 结束拖动
function endDrag() {
  isDragging.value = false
}

// 滚动到指定行
function scrollToLine(lineNumber) {
  // 滚动编辑区域
  if (editorTextarea.value) {
    const lines = content.value.split('\n')
    let position = 0
    
    // 计算目标行之前所有行的字符长度总和
    for (let i = 0; i < lineNumber - 1 && i < lines.length; i++) {
      position += lines[i].length + 1 // +1 是换行符
    }
    
    // 设置光标位置并滚动
    editorTextarea.value.focus()
    editorTextarea.value.setSelectionRange(position, position)
    
    // 确保光标可见
    const lineHeight = parseInt(getComputedStyle(editorTextarea.value).lineHeight)
    const scrollTop = (lineNumber - 1) * lineHeight
    editorTextarea.value.scrollTop = scrollTop
    
    // 更新滚动条位置
    updateThumbPosition()
  }
  
  // 滚动预览区域
  if (previewDiv.value && showPreview.value) {
    // 查找预览区域中对应的标题元素
    const headings = previewDiv.value.querySelectorAll('h1, h2, h3, h4, h5, h6')
    if (headings.length > 0) {
      // 找到最接近的标题
      const lines = content.value.split('\n')
      let targetHeadingText = ''
      
      // 向上查找最近的标题
      for (let i = lineNumber - 1; i >= 0; i--) {
        const line = lines[i]
        const match = line.match(/^(#{1,6})\s+(.+)$/)
        if (match) {
          targetHeadingText = match[2].trim()
          break
        }
      }
      
      if (targetHeadingText) {
        // 查找预览区域中匹配的标题
        for (const heading of headings) {
          if (heading.textContent.trim() === targetHeadingText) {
            heading.scrollIntoView({ behavior: 'smooth', block: 'start' })
            break
          }
        }
      }
    }
  }
}

// 渲染Markdown为HTML
const renderedContent = computed(() => {
  if (!content.value) return '';
  
  try {
    console.log('开始渲染Markdown内容');
    // 使用marked渲染Markdown
    const html = marked.parse(content.value);
    console.log('渲染结果(前100字符):', html.substring(0, 100));
    
    // 检查渲染结果中的代码块
    const codeBlocks = html.match(/<pre><code class=".*?">([\s\S]*?)<\/code><\/pre>/g);
    if (codeBlocks && codeBlocks.length > 0) {
      console.log('渲染过程中找到代码块数量:', codeBlocks.length);
    }
    
    // 强制处理所有code标签，确保高亮生效
    let processedHtml = forceHighlightCodeBlocks(html);
    
    return processedHtml;
  } catch (error) {
    console.error('Markdown渲染错误:', error);
    return '<p>渲染错误，请检查控制台</p>';
  }
});

// 强制处理所有代码块，确保高亮生效
function forceHighlightCodeBlocks(html) {
  try {
    // 用DOMParser解析HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // 查找所有代码块
    const codeBlocks = doc.querySelectorAll('pre code');
    console.log('找到代码块:', codeBlocks.length);
    
    // 处理每个代码块
    codeBlocks.forEach((codeBlock, index) => {
      // 获取语言
      const className = codeBlock.className;
      const langMatch = className.match(/language-(\w+)/);
      const lang = langMatch ? langMatch[1] : '';
      console.log(`处理代码块${index + 1}，语言:`, lang || '未指定');
      
      if (lang && lang.toLowerCase() === 'java') {
        // 手动处理Java代码高亮
        const code = codeBlock.textContent;
        try {
          // 使用highlight.js处理
          const highlighted = hljs.highlight(code, { language: lang }).value;
          
          // 特殊处理所有Java注解，不仅限于@Override
          const processedCode = highlighted.replace(/(@\w+)/g, '<span class="hljs-meta">$1</span>');
          
          // 设置高亮后的HTML
          codeBlock.innerHTML = processedCode;
          
          // 增强Java代码块的样式，添加更醒目的样式类
          const preElement = codeBlock.parentElement;
          if (preElement) {
            preElement.classList.add('java-code-block');
            
            // 添加语言标记
            if (!preElement.querySelector('.lang-label')) {
              const langLabel = doc.createElement('div');
              langLabel.className = 'lang-label';
              langLabel.textContent = 'Java';
              langLabel.style.position = 'absolute';
              langLabel.style.top = '0';
              langLabel.style.right = '0';
              langLabel.style.backgroundColor = '#ff8c00';
              langLabel.style.color = '#282c34';
              langLabel.style.padding = '2px 8px';
              langLabel.style.fontSize = '12px';
              langLabel.style.borderBottomLeftRadius = '5px';
              langLabel.style.fontWeight = 'bold';
              
              // 确保pre元素有相对定位
              preElement.style.position = 'relative';
              preElement.insertBefore(langLabel, preElement.firstChild);
            }
          }
          
          // 增强高亮元素的样式
          processHighlightElements(codeBlock);
          
          console.log(`代码块${index + 1}高亮成功`);
        } catch (e) {
          console.error(`代码块${index + 1}高亮失败:`, e);
        }
      } else if (lang) {
        // 为其他语言的代码块添加额外的样式类
        const preElement = codeBlock.parentElement;
        if (preElement) {
          preElement.classList.add(`${lang}-code-block`);
          
          // 添加语言标记
          if (!preElement.querySelector('.lang-label')) {
            const langLabel = doc.createElement('div');
            langLabel.className = 'lang-label';
            langLabel.textContent = lang.charAt(0).toUpperCase() + lang.slice(1); // 首字母大写
            langLabel.style.position = 'absolute';
            langLabel.style.top = '0';
            langLabel.style.right = '0';
            langLabel.style.backgroundColor = '#607D8B';
            langLabel.style.color = '#fff';
            langLabel.style.padding = '2px 8px';
            langLabel.style.fontSize = '12px';
            langLabel.style.borderBottomLeftRadius = '5px';
            langLabel.style.fontWeight = 'bold';
            
            // 确保pre元素有相对定位
            preElement.style.position = 'relative';
            preElement.insertBefore(langLabel, preElement.firstChild);
          }
        }
      }
    });
    
    // 将处理后的DOM转回HTML字符串
    return doc.body.innerHTML;
  } catch (e) {
    console.error('强制高亮处理失败:', e);
    return html;
  }
}

// 处理代码块中的高亮元素
function processHighlightElements(codeElement) {
  try {
    // 关键词
    Array.from(codeElement.querySelectorAll('.hljs-keyword')).forEach(keyword => {
      if (keyword instanceof HTMLElement) {
        keyword.style.color = '#ff79c6';
        keyword.style.fontWeight = 'bold';
      }
    });
    
    // 注解
    Array.from(codeElement.querySelectorAll('.hljs-meta')).forEach(meta => {
      if (meta instanceof HTMLElement) {
        meta.style.color = '#ff8c00';
        meta.style.fontWeight = 'bold';
      }
    });
    
    // 字符串
    Array.from(codeElement.querySelectorAll('.hljs-string')).forEach(str => {
      if (str instanceof HTMLElement) {
        str.style.color = '#f1fa8c';
      }
    });
    
    // 注释
    Array.from(codeElement.querySelectorAll('.hljs-comment')).forEach(comment => {
      if (comment instanceof HTMLElement) {
        comment.style.color = '#6A9955';
        comment.style.fontStyle = 'italic';
      }
    });
    
    // 函数和方法名
    Array.from(codeElement.querySelectorAll('.hljs-function, .hljs-title')).forEach(func => {
      if (func instanceof HTMLElement) {
        func.style.color = '#50fa7b';
      }
    });
    
    // 类型
    Array.from(codeElement.querySelectorAll('.hljs-type, .hljs-class')).forEach(type => {
      if (type instanceof HTMLElement) {
        type.style.color = '#8be9fd';
        type.style.fontWeight = 'bold';
      }
    });
    
    // 数字
    Array.from(codeElement.querySelectorAll('.hljs-number, .hljs-literal')).forEach(num => {
      if (num instanceof HTMLElement) {
        num.style.color = '#bd93f9';
      }
    });
  } catch (e) {
    console.error('处理高亮元素失败:', e);
  }
}

// 更新内容
function updateContent(e: Event) {
  const target = e.target as HTMLTextAreaElement
  editorStore.setContent(target.value)
  
  // 当内容变化时，触发大纲更新
  updateOutline()
  
  // 更新滚动条
  nextTick(() => {
    updateScrollbarThumb()
  })
}

// 触发大纲更新
function updateOutline() {
  // 使用自定义事件通知父组件更新大纲
  const event = new CustomEvent('outline-update')
  window.dispatchEvent(event)
}

// 在光标位置插入文本
function insertText(text: string) {
  if (!editorTextarea.value) return
  
  const start = editorTextarea.value.selectionStart
  const end = editorTextarea.value.selectionEnd
  
  // 保存当前滚动位置
  const scrollTop = editorTextarea.value.scrollTop
  let previewScrollTop = 0
  if (previewDiv.value && showPreview.value) {
    previewScrollTop = previewDiv.value.scrollTop
  }
  
  // 如果有选中文本，则替换选中文本
  if (start !== end) {
    const selectedText = content.value.substring(start, end)
    
    // 检查是否是插入标题
    if (text.startsWith('#')) {
      // 对于标题，将文本放在标题标记后面
      const newContent = content.value.substring(0, start) + text + selectedText + content.value.substring(end)
      editorStore.setContent(newContent)
      
      // 设置光标位置到文本末尾
      setTimeout(() => {
        editorTextarea.value.focus()
        const newPosition = start + text.length + selectedText.length
        editorTextarea.value.setSelectionRange(newPosition, newPosition)
        
        // 恢复滚动位置
        editorTextarea.value.scrollTop = scrollTop
        if (previewDiv.value && showPreview.value) {
          previewDiv.value.scrollTop = previewScrollTop
        }
      }, 0)
    } else {
      // 对于其他格式，尝试智能替换
      let newText = text
      
      // 如果文本包含占位符，替换占位符
      if (text.includes('链接文字')) {
        newText = text.replace('链接文字', selectedText)
      } else if (text.includes('图片描述')) {
        newText = text.replace('图片描述', selectedText)
      } else if (text.includes('引用文字')) {
        newText = text.replace('引用文字', selectedText)
      } else if (text.includes('列表项')) {
        newText = text.replace('列表项', selectedText)
      } else if (text.includes('代码块')) {
        newText = text.replace('代码块', selectedText)
      } else if (text.includes('单元格')) {
        // 表格保持原样
        newText = text
      }
      
      const newContent = content.value.substring(0, start) + newText + content.value.substring(end)
      editorStore.setContent(newContent)
      
      // 设置光标位置到文本末尾
      setTimeout(() => {
        editorTextarea.value.focus()
        const newPosition = start + newText.length
        editorTextarea.value.setSelectionRange(newPosition, newPosition)
        
        // 恢复滚动位置
        editorTextarea.value.scrollTop = scrollTop
        if (previewDiv.value && showPreview.value) {
          previewDiv.value.scrollTop = previewScrollTop
        }
      }, 0)
    }
  } else {
    // 没有选中文本，直接插入
    const newContent = content.value.substring(0, start) + text + content.value.substring(end)
    editorStore.setContent(newContent)
    
    // 设置光标位置
    setTimeout(() => {
      editorTextarea.value.focus()
      editorTextarea.value.setSelectionRange(start + text.length, start + text.length)
      
      // 恢复滚动位置
      editorTextarea.value.scrollTop = scrollTop
      if (previewDiv.value && showPreview.value) {
        previewDiv.value.scrollTop = previewScrollTop
      }
    }, 0)
  }
}

// 切换预览
function togglePreview() {
  // 切换预览状态前的值
  const oldValue = showPreview.value;
  console.log('切换预览状态前:', oldValue);
  
  // 切换预览状态
  editorStore.togglePreview();
  
  // 切换预览状态后的值
  console.log('切换预览状态后:', showPreview.value);
  
  // 手动调整编辑器宽度
  nextTick(() => {
    if (editorTextarea.value && editorTextarea.value.parentElement) {
      if (showPreview.value) {
        editorTextarea.value.parentElement.style.maxWidth = '50%';
      } else {
        editorTextarea.value.parentElement.style.maxWidth = '100%';
      }
    }
  });
}

// 切换全屏
function toggleFullscreen() {
  editorStore.toggleFullscreen()
}

// 更改主题
function changeTheme(themeId: string) {
  editorStore.setTheme(themeId)
}

// 显示微信公众号复制指南
function showWechatGuide() {
  copyToWechat()
}

// 设置不再显示指南
function setDontShowGuide() {
  dontShowGuide.value = true
  localStorage.setItem('dontShowWechatGuide', 'true')
}

// 复制到微信公众号
async function copyToWechat() {
  const success = await editorStore.copyToWechat()
  if (success) {
    ElMessage.success('富文本内容已复制到剪贴板，可直接粘贴到微信公众号')
    
    // 显示指南（如果需要）
    if (!dontShowGuide.value) {
      guideVisible.value = true
    }
  } else {
    ElMessage.error('复制失败，请手动复制')
  }
}

// 添加光标位置变化监听
function handleCursorChange(e) {
  if (!editorTextarea.value) return
  
  const cursorPosition = editorTextarea.value.selectionStart
  const content = editorStore.content
  
  // 计算当前光标所在行号
  const textBeforeCursor = content.substring(0, cursorPosition)
  const currentLine = (textBeforeCursor.match(/\n/g) || []).length + 1
  
  // 触发自定义事件，通知父组件更新大纲高亮
  const event = new CustomEvent('cursor-position-change', { 
    detail: { lineNumber: currentLine } 
  })
  window.dispatchEvent(event)
}

// 在组件卸载时移除事件监听
onUnmounted(() => {
  if (editorTextarea.value) {
    editorTextarea.value.removeEventListener('click', handleCursorChange);
    editorTextarea.value.removeEventListener('keyup', handleCursorChange);
  }
  
  // 移除窗口大小变化监听
  window.removeEventListener('resize', handleResize);
});

// 处理右键菜单
function showContextMenu(e) {
  e.preventDefault()
  contextMenuVisible.value = true
  contextMenuStyle.value = {
    top: e.clientY + 'px',
    left: e.clientX + 'px'
  }
  
  // 点击其他区域关闭菜单
  document.addEventListener('click', closeContextMenu)
}

// 关闭右键菜单
function closeContextMenu() {
  contextMenuVisible.value = false
  document.removeEventListener('click', closeContextMenu)
}

// 处理颜色命令
function handleColorCommand(command) {
  applyTextColor(command)
}

// 处理背景颜色命令
function handleBgColorCommand(command) {
  applyBgColor(command)
}

// 处理文本颜色命令
function applyTextColor(color) {
  if (!editorTextarea.value) return
  
  // 保存当前滚动位置
  const scrollTop = editorTextarea.value.scrollTop
  let previewScrollTop = 0
  if (previewDiv.value && showPreview.value) {
    previewScrollTop = previewDiv.value.scrollTop
  }
  
  const start = editorTextarea.value.selectionStart
  const end = editorTextarea.value.selectionEnd
  
  if (start === end) {
    // 没有选中文本，插入占位符
    insertText(`<span style="color: ${color};">文本</span>`)
    
    // 设置光标位置到"文本"中间
    const insertedTextStart = start + `<span style="color: ${color};">`.length
    setTimeout(() => {
      editorTextarea.value.focus()
      editorTextarea.value.setSelectionRange(insertedTextStart, insertedTextStart + 2)
      
      // 恢复滚动位置
      editorTextarea.value.scrollTop = scrollTop
      if (previewDiv.value && showPreview.value) {
        previewDiv.value.scrollTop = previewScrollTop
      }
    }, 0)
  } else {
    // 选中了文本，应用颜色
    const selectedText = content.value.substring(start, end)
    const coloredText = `<span style="color: ${color};">${selectedText}</span>`
    
    const newContent = content.value.substring(0, start) + coloredText + content.value.substring(end)
    editorStore.setContent(newContent)
    
    // 保持原来的选区
    setTimeout(() => {
      editorTextarea.value.focus()
      editorTextarea.value.setSelectionRange(start, start + coloredText.length)
      
      // 恢复滚动位置
      editorTextarea.value.scrollTop = scrollTop
      if (previewDiv.value && showPreview.value) {
        previewDiv.value.scrollTop = previewScrollTop
      }
    }, 0)
  }
  
  closeContextMenu()
}

// 处理背景颜色命令
function applyBgColor(color) {
  if (!editorTextarea.value) return
  
  // 保存当前滚动位置
  const scrollTop = editorTextarea.value.scrollTop
  let previewScrollTop = 0
  if (previewDiv.value && showPreview.value) {
    previewScrollTop = previewDiv.value.scrollTop
  }
  
  const start = editorTextarea.value.selectionStart
  const end = editorTextarea.value.selectionEnd
  
  if (start === end) {
    // 没有选中文本，插入占位符
    insertText(`<span style="background-color: ${color};">文本</span>`)
    
    // 设置光标位置到"文本"中间
    const insertedTextStart = start + `<span style="background-color: ${color};">`.length
    setTimeout(() => {
      editorTextarea.value.focus()
      editorTextarea.value.setSelectionRange(insertedTextStart, insertedTextStart + 2)
      
      // 恢复滚动位置
      editorTextarea.value.scrollTop = scrollTop
      if (previewDiv.value && showPreview.value) {
        previewDiv.value.scrollTop = previewScrollTop
      }
    }, 0)
  } else {
    // 选中了文本，应用背景颜色
    const selectedText = content.value.substring(start, end)
    const coloredText = `<span style="background-color: ${color};">${selectedText}</span>`
    
    const newContent = content.value.substring(0, start) + coloredText + content.value.substring(end)
    editorStore.setContent(newContent)
    
    // 保持原来的选区
    setTimeout(() => {
      editorTextarea.value.focus()
      editorTextarea.value.setSelectionRange(start, start + coloredText.length)
      
      // 恢复滚动位置
      editorTextarea.value.scrollTop = scrollTop
      if (previewDiv.value && showPreview.value) {
        previewDiv.value.scrollTop = previewScrollTop
      }
    }, 0)
  }
  
  closeContextMenu()
}

// 处理标题命令
function applyHeading(level) {
  if (!editorTextarea.value) return
  
  // 保存当前滚动位置
  const scrollTop = editorTextarea.value.scrollTop
  let previewScrollTop = 0
  if (previewDiv.value && showPreview.value) {
    previewScrollTop = previewDiv.value.scrollTop
  }
  
  const start = editorTextarea.value.selectionStart
  const end = editorTextarea.value.selectionEnd
  
  // 获取当前行的起始位置
  let lineStart = start
  while (lineStart > 0 && content.value.charAt(lineStart - 1) !== '\n') {
    lineStart--
  }
  
  // 获取当前行的内容
  const lineEnd = content.value.indexOf('\n', start)
  const currentLine = content.value.substring(lineStart, lineEnd === -1 ? content.value.length : lineEnd)
  
  // 移除现有的标题标记
  const cleanLine = currentLine.replace(/^#+\s*/, '')
  
  // 添加新的标题标记
  const heading = '#'.repeat(level) + ' ' + cleanLine
  
  // 替换当前行
  const newContent = content.value.substring(0, lineStart) + heading + content.value.substring(lineEnd === -1 ? content.value.length : lineEnd)
  editorStore.setContent(newContent)
  
  // 设置光标位置
  setTimeout(() => {
    editorTextarea.value.focus()
    const newPosition = lineStart + heading.length
    editorTextarea.value.setSelectionRange(newPosition, newPosition)
    
    // 恢复滚动位置
    editorTextarea.value.scrollTop = scrollTop
    if (previewDiv.value && showPreview.value) {
      previewDiv.value.scrollTop = previewScrollTop
    }
  }, 0)
  
  closeContextMenu()
}

// 处理样式命令
function applyStyle(style) {
  if (!editorTextarea.value) return
  
  const start = editorTextarea.value.selectionStart
  const end = editorTextarea.value.selectionEnd
  
  // 保存当前滚动位置
  const scrollTop = editorTextarea.value.scrollTop
  let previewScrollTop = 0
  if (previewDiv.value && showPreview.value) {
    previewScrollTop = previewDiv.value.scrollTop
  }
  
  let styleMarker = ''
  let styleText = ''
  
  switch (style) {
    case 'bold':
      styleMarker = '**'
      styleText = '粗体文本'
      break
    case 'italic':
      styleMarker = '*'
      styleText = '斜体文本'
      break
    case 'strikethrough':
      styleMarker = '~~'
      styleText = '删除线文本'
      break
    default:
      return
  }
  
  if (start === end) {
    // 没有选中文本，插入占位符
    insertText(`${styleMarker}${styleText}${styleMarker}`)
    
    // 设置光标位置到占位文本中间
    const textStart = start + styleMarker.length
    setTimeout(() => {
      editorTextarea.value.focus()
      editorTextarea.value.setSelectionRange(textStart, textStart + styleText.length)
      
      // 恢复滚动位置
      editorTextarea.value.scrollTop = scrollTop
      if (previewDiv.value && showPreview.value) {
        previewDiv.value.scrollTop = previewScrollTop
      }
    }, 0)
  } else {
    // 选中了文本，应用样式
    const selectedText = content.value.substring(start, end)
    const styledText = `${styleMarker}${selectedText}${styleMarker}`
    
    const newContent = content.value.substring(0, start) + styledText + content.value.substring(end)
    editorStore.setContent(newContent)
    
    // 保持原来的选区，但包含样式标记
    setTimeout(() => {
      editorTextarea.value.focus()
      editorTextarea.value.setSelectionRange(start, start + styledText.length)
      
      // 恢复滚动位置
      editorTextarea.value.scrollTop = scrollTop
      if (previewDiv.value && showPreview.value) {
        previewDiv.value.scrollTop = previewScrollTop
      }
    }, 0)
  }
  
  closeContextMenu()
}

// 处理键盘快捷键
function handleKeyDown(e) {
  // 检查是否按下了Ctrl键（Windows）或Command键（Mac）
  const isCtrlOrCmd = e.ctrlKey || e.metaKey
  
  if (isCtrlOrCmd) {
    switch (e.key) {
      case 'b': // Ctrl+B: 粗体
        e.preventDefault()
        applyStyle('bold')
        break
      case 'i': // Ctrl+I: 斜体
        e.preventDefault()
        applyStyle('italic')
        break
      case '1': // Ctrl+1: 一级标题
      case '2': // Ctrl+2: 二级标题
      case '3': // Ctrl+3: 三级标题
      case '4': // Ctrl+4: 四级标题
      case '5': // Ctrl+5: 五级标题
        if (e.key >= '1' && e.key <= '5') {
          e.preventDefault()
          applyHeading(parseInt(e.key))
        }
        break
      case 'k': // Ctrl+K: 插入链接
        e.preventDefault()
        insertText('[链接文字](链接URL)')
        break
      case 'l': // Ctrl+L: 无序列表
        e.preventDefault()
        insertText('- 列表项')
        break
      case 'o': // Ctrl+O: 有序列表
        e.preventDefault()
        insertText('1. 列表项')
        break
      case 'q': // Ctrl+Q: 引用
        e.preventDefault()
        insertText('> 引用文字')
        break
      case 'd': // Ctrl+D: 删除线
        e.preventDefault()
        applyStyle('strikethrough')
        break
    }
  }
}

// 显示文本颜色选择器
function showTextColorPicker() {
  colorPickerVisible.value = true
  colorPickerTitle.value = '选择文字颜色'
  colorPickerType.value = 'text'
  pickerColor.value = currentTextColor.value
  closeContextMenu()
}

// 显示背景颜色选择器
function showBgColorPicker() {
  colorPickerVisible.value = true
  colorPickerTitle.value = '选择背景颜色'
  colorPickerType.value = 'bg'
  pickerColor.value = currentBgColor.value
  closeContextMenu()
}

// 应用选中的颜色
function applyPickerColor() {
  if (!editorTextarea.value) return
  
  // 保存当前滚动位置
  const scrollTop = editorTextarea.value.scrollTop
  let previewScrollTop = 0
  if (previewDiv.value && showPreview.value) {
    previewScrollTop = previewDiv.value.scrollTop
  }
  
  const selectedColor = pickerColor.value
  
  if (colorPickerType.value === 'text') {
    currentTextColor.value = selectedColor
    applyTextColor(selectedColor)
  } else {
    currentBgColor.value = selectedColor
    applyBgColor(selectedColor)
  }
  
  colorPickerVisible.value = false
  
  // 恢复滚动位置
  setTimeout(() => {
    if (editorTextarea.value) {
      editorTextarea.value.scrollTop = scrollTop
    }
    if (previewDiv.value && showPreview.value) {
      previewDiv.value.scrollTop = previewScrollTop
    }
  }, 0)
}

// 应用当前选中的文本颜色
function applyCurrentTextColor(color) {
  applyTextColor(color)
}

// 应用当前选中的背景颜色
function applyCurrentBgColor(color) {
  applyBgColor(color)
}

// 添加调试按钮
function debugRenderedHtml() {
  console.log('渲染后的HTML:', renderedContent.value);
  
  // 查找代码块
  const codeBlocks = renderedContent.value.match(/<pre><code class=".*?">([\s\S]*?)<\/code><\/pre>/g);
  if (codeBlocks && codeBlocks.length > 0) {
    console.log('找到代码块数量:', codeBlocks.length);
    codeBlocks.forEach((block, index) => {
      console.log(`代码块 ${index + 1}:`, block);
      console.log(`代码块 ${index + 1} 类名:`, block.match(/class="([^"]+)"/)[1]);
      
      // 显示是否包含特定语言的高亮
      const classNames = block.match(/class="([^"]+)"/)[1];
      if (classNames.includes('language-java')) {
        console.log(`代码块 ${index + 1} 是Java代码块`);
        
        // 检查Java特有高亮元素
        const hasKeywords = block.includes('hljs-keyword');
        const hasAnnotations = block.includes('hljs-meta');
        const hasStrings = block.includes('hljs-string');
        const hasComments = block.includes('hljs-comment');
        const hasFunctions = block.includes('hljs-function') || block.includes('hljs-title');
        const hasTypes = block.includes('hljs-type') || block.includes('hljs-class');
        
        console.log(`Java代码块 ${index + 1} 包含: `, {
          关键字: hasKeywords,
          注解: hasAnnotations,
          字符串: hasStrings,
          注释: hasComments,
          函数: hasFunctions,
          类型: hasTypes
        });
      }
    });
  } else {
    console.log('未找到代码块');
  }
  
  // 检查highlight.js是否正确加载
  console.log('highlight.js 对象:', hljs);
  console.log('highlight.js 支持的语言:', hljs.listLanguages());
  
  // 尝试手动高亮一段Java代码
  const testCode = `
  @Override
  public void test() {
    System.out.println("Hello");
  }`;
  try {
    const result = hljs.highlight(testCode, { language: 'java' }).value;
    console.log('手动高亮测试结果:', result);
  } catch (e) {
    console.error('手动高亮测试失败:', e);
  }
}

// 添加调试预览状态按钮
function debugPreviewState() {
  console.log('预览状态:', showPreview.value)
}
</script>

<style scoped>
.markdown-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  overflow: hidden;
  padding-top: 50px; /* 为固定的标题栏留出空间 */
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  height: 50px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #dcdfe6;
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 100;
  box-sizing: border-box;
}

.header-left {
  display: flex;
  align-items: center;
}

.header-left h2 {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.markdown-toolbar {
  display: flex;
  justify-content: space-between;
  padding: 8px 16px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #dcdfe6;
  width: 100%;
  box-sizing: border-box;
  margin-top: 0; /* 不需要额外的顶部间距，因为App.vue已经添加了padding-top */
}

.toolbar-left {
  display: flex;
  flex: 1;
  gap: 8px;
  overflow-x: auto;
}

.editor-content {
  display: flex;
  flex: 1;
  position: relative;
  overflow: hidden;
  min-height: 500px; /* 确保编辑器有足够的高度 */
  border: 1px solid #dcdfe6;
  margin-top: 10px;
}

.editor-input {
  flex: 1;
  height: 100%;
  position: relative;
  min-height: 0;
  padding-right: 12px;
  max-width: 50%;
}

.editor-input.full-width {
  max-width: 100%;
}

.editor-input textarea {
  width: 100%;
  height: 100%;
  padding: 16px;
  border: none;
  resize: none;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
  color: #303133;
  background-color: #ffffff;
  outline: none;
  overflow-y: auto;
  box-sizing: border-box;
}

/* 隐藏原生滚动条 */
.editor-input textarea::-webkit-scrollbar {
  width: 0;
  height: 0;
}

.editor-preview {
  flex: 1;
  height: 100%;
  padding: 16px;
  overflow-y: auto;
  background-color: #ffffff;
  box-sizing: border-box;
  min-height: 0;
  border-left: 1px solid #dcdfe6;
}

/* 预览区域内容样式 */
.editor-preview h1,
.editor-preview h2,
.editor-preview h3,
.editor-preview h4,
.editor-preview h5,
.editor-preview h6 {
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  font-weight: 600;
  line-height: 1.25;
}

.editor-preview h1 {
  font-size: 2em;
  border-bottom: 1px solid #eaecef;
  padding-bottom: 0.3em;
}

.editor-preview h2 {
  font-size: 1.5em;
  border-bottom: 1px solid #eaecef;
  padding-bottom: 0.3em;
}

.editor-preview h3 {
  font-size: 1.25em;
}

.editor-preview p {
  margin-top: 0;
  margin-bottom: 16px;
}

.editor-preview pre {
  position: relative;
  padding: 16px;
  overflow: auto;
  font-size: 85%;
  line-height: 1.45;
  background-color: #282c34 !important;
  border-radius: 6px;
  margin-bottom: 16px;
  color: #f8f8f2 !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  border: 1px solid #444;
}

/* 语言标签样式 */
.editor-preview pre .lang-label {
  position: absolute;
  top: 0;
  right: 0;
  background-color: #ff8c00;
  color: #282c34;
  padding: 2px 8px;
  font-size: 12px;
  border-bottom-left-radius: 5px;
  font-weight: bold;
  z-index: 5;
}

.editor-preview code {
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  padding: 0.2em 0.4em;
  margin: 0;
  font-size: 85%;
  background-color: rgba(27, 31, 35, 0.1);
  border-radius: 3px;
}

.editor-preview pre code {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace !important;
  padding: 0 !important;
  margin: 0 !important;
  font-size: 14px !important;
  background-color: transparent !important;
  border: 0 !important;
  display: block !important;
  overflow-x: auto !important;
  color: #f8f8f2 !important;
  line-height: 1.5 !important;
  tab-size: 4 !important;
  white-space: pre !important;
  border-radius: 0 !important;
}

/* 针对Java代码高亮的特定样式 */
.editor-preview pre code.language-java .hljs-keyword {
  color: #ff79c6 !important;
  font-weight: bold !important;
}

.editor-preview pre code.language-java .hljs-meta {
  color: #ff8c00 !important;
  font-weight: bold !important;
}

.editor-preview pre code.language-java .hljs-comment {
  color: #6A9955 !important;
  font-style: italic !important;
}

.editor-preview pre code.language-java .hljs-string {
  color: #f1fa8c !important;
}

.editor-preview pre code.language-java .hljs-function {
  color: #50fa7b !important;
}

.editor-preview pre code.language-java .hljs-title {
  color: #50fa7b !important;
}

.editor-preview pre code.language-java .hljs-params {
  color: #8be9fd !important;
}

.editor-preview pre code.language-java .hljs-number {
  color: #bd93f9 !important;
}

.editor-preview pre code.language-java .hljs-type {
  color: #8be9fd !important;
}

.editor-preview pre code.language-java .hljs-class {
  color: #8be9fd !important;
}

/* 为Java代码块添加特殊样式，增强可见性 */
.editor-preview pre.java-code-block {
  background-color: #282c34 !important;
  border: 1px solid #444 !important;
  border-radius: 6px !important;
  margin: 1em 0 !important;
  position: relative !important;
  overflow: auto !important;
}

/* 自定义语言标签 */
.editor-preview pre.java-code-block::before {
  content: "Java";
  position: absolute;
  top: 0;
  right: 0;
  background: #ff8c00;
  color: #282c34;
  padding: 2px 8px;
  font-size: 12px;
  border-bottom-left-radius: 5px;
  font-weight: bold;
  z-index: 2;
}

/* 其他语言的代码块样式 */
.editor-preview pre[class*="-code-block"]:not(.java-code-block)::before {
  content: attr(class);
  content: attr(data-lang);
  position: absolute;
  top: 0;
  right: 0;
  background: #607D8B;
  color: #fff;
  padding: 2px 8px;
  font-size: 12px;
  border-bottom-left-radius: 5px;
  font-weight: bold;
  z-index: 2;
}

/* 优化微信公众号样式复制，添加内联样式支持 */
.editor-preview pre.java-code-block code,
.editor-preview pre.java-code-block code * {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace !important;
  font-size: 14px !important;
  line-height: 1.5 !important;
}

/* 添加一个特别的处理，确保@Override注解为橙色 */
.editor-preview pre code.language-java .hljs-meta:contains("@Override") {
  color: #ff8c00 !important;
  font-weight: bold !important;
}

/* 微信公众号复制优化 - 使用更鲜明的颜色，确保在复制后也可见 */
.editor-preview pre code.language-java .hljs-keyword[style] {
  color: #ff79c6 !important;
  font-weight: bold !important;
}

.editor-preview pre code.language-java .hljs-meta[style] {
  color: #ff8c00 !important;
  font-weight: bold !important;
}

.editor-preview pre code.language-java .hljs-comment[style] {
  color: #6A9955 !important;
  font-style: italic !important;
}

.editor-preview pre code.language-java .hljs-string[style] {
  color: #f1fa8c !important;
}

.editor-preview pre code.language-java .hljs-function[style] {
  color: #50fa7b !important;
}

.editor-preview pre code.language-java .hljs-title[style] {
  color: #50fa7b !important;
}

.editor-preview pre code.language-java .hljs-params[style] {
  color: #8be9fd !important;
}

.editor-preview pre code.language-java .hljs-number[style] {
  color: #bd93f9 !important;
}

.editor-preview pre code.language-java .hljs-type[style] {
  color: #8be9fd !important;
}

.editor-preview pre code.language-java .hljs-class[style] {
  color: #8be9fd !important;
}

/* 修改全局语法高亮样式，提高对比度和可见性 */
:deep(.hljs),
:deep(code.hljs) {
  display: block;
  overflow-x: auto;
  padding: 0 !important;
  color: #f8f8f2 !important;
  background: transparent !important;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
}

/* 通用语法高亮样式增强 */
:deep(.hljs-comment),
:deep(.hljs-quote) {
  color: #6A9955 !important;
  font-style: italic;
}

:deep(.hljs-keyword),
:deep(.hljs-selector-tag) {
  color: #ff79c6 !important;
  font-weight: bold;
}

:deep(.hljs-string),
:deep(.hljs-doctag) {
  color: #f1fa8c !important;
}

:deep(.hljs-number),
:deep(.hljs-literal) {
  color: #bd93f9 !important;
}

:deep(.hljs-attribute),
:deep(.hljs-name),
:deep(.hljs-tag) {
  color: #8be9fd !important;
}

:deep(.hljs-regexp),
:deep(.hljs-link) {
  color: #ff5555 !important;
}

:deep(.hljs-symbol),
:deep(.hljs-bullet) {
  color: #f8c555 !important;
}

:deep(.hljs-built_in),
:deep(.hljs-builtin-name) {
  color: #8be9fd !important;
  font-weight: bold;
}

:deep(.hljs-title) {
  color: #50fa7b !important;
}

:deep(.hljs-meta) {
  color: #ff8c00 !important;
  font-weight: bold;
}

:deep(.hljs-meta-string) {
  color: #f1fa8c !important;
}

:deep(.hljs-type) {
  color: #8be9fd !important;
  font-weight: bold;
}

:deep(.hljs-function) {
  color: #50fa7b !important;
}

:deep(.hljs-class) {
  color: #8be9fd !important;
}

:deep(.hljs-params) {
  color: #8be9fd !important;
}

:deep(.hljs-variable) {
  color: #f8f8f2 !important;
}

:deep(.hljs-section),
:deep(.hljs-selector-class),
:deep(.hljs-selector-id) {
  color: #ffb86c !important;
}

:deep(.hljs-emphasis) {
  font-style: italic;
}

:deep(.hljs-strong) {
  font-weight: bold;
}

/* 添加一些针对Java代码的特殊高亮 */
:deep(.language-java) {
  color: #f8f8f2 !important;
}

:deep(.language-java .hljs-keyword) {
  color: #ff79c6 !important;
  font-weight: bold;
}

:deep(.language-java .hljs-meta) {
  color: #ff8c00 !important;
  font-weight: bold;
}

:deep(.language-java .hljs-comment) {
  color: #6A9955 !important;
  font-style: italic;
}

:deep(.language-java .hljs-function) {
  color: #50fa7b !important;
}

:deep(.language-java .hljs-string) {
  color: #f1fa8c !important;
}

:deep(.language-java .hljs-number) {
  color: #bd93f9 !important;
}

:deep(.language-java .hljs-type) {
  color: #8be9fd !important;
}

/* 隐藏原生滚动条 */
.editor-preview::-webkit-scrollbar {
  width: 0;
  height: 0;
}

/* 自定义中间滚动条 */
.editor-scrollbar {
  position: absolute;
  top: 10px; /* 距离顶部留出一些空间 */
  left: 50%;
  width: 8px;
  height: calc(100% - 20px); /* 上下各留出10px空间 */
  transform: translateX(-50%);
  z-index: 10;
  background-color: rgba(240, 240, 240, 0.5); /* 添加轻微的背景色 */
  border-radius: 4px;
}

.editor-scrollbar-thumb {
  position: absolute;
  width: 8px;
  background-color: rgba(144, 147, 153, 0.3);
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s, width 0.2s;
}

.editor-scrollbar-thumb:hover,
.editor-scrollbar-thumb:active {
  background-color: rgba(144, 147, 153, 0.5);
  width: 10px; /* 悬停时稍微变宽 */
  left: -1px; /* 保持居中 */
}

/* 编辑器内容区域中间分隔线 */
.editor-content::after {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  width: 1px;
  height: 100%;
  background-color: #dcdfe6;
  transform: translateX(-50%);
  z-index: 5;
  display: none; /* 默认不显示 */
}

/* 添加一个类来控制分隔线的显示 */
.show-divider::after {
  display: block;
}

/* 全屏模式 */
.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  border-radius: 0;
  border: none;
}

.fullscreen .editor-header {
  position: relative;
  width: 100%;
}

.fullscreen .markdown-toolbar {
  margin-top: 0;
}

/* 主题样式 */
.theme-default {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

.theme-elegant {
  font-family: 'Georgia', serif;
  color: #333;
  line-height: 1.8;
}

.theme-github {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
  font-size: 16px;
  line-height: 1.5;
  color: #24292e;
}

.theme-wechat {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  font-size: 15px;
  line-height: 1.7;
  color: #3f3f3f;
}

.theme-dark {
  background-color: #1e1e1e;
  color: #d4d4d4;
  font-family: 'Consolas', 'Monaco', monospace;
}

/* 自定义按钮样式，使其更紧凑 */
:deep(.el-button) {
  padding: 6px 10px;
}

:deep(.el-button-group .el-button) {
  padding: 6px 8px;
}

:deep(.el-select) {
  width: 110px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .editor-content {
    flex-direction: column;
  }
  
  .editor-input,
  .editor-preview {
    width: 100%;
    height: 50%;
    min-height: 0;
  }
  
  .editor-input {
    padding-right: 0; /* 在垂直布局中不需要右侧内边距 */
    padding-bottom: 12px; /* 添加底部内边距 */
  }
  
  .editor-preview {
    padding: 16px; /* 重置内边距 */
    padding-top: 28px; /* 增加顶部内边距 */
  }
  
  .editor-content::after {
    left: 0;
    top: 50%;
    width: 100%;
    height: 1px;
    transform: translateY(-50%);
  }
  
  .editor-scrollbar {
    left: auto;
    top: 50%;
    right: 10px;
    width: 8px;
    height: 8px;
    transform: translateY(-50%);
  }
  
  .editor-scrollbar-thumb {
    width: 8px;
    height: 8px;
  }
  
  .editor-scrollbar-thumb:hover,
  .editor-scrollbar-thumb:active {
    width: 8px;
    height: 10px;
    top: -1px;
    left: 0;
  }
}
</style> 