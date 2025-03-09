import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { marked } from 'marked'
import { getAllThemes, getTheme } from '../themes'
import type { Theme } from '../themes'

export const useEditorStore = defineStore('editor', () => {
  // 编辑器内容
  const content = ref('')
  
  // 当前选择的样式主题
  const currentTheme = ref('default')
  
  // 可用的样式主题列表
  const themes = computed(() => getAllThemes())
  
  // 当前主题对象
  const currentThemeObj = computed(() => getTheme(currentTheme.value) || themes.value[0])
  
  // 是否显示预览
  const showPreview = ref(true)
  
  // 是否全屏编辑
  const isFullscreen = ref(false)
  
  // 要滚动到的行号
  const scrollToLineNumber = ref(0)
  
  // 切换全屏状态
  function toggleFullscreen() {
    isFullscreen.value = !isFullscreen.value
  }
  
  // 切换预览状态
  function togglePreview() {
    showPreview.value = !showPreview.value
  }
  
  // 设置主题
  function setTheme(themeId: string) {
    const theme = getTheme(themeId)
    if (theme) {
      currentTheme.value = themeId
    } else {
      console.warn(`主题 "${themeId}" 不存在，使用默认主题`)
      currentTheme.value = themes.value[0].id
    }
  }
  
  // 设置内容
  function setContent(newContent: string) {
    content.value = newContent
  }
  
  // 滚动到指定行
  function scrollToLine(lineNumber: number) {
    scrollToLineNumber.value = lineNumber
  }
  
  // 普通复制到剪贴板
  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(content.value)
      return true
    } catch (err) {
      console.error('复制失败:', err)
      return false
    }
  }
  
  // 复制到微信公众号
  async function copyToWechat() {
    try {
      // 获取当前呈现的HTML以保持与预览一致
      const previewDiv = document.querySelector('.editor-preview > div');
      
      // 如果找不到预览区域，回退到使用marked转换
      let htmlContent = '';
      if (previewDiv) {
        htmlContent = previewDiv.innerHTML;
        console.log('使用预览区域的HTML内容');
      } else {
        htmlContent = marked(content.value) as string;
        console.log('使用marked直接转换的HTML内容');
      }
      
      // 创建一个临时div来存放HTML内容并进行处理
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlContent;
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      
      // 对内容进行增强处理
      enhanceForWechat(tempDiv);
      
      // 将临时div添加到文档中
      document.body.appendChild(tempDiv);
      
      try {
        // 使用更可靠的复制方法
        const range = document.createRange();
        range.selectNode(tempDiv);
        
        // 清除当前选择
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
        
        // 复制到剪贴板
        const successful = document.execCommand('copy');
        
        // 清除选择并移除临时元素
        selection?.removeAllRanges();
        document.body.removeChild(tempDiv);
        
        if (successful) {
          console.log('成功复制到剪贴板');
          return true;
        } else {
          throw new Error('document.execCommand(copy) 返回 false');
        }
      } catch (err) {
        console.error('复制失败:', err);
        
        try {
          // 第二种尝试：使用Clipboard API
          await navigator.clipboard.writeText(tempDiv.innerHTML);
          console.log('使用Clipboard API复制成功');
          document.body.removeChild(tempDiv);
          return true;
        } catch (e) {
          console.error('Clipboard API复制也失败:', e);
          
          if (tempDiv.parentNode) {
            document.body.removeChild(tempDiv);
          }
          return false;
        }
      }
    } catch (err) {
      console.error('复制到微信公众号整体失败:', err);
      return false;
    }
  }
  
  // 增强HTML内容以适应微信公众号
  function enhanceForWechat(container: HTMLElement) {
    // 添加内联样式以保持格式
    const styleElements = container.querySelectorAll('h1, h2, h3, h4, h5, h6, p, blockquote, pre, ul, ol, li, code, strong, em, del');
    styleElements.forEach(el => {
      // 根据元素类型添加适当的样式
      const element = el as HTMLElement;
      if (element.tagName === 'H1') {
        element.style.fontSize = '24px';
        element.style.fontWeight = 'bold';
        element.style.margin = '20px 0 10px 0';
        element.style.color = '#333';
      } else if (element.tagName === 'H2') {
        element.style.fontSize = '20px';
        element.style.fontWeight = 'bold';
        element.style.margin = '18px 0 10px 0';
        element.style.color = '#333';
      } else if (element.tagName === 'H3') {
        element.style.fontSize = '18px';
        element.style.fontWeight = 'bold';
        element.style.margin = '16px 0 8px 0';
        element.style.color = '#333';
      } else if (element.tagName === 'P') {
        element.style.margin = '10px 0';
        element.style.lineHeight = '1.6';
        element.style.color = '#3f3f3f';
      } else if (element.tagName === 'BLOCKQUOTE') {
        element.style.borderLeft = '4px solid #dfe2e5';
        element.style.padding = '0 15px';
        element.style.color = '#777';
        element.style.margin = '10px 0';
        element.style.backgroundColor = '#f8f8f8';
      } else if (element.tagName === 'PRE') {
        element.style.backgroundColor = '#282c34';
        element.style.padding = '16px';
        element.style.borderRadius = '6px';
        element.style.overflow = 'auto';
        element.style.fontSize = '14px';
        element.style.fontFamily = 'Consolas, Monaco, monospace';
        element.style.color = '#f8f8f2';
        element.style.margin = '16px 0';
        element.style.border = '1px solid #444';
        element.style.position = 'relative';
      } else if (element.tagName === 'UL' || element.tagName === 'OL') {
        element.style.paddingLeft = '20px';
        element.style.margin = '10px 0';
      } else if (element.tagName === 'LI') {
        element.style.margin = '5px 0';
        element.style.color = '#3f3f3f';
      } else if (element.tagName === 'CODE') {
        element.style.fontFamily = 'Consolas, Monaco, monospace';
        
        // 针对代码块中的代码元素和内联代码元素采用不同的样式
        if (element.parentElement?.tagName === 'PRE') {
          element.style.backgroundColor = 'transparent';
          element.style.padding = '0';
          element.style.color = '#f8f8f2';
        } else {
          element.style.backgroundColor = '#f0f0f0';
          element.style.padding = '2px 4px';
          element.style.borderRadius = '3px';
          element.style.fontSize = '90%';
          element.style.color = '#333';
        }
      } else if (element.tagName === 'STRONG') {
        element.style.fontWeight = 'bold';
      } else if (element.tagName === 'EM') {
        element.style.fontStyle = 'italic';
      } else if (element.tagName === 'DEL') {
        element.style.textDecoration = 'line-through';
      }
    });
    
    // 处理表格样式
    const tables = container.querySelectorAll('table');
    tables.forEach(table => {
      const tableElement = table as HTMLTableElement;
      tableElement.style.borderCollapse = 'collapse';
      tableElement.style.width = '100%';
      tableElement.style.margin = '15px 0';
      tableElement.setAttribute('border', '1');
      
      // 设置表格边框和单元格样式
      const cells = tableElement.querySelectorAll('th, td');
      cells.forEach(cell => {
        const cellElement = cell as HTMLElement;
        cellElement.style.border = '1px solid #ddd';
        cellElement.style.padding = '8px';
        cellElement.style.textAlign = 'left';
      });
      
      // 设置表头样式
      const headers = tableElement.querySelectorAll('th');
      headers.forEach(header => {
        const headerElement = header as HTMLElement;
        headerElement.style.backgroundColor = '#f2f2f2';
        headerElement.style.fontWeight = 'bold';
      });
    });
    
    // 特别处理代码高亮 - 重要部分
    const codeBlocks = container.querySelectorAll('pre code');
    codeBlocks.forEach(codeBlock => {
      const codeElement = codeBlock as HTMLElement;
      const preElement = codeElement.parentElement as HTMLElement;
      
      if (preElement) {
        // 确保代码块有正确的样式
        preElement.style.backgroundColor = '#282c34';
        preElement.style.color = '#f8f8f2';
        preElement.style.padding = '16px';
        preElement.style.borderRadius = '6px';
        preElement.style.position = 'relative';
        preElement.style.fontFamily = 'Consolas, Monaco, monospace';
        preElement.style.fontSize = '14px';
        preElement.style.lineHeight = '1.5';
        preElement.style.border = '1px solid #444';
        preElement.style.margin = '16px 0';
        
        // 添加微信富文本编辑器支持的属性
        preElement.setAttribute('data-wiz-code-container', 'true');
        preElement.setAttribute('data-mode', 'HTML');
        
        // 检查是否是Java代码块
        const isJava = codeElement.className.includes('language-java');
        
        // 获取语言信息
        const langMatch = codeElement.className.match(/language-(\w+)/);
        const lang = langMatch ? langMatch[1] : '';
        
        // 添加语言标签
        if (lang) {
          // 移除可能已存在的语言标签
          const existingLabels = preElement.querySelectorAll('.lang-label');
          existingLabels.forEach(label => label.remove());
          
          const langLabel = document.createElement('div');
          langLabel.className = 'lang-label';
          langLabel.textContent = lang.charAt(0).toUpperCase() + lang.slice(1);
          langLabel.style.position = 'absolute';
          langLabel.style.top = '0';
          langLabel.style.right = '0';
          langLabel.style.backgroundColor = isJava ? '#ff8c00' : '#607D8B';
          langLabel.style.color = isJava ? '#282c34' : '#fff';
          langLabel.style.padding = '2px 8px';
          langLabel.style.fontSize = '12px';
          langLabel.style.borderBottomLeftRadius = '5px';
          langLabel.style.fontWeight = 'bold';
          langLabel.style.zIndex = '5';
          
          // 为微信公众号设置特殊属性
          langLabel.setAttribute('data-mce-style', `position: absolute; top: 0; right: 0; background-color: ${isJava ? '#ff8c00' : '#607D8B'}; color: ${isJava ? '#282c34' : '#fff'}; padding: 2px 8px; font-size: 12px; border-bottom-left-radius: 5px; font-weight: bold; z-index: 5;`);
          
          preElement.insertBefore(langLabel, preElement.firstChild);
        }
        
        // 处理Java代码块的特殊高亮
        if (isJava) {
          // 为所有高亮元素添加内联样式，以确保微信公众号能正确显示
          processHighlightElements(codeElement);
        }
      }
    });
    
    // 处理链接样式
    const links = container.querySelectorAll('a');
    links.forEach(link => {
      const linkElement = link as HTMLAnchorElement;
      linkElement.style.color = '#576b95';
      linkElement.style.textDecoration = 'none';
    });
    
    return container;
  }
  
  // 处理代码高亮元素样式
  function processHighlightElements(codeElement: HTMLElement) {
    const highlightMap = [
      { selector: '.hljs-keyword', color: '#ff79c6', bold: true },
      { selector: '.hljs-meta', color: '#ff8c00', bold: true },
      { selector: '.hljs-comment', color: '#6A9955', italic: true },
      { selector: '.hljs-string', color: '#f1fa8c' },
      { selector: '.hljs-function, .hljs-title', color: '#50fa7b' },
      { selector: '.hljs-type, .hljs-class', color: '#8be9fd', bold: true },
      { selector: '.hljs-number, .hljs-literal', color: '#bd93f9' },
      { selector: '.hljs-variable', color: '#f8f8f2' }
    ];
    
    highlightMap.forEach(item => {
      const elements = codeElement.querySelectorAll(item.selector);
      elements.forEach(el => {
        const element = el as HTMLElement;
        element.style.color = item.color;
        if (item.bold) element.style.fontWeight = 'bold';
        if (item.italic) element.style.fontStyle = 'italic';
        
        // 创建一个新的span元素，以提高微信公众号兼容性
        const span = document.createElement('span');
        span.style.color = item.color;
        if (item.bold) span.style.fontWeight = 'bold';
        if (item.italic) span.style.fontStyle = 'italic';
        
        // 添加微信富文本编辑器支持的属性
        let styleString = `color: ${item.color};`;
        if (item.bold) styleString += ' font-weight: bold;';
        if (item.italic) styleString += ' font-style: italic;';
        span.setAttribute('data-mce-style', styleString);
        
        // 将原元素的内容移动到新span
        while (element.firstChild) {
          span.appendChild(element.firstChild);
        }
        
        // 将新span添加到原元素中
        element.appendChild(span);
      });
    });
  }
  
  return {
    content,
    currentTheme,
    themes,
    currentThemeObj,
    showPreview,
    isFullscreen,
    scrollToLineNumber,
    toggleFullscreen,
    togglePreview,
    setTheme,
    setContent,
    scrollToLine,
    copyToClipboard,
    copyToWechat
  }
}) 