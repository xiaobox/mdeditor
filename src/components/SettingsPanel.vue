<template>
  <div class="settings-panel" v-if="visible">
    <div class="settings-overlay" @click="$emit('close')"></div>
    <div class="settings-content">
      <div class="settings-header">
        <div class="header-content">
          <div class="header-icon">
            <svg viewBox="0 0 24 24" width="28" height="28">
              <path fill="currentColor" d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.22,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.22,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.68 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z"/>
            </svg>
          </div>
          <div class="header-text">
            <h2>设置</h2>
            <p>个性化定制您的编辑器体验</p>
          </div>
        </div>
        <button class="close-btn" @click="$emit('close')">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
          </svg>
        </button>
      </div>
      
      <div class="settings-body">
        <div class="settings-sections">
          <!-- 主题系统设置 -->
          <section class="settings-section">
            <div class="section-header">
              <div class="section-icon">
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="currentColor" d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z"/>
                </svg>
              </div>
              <h3>主题风格</h3>
            </div>

            <div class="theme-system-grid">
            <div
              v-for="themeSystem in layoutList"
              :key="themeSystem.id"
              class="theme-system-card"
              :class="{ active: selectedThemeSystemId === themeSystem.id }"
              @click="selectThemeSystem(themeSystem.id)"
            >
              <div class="theme-system-preview">
                <div class="theme-system-header">
                  <div class="theme-system-title">{{ themeSystem.name }}</div>
                  <div class="theme-system-colors">
                    <span
                      v-for="colorId in themeSystem.supportedColors.slice(0, 4)"
                      :key="colorId"
                      class="color-dot"
                      :style="{ backgroundColor: getColorPreview(colorId) }"
                    ></span>
                    <span v-if="themeSystem.supportedColors.length > 4" class="color-more">
                      +{{ themeSystem.supportedColors.length - 4 }}
                    </span>
                  </div>
                </div>
                <div class="theme-system-description">{{ themeSystem.description }}</div>
              </div>

              <div class="theme-system-check" v-if="selectedThemeSystemId === themeSystem.id">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="10" fill="var(--theme-primary, #10b981)"/>
                  <path d="M6 10l3 3 5-6" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
            </div>
          </div>
          </section>

          <!-- 主题色设置 -->
          <section class="settings-section">
            <div class="section-header">
              <div class="section-icon">
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="currentColor" d="M17.5,12A1.5,1.5 0 0,1 16,10.5A1.5,1.5 0 0,1 17.5,9A1.5,1.5 0 0,1 19,10.5A1.5,1.5 0 0,1 17.5,12M14.5,8A1.5,1.5 0 0,1 13,6.5A1.5,1.5 0 0,1 14.5,5A1.5,1.5 0 0,1 16,6.5A1.5,1.5 0 0,1 14.5,8M9.5,8A1.5,1.5 0 0,1 8,6.5A1.5,1.5 0 0,1 9.5,5A1.5,1.5 0 0,1 11,6.5A1.5,1.5 0 0,1 9.5,8M6.5,12A1.5,1.5 0 0,1 5,10.5A1.5,1.5 0 0,1 6.5,9A1.5,1.5 0 0,1 8,10.5A1.5,1.5 0 0,1 6.5,12M12,3A9,9 0 0,0 3,12A9,9 0 0,0 12,21A8.5,8.5 0 0,0 16.5,19C15.9,18.7 15.2,18.4 14.5,18.1C13.3,17.6 12,17 12,17C12,17 13.3,17.6 14.5,18.1C15.2,18.4 15.9,18.7 16.5,19A8.5,8.5 0 0,0 12,3Z"/>
                </svg>
              </div>
              <h3>主题色</h3>
            </div>

            <div class="theme-grid">
            <div
              v-for="theme in colorThemeList"
              :key="theme.id"
              class="theme-card"
              :class="{ active: selectedThemeId === theme.id }"
              @click="selectTheme(theme.id)"
            >
              <div class="theme-preview">
                <div class="theme-color-bar" :style="{ backgroundColor: theme.primary }"></div>
                <div class="theme-content">
                  <div class="theme-title" :style="{ color: theme.primary }">{{ theme.name }}</div>
                  <div class="theme-description">{{ theme.description }}</div>
                </div>
              </div>
              
              <div class="theme-check" v-if="selectedThemeId === theme.id">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="10" :fill="theme.primary"/>
                  <path d="M6 10l3 3 5-6" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
            </div>
          </div>
          </section>

          <!-- 代码样式设置 -->
          <section class="settings-section">
            <div class="section-header">
              <div class="section-icon">
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="currentColor" d="M8,3A2,2 0 0,0 6,5V9A2,2 0 0,1 4,11H3V13H4A2,2 0 0,1 6,15V19A2,2 0 0,0 8,21H10V19H8V14A2,2 0 0,0 6,12A2,2 0 0,0 8,10V5H10V3M16,3A2,2 0 0,1 18,5V9A2,2 0 0,0 20,11H21V13H20A2,2 0 0,0 18,15V19A2,2 0 0,1 16,21H14V19H16V14A2,2 0 0,1 18,12A2,2 0 0,1 16,10V5H14V3H16Z"/>
                </svg>
              </div>
              <h3>代码样式</h3>
            </div>

            <div class="code-style-grid">
            <div
              v-for="codeStyle in codeStyleList"
              :key="codeStyle.id"
              class="code-style-card"
              :class="{ active: selectedCodeStyleId === codeStyle.id }"
              @click="selectCodeStyle(codeStyle.id)"
            >
              <div class="code-style-preview">
                <div
                  class="code-preview-container"
                  :style="getCodeStylePreviewStyles(codeStyle.id)"
                >
                  <!-- 为Mac风格添加占位头部，保持布局一致 -->
                  <div class="code-preview-header" v-if="codeStyle.id === 'mac'" style="background: transparent; border: none; height: 32px;">
                    <div class="code-preview-lights">
                      <span class="light red"></span>
                      <span class="light yellow"></span>
                      <span class="light green"></span>
                    </div>
                  </div>
                  <!-- 其他主题的正常头部 -->
                  <div class="code-preview-header" v-else>
                    <span v-if="codeStyle.id === 'github'">📄</span>
                    <span v-else-if="codeStyle.id === 'vscode'">⚡</span>
                    <span v-else-if="codeStyle.id === 'terminal'">$</span>
                    {{ codeStyle.id === 'terminal' ? 'terminal' : '代码' }}
                  </div>
                  <div class="code-preview-content" :data-theme="codeStyle.id">
                    <span class="code-keyword">function</span> <span class="code-function">hello</span>() {<br>
                    &nbsp;&nbsp;<span class="code-keyword">return</span> <span class="code-string">"world"</span>;<br>
                    }
                  </div>
                </div>
              </div>
              
              <div class="code-style-info">
                <div class="code-style-name">{{ codeStyle.name }}</div>
                <div class="code-style-description">{{ codeStyle.description }}</div>
              </div>
              
              <div class="code-style-check" v-if="selectedCodeStyleId === codeStyle.id">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="10" fill="var(--theme-primary, #10b981)"/>
                  <path d="M6 10l3 3 5-6" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
            </div>
            </div>
          </section>
        </div>
      </div>
      
      <div class="settings-footer">
        <button 
          class="apply-button"
          :style="{ backgroundColor: currentColorTheme.primary, borderColor: currentColorTheme.primary }"
          @click="applySettings"
        >
          应用设置
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useGlobalThemeManager } from '../composables/index.js'
import { getCodeStyle } from '../core/theme/presets/code-styles.js'

// Props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['close', 'theme-system-changed', 'theme-changed', 'code-style-changed'])

// 使用统一主题管理器
const themeManager = useGlobalThemeManager()

// 解构所需功能
const {
  currentThemeSystemId: currentLayoutId,
  themeSystemList: layoutList,
  setThemeSystem: setLayout,
  currentColorThemeId,
  currentColorTheme,
  colorThemeList,
  setColorTheme,
  currentCodeStyleId,
  codeStyleList,
  setCodeStyle
} = themeManager

// 代码样式预览功能
const getCodeStylePreviewStyles = (styleId) => {
  const style = getCodeStyle(styleId)
  return {
    '--code-preview-bg': style.background,
    '--code-preview-color': style.color,
    '--code-preview-border': style.border || 'none',
    '--code-preview-radius': style.borderRadius,
    '--code-preview-padding': style.padding,
    '--code-preview-font-family': style.fontFamily,
    '--code-preview-font-size': style.fontSize,
    '--code-preview-line-height': style.lineHeight,
    '--code-preview-box-shadow': style.boxShadow || 'none'
  }
}

// 本地状态
const selectedThemeSystemId = ref(currentLayoutId.value)
const selectedThemeId = ref(currentColorThemeId.value)
const selectedCodeStyleId = ref(currentCodeStyleId.value)

// 方法
const selectThemeSystem = (systemId) => {
  selectedThemeSystemId.value = systemId
}

const selectTheme = (themeId) => {
  selectedThemeId.value = themeId
  // 立即应用选中主题的颜色到CSS变量，以便选中状态边框颜色实时更新
  // 获取完整的主题对象并临时应用，不保存到本地存储
  import('../core/theme/presets/color-themes.js').then(({ getColorTheme }) => {
    const fullTheme = getColorTheme(themeId)
    themeManager.cssManager.applyColorTheme(fullTheme)
  })
}

const selectCodeStyle = (styleId) => {
  selectedCodeStyleId.value = styleId
}

// 获取颜色预览
const getColorPreview = (colorId) => {
  const colorMap = {
    green: '#10b981',
    blue: '#3b82f6',
    red: '#ef4444',
    purple: '#8b5cf6',
    orange: '#f97316',
    pink: '#ec4899'
  }
  return colorMap[colorId] || '#10b981'
}

const applySettings = () => {
  let delay = 0

  // 应用布局主题系统
  if (selectedThemeSystemId.value !== currentLayoutId.value) {
    setLayout(selectedThemeSystemId.value)
    setTimeout(() => {
      emit('theme-system-changed', selectedThemeSystemId.value)
    }, delay)
    delay += 100 // 每个通知间隔100ms
  }

  // 应用颜色主题
  if (selectedThemeId.value !== currentColorThemeId.value) {
    setColorTheme(selectedThemeId.value)
    setTimeout(() => {
      emit('theme-changed', selectedThemeId.value)
    }, delay)
    delay += 100
  }

  // 应用代码样式
  if (selectedCodeStyleId.value !== currentCodeStyleId.value) {
    setCodeStyle(selectedCodeStyleId.value)
    setTimeout(() => {
      emit('code-style-changed', selectedCodeStyleId.value)
    }, delay)
  }

  emit('close')
}

// 监听props变化，重置选择状态
const resetSelections = () => {
  selectedThemeSystemId.value = currentLayoutId.value
  selectedThemeId.value = currentColorThemeId.value
  selectedCodeStyleId.value = currentCodeStyleId.value
  // 恢复当前主题的CSS变量
  themeManager.updateAllCSS()
}

// 当面板打开时重置选择
onMounted(() => {
  resetSelections()
})

// 监听visible变化，当面板打开时重置选择，关闭时恢复主题
watch(() => props.visible, (newVisible, oldVisible) => {
  if (newVisible) {
    resetSelections()
  } else if (oldVisible) {
    // 面板关闭时，恢复到当前保存的主题
    themeManager.updateAllCSS()
  }
})

// 暴露方法给父组件
defineExpose({
  resetSelections
})
</script>

<style scoped>
.settings-panel {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.settings-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.settings-content {
  position: relative;
  background: var(--theme-bg-primary);
  border-radius: 20px;
  box-shadow: 0 32px 80px rgba(0, 0, 0, 0.25);
  width: 95%;
  max-width: 1000px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--theme-border-light);
}

.settings-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32px 40px;
  background: linear-gradient(135deg, var(--theme-bg-secondary), var(--theme-bg-primary));
  border-bottom: 1px solid var(--theme-border-light);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.header-icon {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  position: relative;
  overflow: hidden;
}

.header-icon::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transform: rotate(45deg);
  animation: shimmer 3s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
  100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
}

.header-text h2 {
  margin: 0 0 4px 0;
  font-size: 24px;
  font-weight: 700;
  color: var(--theme-text-primary);
  letter-spacing: -0.5px;
}

.header-text p {
  margin: 0;
  font-size: 14px;
  color: var(--theme-text-secondary);
  font-weight: 500;
}

.close-btn {
  width: 44px;
  height: 44px;
  background: var(--theme-bg-tertiary);
  border: 1px solid var(--theme-border-light);
  border-radius: 12px;
  cursor: pointer;
  color: var(--theme-text-secondary);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.close-btn:hover {
  background: var(--theme-bg-secondary);
  color: var(--theme-text-primary);
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  border-color: var(--primary-color);
}

.settings-body {
  flex: 1;
  overflow-y: auto;
  padding: 40px;
  background: linear-gradient(135deg, var(--theme-bg-primary) 0%, var(--theme-bg-secondary) 100%);
}

.settings-sections {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.settings-section {
  background: var(--theme-bg-primary);
  border: 1px solid var(--theme-border-light);
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.settings-section:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border-color: var(--primary-color);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--theme-border-light);
}

.section-icon {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.section-icon::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transform: rotate(45deg);
  animation: shimmer 3s infinite;
}

.section-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--theme-text-primary);
  letter-spacing: -0.5px;
}

/* 主题系统网格样式 */
.theme-system-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 20px;
}

.theme-system-card {
  position: relative;
  background: var(--theme-bg-secondary);
  border: 1px solid var(--theme-border-light);
  border-radius: 16px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.theme-system-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  border-color: var(--primary-color);
}

.theme-system-card.active {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px var(--primary-color), 0 8px 32px rgba(0, 0, 0, 0.15);
  transform: translateY(-3px);
  background: linear-gradient(135deg, var(--theme-bg-secondary), var(--theme-bg-primary));
}

.theme-system-preview {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.theme-system-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.theme-system-title {
  font-weight: 700;
  font-size: 18px;
  color: var(--theme-text-primary);
  transition: all 0.3s ease;
  letter-spacing: -0.3px;
}

.theme-system-card:hover .theme-system-title {
  color: var(--primary-color);
}

.theme-system-colors {
  display: flex;
  align-items: center;
  gap: 6px;
}

.color-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid var(--theme-bg-primary);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.theme-system-card:hover .color-dot {
  transform: scale(1.1);
}

.color-more {
  font-size: 12px;
  color: var(--theme-text-secondary);
  margin-left: 4px;
  font-weight: 600;
}

.theme-system-description {
  font-size: 14px;
  color: var(--theme-text-secondary);
  line-height: 1.5;
  font-weight: 500;
}

.theme-system-check {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 10;
  background: var(--theme-bg-primary);
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  border: 2px solid var(--primary-color);
}

/* 主题色网格样式 */
.theme-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
}

.theme-card {
  position: relative;
  background: var(--theme-bg-secondary);
  border: 1px solid var(--theme-border-light);
  border-radius: 16px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.theme-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  border-color: var(--primary-color);
}

.theme-card.active {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px var(--primary-color), 0 8px 32px rgba(0, 0, 0, 0.15);
  transform: translateY(-3px);
  background: linear-gradient(135deg, var(--theme-bg-secondary), var(--theme-bg-primary));
}

.theme-preview {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.theme-color-bar {
  height: 6px;
  border-radius: 3px;
  width: 100%;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.theme-card:hover .theme-color-bar {
  height: 8px;
  transform: scaleX(1.02);
}

.theme-content {
  flex: 1;
}

.theme-title {
  font-weight: 700;
  font-size: 16px;
  margin-bottom: 6px;
  transition: all 0.3s ease;
  letter-spacing: -0.3px;
}

.theme-card:hover .theme-title {
  transform: translateX(3px);
}

.theme-description {
  font-size: 13px;
  color: var(--theme-text-secondary);
  font-weight: 500;
  line-height: 1.4;
}

.theme-check {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 10;
  background: var(--theme-bg-primary);
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  border: 2px solid var(--primary-color);
}

/* 代码样式网格样式 */
.code-style-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.code-style-card {
  position: relative;
  background: var(--theme-bg-secondary);
  border: 1px solid var(--theme-border-light);
  border-radius: 16px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.code-style-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  border-color: var(--primary-color);
}

.code-style-card.active {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px var(--primary-color), 0 8px 32px rgba(0, 0, 0, 0.15);
  transform: translateY(-3px);
  background: linear-gradient(135deg, var(--theme-bg-secondary), var(--theme-bg-primary));
}

.code-style-preview {
  margin-bottom: 16px;
}

.code-preview-container {
  position: relative;
  border-radius: var(--code-preview-radius, 6px);
  overflow: hidden;
  font-size: 12px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  background: var(--code-preview-bg, #f6f8fa);
  color: var(--code-preview-color, #24292f);
  border: var(--code-preview-border, none);
}

.code-preview-header {
  padding: 8px 12px;
  font-size: 11px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(0, 0, 0, 0.05);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

/* GitHub主题的头部样式 */
.code-preview-container[style*="#f6f8fa"] .code-preview-header {
  background: rgba(0, 0, 0, 0.05);
  color: #656d76;
}

/* VS Code主题的头部样式 */
.code-preview-container[style*="#1e1e1e"] .code-preview-header,
.code-preview-container[style*="linear-gradient"] .code-preview-header {
  background: rgba(255, 255, 255, 0.1);
  color: #cccccc;
  border-bottom: 1px solid #3c3c3c;
}

/* 终端主题的头部样式 */
.code-preview-container[style*="#000000"] .code-preview-header {
  background: rgba(0, 255, 0, 0.1);
  color: #00ff00;
  border-bottom: 1px solid #333333;
}

.code-preview-lights {
  display: flex;
  gap: 4px;
  align-items: center;
}

/* 当红绿灯在Mac头部内时的样式 */
.code-preview-header .code-preview-lights {
  position: static;
}

/* 当红绿灯是独立元素时的样式（保持向后兼容） */
.code-preview-container > .code-preview-lights {
  position: absolute;
  top: 14px;
  left: 12px;
  z-index: 1;
}

.light {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.light.red { background: #ff5f56; }
.light.yellow { background: #ffbd2e; }
.light.green { background: #27ca3f; }

.code-preview-content {
  padding: 12px;
  line-height: 1.4;
  margin-top: 0;
}

/* 默认代码样式 */
.code-keyword { color: #d73a49; }
.code-function { color: #6f42c1; }
.code-string { color: #032f62; }

/* 不同主题的预览样式 */
.code-preview-content[data-theme="mac"] .code-keyword {
  color: #ff7b72;
}

.code-preview-content[data-theme="mac"] .code-function {
  color: #d2a8ff;
}

.code-preview-content[data-theme="mac"] .code-string {
  color: #a5d6ff;
}

.code-preview-content[data-theme="github"] .code-keyword {
  color: #cf222e;
}

.code-preview-content[data-theme="github"] .code-function {
  color: #8250df;
}

.code-preview-content[data-theme="github"] .code-string {
  color: #0a3069;
}

.code-preview-content[data-theme="vscode"] .code-keyword {
  color: #569cd6;
}

.code-preview-content[data-theme="vscode"] .code-function {
  color: #dcdcaa;
}

.code-preview-content[data-theme="vscode"] .code-string {
  color: #ce9178;
}

.code-preview-content[data-theme="terminal"] .code-keyword {
  color: #00ffff;
}

.code-preview-content[data-theme="terminal"] .code-function {
  color: #00ff00;
}

.code-preview-content[data-theme="terminal"] .code-string {
  color: #ffff00;
}

.code-style-info {
  text-align: center;
}

.code-style-name {
  font-weight: 700;
  font-size: 16px;
  margin-bottom: 6px;
  color: var(--theme-text-primary);
  transition: all 0.3s ease;
  letter-spacing: -0.3px;
}

.code-style-card:hover .code-style-name {
  color: var(--primary-color);
  transform: translateY(-1px);
}

.code-style-description {
  font-size: 13px;
  color: var(--theme-text-secondary);
  font-weight: 500;
  line-height: 1.4;
}

.code-style-check {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 10;
  background: var(--theme-bg-primary);
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  border: 2px solid var(--primary-color);
}

.settings-footer {
  padding: 32px 40px;
  background: linear-gradient(135deg, var(--theme-bg-secondary), var(--theme-bg-primary));
  border-top: 1px solid var(--theme-border-light);
  display: flex;
  justify-content: flex-end;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
}

.apply-button {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
  color: white;
  border: none;
  padding: 16px 32px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
  letter-spacing: -0.3px;
}

.apply-button::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transform: rotate(45deg);
  transition: all 0.3s ease;
  opacity: 0;
}

.apply-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.apply-button:hover::before {
  opacity: 1;
  animation: shimmer 0.6s ease-in-out;
}

.apply-button:active {
  transform: translateY(0);
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .theme-system-grid,
  .theme-grid,
  .code-style-grid {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }
}

@media (max-width: 768px) {
  .settings-content {
    width: 95%;
    max-height: 95vh;
    border-radius: 16px;
  }

  .theme-system-grid,
  .theme-grid,
  .code-style-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .settings-body {
    padding: 24px;
  }

  .settings-sections {
    gap: 32px;
  }

  .settings-section {
    padding: 24px;
  }

  .section-header {
    gap: 12px;
    margin-bottom: 20px;
  }

  .section-icon {
    width: 40px;
    height: 40px;
  }

  .section-header h3 {
    font-size: 18px;
  }

  .settings-header {
    padding: 24px 32px;
  }

  .settings-footer {
    padding: 24px 32px;
  }

  .apply-button {
    padding: 14px 28px;
    font-size: 15px;
  }
}
</style>
