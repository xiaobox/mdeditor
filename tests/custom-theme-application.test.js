/**
 * @file tests/custom-theme-application.test.js
 * @description 测试自定义主题应用功能
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { ColorThemeGenerator } from '../src/core/theme/presets/color-themes.js'
import { cssManager } from '../src/core/theme/manager.js'

// Mock DOM environment
const mockDocumentElement = {
  style: {
    setProperty: vi.fn(),
    getPropertyValue: vi.fn()
  }
}

// Mock document
global.document = {
  documentElement: mockDocumentElement
}

describe('自定义主题应用测试', () => {
  beforeEach(() => {
    // 清除所有mock调用
    mockDocumentElement.style.setProperty.mockClear()
    mockDocumentElement.style.getPropertyValue.mockClear()
    
    // 清除CSS管理器缓存
    cssManager._currentThemeCache = {
      colorTheme: null,
      codeStyle: null,
      themeSystem: null
    }
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('CSS变量应用', () => {
    it('应该正确应用自定义主题的CSS变量', () => {
      const customTheme = ColorThemeGenerator.createCustomTheme('#ff6b6b', '红色主题')
      
      cssManager.applyColorTheme(customTheme)
      
      // 验证CSS变量被设置
      expect(mockDocumentElement.style.setProperty).toHaveBeenCalled()
      
      // 检查主要颜色变量
      const calls = mockDocumentElement.style.setProperty.mock.calls
      const primaryCall = calls.find(call => call[0] === '--theme-primary')
      expect(primaryCall).toBeTruthy()
      expect(primaryCall[1]).toMatch(/^#[0-9a-f]{6}$/i) // 应该是有效的十六进制颜色
    })

    it('应该为自定义主题生成透明度变体', () => {
      const customTheme = ColorThemeGenerator.createCustomTheme('#3b82f6', '蓝色主题')
      
      cssManager.applyColorTheme(customTheme)
      
      const calls = mockDocumentElement.style.setProperty.mock.calls
      
      // 检查透明度变体
      const alpha15Call = calls.find(call => call[0] === '--theme-primary-15')
      const alpha20Call = calls.find(call => call[0] === '--theme-primary-20')
      
      expect(alpha15Call).toBeTruthy()
      expect(alpha20Call).toBeTruthy()
      expect(alpha15Call[1]).toMatch(/^rgba\(\d+, \d+, \d+, 0\.15\)$/)
      expect(alpha20Call[1]).toMatch(/^rgba\(\d+, \d+, \d+, 0\.20\)$/)
    })

    it('强制应用应该跳过缓存检查', () => {
      const customTheme = ColorThemeGenerator.createCustomTheme('#10b981', '绿色主题')
      
      // 第一次应用
      cssManager.applyColorTheme(customTheme)
      const firstCallCount = mockDocumentElement.style.setProperty.mock.calls.length
      
      // 清除mock调用记录但保持缓存
      mockDocumentElement.style.setProperty.mockClear()
      
      // 再次应用相同主题（应该被缓存跳过）
      cssManager.applyColorTheme(customTheme)
      expect(mockDocumentElement.style.setProperty).not.toHaveBeenCalled()
      
      // 强制应用（应该跳过缓存）
      cssManager.forceApplyColorTheme(customTheme)
      expect(mockDocumentElement.style.setProperty).toHaveBeenCalled()
    })
  })

  describe('缓存机制', () => {
    it('应该正确缓存自定义主题信息', () => {
      const customTheme = ColorThemeGenerator.createCustomTheme('#f59e0b', '橙色主题')
      
      cssManager.applyColorTheme(customTheme)
      
      // 检查缓存
      const cached = cssManager._currentThemeCache.colorTheme
      expect(cached).toBeTruthy()
      expect(cached.id).toBe(customTheme.id)
      expect(cached.primary).toBe(customTheme.primary)
    })

    it('应该能检测自定义主题的变化', () => {
      const theme1 = ColorThemeGenerator.createCustomTheme('#ef4444', '红色主题1')
      const theme2 = ColorThemeGenerator.createCustomTheme('#dc2626', '红色主题2')
      
      // 应用第一个主题
      cssManager.applyColorTheme(theme1)
      const firstCallCount = mockDocumentElement.style.setProperty.mock.calls.length
      
      // 清除调用记录
      mockDocumentElement.style.setProperty.mockClear()
      
      // 应用不同的主题（应该触发更新）
      cssManager.applyColorTheme(theme2)
      expect(mockDocumentElement.style.setProperty).toHaveBeenCalled()
    })
  })

  describe('颜色验证', () => {
    it('应该拒绝无效的主题对象', () => {
      cssManager.applyColorTheme(null)
      cssManager.applyColorTheme(undefined)
      cssManager.applyColorTheme({})
      
      expect(mockDocumentElement.style.setProperty).not.toHaveBeenCalled()
    })

    it('应该处理缺少某些属性的主题对象', () => {
      const incompleteTheme = {
        id: 'test-theme',
        name: '测试主题',
        primary: '#3b82f6'
        // 缺少其他属性
      }
      
      expect(() => {
        cssManager.applyColorTheme(incompleteTheme)
      }).not.toThrow()
      
      expect(mockDocumentElement.style.setProperty).toHaveBeenCalled()
    })
  })
})
