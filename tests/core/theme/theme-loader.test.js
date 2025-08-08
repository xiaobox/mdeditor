/**
 * @file tests/core/theme/theme-loader.test.js
 * @description 主题预加载（theme-loader）首屏变量注入测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'

// 通过 JSDOM 执行，直接加载模块函数体
describe('theme-loader 预加载', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('style')
    vi.resetModules()
  })

  it('无存储时使用默认主题变量', async () => {
    await import('../../../src/core/theme/theme-loader.js')
    const style = document.documentElement.style
    expect(style.getPropertyValue('--theme-primary')).toBeTruthy()
  })

  it('存在临时自定义主题时优先使用，避免 FOUC', async () => {
    const custom = {
      primary: '#ff0000',
      primaryHover: '#cc0000',
      primaryLight: 'rgba(255,0,0,0.08)',
      primaryDark: '#990000',
      inlineCodeBg: 'rgba(255,0,0,0.08)',
      inlineCodeText: '#990000',
      inlineCodeBorder: 'rgba(255,0,0,0.15)'
    }
    localStorage.setItem('temp-custom-theme', JSON.stringify(custom))
    await import('../../../src/core/theme/theme-loader.js')

    const style = document.documentElement.style
    expect(style.getPropertyValue('--theme-primary').trim()).toBe('#ff0000')
  })
})


