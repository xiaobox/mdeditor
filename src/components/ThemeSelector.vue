<template>
  <div class="theme-selector">
    <div class="theme-selector-header">
      <h3>主题选择</h3>
      <p>选择您喜欢的主题风格</p>
    </div>
    
    <div class="theme-grid">
      <div
        v-for="theme in themeList"
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

// Props
const props = defineProps({
  modelValue: {
    type: String,
    default: 'green'
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'theme-changed'])

// 响应式数据
const currentThemeId = ref(props.modelValue)
const themeList = ref(getColorThemeList())

// 计算属性
const currentTheme = computed(() => getColorTheme(currentThemeId.value))

// 方法
const selectTheme = (themeId) => {
  currentThemeId.value = themeId
  emit('update:modelValue', themeId)
}

const applyTheme = () => {
  saveColorTheme(currentThemeId.value)
  emit('theme-changed', currentTheme.value)
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

/* 响应式设计 */
@media (max-width: 768px) {
  .theme-grid {
    grid-template-columns: 1fr;
  }
  
  .theme-selector {
    padding: 16px;
  }
}
</style>
