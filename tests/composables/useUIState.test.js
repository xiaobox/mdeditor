/**
 * @file tests/composables/useUIState.test.js
 * @description useUIState composable 测试
 */

import { describe, it, expect } from 'vitest'

describe('useUIState', () => {
  it('应该能够切换设置面板', async () => {
    const { useUIState } = await import('@/composables/useUIState.js')
    const { showSettingsPanel, toggleSettingsPanel } = useUIState()

    expect(showSettingsPanel.value).toBe(false)

    toggleSettingsPanel()
    expect(showSettingsPanel.value).toBe(true)

    toggleSettingsPanel()
    expect(showSettingsPanel.value).toBe(false)
  })

  it('应该能够打开设置面板', async () => {
    const { useUIState } = await import('@/composables/useUIState.js')
    const { showSettingsPanel, openSettingsPanel } = useUIState()

    expect(showSettingsPanel.value).toBe(false)

    openSettingsPanel()
    expect(showSettingsPanel.value).toBe(true)

    // 再次调用不应改变状态
    openSettingsPanel()
    expect(showSettingsPanel.value).toBe(true)
  })

  it('应该能够关闭设置面板', async () => {
    const { useUIState } = await import('@/composables/useUIState.js')
    const { showSettingsPanel, openSettingsPanel, closeSettingsPanel } = useUIState()

    openSettingsPanel()
    expect(showSettingsPanel.value).toBe(true)

    closeSettingsPanel()
    expect(showSettingsPanel.value).toBe(false)
  })

  it('应该能够设置视图模式', async () => {
    const { useUIState } = await import('@/composables/useUIState.js')
    const { viewMode, setViewMode } = useUIState()

    expect(viewMode.value).toBe('both') // 默认值

    setViewMode('preview')
    expect(viewMode.value).toBe('preview')

    setViewMode('editor')
    expect(viewMode.value).toBe('editor')

    setViewMode('wysiwyg')
    expect(viewMode.value).toBe('wysiwyg')
  })

  it('应该能够循环切换视图模式', async () => {
    const { useUIState } = await import('@/composables/useUIState.js')
    const { viewMode, toggleViewMode } = useUIState()

    expect(viewMode.value).toBe('both')

    toggleViewMode()
    expect(viewMode.value).toBe('editor')

    toggleViewMode()
    expect(viewMode.value).toBe('preview')

    toggleViewMode()
    expect(viewMode.value).toBe('both') // 回到开始
  })

  it('应该提供便捷方法设置各视图模式', async () => {
    const { useUIState } = await import('@/composables/useUIState.js')
    const { viewMode, showBothPanes, showEditorOnly, showPreviewOnly } = useUIState()

    showEditorOnly()
    expect(viewMode.value).toBe('editor')

    showPreviewOnly()
    expect(viewMode.value).toBe('preview')

    showBothPanes()
    expect(viewMode.value).toBe('both')
  })

  it('应该能够切换 Markdown 指南', async () => {
    const { useUIState } = await import('@/composables/useUIState.js')
    const { showMarkdownGuide, toggleGuide } = useUIState()

    expect(showMarkdownGuide.value).toBe(false)

    toggleGuide()
    expect(showMarkdownGuide.value).toBe(true)

    toggleGuide()
    expect(showMarkdownGuide.value).toBe(false)
  })

  it('应该能够显示和关闭 Markdown 指南', async () => {
    const { useUIState } = await import('@/composables/useUIState.js')
    const { showMarkdownGuide, showGuide, closeGuide } = useUIState()

    showGuide()
    expect(showMarkdownGuide.value).toBe(true)

    closeGuide()
    expect(showMarkdownGuide.value).toBe(false)
  })

  it('应该能够切换同步滚动', async () => {
    const { useUIState } = await import('@/composables/useUIState.js')
    const { syncScrollEnabled, toggleSyncScroll } = useUIState()

    expect(syncScrollEnabled.value).toBe(true) // 默认启用

    toggleSyncScroll()
    expect(syncScrollEnabled.value).toBe(false)

    toggleSyncScroll()
    expect(syncScrollEnabled.value).toBe(true)
  })

  it('应该能够启用和禁用同步滚动', async () => {
    const { useUIState } = await import('@/composables/useUIState.js')
    const { syncScrollEnabled, enableSyncScroll, disableSyncScroll } = useUIState()

    disableSyncScroll()
    expect(syncScrollEnabled.value).toBe(false)

    enableSyncScroll()
    expect(syncScrollEnabled.value).toBe(true)
  })

  it('所有状态应该有正确的初始值', async () => {
    const { useUIState } = await import('@/composables/useUIState.js')
    const { showSettingsPanel, showMarkdownGuide, syncScrollEnabled, viewMode } = useUIState()

    expect(showSettingsPanel.value).toBe(false)
    expect(showMarkdownGuide.value).toBe(false)
    expect(syncScrollEnabled.value).toBe(true)
    expect(viewMode.value).toBe('both')
  })
})
