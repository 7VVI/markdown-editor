<template>
  <el-dialog
    v-model="dialogVisible"
    title="微信公众号复制指南"
    :width="dialogWidth"
    :before-close="handleClose"
    top="5vh"
  >
    <div class="guide-content">
      <h3>如何将Markdown内容复制到微信公众号</h3>
      
      <el-alert
        title="已复制为富文本格式"
        type="success"
        :closable="false"
        show-icon
        style="margin-bottom: 15px;"
      >
        <p>您的内容已转换为带样式的富文本格式，可直接粘贴到微信公众号编辑器中</p>
      </el-alert>
      
      <ol>
        <li>在编辑器中编写或粘贴您的Markdown内容</li>
        <li>选择合适的主题样式（推荐使用"微信公众号样式"）</li>
        <li>点击工具栏中的"复制到微信公众号"按钮</li>
        <li>打开微信公众号编辑页面</li>
        <li>直接使用Ctrl+V（或Command+V）粘贴内容</li>
        <li>检查并调整格式（如有必要）</li>
      </ol>
      
      <el-alert
        title="注意事项"
        type="warning"
        :closable="false"
        show-icon
      >
        <p>1. 微信公众号对某些样式有限制，可能需要手动调整部分格式</p>
        <p>2. 复杂的表格和代码块可能需要额外调整</p>
        <p>3. 图片需要在微信公众号后台上传，无法直接复制外部图片链接</p>
      </el-alert>
      
      <h4>常见问题</h4>
      
      <el-collapse>
        <el-collapse-item title="如果样式没有完全保留怎么办？" name="1">
          <p>如果直接粘贴后样式丢失，可以尝试以下方法：</p>
          <ol>
            <li>确保使用最新版本的浏览器</li>
            <li>尝试使用微信公众号的"插入代码"功能（点击右上角"..."菜单）</li>
            <li>对于重要的格式，可以在微信公众号编辑器中手动调整</li>
          </ol>
        </el-collapse-item>
        <el-collapse-item title="为什么我的表格样式异常？" name="2">
          <p>微信公众号对表格支持有限。如果表格样式异常，建议在微信公众号编辑器中重新创建表格，或使用截图方式插入表格。</p>
        </el-collapse-item>
        <el-collapse-item title="如何调整图片大小？" name="3">
          <p>复制后，在微信公众号编辑器中点击图片，可以通过拖拽调整大小或使用编辑器提供的图片设置选项。</p>
        </el-collapse-item>
        <el-collapse-item title="代码块格式异常怎么办？" name="4">
          <p>微信公众号对代码块支持有限。建议复制后，选中代码块，使用微信公众号编辑器的"代码块"功能重新设置。</p>
        </el-collapse-item>
        <el-collapse-item title="如何获得最佳复制效果？" name="5">
          <p>为获得最佳复制效果，建议：</p>
          <ul>
            <li>复制前选择"微信公众号样式"主题</li>
            <li>使用Chrome或Edge等现代浏览器</li>
            <li>对于复杂内容，考虑分段复制粘贴</li>
          </ul>
        </el-collapse-item>
      </el-collapse>
    </div>
    
    <template #footer>
      <span class="dialog-footer">
        <el-checkbox v-model="dontShowAgain">不再显示</el-checkbox>
        <el-button @click="dialogVisible = false">关闭</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'dontShowAgain'): void
}>()

const dialogVisible = ref(props.visible)
const dontShowAgain = ref(false)

// 监听visible属性变化
watch(() => props.visible, (newVal) => {
  dialogVisible.value = newVal
})

// 监听对话框状态变化
watch(dialogVisible, (newVal) => {
  emit('update:visible', newVal)
})

// 监听"不再显示"选项
watch(dontShowAgain, (newVal) => {
  if (newVal) {
    emit('dontShowAgain')
  }
})

// 关闭对话框
function handleClose() {
  dialogVisible.value = false
  if (dontShowAgain.value) {
    emit('dontShowAgain')
  }
}

// 根据屏幕宽度计算对话框宽度
const dialogWidth = computed(() => {
  return window.innerWidth < 768 ? '90%' : '50%'
})
</script>

<style scoped>
.guide-content {
  padding: 0 20px;
}

.guide-content h3 {
  margin-top: 0;
  color: #409eff;
}

.guide-content ol {
  padding-left: 20px;
}

.guide-content li {
  margin-bottom: 10px;
}

.guide-content h4 {
  margin-top: 20px;
}

.dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

@media (max-width: 768px) {
  .guide-content {
    padding: 0 10px;
  }
  
  .guide-content ol {
    padding-left: 16px;
  }
  
  .dialog-footer {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
}
</style> 