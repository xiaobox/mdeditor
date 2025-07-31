<template>
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
          @click="$emit('select-font-family', font.id)"
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

    <!-- 字号设置 -->
    <div class="font-setting-group">
      <div class="section-header">
        <div class="section-icon">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="currentColor" d="M11,7A2,2 0 0,1 13,9V17A2,2 0 0,1 11,19H9A2,2 0 0,1 7,17V9A2,2 0 0,1 9,7H11M9,9V17H11V9H9M12,2A2,2 0 0,1 14,4V6H12V4H10V6H8V4A2,2 0 0,1 10,2H12Z"/>
          </svg>
        </div>
        <h3>字号设置</h3>
      </div>

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
              :value="selectedFontSize"
              @input="$emit('update-font-size', Number($event.target.value))"
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
          @click="$emit('update-font-size', preset.value)"
        >
          {{ preset.label }}
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { fontSizeOptions, fontSettingsUtils } from '../../core/theme/presets/font-settings.js'

const props = defineProps({
  fontFamilyList: {
    type: Array,
    required: true
  },
  selectedFontFamily: {
    type: String,
    required: true
  },
  selectedFontSize: {
    type: Number,
    required: true
  }
})

defineEmits(['select-font-family', 'update-font-size'])

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

// 字体预览相关方法
const getFontPreviewStyle = (fontId) => {
  return fontSettingsUtils.getPreviewStyle(fontId, 14)
}

// 字号预览样式
const getFontSizePreviewStyle = () => {
  const fontFamily = fontSettingsUtils.getFontFamily(props.selectedFontFamily)
  return {
    fontFamily: fontFamily ? fontFamily.value : 'inherit',
    fontSize: `${props.selectedFontSize}px`,
    lineHeight: '1.2',
    transition: 'all 0.2s ease'
  }
}
</script>

<style scoped>
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
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--primary-color);
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
}

.font-size-slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

.font-size-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--primary-color);
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
}

.font-size-marks {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  padding: 0 10px;
}

.font-size-mark {
  font-size: 12px;
  color: var(--theme-text-secondary);
  font-weight: 500;
}

/* 预览显示区域 */
.preview-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 20px;
  background: var(--theme-bg-primary);
  border-radius: 12px;
  border: 1px solid var(--theme-border-light);
}

.preview-info {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.current-size {
  font-size: 18px;
  font-weight: 700;
  color: var(--primary-color);
}

.size-unit {
  font-size: 12px;
  color: var(--theme-text-secondary);
  font-weight: 500;
}

.preview-char {
  color: var(--theme-text-primary);
  font-weight: 500;
  text-align: center;
}

/* 字号预设按钮 */
.font-size-presets {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.font-size-preset-btn {
  padding: 8px 16px;
  border: 2px solid var(--theme-border-light);
  border-radius: 8px;
  background: var(--theme-bg-secondary);
  color: var(--theme-text-primary);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.font-size-preset-btn:hover {
  border-color: var(--primary-color);
  background: var(--primary-light);
}

.font-size-preset-btn.active {
  border-color: var(--primary-color);
  background: var(--primary-color);
  color: white;
}

@keyframes shimmer {
  0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
  100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
}
</style>
