<template>
  <header class="app-header">
    <div class="header-left">
      <h1>Modern MD Editor</h1>
      <span class="header-subtitle">现代化 Markdown 编辑器</span>
    </div>
    <div class="header-right">
      <button class="header-btn" @click="$emit('open-github')" title="查看源码">
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path fill="currentColor" d="M12,2A10,10 0 0,0 2,12C2,16.42 4.87,20.17 8.84,21.5C9.34,21.58 9.5,21.27 9.5,21C9.5,20.77 9.5,20.14 9.5,19.31C6.73,19.91 6.14,17.97 6.14,17.97C5.68,16.81 5.03,16.5 5.03,16.5C4.12,15.88 5.1,15.9 5.1,15.9C6.1,15.97 6.63,16.93 6.63,16.93C7.5,18.45 8.97,18 9.54,17.76C9.63,17.11 9.89,16.67 10.17,16.42C7.95,16.17 5.62,15.31 5.62,11.5C5.62,10.39 6,9.5 6.65,8.79C6.55,8.54 6.2,7.5 6.75,6.15C6.75,6.15 7.59,5.88 9.5,7.17C10.29,6.95 11.15,6.84 12,6.84C12.85,6.84 13.71,6.95 14.5,7.17C16.41,5.88 17.25,6.15 17.25,6.15C17.8,7.5 17.45,8.54 17.35,8.79C18,9.5 18.38,10.39 18.38,11.5C18.38,15.32 16.04,16.16 13.81,16.41C14.17,16.72 14.5,17.33 14.5,18.26C14.5,19.6 14.5,20.68 14.5,21C14.5,21.27 14.66,21.59 15.17,21.5C19.14,20.16 22,16.42 22,12A10,10 0 0,0 12,2Z"/>
        </svg>
        <span>GitHub</span>
      </button>

      <button
        class="header-btn"
        @click="$emit('toggle-settings')"
        :class="{ 'active': showSettingsPanel }"
      >
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path fill="currentColor" d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.22,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.22,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.68 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z"/>
        </svg>
        <span>设置</span>
      </button>

      <button class="header-btn" @click="$emit('show-guide')">
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path fill="currentColor" d="M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z"/>
        </svg>
        <span>语法指南</span>
      </button>

      <DropdownMenu
        :options="copyFormatOptions"
        :model-value="selectedCopyFormat"
        trigger-text="复制"
        trigger-class="header-btn"
        :disabled="!hasContent"
        @update:model-value="$emit('update:selected-copy-format', $event)"
        @select="$emit('copy-format-select', $event)"
      />
    </div>
  </header>
</template>

<script setup>
import DropdownMenu from '../DropdownMenu.vue'

defineProps({
  showSettingsPanel: {
    type: Boolean,
    default: false
  },
  copyFormatOptions: {
    type: Array,
    required: true
  },
  selectedCopyFormat: {
    type: Object,
    default: null
  },
  hasContent: {
    type: Boolean,
    default: false
  }
})

defineEmits([
  'open-github',
  'toggle-settings',
  'show-guide',
  'copy-format-select',
  'update:selected-copy-format'
])
</script>

<style scoped>
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
  background: linear-gradient(135deg,
    #f8fafc 0%,
    #f1f5f9 25%,
    #e2e8f0 50%,
    #cbd5e1 75%,
    #94a3b8 100%);
  border-bottom: 1px solid rgba(148, 163, 184, 0.2);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.06),
    0 4px 16px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  flex-shrink: 0;
  position: relative;
  overflow: visible;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.header-left h1 {
  font-size: 26px;
  font-weight: 800;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  color: var(--primary-color); /* 降级支持 */
  margin: 0;
  letter-spacing: -0.8px;
  position: relative;
  transition: all 0.3s ease;
}

.header-left h1:hover {
  transform: translateY(-1px);
  filter: brightness(1.1);
}

.header-left h1::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 60px;
  height: 3px;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
  border-radius: 2px;
  opacity: 0.6;
  transition: all 0.3s ease;
}

.header-left h1:hover::after {
  opacity: 0.8;
  width: 80px;
}

.header-subtitle {
  font-size: 14px;
  color: var(--primary-color);
  font-weight: 600;
  letter-spacing: 0.2px;
  opacity: 0.95;
  transition: all 0.3s ease;
}

.header-subtitle:hover {
  opacity: 1;
  color: var(--primary-hover);
  transform: translateY(-1px);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 简洁现代的 Neumorphism 按钮设计 - 跟随主题色 */
.header-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 18px;
  border: none;
  border-radius: 12px;
  background: #f0f0f3;
  color: var(--primary-color);
  font-size: 14px;
  font-weight: 600;
  line-height: 1.2;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  user-select: none;
  position: relative;
  box-shadow:
    /* 轻柔的外部阴影 */
    6px 6px 12px rgba(163, 177, 198, 0.6),
    -6px -6px 12px rgba(255, 255, 255, 0.8);
}

/* 悬停状态 - 轻微内凹效果 + 主题色增强 */
.header-btn:hover {
  color: var(--primary-hover);
  font-weight: 700;
  box-shadow:
    /* 内凹阴影 */
    inset 3px 3px 6px rgba(163, 177, 198, 0.4),
    inset -3px -3px 6px rgba(255, 255, 255, 0.8),
    /* 主题色光晕 */
    0 0 20px rgba(var(--primary-rgb), 0.2);
}

/* 激活状态 - 深度内凹 */
.header-btn:active {
  color: var(--primary-dark);
  box-shadow:
    /* 深度内凹阴影 */
    inset 4px 4px 8px rgba(163, 177, 198, 0.5),
    inset -4px -4px 8px rgba(255, 255, 255, 0.9);
}

/* 选中状态（用于设置按钮） - 简洁的主题色 Neumorphism */
.header-btn.active {
  background: var(--primary-color);
  color: white;
  font-weight: 700;
  box-shadow:
    /* 主题色的内凹效果 */
    inset 3px 3px 6px rgba(0, 0, 0, 0.2),
    inset -3px -3px 6px rgba(255, 255, 255, 0.1),
    /* 轻微外部光晕 */
    0 0 20px rgba(var(--primary-rgb), 0.3);
}

.header-btn.active:hover {
  background: var(--primary-hover);
  box-shadow:
    inset 2px 2px 4px rgba(0, 0, 0, 0.15),
    inset -2px -2px 4px rgba(255, 255, 255, 0.05),
    0 0 25px rgba(var(--primary-rgb), 0.4);
}

.header-btn.active:active {
  box-shadow:
    inset 4px 4px 8px rgba(0, 0, 0, 0.3),
    inset -4px -4px 8px rgba(255, 255, 255, 0.1);
}

/* 禁用状态 - 简洁的禁用效果 */
.header-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  color: #9ca3af;
  box-shadow:
    2px 2px 4px rgba(163, 177, 198, 0.3),
    -2px -2px 4px rgba(255, 255, 255, 0.5);
}

.header-btn:disabled:hover {
  color: #9ca3af;
  box-shadow:
    2px 2px 4px rgba(163, 177, 198, 0.3),
    -2px -2px 4px rgba(255, 255, 255, 0.5);
}

/* 图标样式 - 跟随主题色 */
.header-btn svg {
  flex-shrink: 0;
  transition: all 0.2s ease;
  opacity: 0.9;
  color: var(--primary-color);
}

.header-btn:hover svg {
  opacity: 1;
  color: var(--primary-hover);
  transform: scale(1.05);
}

.header-btn.active svg {
  opacity: 1;
  color: white;
}

.header-btn:active svg {
  color: var(--primary-dark);
}

/* 文字样式 - 跟随主题色 */
.header-btn span {
  font-weight: 600;
  letter-spacing: -0.01em;
  transition: all 0.2s ease;
}

.header-btn:hover span {
  font-weight: 700;
}

.header-btn.active span {
  font-weight: 700;
}

/* 焦点状态（无障碍） - 简洁焦点环 */
.header-btn:focus-visible {
  outline: none;
  box-shadow:
    6px 6px 12px rgba(163, 177, 198, 0.6),
    -6px -6px 12px rgba(255, 255, 255, 0.8),
    0 0 0 3px rgba(var(--primary-rgb), 0.3);
}

/* 保留旧的 .btn 类以兼容 DropdownMenu */
.btn:hover {
  background: var(--theme-bg-secondary);
  border-color: var(--primary-color);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.btn-github {
  background: linear-gradient(135deg, #24292e 0%, #1a1e22 100%);
  color: white;
  border-color: #24292e;
}

.btn-github:hover {
  background: linear-gradient(135deg, #2f363d 0%, #24292e 100%);
  border-color: #444d56;
}

.btn-settings.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.btn-secondary {
  background: linear-gradient(135deg, var(--theme-bg-tertiary) 0%, var(--theme-bg-secondary) 100%);
}

@media (max-width: 768px) {
  .app-header {
    padding: 12px 16px;
    flex-wrap: wrap;
    gap: 12px;
  }
  
  .header-left h1 {
    font-size: 20px;
  }
  
  .header-subtitle {
    display: none;
  }
  
  .btn {
    padding: 8px 12px;
    font-size: 13px;
  }
  
  .btn span {
    display: none;
  }
}
</style>
