<template>
  <div id="app">
    <!-- 应用头部 -->
    <AppHeader
      :show-settings-panel="showSettingsPanel"
      :view-mode="viewMode"
      :copy-format-options="copyFormatOptions"
      :selected-copy-format="selectedCopyFormat"
      :has-content="hasContent"
      logo-src="/logo.svg"
      logo-alt="Modern MD Editor"
      @open-github="openGithub"
      @toggle-settings="toggleSettingsPanel"
      @set-view-mode="setViewMode"
      @show-guide="showGuide"
      @copy-format-select="handleCopyFormatSelect"
      @update:selected-copy-format="selectedCopyFormat = $event"
    />

    <!-- 隐藏文件输入：用于导入 .md -->
    <input ref="fileInputRef" type="file" accept=".md,text/markdown,.txt" style="display:none" @change="handleFileChosen" />

    <!-- 主内容区域 -->
    <AppMain
      :markdown-content="markdownContent"
      :sync-scroll-enabled="syncScrollEnabled"
      :view-mode="viewMode"
      @update:markdown-content="updateMarkdownContent"
      @clear-content="clearContent"
      @load-sample="loadSample"
      @html-generated="updateHtmlContent"
      @import-markdown="triggerImportMd"
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
import { ref } from 'vue'
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
  showSettingsPanel,
  showMarkdownGuide,
  syncScrollEnabled,
  viewMode,
  notifications,
  selectedCopyFormat,
  copyFormatOptions,

  // 计算属性
  hasContent,
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
  handleCopyFormatSelect,
  openGithub
} = useAppState()

// 初始化主题管理器（全局单例内部已自动调用 initialize）
useGlobalThemeManager()

// 导入：隐藏文件输入
const fileInputRef = ref(null)
const triggerImportMd = () => fileInputRef.value && fileInputRef.value.click()

const handleFileChosen = async (e) => {
  const file = e.target.files && e.target.files[0]
  // 允许重复选择同一个文件
  e.target.value = ''
  if (!file) return
  if (!/\.(md|markdown)$/i.test(file.name) && !/text\/markdown|text\/plain/.test(file.type)) {
    showNotification('仅支持导入 .md 文件', 'warning')
    return
  }
  try {
    const text = await file.text()
    updateMarkdownContent(text)
    showNotification(`已导入：${file.name}`, 'success')
  } catch (err) {
    showNotification(`导入失败：${err.message}`, 'error')
  }
}

// 基于第一行 H1 自动生成文件名（导出功能移除后不再使用，可保留以备后续扩展）
// const makeExportFilename = () => {
//   const md = markdownContent.value || ''
//   const h1Match = md.match(/^#\s+(.+?)\s*$/m)
//   const raw = (h1Match && h1Match[1]) || 'markdown-preview'
//   return raw.replace(/[\\/:*?"<>|]/g, '').replace(/\s+/g, ' ').trim().slice(0, 80) || 'markdown-preview'
// }

</script>

<style scoped>
/* 导入原来的样式 */
@import './styles/components/layout/app-layout.css';
@import './styles/components/notifications.css';


</style>
