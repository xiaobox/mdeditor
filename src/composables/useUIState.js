/**
 * @file src/composables/useUIState.js
 * @description UI状态管理 Composable
 *
 * 专门管理界面元素的显示和隐藏状态，包括：
 * - 设置面板的显示/隐藏
 * - Markdown指南的显示/隐藏
 * - 其他UI元素的状态控制
 */

import { ref } from 'vue'

/**
 * UI状态管理 Composable
 * @returns {Object} UI状态和控制方法
 */
export function useUIState() {
  // 状态
  const showSettingsPanel = ref(false)
  const showMarkdownGuide = ref(false)
  const syncScrollEnabled = ref(true) // 默认启用同步滚动
  const viewMode = ref('both') // 'both', 'editor', 'preview', 'wysiwyg'

  // 设置面板控制方法
  const toggleSettingsPanel = () => {
    showSettingsPanel.value = !showSettingsPanel.value
  }

  const closeSettingsPanel = () => {
    showSettingsPanel.value = false
  }

  const openSettingsPanel = () => {
    showSettingsPanel.value = true
  }

  // Markdown指南控制方法
  const showGuide = () => {
    showMarkdownGuide.value = true
  }

  const closeGuide = () => {
    showMarkdownGuide.value = false
  }

  const toggleGuide = () => {
    showMarkdownGuide.value = !showMarkdownGuide.value
  }

  // 同步滚动控制方法
  const toggleSyncScroll = () => {
    syncScrollEnabled.value = !syncScrollEnabled.value
  }

  const enableSyncScroll = () => {
    syncScrollEnabled.value = true
  }

  const disableSyncScroll = () => {
    syncScrollEnabled.value = false
  }

  // 视图模式控制方法
  const setViewMode = (mode) => {
    viewMode.value = mode
  }

  const toggleViewMode = () => {
    const modes = ['both', 'editor', 'preview']
    const currentIndex = modes.indexOf(viewMode.value)
    const nextIndex = (currentIndex + 1) % modes.length
    viewMode.value = modes[nextIndex]
  }

  const showBothPanes = () => {
    viewMode.value = 'both'
  }

  const showEditorOnly = () => {
    viewMode.value = 'editor'
  }

  const showPreviewOnly = () => {
    viewMode.value = 'preview'
  }

  return {
    // 状态
    showSettingsPanel,
    showMarkdownGuide,
    syncScrollEnabled,
    viewMode,

    // 设置面板方法
    toggleSettingsPanel,
    closeSettingsPanel,
    openSettingsPanel,

    // Markdown指南方法
    showGuide,
    closeGuide,
    toggleGuide,

    // 同步滚动方法
    toggleSyncScroll,
    enableSyncScroll,
    disableSyncScroll,

    // 视图模式方法
    setViewMode,
    toggleViewMode,
    showBothPanes,
    showEditorOnly,
    showPreviewOnly
  }
}
