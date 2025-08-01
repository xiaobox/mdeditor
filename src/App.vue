<template>
  <div id="app">
    <!-- 应用头部 -->
    <AppHeader
      :show-settings-panel="showSettingsPanel"
      :copy-format-options="copyFormatOptions"
      :selected-copy-format="selectedCopyFormat"
      :has-content="hasContent"
      @open-github="openGithub"
      @toggle-settings="toggleSettingsPanel"
      @show-guide="showGuide"
      @copy-format-select="handleCopyFormatSelect"
      @update:selected-copy-format="selectedCopyFormat = $event"
    />

    <!-- 主内容区域 -->
    <AppMain
      :markdown-content="markdownContent"
      @update:markdown-content="updateMarkdownContent"
      @clear-content="clearContent"
      @load-sample="loadSample"
      @html-generated="updateHtmlContent"
    />

    <!-- 应用底部 -->
    <AppFooter
      :character-count="characterCount"
      :is-ready="isHtmlReady"
    />

    <!-- 通知组件 -->
    <div v-if="notifications.length > 0" class="notification-container">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        :class="['notification', notification.type, { 'slide-out': notification.isRemoving }]"
      >
        {{ notification.message }}
      </div>
    </div>

    <!-- 设置面板 -->
    <SettingsPanel
      :visible="showSettingsPanel"
      @close="closeSettingsPanel"
      @show-notification="showNotification"
    />

    <!-- Markdown 语法指南 -->
    <MarkdownGuide
      :show="showMarkdownGuide"
      @close="closeGuide"
    />
  </div>
</template>

<script setup>
import { useAppState } from './composables/useAppState.js'
import { useGlobalThemeManager } from './composables/index.js'
import AppHeader from './components/layout/AppHeader.vue'
import AppMain from './components/layout/AppMain.vue'
import AppFooter from './components/layout/AppFooter.vue'
import SettingsPanel from './components/SettingsPanel.vue'
import MarkdownGuide from './components/MarkdownGuide.vue'

// 使用应用状态管理
const {
  // 状态
  markdownContent,
  htmlContent,
  showSettingsPanel,
  showMarkdownGuide,
  notifications,
  selectedCopyFormat,
  copyFormatOptions,

  // 计算属性
  hasContent,
  isHtmlReady,
  characterCount,

  // 方法
  updateMarkdownContent,
  clearContent,
  loadSample,
  updateHtmlContent,
  toggleSettingsPanel,
  closeSettingsPanel,
  showGuide,
  closeGuide,
  showNotification,
  removeNotification,
  handleCopyFormatSelect,
  openGithub
} = useAppState()

// 初始化主题管理器
const themeManager = useGlobalThemeManager()
themeManager.initialize()


</script>

<style scoped>
/* 导入原来的样式 */
@import './styles/components/app-layout.css';
@import './styles/components/notifications.css';

/* 设置按钮样式 */
.btn-settings {
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  color: #495057;
  border: 1px solid #dee2e6;
  position: relative;
  overflow: hidden;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.btn-settings::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg,
    var(--theme-primary-light) 0%,
    var(--theme-primary-lighter) 50%,
    var(--theme-primary-light) 100%);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.btn-settings:hover::before {
  opacity: 1;
}

.btn-settings:hover {
  border-color: var(--theme-primary);
  color: var(--theme-primary, #00A86B);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.btn-settings.active {
  background: var(--theme-primary, #00A86B);
  color: white;
  border-color: var(--theme-primary, #00A86B);
  box-shadow: 0 2px 8px var(--theme-primary, #00A86B)40;
}

.btn-settings.active::before {
  opacity: 0;
}
</style>
