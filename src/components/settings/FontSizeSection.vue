<template>
  <section class="settings-section">
    <div class="section-header">
      <div class="section-icon">
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path fill="currentColor" d="M11,7A2,2 0 0,1 13,9V17A2,2 0 0,1 11,19H9A2,2 0 0,1 7,17V9A2,2 0 0,1 9,7H11M9,9V17H11V9H9M12,2A2,2 0 0,1 14,4V6H12V4H10V6H8V4A2,2 0 0,1 10,2H12Z"/>
        </svg>
      </div>
      <h3>字号</h3>
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
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { fontSizeOptions, fontSettingsUtils } from '../../core/theme/presets/font-settings.js'

const props = defineProps({
  selectedFontFamily: {
    type: String,
    required: true
  },
  selectedFontSize: {
    type: Number,
    required: true
  }
})

defineEmits(['update-font-size'])

// 字号相关的计算属性和数据
const fontSizeRange = computed(() => ({
  min: fontSizeOptions.min,
  max: fontSizeOptions.max,
  step: fontSizeOptions.step
}))

const fontSizeMarks = computed(() => [
  fontSizeOptions.min,
  Math.round((fontSizeOptions.min + fontSizeOptions.max) / 2),
  fontSizeOptions.max
])

const fontSizePresets = computed(() => fontSizeOptions.presets)

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
@import '../../styles/components/settings/font.css';
</style>
