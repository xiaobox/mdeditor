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
      <div class="preset-colors-title">快速选择</div>
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
      <div class="preview-title">主题预览</div>
      <div class="preview-content">
        <div class="preview-text" :style="{ color: generatedTheme.textPrimary }">
          这是正文文本的效果
        </div>
        <div class="preview-primary" :style="{ color: generatedTheme.primary }">
          这是主色调的效果
        </div>
        <div class="preview-code" :style="{ 
          backgroundColor: generatedTheme.inlineCodeBg, 
          color: generatedTheme.inlineCodeText,
          border: `1px solid ${generatedTheme.inlineCodeBorder}`
        }">
          代码文本效果
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="actions">
      <button class="btn btn-secondary" @click="onCancel">
        取消
      </button>
      <button class="btn btn-primary" @click="onConfirm" :disabled="!isValidColor">
        {{ confirmText }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ColorThemeGenerator } from '../core/theme/presets/color-themes.js'

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
    default: '确认'
  }
})

const emit = defineEmits(['confirm', 'cancel', 'colorChange'])

// 响应式数据
const selectedColor = ref(props.initialColor)

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
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  max-width: 400px;
}

.color-input-section {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.color-preview {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: 2px solid #e5e7eb;
  cursor: pointer;
}

.color-input {
  width: 60px;
  height: 40px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  background: none;
}

.color-text-input {
  flex: 1;
  height: 40px;
  padding: 0 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-family: monospace;
  font-size: 14px;
}

.color-text-input:focus {
  outline: none;
  border-color: #3b82f6;
}

.preset-colors {
  margin-bottom: 20px;
}

.preset-colors-title {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 12px;
}

.preset-colors-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 8px;
}

.preset-color-btn {
  width: 32px;
  height: 32px;
  border: 2px solid #e5e7eb;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.preset-color-btn:hover {
  transform: scale(1.1);
  border-color: #9ca3af;
}

.preset-color-btn.active {
  border-color: #3b82f6;
  border-width: 3px;
  transform: scale(1.1);
}

.theme-preview {
  margin-bottom: 20px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
}

.preview-title {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 12px;
}

.preview-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.preview-text {
  font-size: 14px;
}

.preview-primary {
  font-size: 14px;
  font-weight: 500;
}

.preview-code {
  font-size: 12px;
  font-family: monospace;
  padding: 4px 8px;
  border-radius: 4px;
  display: inline-block;
  width: fit-content;
}

.actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn-primary:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}
</style>
