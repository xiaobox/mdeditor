<template>
  <div class="code-theme-selector">
    <div class="code-theme-header">
      <h3>代码样式</h3>
      <p>选择您喜欢的代码块样式</p>
    </div>
    
    <div class="code-theme-grid">
      <div
        v-for="style in codeStyleList"
        :key="style.id"
        class="code-theme-card"
        :class="{ active: selectedCodeStyleId === style.id }"
        @click="selectCodeStyle(style.id)"
      >
        <div class="code-theme-preview">
          <div 
            class="code-preview-container"
            :style="getCodeStylePreviewStyles(style.id)"
          >
            <div class="code-preview-header" v-if="style.id !== 'mac'">
              <span v-if="style.id === 'github'">📄</span>
              <span v-else-if="style.id === 'vscode'">⚡</span>
              <span v-else-if="style.id === 'terminal'">$</span>
              {{ style.id === 'terminal' ? 'terminal' : '代码' }}
            </div>
            <div class="code-preview-lights" v-if="style.id === 'mac'">
              <span class="light red"></span>
              <span class="light yellow"></span>
              <span class="light green"></span>
            </div>
            <div class="code-preview-content" :data-theme="style.id">
              <span class="code-keyword">function</span>
              <span class="code-function">hello</span>() {<br>
              &nbsp;&nbsp;<span class="code-keyword">return</span>
              <span class="code-string">"world"</span>;<br>
              }
            </div>
          </div>
        </div>

        <div class="code-theme-info">
          <div class="code-theme-name">{{ style.name }}</div>
          <div class="code-theme-description">{{ style.description }}</div>
        </div>

        <div class="code-theme-check" v-if="selectedCodeStyleId === style.id">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M13.5 4.5L6 12L2.5 8.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>
    </div>
    
    <div class="code-theme-actions">
      <button 
        class="apply-button"
        @click="applyCodeStyle"
      >
        应用代码主题
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useGlobalThemeManager } from '../composables/index.js'
import { getCodeStyle } from '../core/theme/presets/code-styles.js'

// Props
const props = defineProps({
  modelValue: {
    type: String,
    default: 'mac'
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'code-theme-changed'])

// 使用统一主题管理器
const themeManager = useGlobalThemeManager()

// 解构所需功能
const {
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

// 响应式数据
const selectedCodeStyleId = ref(props.modelValue)

// 方法
const selectCodeStyle = (styleId) => {
  selectedCodeStyleId.value = styleId
  emit('update:modelValue', styleId)
}

const applyCodeStyle = () => {
  setCodeStyle(selectedCodeStyleId.value)
  emit('code-theme-changed', selectedCodeStyleId.value)
}

// 监听当前代码样式变化
watch(currentCodeStyleId, (newStyleId) => {
  if (newStyleId !== selectedCodeStyleId.value) {
    selectedCodeStyleId.value = newStyleId
    emit('update:modelValue', newStyleId)
  }
}, { immediate: true })

// 生命周期
onMounted(() => {
  if (currentCodeStyleId.value !== selectedCodeStyleId.value) {
    selectedCodeStyleId.value = currentCodeStyleId.value
    emit('update:modelValue', currentCodeStyleId.value)
  }
})
</script>

<style scoped>
.code-theme-selector {
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e5e7eb;
}

.code-theme-header {
  margin-bottom: 20px;
  text-align: center;
}

.code-theme-header h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.code-theme-header p {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
}

.code-theme-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.code-theme-card {
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  background: #ffffff;
}

.code-theme-card:hover {
  border-color: #d1d5db;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.code-theme-card.active {
  border-color: var(--theme-primary, #00A86B);
  box-shadow: 0 0 0 1px var(--theme-primary, #00A86B);
}

.code-theme-preview {
  margin-bottom: 12px;
}

.code-preview-container {
  background: var(--code-preview-bg, #1e1e1e);
  color: var(--code-preview-color, #e6edf3);
  border: var(--code-preview-border, none);
  border-radius: var(--code-preview-radius, 8px);
  padding: 12px;
  font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
  font-size: 12px;
  line-height: 1.4;
  position: relative;
  overflow: hidden;
}

.code-preview-header {
  background: rgba(255, 255, 255, 0.1);
  margin: -12px -12px 8px -12px;
  padding: 6px 12px;
  font-size: 10px;
  border-radius: var(--code-preview-radius, 8px) var(--code-preview-radius, 8px) 0 0;
  opacity: 0.8;
}

/* GitHub主题的头部样式 */
.code-preview-container[style*="#f6f8fa"] .code-preview-header {
  background: rgba(0, 0, 0, 0.05);
  color: #656d76;
}

.code-preview-lights {
  position: absolute;
  top: 14px;
  left: 12px;
  display: flex;
  gap: 4px;
}

.light {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.light.red {
  background: #ff5f56;
}

.light.yellow {
  background: #ffbd2e;
}

.light.green {
  background: #27ca3f;
}

.code-preview-content {
  margin-top: 16px;
}

.code-keyword {
  color: #ff7b72;
  font-weight: 500;
}

.code-function {
  color: #d2a8ff;
}

.code-string {
  color: #a5d6ff;
}

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

.code-theme-info {
  flex: 1;
}

.code-theme-name {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
  color: #1f2937;
}

.code-theme-description {
  font-size: 13px;
  color: #6b7280;
  line-height: 1.4;
}

.code-theme-check {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 24px;
  height: 24px;
  background: var(--theme-primary, #00A86B);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.code-theme-actions {
  display: flex;
  justify-content: center;
}

.apply-button {
  background: var(--theme-primary, #00A86B);
  color: white;
  border: 2px solid var(--theme-primary, #00A86B);
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
  .code-theme-grid {
    grid-template-columns: 1fr;
  }
  
  .code-theme-selector {
    padding: 16px;
  }
}
</style>
