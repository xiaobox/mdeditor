/**
 * @file tests/composables/useThemeManager.test.js
 * @description useThemeManager 初始化与自定义主题应用测试
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { useGlobalThemeManager } from '../../src/composables/theme/useThemeManager.js'

describe('useThemeManager', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('style')
  })

  it('初始化后应设置 isInitialized=true 并应用默认主题', async () => {
    const tm = useGlobalThemeManager()
    expect(tm.isInitialized.value).toBe(true)
    // 等待防抖更新生效
    await new Promise(r => setTimeout(r, 30))
    const primary = document.documentElement.style.getPropertyValue('--theme-primary')
    expect(primary).toBeTruthy()
  })

  it('应用自定义主题后，变量应更新为自定义颜色', async () => {
    const tm = useGlobalThemeManager()
    const custom = {
      id: 'custom-test',
      name: '自定义测试',
      description: '测试',
      primary: '#ff0000',
      primaryHover: '#cc0000',
      primaryLight: 'rgba(255,0,0,0.08)',
      primaryDark: '#990000',
      inlineCodeBg: 'rgba(255,0,0,0.08)',
      inlineCodeText: '#990000',
      inlineCodeBorder: 'rgba(255,0,0,0.15)'
    }

    tm.cssManager.forceApplyColorTheme(custom)

    // 等待防抖写入样式
    await new Promise(r => setTimeout(r, 30))
    const style = document.documentElement.style
    expect(style.getPropertyValue('--theme-primary').trim()).toBe('#ff0000')
  })
})


