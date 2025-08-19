<template>
  <div id="app">
    <!-- 应用头部 -->
    <AppHeader
      :show-settings-panel="showSettingsPanel"
      :view-mode="viewMode"
      :copy-format-options="copyFormatOptions"
      :selected-copy-format="selectedCopyFormat"
      :has-content="hasContent"
      logo-src="./logo.svg"
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

// 使用Electron集成
const {
  openFile,
  saveFile,
  setupMenuListeners,
  setupFileUpdateListener,
  currentFilePath
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
  
  // 设置文件内容更新监听器
  setupFileUpdateListener((event, { filePath, content }) => {
    console.log('📨 收到文件内容更新事件');
    console.log('📂 文件路径:', filePath);
    console.log('📄 新内容长度:', content.length);
    
    // 检查是否是当前打开的文件
    if (currentFilePath.value === filePath) {
      console.log('🔄 更新当前文件内容...');
      
      // 检查内容是否真的发生了变化
      if (markdownContent.value !== content) {
        // 更新编辑器内容
        updateMarkdownContent(content);
        console.log('✅ 编辑器内容已自动更新');
        
        // 显示更新通知
        const fileName = filePath.split('/').pop() || filePath.split('\\').pop();
        showNotification(`文件已更新: ${fileName}`);
        
        // 可选：记录更新日志
        console.log('📝 文件内容更新记录:', {
          filePath,
          oldLength: markdownContent.value.length,
          newLength: content.length,
          timestamp: new Date().toISOString()
        });
      } else {
        console.log('ℹ️ 内容相同，无需更新');
      }
    } else {
      console.log('ℹ️ 不是当前打开的文件，忽略更新:', filePath);
    }
  });
})

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
