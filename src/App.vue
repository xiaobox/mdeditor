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
import { useAppState, useElectron } from './composables/index.js'
import { useGlobalThemeManager } from './composables/index.js'
import { nextTick } from 'vue'
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

// 使用Electron集成
const {
  openFile,
  saveFile,
  setupMenuListeners
} = useElectron()

// 设置菜单监听器
nextTick(() => {
  console.log('⏰ 在下一个tick中设置菜单监听器...');
  setupMenuListeners({
    onOpenFile: (event, { filePath, content }) => {
      console.log('📁 渲染进程收到打开文件事件');
      console.log('📂 文件路径:', filePath);
      
      // 更新编辑器内容
      updateMarkdownContent(content);
      console.log('✅ 编辑器内容已更新');
      
      // 设置当前文件路径（通过 openFile 函数）
      openFile(filePath, content);
      console.log('📁 当前文件路径已设置');
      
      const fileName = filePath.split('/').pop() || filePath.split('\\').pop();
      console.log('🔔 显示成功通知:', fileName);
      showNotification('success', `已打开文件: ${fileName}`);
      
      console.log('🎉 文件打开流程完成');
    },
    onSaveFile: async () => {
      console.log('💾 渲染进程收到保存文件事件');
      try {
        const result = await saveFile(markdownContent.value);
        if (result.success) {
          console.log('✅ 文件保存成功:', result.filePath);
          const fileName = result.filePath.split('/').pop() || result.filePath.split('\\').pop();
          showNotification('success', `文件已保存: ${fileName}`);
        } else {
          console.log('❌ 文件保存失败:', result.message);
          showNotification('error', `保存失败: ${result.message}`);
        }
      } catch (error) {
        console.error('💥 保存文件时发生错误:', error);
        showNotification('error', `保存失败: ${error.message}`);
      }
    }
  })
})

// 初始化主题管理器（全局单例内部已自动调用 initialize）


</script>

<style scoped>
/* 导入原来的样式 */
@import './styles/components/layout/app-layout.css';
@import './styles/components/notifications.css';


</style>
