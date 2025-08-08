/**
 * @file tests/core/theme/variables.test.js
 * @description 主题变量计算工具测试（hexToRgb / computeThemeVariables）
 */

import { describe, it, expect } from 'vitest'
import { hexToRgb, computeThemeVariables } from '../../../src/core/theme/variables.js'

describe('theme variables 工具函数', () => {
  it('hexToRgb 支持 6 位与 3 位十六进制', () => {
    expect(hexToRgb('#ff0000')).toEqual({ r: 255, g: 0, b: 0 })
    expect(hexToRgb('#0f0')).toEqual({ r: 0, g: 255, b: 0 })
    expect(hexToRgb('invalid')).toBeNull()
  })

  it('computeThemeVariables 生成核心变量与 rgb 变体', () => {
    const theme = {
      primary: '#ff0000',
      primaryHover: '#cc0000',
      primaryLight: 'rgba(255,0,0,0.08)',
      primaryDark: '#990000',
      textPrimary: '#111',
      textSecondary: '#222',
      textTertiary: '#333',
      bgPrimary: '#fff',
      bgSecondary: '#f6f8fa',
      bgTertiary: '#f1f3f4',
      borderLight: '#ddd',
      borderMedium: '#bbb',
      inlineCodeBg: 'rgba(255,0,0,0.08)',
      inlineCodeText: '#990000',
      inlineCodeBorder: 'rgba(255,0,0,0.15)',
      blockquoteBorder: '#ff0000',
      blockquoteBackground: 'rgba(255,0,0,0.05)',
      hrColor: '#ff0000',
      tableHeaderBg: '#f6f8fa',
      tableBorder: '#d0d7de',
      listColors: ['#ff0000', '#10A0FF']
    }

    const vars = computeThemeVariables(theme)
    expect(vars['--theme-primary']).toBe('#ff0000')
    expect(vars['--theme-primary-hover']).toBe('#cc0000')
    expect(vars['--theme-primary-rgb']).toBe('255, 0, 0')
    expect(vars['--theme-list-color-1']).toBe('#ff0000')
    expect(vars['--theme-list-color-2']).toBe('#10A0FF')
  })
})


