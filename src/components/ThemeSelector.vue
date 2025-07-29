<template>
  <div class="theme-selector">
    <div class="theme-selector-header">
      <h3>主题选择</h3>
      <p>选择您喜欢的主题风格</p>
    </div>
    
    <div class="theme-grid">
      <!-- 内置主题 -->
      <div
        v-for="theme in builtinThemes"
        :key="theme.id"
        class="theme-card"
        :class="{ active: currentThemeId === theme.id }"
        @click="selectTheme(theme.id)"
      >
        <div class="theme-preview">
          <div class="theme-color-bar" :style="{ backgroundColor: theme.primary }"></div>
          <div class="theme-content">
            <div class="theme-title" :style="{ color: theme.primary }">{{ theme.name }}</div>
            <div class="theme-description">{{ theme.description }}</div>
          </div>
        </div>

        <div class="theme-check" v-if="currentThemeId === theme.id">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M13.5 4.5L6 12L2.5 8.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>

      <!-- 自定义颜色选择器 -->
      <div
        class="theme-card custom-color-card"
        :class="{ active: showColorPicker }"
        @click="toggleColorPicker"
      >
        <div class="theme-preview">
          <div class="custom-color-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="currentColor"/>
              <path d="M19 15L20.09 18.26L24 19L20.09 19.74L19 23L17.91 19.74L14 19L17.91 18.26L19 15Z" fill="currentColor"/>
              <path d="M5 15L6.09 18.26L10 19L6.09 19.74L5 23L3.91 19.74L0 19L3.91 18.26L5 15Z" fill="currentColor"/>
            </svg>
          </div>
          <div class="theme-content">
            <div class="theme-title">自定义颜色</div>
            <div class="theme-description">选择任意颜色</div>
          </div>
        </div>
      </div>

      <!-- 自定义主题 -->
      <div
        v-for="theme in customThemes"
        :key="theme.id"
        class="theme-card custom-theme-card"
        :class="{ active: currentThemeId === theme.id }"
        @click="selectTheme(theme.id)"
      >
        <div class="theme-preview">
          <div class="theme-color-bar" :style="{ backgroundColor: theme.primary }"></div>
          <div class="theme-content">
            <div class="theme-title" :style="{ color: theme.primary }">{{ theme.name }}</div>
            <div class="theme-description">{{ theme.description }}</div>
          </div>
        </div>

        <div class="theme-actions-menu">
          <button
            class="delete-theme-btn"
            @click.stop="deleteCustomTheme(theme.id)"
            title="删除自定义主题"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </button>
        </div>

        <div class="theme-check" v-if="currentThemeId === theme.id">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M13.5 4.5L6 12L2.5 8.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>
    </div>

    <!-- 颜色选择器弹窗 -->
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
    
    <div class="theme-actions">
      <button 
        class="apply-button"
        :style="{ backgroundColor: currentTheme.primary, borderColor: currentTheme.primary }"
        @click="applyTheme"
      >
        应用主题
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getColorThemeList, getColorTheme } from '../core/theme/presets/color-themes.js'
import { saveColorTheme, loadSavedColorTheme } from '../core/theme/storage.js'
import { useGlobalThemeManager } from '../composables/theme/useThemeManager.js'
import ColorPicker from './ColorPicker.vue'

// Props
const props = defineProps({
  modelValue: {
    type: String,
    default: 'green'
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'theme-changed'])

// 获取主题管理器
const themeManager = useGlobalThemeManager()

// 响应式数据
const currentThemeId = ref(props.modelValue)
const showColorPicker = ref(false)
const selectedCustomColor = ref('#3b82f6')

// 计算属性
const currentTheme = computed(() => themeManager.getExtendedColorTheme(currentThemeId.value) || getColorTheme(currentThemeId.value))

const builtinThemes = computed(() => getColorThemeList())

const customThemes = computed(() => themeManager.getCustomThemes())

// 方法
const selectTheme = (themeId) => {
  currentThemeId.value = themeId
  emit('update:modelValue', themeId)
}

const applyTheme = () => {
  themeManager.setColorTheme(currentThemeId.value)
  emit('theme-changed', currentTheme.value)
}

const toggleColorPicker = () => {
  showColorPicker.value = !showColorPicker.value
}

const closeColorPicker = () => {
  showColorPicker.value = false
}

const onColorChange = (color) => {
  selectedCustomColor.value = color
}

const onColorConfirm = (color) => {
  try {
    const customTheme = themeManager.saveCustomTheme(color)
    currentThemeId.value = customTheme.id
    emit('update:modelValue', customTheme.id)
    showColorPicker.value = false

    // 自动应用新主题
    themeManager.setColorTheme(customTheme.id)
    emit('theme-changed', customTheme)
  } catch (error) {
    console.error('Failed to save custom theme:', error)
    alert('保存自定义主题失败，请重试')
  }
}

const deleteCustomTheme = (themeId) => {
  if (confirm('确定要删除这个自定义主题吗？')) {
    try {
      themeManager.deleteCustomTheme(themeId)

      // 如果删除的是当前主题，切换到默认主题
      if (currentThemeId.value === themeId) {
        const defaultTheme = builtinThemes.value[0]
        currentThemeId.value = defaultTheme.id
        emit('update:modelValue', defaultTheme.id)
        themeManager.setColorTheme(defaultTheme.id)
        emit('theme-changed', defaultTheme)
      }
    } catch (error) {
      console.error('Failed to delete custom theme:', error)
      alert('删除自定义主题失败，请重试')
    }
  }
}

// 生命周期
onMounted(() => {
  const savedThemeId = loadSavedColorTheme()
  if (savedThemeId !== currentThemeId.value) {
    currentThemeId.value = savedThemeId
    emit('update:modelValue', savedThemeId)
  }
})
</script>

<style scoped>
.theme-selector {
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e5e7eb;
}

.theme-selector-header {
  margin-bottom: 20px;
  text-align: center;
}

.theme-selector-header h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.theme-selector-header p {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
}

.theme-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.theme-card {
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  background: #ffffff;
}

.theme-card:hover {
  border-color: #d1d5db;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.theme-card.active {
  border-color: var(--primary-color, #00A86B);
  box-shadow: 0 0 0 1px var(--primary-color, #00A86B);
}

.theme-preview {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.theme-color-bar {
  height: 4px;
  border-radius: 2px;
  width: 100%;
}

.theme-content {
  flex: 1;
}

.theme-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
}

.theme-description {
  font-size: 13px;
  color: #6b7280;
  line-height: 1.4;
}

.theme-check {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 24px;
  height: 24px;
  background: var(--primary-color, #00A86B);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.theme-actions {
  display: flex;
  justify-content: center;
}

.apply-button {
  background: #00A86B;
  color: white;
  border: 2px solid #00A86B;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.apply-button:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.apply-button:active {
  transform: translateY(0);
}

/* 自定义颜色卡片样式 */
.custom-color-card .theme-preview {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
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

/* 自定义主题卡片样式 */
.custom-theme-card {
  position: relative;
}

.theme-actions-menu {
  position: absolute;
  top: 8px;
  right: 8px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.custom-theme-card:hover .theme-actions-menu {
  opacity: 1;
}

.delete-theme-btn {
  width: 24px;
  height: 24px;
  border: none;
  background: rgba(239, 68, 68, 0.9);
  color: white;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.delete-theme-btn:hover {
  background: rgba(239, 68, 68, 1);
  transform: scale(1.1);
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
  z-index: 1000;
}

.color-picker-modal {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  max-width: 90vw;
  max-height: 90vh;
  overflow: auto;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .theme-grid {
    grid-template-columns: 1fr;
  }

  .theme-selector {
    padding: 16px;
  }

  .color-picker-modal {
    margin: 20px;
    max-width: calc(100vw - 40px);
  }
}
</style>
