/**
 * @file src/composables/useAppState.js
 * @description 应用状态管理 Composable
 *
 * 重构后的组合器，整合所有功能域的 composables：
 * - 内容状态管理 (useContentState)
 * - UI状态管理 (useUIState)
 * - 通知系统 (useNotification)
 * - 剪贴板功能 (useClipboard)
 *
 * 保持对外接口的完全兼容性，同时提供更好的模块化架构。
 */

import { useContentState } from './useContentState.js'
import { useUIState } from './useUIState.js'
import { useNotification } from './useNotification.js'
import { useClipboard } from './useClipboard.js'
import { EXTERNAL_LINKS } from '../config/constants/links.js'

export function useAppState() {
  // 初始化各个功能域的 composables
  const notification = useNotification()

  // 内容状态管理 - 传入通知回调
  const contentState = useContentState({
    onNotify: notification.showNotification
  })

  // UI状态管理
  const uiState = useUIState()

  // 剪贴板功能 - 传入通知回调和内容获取函数
  const clipboard = useClipboard({
    onNotify: notification.showNotification,
    getContent: () => contentState.markdownContent.value
  })

  // 外部链接功能
  const openGithub = () => {
    window.open(EXTERNAL_LINKS.GITHUB_REPO, '_blank')
  }

  return {
    // 内容状态 (来自 useContentState)
    markdownContent: contentState.markdownContent,
    htmlContent: contentState.htmlContent,
    hasContent: contentState.hasContent,
    isHtmlReady: contentState.isHtmlReady,
    characterCount: contentState.characterCount,
    lineCount: contentState.lineCount,
    wordCount: contentState.wordCount,
    estimatedReadTime: contentState.estimatedReadTime,
    updateMarkdownContent: contentState.updateMarkdownContent,
    updateHtmlContent: contentState.updateHtmlContent,
    clearContent: contentState.clearContent,
    loadSample: contentState.loadSample,

    // UI状态 (来自 useUIState)
    showSettingsPanel: uiState.showSettingsPanel,
    showMarkdownGuide: uiState.showMarkdownGuide,
    syncScrollEnabled: uiState.syncScrollEnabled,
    viewMode: uiState.viewMode,
    toggleSettingsPanel: uiState.toggleSettingsPanel,
    closeSettingsPanel: uiState.closeSettingsPanel,
    showGuide: uiState.showGuide,
    closeGuide: uiState.closeGuide,
    toggleSyncScroll: uiState.toggleSyncScroll,
    enableSyncScroll: uiState.enableSyncScroll,
    disableSyncScroll: uiState.disableSyncScroll,
    setViewMode: uiState.setViewMode,
    toggleViewMode: uiState.toggleViewMode,
    showBothPanes: uiState.showBothPanes,
    showEditorOnly: uiState.showEditorOnly,
    showPreviewOnly: uiState.showPreviewOnly,

    // 通知系统 (来自 useNotification)
    notifications: notification.notifications,
    showNotification: notification.showNotification,
    removeNotification: notification.removeNotification,

    // 剪贴板功能 (来自 useClipboard)
    copyFormatOptions: clipboard.copyFormatOptions,
    selectedCopyFormat: clipboard.selectedCopyFormat,
    handleCopyFormatSelect: clipboard.handleCopyFormatSelect,

    // 其他功能
    openGithub
  }
}
