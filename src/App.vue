<script setup lang="ts">
import MarkdownEditor from './components/MarkdownEditor.vue'
import '../src/assets/themes.css'
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useEditorStore } from './stores/editor'

const editorStore = useEditorStore()

// 内容大纲项目
const outlineItems = ref([])

// 更新大纲
function updateOutline() {
  const content = editorStore.content
  const lines = content.split('\n')
  const items = []
  
  // 正则表达式匹配标题
  const headingRegex = /^(#{1,6})\s+(.+)$/
  
  lines.forEach((line, index) => {
    const match = line.match(headingRegex)
    if (match) {
      const level = match[1].length // 标题级别 (# 的数量)
      const text = match[2].trim() // 标题文本
      
      items.push({
        id: `heading-${index}`,
        text,
        level,
        lineNumber: index + 1
      })
    }
  })
  
  outlineItems.value = items
}

// 监听内容变化事件
function handleOutlineUpdate() {
  updateOutline()
}

// 监听光标位置变化事件
function handleCursorPositionChange(event) {
  const { lineNumber } = event.detail
  updateActiveOutlineItem(lineNumber)
}

// 更新当前活动的大纲项
function updateActiveOutlineItem(currentLine) {
  // 找到当前行之前最近的标题
  let closestHeading = null
  
  for (const item of outlineItems.value) {
    if (item.lineNumber <= currentLine) {
      if (!closestHeading || item.lineNumber > closestHeading.lineNumber) {
        closestHeading = item
      }
    }
  }
  
  if (closestHeading) {
    activeOutlineItem.value = closestHeading.id
  }
}

// 组件挂载时添加事件监听
onMounted(() => {
  window.addEventListener('outline-update', handleOutlineUpdate)
  window.addEventListener('cursor-position-change', handleCursorPositionChange)
  // 初始化时更新一次大纲
  updateOutline()
})

// 组件卸载时移除事件监听
onUnmounted(() => {
  window.removeEventListener('outline-update', handleOutlineUpdate)
  window.removeEventListener('cursor-position-change', handleCursorPositionChange)
})

// 当前选中的大纲项
const activeOutlineItem = ref('')

// 点击大纲项时定位到相应位置
function scrollToHeading(item) {
  activeOutlineItem.value = item.id
  editorStore.scrollToLine(item.lineNumber)
}

// 计算字数和行数
const wordCount = computed(() => {
  const content = editorStore.content
  return content.replace(/\s/g, '').length
})

const lineCount = computed(() => {
  const content = editorStore.content
  return content ? content.split('\n').length : 0
})

// 监听内容变化，更新大纲
watch(() => editorStore.content, () => {
  updateOutline()
}, { deep: true })
</script>

<template>
  <div class="app-container">
    <!-- 主内容区 -->
    <div class="app-main">
      <!-- 左侧大纲 -->
      <div class="app-sidebar">
        <div class="sidebar-header">
          <h3>文档大纲</h3>
        </div>
        <div class="sidebar-content">
          <div v-if="outlineItems.length === 0" class="empty-outline">
            <p>暂无大纲内容</p>
            <p class="empty-outline-tip">添加 # 标题 生成大纲</p>
          </div>
          <ul v-else class="outline-list">
            <li 
              v-for="item in outlineItems" 
              :key="item.id" 
              :class="{ 
                active: activeOutlineItem === item.id,
                [`level-${item.level}`]: true
              }"
              @click="scrollToHeading(item)"
            >
              <span>{{ item.text }}</span>
            </li>
          </ul>
        </div>
      </div>
      
      <!-- 编辑器内容区 -->
      <main class="app-content">
        <MarkdownEditor />
      </main>
    </div>
    
    <!-- 底部栏 -->
    <footer class="app-footer">
      <div class="footer-content">
        <div class="footer-left">
          <span>字数：{{ wordCount }} 行数：{{ lineCount }}</span>
        </div>
        <div class="footer-right">
          <span>© {{ new Date().getFullYear() }} Markdown编辑器 - 基于Vue3和TypeScript</span>
        </div>
      </div>
    </footer>
  </div>
</template>

<style>
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  overflow: hidden; /* 防止页面滚动 */
}

#app {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  padding-top: 50px; /* 为顶部栏留出空间 */
}

/* 主体区域样式 */
.app-main {
  flex: 1;
  display: flex;
  overflow: hidden;
  height: calc(100vh - 50px - 30px); /* 视口高度减去顶部栏和底部栏的高度 */
}

/* 侧边栏样式 */
.app-sidebar {
  width: 220px;
  min-width: 220px; /* 添加最小宽度确保不会缩小 */
  flex: 0 0 220px; /* 设置flex属性为0 0 auto，防止伸缩 */
  background-color: #fff;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 10;
  height: calc(100vh - 50px - 30px); /* 确保大纲占满整个可视区域高度 */
  box-sizing: border-box; /* 确保边框包含在宽度内 */
  position: fixed; /* 添加固定定位 */
  left: 0; /* 固定在左侧 */
  top: 50px; /* 固定在顶部栏下方 */
}

/* 侧边栏标题区域样式 */
.sidebar-header {
  padding: 10px 15px;
  border-bottom: 1px solid #e0e0e0;
  background-color: #f5f7fa;
  height: 42px; /* 与工具栏高度保持一致 */
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center; /* 居中显示 */
}

.sidebar-header h3 {
  margin: 0;
  font-size: 14px;
  color: #333;
  font-weight: bold; /* 加粗显示 */
  text-align: center; /* 文本居中 */
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden; /* 防止横向滚动 */
  border-top: none;
  scrollbar-width: thin; /* Firefox */
}

/* 为Webkit浏览器自定义滚动条样式 */
.sidebar-content::-webkit-scrollbar {
  width: 6px;
}

.sidebar-content::-webkit-scrollbar-thumb {
  background-color: #c1c1c1;
  border-radius: 3px;
}

.sidebar-content::-webkit-scrollbar-track {
  background-color: transparent;
}

/* 大纲列表样式 */
.outline-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.outline-list li {
  padding: 6px 15px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  font-size: 13px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.5;
}

.outline-list li:hover {
  background-color: #f5f7fa;
}

.outline-list li.active {
  background-color: #e6f7ff;
  color: #1890ff;
  border-right: 3px solid #1890ff;
}

/* 不同级别标题的缩进 */
.outline-list li.level-1 {
  font-weight: bold;
  font-size: 14px;
}

.outline-list li.level-2 {
  padding-left: 25px;
  font-size: 13px;
}

.outline-list li.level-3 {
  padding-left: 35px;
  font-size: 13px;
}

.outline-list li.level-4 {
  padding-left: 45px;
  font-size: 12px;
  color: #606266;
}

.outline-list li.level-5 {
  padding-left: 55px;
  font-size: 12px;
  color: #606266;
}

.outline-list li.level-6 {
  padding-left: 65px;
  font-size: 12px;
  color: #606266;
}

/* 空大纲提示 */
.empty-outline {
  padding: 30px 15px;
  text-align: center;
  color: #909399;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.empty-outline p {
  margin: 5px 0;
}

.empty-outline-tip {
  font-size: 12px;
  color: #c0c4cc;
  margin-top: 8px;
}

/* 编辑器内容区样式 */
.app-content {
  margin-left: 220px; /* 与侧边栏宽度相同 */
  flex: 1;
  position: relative;
  height: 100%;
  overflow: auto;
}

/* 底部栏样式 */
.app-footer {
  background-color: #fff;
  border-top: 1px solid #dcdfe6;
  padding: 5px 15px;
  font-size: 0.75rem;
  color: #909399;
  height: 30px; /* 固定底部栏高度 */
  box-sizing: border-box;
  display: flex;
  align-items: center;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-left {
  text-align: left;
}

.footer-right {
  text-align: right;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .app-sidebar {
    width: 200px;
  }
}

@media (max-width: 768px) {
  .app-sidebar {
    width: 180px;
  }
  
  .outline-list li {
    padding: 8px 10px;
    font-size: 12px;
  }
  
  .sidebar-header h3 {
    font-size: 14px;
  }
}

@media (max-width: 576px) {
  .app-sidebar {
    width: 160px;
  }
}
</style>
