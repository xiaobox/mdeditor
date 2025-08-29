<template>
  <div class="color-picker">
    <!-- 颜色输入区域 -->
    <div class="color-input-section">
      <div class="color-preview" :style="{ backgroundColor: selectedColor }"></div>
      <input
        type="color"
        v-model="selectedColor"
        class="color-input"
        @input="onColorChange"
      />
      <input
        type="text"
        v-model="selectedColor"
        class="color-text-input"
        @input="onTextColorChange"
        placeholder="#000000"
        pattern="^#[0-9A-Fa-f]{6}$"
      />
    </div>

    <!-- 预设颜色快速选择 -->
    <div class="preset-colors">
      <div class="preset-colors-title">{{ $t('settings.colorPicker.quickPick') }}</div>
      <div class="preset-colors-grid">
        <button
          v-for="color in presetColors"
          :key="color"
          class="preset-color-btn"
          :class="{ active: selectedColor.toLowerCase() === color.toLowerCase() }"
          :style="{ backgroundColor: color }"
          @click="selectPresetColor(color)"
          :title="color"
        ></button>
      </div>
    </div>

    <!-- 主题预览 -->
    <div class="theme-preview" v-if="showPreview">
      <div class="preview-header">
        <div class="preview-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          {{ $t('settings.colorPicker.previewTitle') }}
        </div>
        <div class="preview-subtitle">{{ $t('settings.colorPicker.previewSubtitle') }}</div>
      </div>

      <div class="preview-content">
        <!-- 主题效果预览 -->
        <div class="preview-card">
          <div class="preview-card-body">
            <div class="preview-text" :style="{ color: generatedTheme.textPrimary }">
              {{ $t('settings.colorPicker.textSample') }}
            </div>
            <div class="preview-primary" :style="{ color: generatedTheme.primary }">
              {{ $t('settings.colorPicker.primarySample') }}
            </div>
            <code class="preview-code" :style="{
              backgroundColor: generatedTheme.inlineCodeBg,
              color: generatedTheme.inlineCodeText,
              border: `1px solid ${generatedTheme.inlineCodeBorder}`
            }">
              <span class="code-keyword">const</span> <span class="code-variable">theme</span> = <span class="code-string">'{{ selectedColor }}'</span>
            </code>
          </div>
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="actions">
      <button class="action-btn action-btn-secondary" @click="onCancel">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
        {{ $t('common.cancel') }}
      </button>
      <button class="action-btn action-btn-primary" @click="onConfirm" :disabled="!isValidColor">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 6L9 17l-5-5"/>
        </svg>
        {{ confirmLabel }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ColorThemeGenerator } from '../core/theme/index.js'

const { t } = useI18n()

const props = defineProps({
  initialColor: {
    type: String,
    default: '#3b82f6'
  },
  showPreview: {
    type: Boolean,
    default: true
  },
  confirmText: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['confirm', 'cancel', 'colorChange'])

// 响应式数据
const selectedColor = ref(props.initialColor)

// 确认按钮文案：优先使用传入 props，否则使用通用 OK
const confirmLabel = computed(() => props.confirmText || t('common.ok'))

// 预设颜色
const presetColors = [
  '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b',
  '#ef4444', '#ec4899', '#06b6d4', '#84cc16',
  '#6366f1', '#f97316', '#14b8a6', '#eab308',
  '#dc2626', '#db2777', '#0891b2', '#65a30d',
  '#4f46e5', '#ea580c', '#059669', '#ca8a04',
  '#b91c1c', '#be185d', '#0e7490', '#4d7c0f'
]

// 计算属性
const isValidColor = computed(() => {
  return /^#[0-9A-Fa-f]{6}$/.test(selectedColor.value)
})

const generatedTheme = computed(() => {
  if (!isValidColor.value) return {}
  return ColorThemeGenerator.generateThemeColors(selectedColor.value)
})

// 方法
const onColorChange = () => {
  emit('colorChange', selectedColor.value)
}

const onTextColorChange = (event) => {
  const value = event.target.value
  if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
    selectedColor.value = value
    emit('colorChange', selectedColor.value)
  }
}

const selectPresetColor = (color) => {
  selectedColor.value = color
  emit('colorChange', selectedColor.value)
}

const onConfirm = () => {
  if (isValidColor.value) {
    emit('confirm', selectedColor.value)
  }
}

const onCancel = () => {
  emit('cancel')
}

// 监听初始颜色变化
watch(() => props.initialColor, (newColor) => {
  selectedColor.value = newColor
})
</script>

<style scoped>
.color-picker {
  padding: 24px;
  background: var(--theme-bg-primary);
  border-radius: 16px;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.08),
    0 2px 8px rgba(0, 0, 0, 0.04);
  width: 480px;
  max-width: 90vw;
  border: 1px solid var(--theme-border-light);
}

.color-input-section {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 24px;
  padding: 16px;
  background: var(--theme-bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--theme-border-light);
}

.color-preview {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  border: 2px solid var(--theme-border-light);
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.color-preview:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.color-input {
  width: 64px;
  height: 44px;
  border: 2px solid var(--theme-border-light);
  border-radius: 10px;
  cursor: pointer;
  background: none;
  transition: all 0.3s ease;
}

.color-input:hover {
  border-color: var(--theme-primary);
}

.color-text-input {
  flex: 1;
  height: 44px;
  padding: 0 14px;
  border: 2px solid var(--theme-border-light);
  border-radius: 10px;
  font-family: var(--theme-code-font-family);
  font-size: 14px;
  background: var(--theme-bg-primary);
  color: var(--theme-text-primary);
  transition: all 0.3s ease;
}

.color-text-input:focus {
  outline: none;
  border-color: var(--theme-primary);
  box-shadow: 0 0 0 3px var(--theme-primary-light);
}

.preset-colors {
  margin-bottom: 24px;
}

.preset-colors-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--theme-text-primary);
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.preset-colors-title::before {
  content: '';
  width: 4px;
  height: 16px;
  background: linear-gradient(135deg, var(--theme-primary), var(--theme-primary-dark));
  border-radius: 2px;
}

.preset-colors-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 10px;
  padding: 16px;
  background: var(--theme-bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--theme-border-light);
}

.preset-color-btn {
  width: 36px;
  height: 36px;
  border: 2px solid var(--theme-border-light);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
}

.preset-color-btn:hover {
  transform: scale(1.1);
  border-color: var(--theme-primary);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.preset-color-btn.active {
  border-color: var(--theme-primary);
  border-width: 3px;
  transform: scale(1.1);
  box-shadow: 0 0 0 2px var(--theme-primary-light);
}

.preset-color-btn.active::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 12px;
  font-weight: bold;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.theme-preview {
  margin-bottom: 20px;
  background: var(--theme-bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--theme-border-light);
  overflow: hidden;
}

.preview-header {
  padding: 16px 20px 12px 20px;
  background: linear-gradient(135deg, var(--theme-bg-primary) 0%, var(--theme-bg-secondary) 100%);
  border-bottom: 1px solid var(--theme-border-light);
}

.preview-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--theme-text-primary);
  margin-bottom: 2px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.preview-title svg {
  color: var(--theme-primary);
}

.preview-subtitle {
  font-size: 12px;
  color: var(--theme-text-secondary);
  margin: 0;
}

.preview-content {
  padding: 16px;
}

.preview-card {
  background: var(--theme-bg-primary);
  border-radius: 8px;
  border: 1px solid var(--theme-border-light);
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.preview-card-body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.preview-text {
  font-size: 13px;
  line-height: 1.4;
}

.preview-primary {
  font-size: 13px;
  font-weight: 600;
  line-height: 1.4;
}

.preview-code {
  font-size: 12px;
  font-family: var(--theme-code-font-family);
  padding: 8px 12px;
  border-radius: 6px;
  display: inline-block;
  line-height: 1.3;
  margin-top: 4px;
}

.code-keyword {
  color: #d73a49;
  font-weight: 600;
}

.code-variable {
  color: #6f42c1;
}

.code-string {
  color: #032f62;
}

.actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid var(--theme-border-light);
  margin-top: 4px;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  white-space: nowrap;
  position: relative;
  overflow: hidden;
  min-width: 100px;
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.action-btn svg {
  transition: transform 0.3s ease;
}

.action-btn:hover:not(:disabled) svg {
  transform: scale(1.1);
}

.action-btn-secondary {
  background: var(--theme-bg-tertiary);
  color: var(--theme-text-secondary);
  border: 1px solid var(--theme-border-light);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.action-btn-secondary:hover:not(:disabled) {
  background: var(--theme-bg-secondary);
  color: var(--theme-text-primary);
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  border-color: var(--theme-primary);
}

.action-btn-primary {
  background: linear-gradient(135deg, var(--theme-primary), var(--theme-primary-hover));
  color: white;
  border: none;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.action-btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.action-btn-primary:disabled {
  background: var(--theme-text-tertiary);
  box-shadow: none;
}
</style>
