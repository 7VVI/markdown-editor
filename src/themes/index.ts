// 主题接口定义
export interface Theme {
  id: string;
  name: string;
  cssFile: string;
  variables: Record<string, string>;
  description?: string;
}

// 主题列表
const themes: Theme[] = [];

// 注册主题
export function registerTheme(theme: Theme): void {
  // 检查主题ID是否已存在
  const existingTheme = themes.find(t => t.id === theme.id);
  if (existingTheme) {
    console.warn(`主题 "${theme.id}" 已存在，将被覆盖`);
    const index = themes.findIndex(t => t.id === theme.id);
    themes[index] = theme;
  } else {
    themes.push(theme);
  }
}

// 获取所有主题
export function getAllThemes(): Theme[] {
  return [...themes];
}

// 获取特定主题
export function getTheme(themeId: string): Theme | undefined {
  return themes.find(theme => theme.id === themeId);
}

// 获取主题CSS变量
export function getThemeVariables(themeId: string): Record<string, string> {
  const theme = getTheme(themeId);
  return theme ? theme.variables : {};
}

// 应用主题到DOM
export function applyTheme(themeId: string, element: HTMLElement): void {
  const theme = getTheme(themeId);
  if (!theme) {
    console.error(`主题 "${themeId}" 不存在`);
    return;
  }
  
  // 移除所有主题类
  getAllThemes().forEach(t => {
    element.classList.remove(`theme-${t.id}`);
  });
  
  // 添加当前主题类
  element.classList.add(`theme-${theme.id}`);
  
  // 应用CSS变量
  Object.entries(theme.variables).forEach(([key, value]) => {
    element.style.setProperty(`--${key}`, value);
  });
}

// 导出默认主题列表
export default themes; 