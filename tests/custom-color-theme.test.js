/**
 * @file tests/custom-color-theme.test.js
 * @description 自定义颜色主题功能测试
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { ColorThemeGenerator } from '../src/core/theme/presets/color-themes.js'

describe('ColorThemeGenerator', () => {
  describe('颜色转换功能', () => {
    it('应该正确转换十六进制颜色到HSL', () => {
      const result = ColorThemeGenerator.hexToHsl('#ff0000')
      expect(result.h).toBeCloseTo(0, 1)
      expect(result.s).toBeCloseTo(100, 1)
      expect(result.l).toBeCloseTo(50, 1)
    })

    it('应该正确转换HSL到十六进制颜色', () => {
      const result = ColorThemeGenerator.hslToHex(0, 100, 50)
      expect(result.toLowerCase()).toBe('#ff0000')
    })

    it('应该正确计算颜色亮度', () => {
      const whiteLuminance = ColorThemeGenerator.getLuminance('#ffffff')
      const blackLuminance = ColorThemeGenerator.getLuminance('#000000')
      
      expect(whiteLuminance).toBeCloseTo(1, 2)
      expect(blackLuminance).toBeCloseTo(0, 2)
    })

    it('应该正确计算对比度', () => {
      const contrast = ColorThemeGenerator.getContrastRatio('#ffffff', '#000000')
      expect(contrast).toBeCloseTo(21, 1)
    })
  })

  describe('主题色板生成', () => {
    it('应该从主色生成完整的主题色板', () => {
      const colors = ColorThemeGenerator.generateThemeColors('#3b82f6')
      
      expect(colors).toHaveProperty('primary')
      expect(colors).toHaveProperty('primaryHover')
      expect(colors).toHaveProperty('primaryLight')
      expect(colors).toHaveProperty('primaryDark')
      expect(colors).toHaveProperty('inlineCodeBg')
      expect(colors).toHaveProperty('inlineCodeText')
      expect(colors).toHaveProperty('inlineCodeBorder')
      
      // 验证颜色格式
      expect(colors.primary).toMatch(/^#[0-9a-f]{6}$/i)
      expect(colors.primaryHover).toMatch(/^#[0-9a-f]{6}$/i)
      expect(colors.primaryDark).toMatch(/^#[0-9a-f]{6}$/i)
      expect(colors.primaryLight).toMatch(/^rgba\(\d+, \d+, \d+, 0\.08\)$/)
    })

    it('应该确保生成的颜色有足够的对比度', () => {
      const colors = ColorThemeGenerator.generateThemeColors('#ffff00') // 黄色，可能对比度不够
      const contrast = ColorThemeGenerator.getContrastRatio(colors.primary, '#ffffff')
      
      expect(contrast).toBeGreaterThanOrEqual(4.5)
    })

    it('应该创建完整的自定义主题对象', () => {
      const theme = ColorThemeGenerator.createCustomTheme('#3b82f6', '测试主题', '测试描述')
      
      expect(theme).toHaveProperty('id')
      expect(theme).toHaveProperty('name', '测试主题')
      expect(theme).toHaveProperty('description', '测试描述')
      expect(theme).toHaveProperty('primary')
      expect(theme.id).toMatch(/^custom-\d+$/)
    })
  })

  describe('颜色调整功能', () => {
    it('应该调整颜色以满足对比度要求', () => {
      const adjustedColor = ColorThemeGenerator.adjustColorForContrast('#ffff00', '#ffffff', 4.5)
      const contrast = ColorThemeGenerator.getContrastRatio(adjustedColor, '#ffffff')
      
      expect(contrast).toBeGreaterThanOrEqual(4.5)
    })

    it('对于已经满足对比度的颜色应该保持不变', () => {
      const originalColor = '#000000'
      const adjustedColor = ColorThemeGenerator.adjustColorForContrast(originalColor, '#ffffff', 4.5)
      
      expect(adjustedColor).toBe(originalColor)
    })
  })
})

describe('自定义主题存储', () => {
  it('应该能够序列化和反序列化自定义主题', () => {
    const theme = ColorThemeGenerator.createCustomTheme('#3b82f6', '测试主题')

    // 序列化
    const serialized = JSON.stringify([theme])
    expect(serialized).toBeTruthy()

    // 反序列化
    const deserialized = JSON.parse(serialized)
    expect(deserialized).toHaveLength(1)
    expect(deserialized[0].id).toBe(theme.id)
    expect(deserialized[0].name).toBe(theme.name)
    expect(deserialized[0].primary).toBe(theme.primary)
  })

  it('应该处理无效的JSON数据', () => {
    let themes = []
    try {
      themes = JSON.parse('invalid json')
    } catch {
      themes = []
    }

    expect(themes).toEqual([])
  })
})
