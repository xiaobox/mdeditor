<template>
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
        @click="$emit('select', codeStyle.id)"
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
</template>

<script setup>
import { getCodeStyle } from '../../core/theme/presets/code-styles.js'

defineProps({
  codeStyleList: {
    type: Array,
    required: true
  },
  selectedCodeStyleId: {
    type: String,
    required: true
  }
})

defineEmits(['select'])

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
</script>

<style scoped>
.settings-section {
  background: var(--theme-bg-primary);
  border: 1px solid var(--theme-border-light);
  border-radius: var(--radius-3xl);
  padding: var(--spacing-4xl);
  box-shadow: var(--shadow-md);
  transition: var(--transition-all-slow);
}

.settings-section:hover {
  transform: translateY(calc(-1 * var(--spacing-xs)));
  box-shadow: var(--shadow-xl);
  border-color: var(--primary-color);
}

.section-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-xl);
  margin-bottom: var(--spacing-3xl);
  padding-bottom: var(--spacing-xl);
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

@keyframes shimmer {
  0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
  100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
}
</style>
