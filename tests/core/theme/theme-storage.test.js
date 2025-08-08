/**
 * @file tests/core/theme/theme-storage.test.js
 * @description ThemeStorage 与默认值读取/写入测试
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { ThemeStorage, STORAGE_KEYS, STORAGE_DEFAULTS } from '../../../src/core/theme/storage.js'

describe('ThemeStorage 本地存储', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('应读取默认值', () => {
    expect(ThemeStorage.load(STORAGE_KEYS.COLOR_THEME, STORAGE_DEFAULTS.COLOR_THEME))
      .toBe(STORAGE_DEFAULTS.COLOR_THEME)
  })

  it('保存后应能读取到对应值', () => {
    const themeId = 'meihei'
    ThemeStorage.save(STORAGE_KEYS.COLOR_THEME, themeId)
    expect(ThemeStorage.load(STORAGE_KEYS.COLOR_THEME, STORAGE_DEFAULTS.COLOR_THEME)).toBe(themeId)
  })

  it('saveAll 能批量写入', () => {
    const ok = ThemeStorage.saveAll({ colorTheme: 'conglv', codeStyle: 'github', themeSystem: 'default' })
    expect(ok).toBe(true)
    expect(ThemeStorage.load(STORAGE_KEYS.COLOR_THEME, '')).toBe('conglv')
    expect(ThemeStorage.load(STORAGE_KEYS.CODE_STYLE, '')).toBe('github')
    expect(ThemeStorage.load(STORAGE_KEYS.THEME_SYSTEM, '')).toBe('default')
  })
})


