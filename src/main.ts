import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'

// 导入highlight.js样式 - 使用VS Code风格的主题
import 'highlight.js/styles/vs2015.css'

// 导入主题系统
import registerBuiltinThemes from './themes/register'
import './themes/styles/index.css'

// 注册内置主题
registerBuiltinThemes()

const app = createApp(App)

// 注册Element Plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(createPinia())
app.use(ElementPlus)

app.mount('#app')
