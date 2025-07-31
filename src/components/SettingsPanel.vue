<template>
  <div class="settings-panel" :class="{ 'disable-hover': showColorPicker }" v-if="visible">
    <div class="settings-overlay" @click="$emit('close')" v-show="!showColorPicker"></div>
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
            <!-- 内置主题 -->
            <div
              v-for="theme in builtinColorThemes"
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

            <!-- 自定义颜色选择器 -->
            <div
              class="theme-card custom-color-card"
              :class="{ active: isCustomColorActive }"
              @click="toggleColorPicker"
            >
              <div class="custom-color-preview">
                <!-- 动态渐变背景 -->
                <div
                  class="custom-gradient-bg"
                  :style="isCustomColorActive && currentCustomColor ?
                    { background: `linear-gradient(135deg, ${currentCustomColor} 0%, ${adjustColorBrightness(currentCustomColor, 0.7)} 100%)` } :
                    {}"
                ></div>

                <!-- 内容区域 -->
                <div class="custom-content">
                  <div class="custom-icon">
                    <svg viewBox="0 0 24 24" width="18" height="18">
                      <path fill="currentColor" d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z"/>
                    </svg>
                  </div>
                  <div class="custom-text">
                    <div class="custom-title">自定义颜色</div>
                    <div class="custom-subtitle">选择任意颜色</div>
                  </div>
                </div>

                <!-- 选中状态指示器 -->
                <div v-if="isCustomColorActive" class="custom-check-indicator">
                  <!-- 如果有自定义颜色，显示颜色圆圈 + 勾选 -->
                  <div
                    v-if="currentCustomColor"
                    class="color-check-combo"
                    :style="{ backgroundColor: currentCustomColor }"
                  >
                    <svg viewBox="0 0 24 24" width="12" height="12">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="white"/>
                    </svg>
                  </div>
                  <!-- 如果没有自定义颜色，显示普通勾选 -->
                  <div v-else class="simple-check">
                    <svg viewBox="0 0 24 24" width="14" height="14">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="white"/>
                    </svg>
                  </div>
                </div>
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

          <!-- 字体设置 -->
          <section class="settings-section">
            <div class="section-header">
              <div class="section-icon">
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="currentColor" d="M9,4V7H14V4H16V7H17A1,1 0 0,1 18,8V18A1,1 0 0,1 17,19H7A1,1 0 0,1 6,18V8A1,1 0 0,1 7,7H8V4H9M8,9V17H16V9H8Z"/>
                </svg>
              </div>
              <h3>字体设置</h3>
            </div>

            <!-- 字体族选择 -->
            <div class="font-setting-group">
              <label class="font-setting-label">字体族</label>
              <div class="font-family-grid">
                <div
                  v-for="font in fontFamilyList"
                  :key="font.id"
                  class="font-family-card"
                  :class="{ active: selectedFontFamily === font.id }"
                  @click="selectFontFamily(font.id)"
                >
                  <div class="font-family-preview" :style="getFontPreviewStyle(font.id)">
                    <div class="font-preview-text">Aa 字体</div>
                  </div>
                  <div class="font-family-info">
                    <div class="font-family-name">{{ font.name }}</div>
                    <div class="font-family-description">{{ font.description }}</div>
                  </div>
                  <div class="font-family-check" v-if="selectedFontFamily === font.id">
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                      <circle cx="10" cy="10" r="10" fill="var(--theme-primary, #10b981)"/>
                      <path d="M6 10l3 3 5-6" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- 字号设置 -->
          <section class="settings-section">
            <div class="section-header">
              <div class="section-icon">
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="currentColor" d="M11,7A2,2 0 0,1 13,9V17A2,2 0 0,1 11,19H9A2,2 0 0,1 7,17V9A2,2 0 0,1 9,7H11M9,9V17H11V9H9M12,2A2,2 0 0,1 14,4V6H12V4H10V6H8V4A2,2 0 0,1 10,2H12Z"/>
                </svg>
              </div>
              <h3>字号设置</h3>
            </div>

            <div class="font-setting-group">
              <!-- 字号设置卡片 -->
              <div class="font-size-card">
                <!-- 顶部控制区 -->
                <div class="font-size-top-section">
                  <!-- 左侧滑块区域 -->
                  <div class="font-size-slider-area">
                    <input
                      type="range"
                      class="font-size-slider"
                      :min="fontSizeRange.min"
                      :max="fontSizeRange.max"
                      :step="fontSizeRange.step"
                      v-model.number="selectedFontSize"
                    />
                    <div class="font-size-marks">
                      <span v-for="mark in fontSizeMarks" :key="mark" class="font-size-mark">{{ mark }}</span>
                    </div>
                  </div>

                  <!-- 右侧预览区域 -->
                  <div class="font-size-preview-area">
                    <div class="preview-display">
                      <div class="preview-info">
                        <span class="current-size">{{ selectedFontSize }}</span>
                        <span class="size-unit">px</span>
                      </div>
                      <div
                        class="preview-char"
                        :style="getFontSizePreviewStyle()"
                      >
                        文
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 字号预设 -->
              <div class="font-size-presets">
                <button
                  v-for="preset in fontSizePresets"
                  :key="preset.value"
                  class="font-size-preset-btn"
                  :class="{ active: selectedFontSize === preset.value }"
                  @click="selectedFontSize = preset.value"
                >
                  {{ preset.label }}
                </button>
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

    <!-- 颜色选择器弹窗 - 与设置面板平级 -->
    <div v-if="showColorPicker" class="color-picker-overlay" @click="closeColorPicker">
      <div class="color-picker-modal" @click.stop>
        <ColorPicker
          :initial-color="selectedCustomColor"
          @confirm="onColorConfirm"
          @cancel="closeColorPicker"
          @color-change="onColorChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useGlobalThemeManager } from '../composables/index.js'
import { getCodeStyle } from '../core/theme/presets/code-styles.js'
import { getColorThemeList } from '../core/theme/presets/color-themes.js'
import { fontSizeOptions, fontSettingsUtils } from '../core/theme/presets/font-settings.js'
import ColorPicker from './ColorPicker.vue'

// Props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['close', 'show-notification'])

// 使用统一主题管理器
const themeManager = useGlobalThemeManager()

// 解构所需功能
const {
  currentThemeSystemId: currentLayoutId,
  themeSystemList: layoutList,
  setThemeSystem: setLayout,
  currentColorThemeId,
  currentColorTheme,
  setColorTheme,
  currentCodeStyleId,
  codeStyleList,
  setCodeStyle,
  currentFontFamily,
  currentFontSize,
  currentFontSettings,
  fontFamilyList,
  setFontFamily,
  setFontSize
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
const selectedFontFamily = ref(currentFontFamily.value)
const selectedFontSize = ref(currentFontSize.value)
const showColorPicker = ref(false)
const selectedCustomColor = ref('#3b82f6')
const currentCustomColor = ref('#3b82f6')
const isUsingCustomColor = ref(false)
const currentCustomTheme = ref(null)

// 保存面板打开时的初始设置，用于应用设置时的比较
const initialFontFamily = ref(currentFontFamily.value)
const initialFontSize = ref(currentFontSize.value)
const initialCustomColor = ref('#3b82f6')
const initialIsUsingCustomColor = ref(false)

// 字体相关的计算属性和数据
const fontSizeRange = computed(() => ({
  min: fontSizeOptions.min,
  max: fontSizeOptions.max,
  step: fontSizeOptions.step
}))

const fontSizeMarks = computed(() => [
  fontSizeOptions.min,
  Math.floor((fontSizeOptions.min + fontSizeOptions.max) / 2),
  fontSizeOptions.max
])

const fontSizePresets = computed(() => fontSizeOptions.presets)

// 计算属性
const builtinColorThemes = computed(() => getColorThemeList())

// 检查是否正在使用自定义颜色
const isCustomColorActive = computed(() => isUsingCustomColor.value)

// 方法
const selectThemeSystem = (systemId) => {
  selectedThemeSystemId.value = systemId
}

const selectTheme = (themeId) => {
  selectedThemeId.value = themeId
  isUsingCustomColor.value = false
  currentCustomTheme.value = null

  // 清除临时自定义颜色和标记
  try {
    localStorage.removeItem('temp-custom-color')
    localStorage.removeItem('temp-custom-theme')

    // 清除临时主题标记
    if (themeManager.themeState) {
      themeManager.themeState.hasTemporaryCustomTheme = false
    }
  } catch (error) {
    console.warn('Failed to clear custom color from localStorage:', error)
  }

  // 立即应用选中主题的颜色到CSS变量，以便选中状态边框颜色实时更新
  import('../core/theme/presets/color-themes.js').then(({ getColorTheme }) => {
    const fullTheme = getColorTheme(themeId)
    if (fullTheme) {
      themeManager.cssManager.applyColorTheme(fullTheme)
    }
  })
}

const selectCodeStyle = (styleId) => {
  selectedCodeStyleId.value = styleId
}

const selectFontFamily = (fontId) => {
  selectedFontFamily.value = fontId
}



// 字体预览相关方法
const getFontPreviewStyle = (fontId) => {
  return fontSettingsUtils.getPreviewStyle(fontId, 14)
}

// 字号预览样式
const getFontSizePreviewStyle = () => {
  const fontFamily = fontSettingsUtils.getFontFamily(selectedFontFamily.value)
  return {
    fontFamily: fontFamily ? fontFamily.value : 'inherit',
    fontSize: `${selectedFontSize.value}px`,
    lineHeight: '1.2',
    transition: 'all 0.2s ease'
  }
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

  // 设置标志位，防止watch监听器重复应用字体设置
  isApplyingSettings.value = true

  // 应用布局主题系统
  if (selectedThemeSystemId.value !== currentLayoutId.value) {
    setLayout(selectedThemeSystemId.value)
    setTimeout(() => {
      const systemName = selectedThemeSystemId.value === 'default' ? '默认主题' : '主题系统'
      emit('show-notification', `主题风格已更新为${systemName}`, 'success')
    }, delay)
    delay += 100 // 每个通知间隔100ms
  }

  // 应用颜色主题（内置主题）
  if (!isUsingCustomColor.value && selectedThemeId.value !== currentColorThemeId.value) {
    setColorTheme(selectedThemeId.value)
    setTimeout(() => {
      emit('show-notification', '主题色已更新', 'success')
    }, delay)
    delay += 100
  }

  // 应用自定义颜色主题 - 只在实际发生变化时显示通知
  const customColorChanged = (
    (isUsingCustomColor.value !== initialIsUsingCustomColor.value) ||
    (isUsingCustomColor.value && currentCustomColor.value !== initialCustomColor.value)
  )

  if (customColorChanged && isUsingCustomColor.value && currentCustomColor.value) {
    setTimeout(() => {
      emit('show-notification', `自定义颜色主题已应用 (${currentCustomColor.value})`, 'success')
    }, delay)
    delay += 100
  }

  // 应用代码样式
  if (selectedCodeStyleId.value !== currentCodeStyleId.value) {
    setCodeStyle(selectedCodeStyleId.value)
    setTimeout(() => {
      const styleName = selectedCodeStyleId.value === 'mac' ? 'Mac 风格' :
                       selectedCodeStyleId.value === 'github' ? 'GitHub 风格' :
                       selectedCodeStyleId.value === 'vscode' ? 'VS Code 风格' :
                       selectedCodeStyleId.value === 'terminal' ? '终端风格' : '代码样式'
      emit('show-notification', `代码样式已更新为${styleName}`, 'success')
    }, delay)
    delay += 100 // 增加延迟，确保通知不重叠
  }

  // 应用字体设置 - 与面板打开时的初始值比较
  let fontFamilyChanged = false
  let fontSizeChanged = false

  if (selectedFontFamily.value !== initialFontFamily.value) {
    setFontFamily(selectedFontFamily.value)
    fontFamilyChanged = true
  }
  if (selectedFontSize.value !== initialFontSize.value) {
    setFontSize(selectedFontSize.value)
    fontSizeChanged = true
  }

  // 分别处理字体族和字号的通知
  if (fontFamilyChanged) {
    setTimeout(() => {
      const fontName = fontFamilyList.value.find(f => f.id === selectedFontFamily.value)?.name || '字体'
      emit('show-notification', `字体族已更新为${fontName}`, 'success')
    }, delay)
    delay += 100
  }

  if (fontSizeChanged) {
    setTimeout(() => {
      emit('show-notification', `字号已更新为${selectedFontSize.value}px`, 'success')
    }, delay)
    delay += 100
  }

  // 重置标志位
  setTimeout(() => {
    isApplyingSettings.value = false
  }, delay + 100)

  // 如果使用自定义颜色，在所有设置应用后重新应用自定义主题
  if (isUsingCustomColor.value && currentCustomTheme.value) {
    setTimeout(() => {
      // 重新设置临时主题标记
      if (themeManager.themeState) {
        themeManager.themeState.hasTemporaryCustomTheme = true
      }

      // 重新应用自定义主题（只应用颜色，不触发额外事件）
      themeManager.cssManager.forceApplyColorTheme(currentCustomTheme.value)

      // 触发自定义主题变化事件，通知PreviewPane等组件更新
      window.dispatchEvent(new CustomEvent('custom-theme-changed', {
        detail: { theme: currentCustomTheme.value, color: currentCustomColor.value }
      }))
    }, delay + 50) // 稍微延迟以确保其他设置先应用
  }

  emit('close')
}

// 颜色处理辅助函数
const adjustColorBrightness = (color, factor) => {
  if (!color) return color

  // 处理十六进制颜色
  if (color.startsWith('#')) {
    const hex = color.slice(1)
    const num = parseInt(hex, 16)
    const r = Math.round((num >> 16) * factor)
    const g = Math.round(((num >> 8) & 0x00FF) * factor)
    const b = Math.round((num & 0x0000FF) * factor)
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
  }

  return color
}

// 自定义颜色相关方法
const toggleColorPicker = () => {
  showColorPicker.value = !showColorPicker.value
}

const closeColorPicker = () => {
  showColorPicker.value = false
}

const onColorChange = (color) => {
  selectedCustomColor.value = color
}

const onColorConfirm = async (color) => {
  try {
    // 导入颜色生成器来创建临时主题
    const { ColorThemeGenerator } = await import('../core/theme/presets/color-themes.js')
    const tempTheme = ColorThemeGenerator.generateThemeColors(color)

    // 创建完整的主题对象
    const customTheme = {
      id: 'temp-custom',
      name: '自定义颜色',
      description: '临时自定义颜色',
      ...tempTheme
    }

    // 设置状态
    currentCustomColor.value = color
    currentCustomTheme.value = customTheme // 保存自定义主题引用
    isUsingCustomColor.value = true
    selectedThemeId.value = null // 清除选中的内置主题
    showColorPicker.value = false

    // 保存到localStorage以便刷新后恢复
    try {
      localStorage.setItem('temp-custom-color', color)
      localStorage.setItem('temp-custom-theme', JSON.stringify(customTheme))
    } catch (error) {
      console.warn('Failed to save custom color to localStorage:', error)
    }

    // 设置临时主题标记
    if (themeManager.themeState) {
      themeManager.themeState.hasTemporaryCustomTheme = true
    }

    // 立即应用自定义主题
    themeManager.cssManager.forceApplyColorTheme(customTheme)

    // 触发自定义主题变化事件，通知其他组件
    window.dispatchEvent(new CustomEvent('custom-theme-changed', {
      detail: { theme: customTheme, color }
    }))

    // 不在这里发送通知，而是在applySettings中统一发送

  } catch (error) {
    console.error('Failed to apply custom color:', error)
    emit('show-notification', '应用自定义颜色失败，请重试', 'error')
  }
}

// 监听props变化，重置选择状态
const resetSelections = () => {
  selectedThemeSystemId.value = currentLayoutId.value
  selectedCodeStyleId.value = currentCodeStyleId.value
  // 使用字体设置的ID而不是对象
  selectedFontFamily.value = currentFontSettings.value.fontFamily
  selectedFontSize.value = currentFontSettings.value.fontSize

  // 更新初始设置值
  initialFontFamily.value = currentFontSettings.value.fontFamily
  initialFontSize.value = currentFontSettings.value.fontSize

  showColorPicker.value = false

  // 检查是否有临时自定义主题
  try {
    const tempTheme = localStorage.getItem('temp-custom-theme')
    const tempColor = localStorage.getItem('temp-custom-color')

    if (tempTheme && tempColor) {
      // 有自定义主题，设置自定义状态
      currentCustomTheme.value = JSON.parse(tempTheme)
      currentCustomColor.value = tempColor
      isUsingCustomColor.value = true
      selectedThemeId.value = null // 清除内置主题选择
      // 记录初始自定义颜色状态
      initialCustomColor.value = tempColor
      initialIsUsingCustomColor.value = true
    } else {
      // 没有自定义主题，使用内置主题
      selectedThemeId.value = currentColorThemeId.value
      isUsingCustomColor.value = false
      currentCustomTheme.value = null
      // 记录初始状态
      initialIsUsingCustomColor.value = false
    }
  } catch (error) {
    console.warn('Failed to restore custom theme state:', error)
    // 出错时使用内置主题
    selectedThemeId.value = currentColorThemeId.value
    isUsingCustomColor.value = false
    currentCustomTheme.value = null
    initialIsUsingCustomColor.value = false
  }

  // 只有在没有临时自定义主题时才恢复CSS变量
  if (!isUsingCustomColor.value) {
    themeManager.updateAllCSS()
  }
}

// 当面板打开时重置选择
onMounted(() => {
  resetSelections()
})

// 监听字体设置变化，实时应用到预览（不显示通知）
// 添加标志位防止重复应用
const isApplyingSettings = ref(false)

// 暂时禁用实时预览的watch监听器，避免与applySettings冲突
// watch([selectedFontFamily, selectedFontSize], ([newFamily, newSize], [oldFamily, oldSize]) => {
//   if (props.visible && !isApplyingSettings.value && (newFamily !== oldFamily || newSize !== oldSize)) {
//     // 实时预览逻辑已暂时禁用
//   }
// }, { immediate: false })

// 监听visible变化，当面板打开时重置选择，关闭时恢复主题
watch(() => props.visible, (newVisible, oldVisible) => {
  if (newVisible) {
    resetSelections()
  } else if (oldVisible) {
    // 面板关闭时，只有在没有使用自定义主题时才恢复主题
    // 如果使用自定义主题，保持当前状态不变
    if (!themeManager.themeState.hasTemporaryCustomTheme) {
      themeManager.updateAllCSS()
    }
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

/* 主题选中状态指示器 */
.theme-check {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
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

/* 自定义颜色卡片样式 */
.custom-color-card {
  position: relative;
  overflow: hidden;
}

.custom-color-preview {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 16px;
  border-radius: 12px;
  overflow: hidden;
}

.custom-gradient-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg,
    #667eea 0%,
    #764ba2 25%,
    #f093fb 50%,
    #f5576c 75%,
    #4facfe 100%);
  background-size: 300% 300%;
  animation: gradientShift 8s ease infinite;
  opacity: 0.9;
}

.custom-color-card.active .custom-gradient-bg {
  opacity: 1;
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.custom-content {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 12px;
  color: white;
}

.custom-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.custom-icon svg {
  opacity: 0.9;
}

.custom-text {
  flex: 1;
}

.custom-title {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 2px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.custom-subtitle {
  font-size: 12px;
  opacity: 0.9;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

/* 选中状态指示器 */
.custom-check-indicator {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 3;
}

.color-check-combo {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
}

.simple-check {
  width: 22px;
  height: 22px;
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

/* 悬停效果 */
.custom-color-card:hover .custom-gradient-bg {
  animation-duration: 4s;
  opacity: 1;
}

.custom-color-card:hover .custom-icon {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
  transition: all 0.3s ease;
}

/* 选中状态 */
.custom-color-card.active {
  border-color: rgba(255, 255, 255, 0.6);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.custom-color-card.active .custom-icon {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
}

.custom-color-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}

.custom-color-card .theme-title {
  color: white !important;
}

.custom-color-card .theme-description {
  color: rgba(255, 255, 255, 0.8);
}



/* 禁用hover效果的类 - 当颜色选择器打开时 */
.settings-panel.disable-hover .close-btn:hover,
.settings-panel.disable-hover .settings-section:hover,
.settings-panel.disable-hover .theme-system-card:hover,
.settings-panel.disable-hover .theme-card:hover,
.settings-panel.disable-hover .code-style-card:hover,
.settings-panel.disable-hover .custom-color-card:hover,
.settings-panel.disable-hover .apply-button:hover {
  transform: none !important;
  box-shadow: inherit !important;
  border-color: inherit !important;
  background: inherit !important;
  color: inherit !important;
}

.settings-panel.disable-hover .theme-system-card:hover .theme-system-title,
.settings-panel.disable-hover .theme-card:hover .theme-title,
.settings-panel.disable-hover .code-style-card:hover .code-style-name {
  transform: none !important;
  color: inherit !important;
}

.settings-panel.disable-hover .theme-system-card:hover .color-dot,
.settings-panel.disable-hover .theme-card:hover .theme-color-bar {
  transform: none !important;
  height: inherit !important;
}

.settings-panel.disable-hover .custom-color-card:hover .custom-gradient-bg {
  animation: none !important;
  opacity: inherit !important;
}

.settings-panel.disable-hover .custom-color-card:hover .custom-icon {
  background: inherit !important;
  transform: none !important;
}

.settings-panel.disable-hover .apply-button:hover::before {
  opacity: 0 !important;
  animation: none !important;
}

/* 颜色选择器弹窗样式 */
.color-picker-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  /* 禁用底层的指针事件，防止hover效果穿透 */
  backdrop-filter: blur(2px);
}

.color-picker-modal {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  max-width: 90vw;
  max-height: 90vh;
  overflow: auto;
}

/* 字体设置样式 */
.font-setting-group {
  margin-bottom: 32px;
}

.font-setting-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--theme-text-primary);
  margin-bottom: 16px;
}

/* 字体族网格 */
.font-family-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.font-family-card {
  background: var(--theme-bg-secondary);
  border: 2px solid var(--theme-border-light);
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.font-family-card:hover {
  border-color: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.font-family-card.active {
  border-color: var(--primary-color);
  background: var(--primary-light);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.font-family-preview {
  margin-bottom: 12px;
  padding: 8px;
  background: var(--theme-bg-primary);
  border-radius: 8px;
  text-align: center;
}

.font-preview-text {
  font-size: 16px;
  color: var(--theme-text-primary);
}

.font-family-info {
  text-align: center;
}

.font-family-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--theme-text-primary);
  margin-bottom: 4px;
}

.font-family-description {
  font-size: 12px;
  color: var(--theme-text-secondary);
}

.font-family-check {
  position: absolute;
  top: 8px;
  right: 8px;
  background: white;
  border-radius: 50%;
  padding: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 字号设置卡片 - 全新设计 */
.font-size-card {
  background: var(--theme-bg-secondary);
  border-radius: 16px;
  border: 1px solid var(--theme-border-light);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  padding: 24px;
  margin-bottom: 18px;
}

/* 顶部控制区 - 左右布局 */
.font-size-top-section {
  display: flex;
  gap: 32px;
  align-items: center;
}

/* 左侧滑块区域 */
.font-size-slider-area {
  flex: 2;
  min-width: 300px;
}

/* 右侧预览区域 */
.font-size-preview-area {
  flex: 1;
  min-width: 180px;
}

/* 滑块样式 */
.font-size-slider {
  width: 100%;
  height: 8px;
  border-radius: 4px;
  background: var(--theme-bg-tertiary);
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  cursor: pointer;
}

.font-size-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--primary-color);
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
  transition: all 0.2s ease;
  border: 3px solid white;
}

.font-size-slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

.font-size-slider::-moz-range-thumb {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--primary-color);
  cursor: pointer;
  border: 3px solid white;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
  transition: all 0.2s ease;
}

.font-size-slider::-moz-range-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

/* 预览显示区域 */
.preview-display {
  background: linear-gradient(135deg,
    white 0%,
    rgba(248, 250, 252, 0.8) 100%);
  border-radius: 14px;
  border: 1.5px solid var(--theme-border-light);
  padding: 24px 20px;
  text-align: center;
  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.preview-display::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 50% 0%,
    rgba(16, 185, 129, 0.03) 0%,
    transparent 50%);
  pointer-events: none;
}

.preview-display:hover {
  border-color: var(--primary-color);
  box-shadow:
    0 4px 16px rgba(16, 185, 129, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  transform: translateY(-1px);
}

/* 预览信息 */
.preview-info {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 6px;
  margin-bottom: 18px;
  position: relative;
  z-index: 1;
}

.current-size {
  font-size: 20px;
  font-weight: 800;
  color: var(--primary-color);
  font-family: 'SF Mono', Monaco, Consolas, monospace;
  text-shadow: 0 1px 2px rgba(16, 185, 129, 0.1);
  transition: all 0.2s ease;
}

.size-unit {
  font-size: 13px;
  font-weight: 600;
  color: var(--theme-text-secondary);
  font-family: 'SF Mono', Monaco, Consolas, monospace;
  opacity: 0.8;
}

/* 预览字符 */
.preview-char {
  color: var(--theme-text-primary);
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  line-height: 1;
  position: relative;
  z-index: 1;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.font-size-marks {
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
  padding: 0 12px;
}

.font-size-mark {
  font-size: 12px;
  color: var(--theme-text-tertiary);
  user-select: none;
  font-weight: 600;
  opacity: 0.8;
  transition: all 0.2s ease;
  font-family: 'SF Mono', Monaco, Consolas, monospace;
  background: var(--theme-bg-tertiary);
  padding: 4px 8px;
  border-radius: 6px;
  border: 1px solid var(--theme-border-light);
  min-width: 24px;
  text-align: center;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.font-size-mark:hover {
  opacity: 1;
  color: var(--primary-color);
  border-color: var(--primary-color);
  background: rgba(16, 185, 129, 0.05);
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(16, 185, 129, 0.15);
}

.font-size-mark::before {
  content: '';
  position: absolute;
  top: -16px;
  left: 50%;
  transform: translateX(-50%);
  width: 2px;
  height: 6px;
  background: var(--theme-text-tertiary);
  opacity: 0.4;
  border-radius: 1px;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .font-size-top-section {
    flex-direction: column;
    gap: 24px;
  }

  .font-size-slider-area {
    min-width: unset;
    width: 100%;
  }

  .font-size-preview-area {
    min-width: unset;
    width: 100%;
    max-width: 200px;
    align-self: center;
  }
}

@media (max-width: 768px) {
  .font-size-card {
    padding: 20px;
  }

  .font-size-top-section {
    gap: 20px;
  }

  .preview-display {
    padding: 16px;
  }

  .current-size {
    font-size: 16px;
  }
}

/* 字号预设 - 精致按钮设计 */
.font-size-presets {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 20px;
}

.font-size-preset-btn {
  padding: 10px 16px;
  border: 1.5px solid var(--theme-border);
  border-radius: 10px;
  background: linear-gradient(135deg,
    white 0%,
    var(--theme-bg-secondary) 100%);
  color: var(--theme-text-secondary);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;
  position: relative;
  box-shadow:
    0 2px 4px rgba(0, 0, 0, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
  min-width: 80px;
  text-align: center;
}

.font-size-preset-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 9px;
  background: linear-gradient(135deg,
    rgba(16, 185, 129, 0.1) 0%,
    transparent 100%);
  opacity: 0;
  transition: opacity 0.25s ease;
}

.font-size-preset-btn:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
  background: linear-gradient(135deg,
    var(--theme-bg-tertiary) 0%,
    white 100%);
  transform: translateY(-1px);
  box-shadow:
    0 4px 12px rgba(16, 185, 129, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.font-size-preset-btn:hover::before {
  opacity: 1;
}

.font-size-preset-btn.active {
  background: linear-gradient(135deg,
    var(--primary-color) 0%,
    var(--primary-dark, #059669) 100%);
  color: white;
  border-color: var(--primary-color);
  transform: translateY(-1px);
  box-shadow:
    0 4px 16px rgba(16, 185, 129, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.font-size-preset-btn.active::before {
  background: linear-gradient(135deg,
    rgba(255, 255, 255, 0.1) 0%,
    transparent 100%);
  opacity: 1;
}

.font-size-preset-btn:active {
  transform: translateY(0);
}



/* 字体预览 */
.font-preview-container {
  background: var(--theme-bg-secondary);
  border: 1px solid var(--theme-border-light);
  border-radius: 12px;
  padding: 24px;
}

.font-preview-sample h3 {
  margin: 0 0 16px 0;
  color: var(--theme-text-primary);
}

.font-preview-sample p {
  margin: 0 0 16px 0;
  color: var(--theme-text-primary);
  line-height: 1.6;
}

.font-preview-sample code {
  background: var(--theme-bg-tertiary);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.9em;
  color: var(--theme-text-primary);
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .theme-system-grid,
  .theme-grid,
  .code-style-grid,
  .font-family-grid {
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
  .code-style-grid,
  .font-family-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .font-size-controls {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .font-size-presets {
    justify-content: center;
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

  .color-picker-modal {
    margin: 20px;
    max-width: calc(100vw - 40px);
  }
}
</style>
