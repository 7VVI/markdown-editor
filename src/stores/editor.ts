import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { marked } from 'marked'
import { getAllThemes, getTheme } from '../themes'
import type { Theme } from '../themes'
import hljs from 'highlight.js'

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
  const scrollOptions = ref({ smooth: true })
  
  // 历史记录
  const history = ref<string[]>([])
  const historyIndex = ref(-1)
  const maxHistoryLength = 100 // 最大历史记录数量
  
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
  function setContent(newContent: string, addToHistory: boolean = true) {
    // 如果内容没有变化，则不做任何操作
    if (content.value === newContent) return
    
    // 设置新内容
    content.value = newContent
    
    // 添加到历史记录
    if (addToHistory) {
      addHistory(newContent)
    }
  }
  
  // 滚动到指定行
  function scrollToLine(lineNumber: number, options?: { smooth: boolean }) {
    scrollToLineNumber.value = lineNumber
    // 存储滚动选项
    if (options !== undefined) {
      scrollOptions.value = options
    }
    // 一段时间后重置，以便下次调用仍然生效（即使是相同行号）
    setTimeout(() => {
      scrollToLineNumber.value = 0
    }, 100)
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
      document.body.appendChild(tempDiv);
      
      // 增强处理，使其在微信编辑器中显示更好
      enhanceForWechat(tempDiv);
      
      // 特殊处理代码块，确保横向滚动
      const codeBlocks = tempDiv.querySelectorAll('pre');
      codeBlocks.forEach(pre => {
        // 检查是否已经有包装器
        if (pre.parentElement && !pre.parentElement.classList.contains('code-block-wrapper-wechat')) {
          // 创建包装容器
          const wrapper = document.createElement('div');
          wrapper.className = 'code-block-wrapper-wechat';
          wrapper.style.position = 'relative';
          wrapper.style.width = '100%';
          wrapper.style.overflowX = 'auto';
          wrapper.style.backgroundColor = '#000000';
          wrapper.style.borderRadius = '6px';
          wrapper.style.margin = '16px 0';
          wrapper.style.border = '1px solid #555';
          wrapper.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.5)';
          
          // 设置微信富文本编辑器支持的属性
          wrapper.setAttribute('data-mce-style', 'position: relative; width: 100%; overflow-x: auto; background-color: #000000; border-radius: 6px; margin: 16px 0; border: 1px solid #555; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);');
          
          // 设置pre元素样式
          pre.style.margin = '0';
          pre.style.borderRadius = '0';
          pre.style.border = 'none';
          pre.style.boxShadow = 'none';
          pre.style.width = 'max-content';
          pre.style.minWidth = '100%';
          pre.style.whiteSpace = 'pre';
          pre.style.overflowX = 'visible';
          
          // 确保code元素也有正确的样式
          const codeEl = pre.querySelector('code');
          if (codeEl) {
            const codeElement = codeEl as HTMLElement;
            codeElement.style.display = 'block';
            codeElement.style.whiteSpace = 'pre';
            codeElement.style.overflowX = 'visible';
            codeElement.style.wordWrap = 'normal';
            codeElement.style.wordBreak = 'normal';
            codeElement.style.width = 'max-content';
            codeElement.style.minWidth = '100%';
          }
          
          // 获取pre的父元素
          const parent = pre.parentNode;
          if (parent) {
            // 将pre从当前位置移除
            parent.removeChild(pre);
            // 将pre添加到包装器中
            wrapper.appendChild(pre);
            // 将包装器添加到原来pre的位置
            parent.appendChild(wrapper);
          }
        }
      });
      
      // 获取处理后的HTML
      const enhancedHTML = tempDiv.innerHTML;
      
      // 使用Clipboard API复制富文本
      try {
        const clipboardItem = new ClipboardItem({
          'text/html': new Blob([enhancedHTML], { type: 'text/html' }),
          'text/plain': new Blob([content.value], { type: 'text/plain' })
        });
        
        await navigator.clipboard.write([clipboardItem]);
        console.log('复制成功');
        
        // 清理临时元素
        document.body.removeChild(tempDiv);
        return true;
      } catch (clipErr) {
        console.error('Clipboard API失败，尝试备用方法', clipErr);
        
        // 备用方法：使用document.execCommand
        const selection = window.getSelection();
        if (selection) {
          selection.removeAllRanges();
          const range = document.createRange();
          range.selectNodeContents(tempDiv);
          selection.addRange(range);
          
          const success = document.execCommand('copy');
          
          // 清理
          selection.removeAllRanges();
          document.body.removeChild(tempDiv);
          
          return success;
        }
        
        document.body.removeChild(tempDiv);
        return false;
      }
    } catch (err) {
      console.error('复制到微信失败:', err);
      return false;
    }
  }
  
  // 增强HTML内容以适应微信编辑器
  function enhanceForWechat(container: HTMLElement) {
    try {
      // 处理所有代码块，确保高亮生效 - 这是重要的部分
      forceHighlightCodeBlocks(container);
      
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
          // 创建一个包装容器，用于微信中显示
          const wrapperDiv = document.createElement('div');
          wrapperDiv.style.position = 'relative';
          wrapperDiv.style.width = '100%';
          wrapperDiv.style.overflowX = 'auto';
          wrapperDiv.style.backgroundColor = '#282c34';
          wrapperDiv.style.padding = '16px';
          wrapperDiv.style.borderRadius = '6px';
          wrapperDiv.style.margin = '16px 0';
          wrapperDiv.style.border = '1px solid #444';
          wrapperDiv.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.5)';
          
          // 设置微信富文本编辑器支持的属性
          wrapperDiv.setAttribute('data-mce-style', 'position: relative; width: 100%; overflow-x: auto; background-color: #282c34; padding: 16px; border-radius: 6px; margin: 16px 0; border: 1px solid #444; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);');
          
          // 设置pre元素样式
          element.style.backgroundColor = 'transparent';
          element.style.padding = '0';
          element.style.margin = '0';
          element.style.border = 'none';
          element.style.boxShadow = 'none';
          element.style.width = 'max-content'; // 关键：确保宽度适应内容
          element.style.minWidth = '100%';
          element.style.whiteSpace = 'pre';
          element.style.overflowX = 'visible'; // 在包装器内可见
          
          // 获取pre的父元素
          const parent = element.parentNode;
          if (parent) {
            // 将pre从当前位置移除
            parent.removeChild(element);
            // 将pre添加到包装器中
            wrapperDiv.appendChild(element);
            // 将包装器添加到原来pre的位置
            parent.appendChild(wrapperDiv);
          }
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
            element.style.display = 'block';
            element.style.whiteSpace = 'pre';
            element.style.overflowX = 'auto';
            element.style.wordWrap = 'normal';
            element.style.wordBreak = 'normal';
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
          // 强制设置黑色背景和相关样式
          preElement.style.backgroundColor = '#000000';
          preElement.style.color = '#f8f8f2';
          preElement.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.5)';
          preElement.style.border = '1px solid #555';
          preElement.style.padding = '16px';
          preElement.style.borderRadius = '6px';
          preElement.style.margin = '16px 0';
          preElement.style.whiteSpace = 'pre';
          preElement.style.overflowX = 'auto';
          preElement.style.maxWidth = '100%';
          preElement.style.width = 'max-content'; // 关键：确保宽度适应内容
          preElement.style.minWidth = '100%';
          
          // 确保代码元素也有正确的样式
          const codeEl = preElement.querySelector('code');
          if (codeEl) {
            const codeElement = codeEl as HTMLElement;
            codeElement.style.display = 'block';
            codeElement.style.whiteSpace = 'pre';
            codeElement.style.overflowX = 'visible'; // 在pre内可见
            codeElement.style.wordWrap = 'normal';
            codeElement.style.wordBreak = 'normal';
            codeElement.style.width = 'max-content'; // 关键：确保宽度适应内容
            codeElement.style.minWidth = '100%';
          }
          
          // 添加微信富文本编辑器支持的属性
          preElement.setAttribute('data-wiz-code-container', 'true');
          preElement.setAttribute('data-mode', 'HTML');
          preElement.setAttribute('data-mce-style', 'background-color: #000000; color: #f8f8f2; padding: 16px; border-radius: 6px; position: relative; font-family: Consolas, Monaco, monospace; font-size: 14px; line-height: 1.5; border: 1px solid #555; margin: 16px 0; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5); white-space: pre; overflow-x: auto; max-width: 100%;');
          
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
            langLabel.style.color = '#000000';
            langLabel.style.padding = '2px 8px';
            langLabel.style.fontSize = '12px';
            langLabel.style.borderBottomLeftRadius = '5px';
            langLabel.style.fontWeight = 'bold';
            langLabel.style.zIndex = '5';
            
            // 为微信公众号设置特殊属性
            langLabel.setAttribute('data-mce-style', `position: absolute; top: 0; right: 0; background-color: ${isJava ? '#ff8c00' : '#607D8B'}; color: #000000; padding: 2px 8px; font-size: 12px; border-bottom-left-radius: 5px; font-weight: bold; z-index: 5;`);
            
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
    } catch (err) {
      console.error('增强处理失败:', err);
      return container;
    }
  }
  
  // 强制处理所有代码块，确保高亮生效
  function forceHighlightCodeBlocks(container: HTMLElement) {
    try {
      // 查找所有代码块
      const codeBlocks = container.querySelectorAll('pre code');
      console.log('找到代码块:', codeBlocks.length);
      
      // 处理每个代码块
      codeBlocks.forEach((codeBlock, index) => {
        // 获取语言
        const className = codeBlock.className;
        const langMatch = className.match(/language-(\w+)/);
        const lang = langMatch ? langMatch[1] : '';
        console.log(`处理代码块${index + 1}，语言:`, lang || '未指定');
        
        // 获取父元素并设置强制黑色背景
        const preElement = codeBlock.parentElement as HTMLElement;
        if (preElement) {
          // 强制设置黑色背景和相关样式
          preElement.style.backgroundColor = '#000000';
          preElement.style.color = '#f8f8f2';
          preElement.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.5)';
          preElement.style.border = '1px solid #555';
          preElement.style.padding = '16px';
          preElement.style.borderRadius = '6px';
          preElement.style.margin = '16px 0';
          preElement.style.whiteSpace = 'pre';
          preElement.style.overflowX = 'auto';
          preElement.style.maxWidth = '100%';
          preElement.style.width = 'max-content'; // 关键：确保宽度适应内容
          preElement.style.minWidth = '100%';
          
          // 确保代码元素也有正确的样式
          const codeEl = preElement.querySelector('code');
          if (codeEl) {
            const codeElement = codeEl as HTMLElement;
            codeElement.style.display = 'block';
            codeElement.style.whiteSpace = 'pre';
            codeElement.style.overflowX = 'visible'; // 在pre内可见
            codeElement.style.wordWrap = 'normal';
            codeElement.style.wordBreak = 'normal';
            codeElement.style.width = 'max-content'; // 关键：确保宽度适应内容
            codeElement.style.minWidth = '100%';
          }
          
          // 创建一个包装容器，用于微信中显示
          const wrapperDiv = document.createElement('div');
          wrapperDiv.className = 'code-block-wrapper-wechat';
          wrapperDiv.style.position = 'relative';
          wrapperDiv.style.width = '100%';
          wrapperDiv.style.overflowX = 'auto';
          wrapperDiv.style.backgroundColor = '#000000';
          wrapperDiv.style.borderRadius = '6px';
          wrapperDiv.style.margin = '16px 0';
          wrapperDiv.style.border = '1px solid #555';
          wrapperDiv.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.5)';
          
          // 设置微信富文本编辑器支持的属性
          wrapperDiv.setAttribute('data-mce-style', 'position: relative; width: 100%; overflow-x: auto; background-color: #000000; border-radius: 6px; margin: 16px 0; border: 1px solid #555; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);');
          
          // 获取pre的父元素
          const parent = preElement.parentNode;
          if (parent) {
            // 将pre从当前位置移除
            parent.removeChild(preElement);
            // 将pre添加到包装器中
            wrapperDiv.appendChild(preElement);
            // 将包装器添加到原来pre的位置
            parent.appendChild(wrapperDiv);
            
            // 调整pre在包装器内的样式
            preElement.style.margin = '0';
            preElement.style.borderRadius = '0';
            preElement.style.border = 'none';
            preElement.style.boxShadow = 'none';
          }
          
          // 添加微信富文本编辑器支持的属性
          preElement.setAttribute('data-wiz-code-container', 'true');
          preElement.setAttribute('data-mode', 'HTML');
          preElement.setAttribute('data-mce-style', 'background-color: #000000; color: #f8f8f2; padding: 16px; border-radius: 6px; position: relative; font-family: Consolas, Monaco, monospace; font-size: 14px; line-height: 1.5; border: 1px solid #555; margin: 16px 0; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5); white-space: pre; overflow-x: auto; max-width: 100%;');
          
          // 检查是否是Java代码块
          const isJava = className.includes('language-java');
          
          // 获取语言信息
          // 这里已经在前面获取过了，不需要重复获取
          
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
            langLabel.style.color = '#000000';
            langLabel.style.padding = '2px 8px';
            langLabel.style.fontSize = '12px';
            langLabel.style.borderBottomLeftRadius = '5px';
            langLabel.style.fontWeight = 'bold';
            langLabel.style.zIndex = '5';
            
            // 为微信公众号设置特殊属性
            langLabel.setAttribute('data-mce-style', `position: absolute; top: 0; right: 0; background-color: ${isJava ? '#ff8c00' : '#607D8B'}; color: #000000; padding: 2px 8px; font-size: 12px; border-bottom-left-radius: 5px; font-weight: bold; z-index: 5;`);
            
            preElement.insertBefore(langLabel, preElement.firstChild);
          }
          
          // 处理Java代码块的特殊高亮
          if (isJava) {
            // 为所有高亮元素添加内联样式，以确保微信公众号能正确显示
            processHighlightElements(codeBlock as HTMLElement);
          }
        }
      });
    } catch (e) {
      console.error('强制高亮处理失败:', e);
    }
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
  
  // 处理Java代码高亮
  function processJavaCodeHighlight(codeElement: HTMLElement) {
    try {
      // 处理Java代码的高亮
      const code = codeElement.textContent || '';
      
      // 使用highlight.js处理
      const highlighted = hljs.highlight(code, { language: 'java' }).value;
      
      // 特殊处理所有Java注解，不仅限于@Override
      const processedCode = highlighted.replace(/(@\w+)/g, '<span class="hljs-meta">$1</span>');
      
      // 设置高亮后的HTML
      codeElement.innerHTML = processedCode;
      
      // 处理高亮元素的样式
      processHighlightElements(codeElement);
    } catch (e) {
      console.error('Java代码高亮处理失败:', e);
    }
  }
  
  // 添加历史记录
  function addHistory(newContent: string) {
    // 如果当前不在历史记录的最后，则删除当前位置之后的所有记录
    if (historyIndex.value < history.value.length - 1) {
      history.value = history.value.slice(0, historyIndex.value + 1)
    }
    
    // 添加新的历史记录
    history.value.push(newContent)
    
    // 如果历史记录超过最大长度，则删除最早的记录
    if (history.value.length > maxHistoryLength) {
      history.value.shift()
    }
    
    // 更新当前位置
    historyIndex.value = history.value.length - 1
  }
  
  // 导出为Markdown文件
  function exportToMarkdown() {
    try {
      // 创建Blob对象
      const blob = new Blob([content.value], { type: 'text/markdown;charset=utf-8' });
      
      // 创建下载链接
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      // 设置文件名 - 使用当前日期时间作为默认文件名
      const now = new Date();
      const fileName = `markdown_${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}.md`;
      
      // 设置下载链接属性
      link.href = url;
      link.download = fileName;
      
      // 添加到文档并触发点击
      document.body.appendChild(link);
      link.click();
      
      // 清理
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
      
      return true;
    } catch (err) {
      console.error('导出Markdown文件失败:', err);
      return false;
    }
  }
  
  // 撤销
  function undo() {
    if (historyIndex.value > 0) {
      historyIndex.value--
      content.value = history.value[historyIndex.value]
      return true
    }
    return false
  }
  
  // 重做
  function redo() {
    if (historyIndex.value < history.value.length - 1) {
      historyIndex.value++
      content.value = history.value[historyIndex.value]
      return true
    }
    return false
  }
  
  return {
    content,
    currentTheme,
    themes,
    currentThemeObj,
    showPreview,
    isFullscreen,
    scrollToLineNumber,
    scrollOptions,
    toggleFullscreen,
    togglePreview,
    setTheme,
    setContent,
    scrollToLine,
    copyToClipboard,
    copyToWechat,
    addHistory,
    exportToMarkdown,
    undo,
    redo
  }
}) 