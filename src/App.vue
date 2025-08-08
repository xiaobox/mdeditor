<template>
  <div id="app">
    <!-- 应用头部 -->
    <AppHeader
      :show-settings-panel="showSettingsPanel"
      :view-mode="viewMode"
      :copy-format-options="copyFormatOptions"
      :selected-copy-format="selectedCopyFormat"
      :has-content="hasContent"
      @open-github="openGithub"
      @toggle-settings="toggleSettingsPanel"
      @set-view-mode="setViewMode"
      @show-guide="showGuide"
      @copy-format-select="handleCopyFormatSelect"
      @update:selected-copy-format="selectedCopyFormat = $event"
    />

    <!-- 主内容区域 -->
    <AppMain
      :markdown-content="markdownContent"
      :sync-scroll-enabled="syncScrollEnabled"
      :view-mode="viewMode"
      @update:markdown-content="updateMarkdownContent"
      @clear-content="clearContent"
      @load-sample="loadSample"
      @html-generated="updateHtmlContent"
    />

    <!-- 应用底部 -->
    <AppFooter
      :character-count="characterCount"
      :line-count="lineCount"
      :word-count="wordCount"
      :estimated-read-time="estimatedReadTime"
      :sync-scroll-enabled="syncScrollEnabled"
      @toggle-sync-scroll="toggleSyncScroll"
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
  syncScrollEnabled,
  viewMode,
  notifications,
  selectedCopyFormat,
  copyFormatOptions,

  // 计算属性
  hasContent,
  isHtmlReady,
  characterCount,
  lineCount,
  wordCount,
  estimatedReadTime,

  // 方法
  updateMarkdownContent,
  clearContent,
  loadSample,
  updateHtmlContent,
  toggleSettingsPanel,
  closeSettingsPanel,
  showGuide,
  closeGuide,
  toggleSyncScroll,
  setViewMode,
  showNotification,
  removeNotification,
  handleCopyFormatSelect,
  openGithub
} = useAppState()

// 初始化主题管理器（全局单例内部已自动调用 initialize）
const themeManager = useGlobalThemeManager()


</script>

<style scoped>
/* 导入原来的样式 */
@import './styles/components/layout/app-layout.css';
@import './styles/components/notifications.css';


</style>
