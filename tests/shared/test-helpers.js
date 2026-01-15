/**
 * @file tests/shared/test-helpers.js
 * @description 测试公共工具函数
 */

import { vi } from 'vitest'

/**
 * 设置测试环境
 */
export function setupTestEnv() {
  localStorage.clear()
  document.documentElement.removeAttribute('style')
}

/**
 * 清理测试环境
 */
export function teardownTestEnv() {
  localStorage.clear()
  document.documentElement.removeAttribute('style')
  vi.clearAllMocks()
}

/**
 * 创建模拟的 CodeMirror 编辑器
 */
export function createMockEditor(initialText = '', from = 0, to = 0) {
  return {
    state: {
      doc: {
        toString: () => initialText,
        lineAt: (pos) => ({ from: 0, to: initialText.length, text: initialText }),
        line: (n) => ({ from: 0, to: initialText.length, text: initialText }),
        length: initialText.length
      },
      selection: {
        main: { from, to, head: to, anchor: from }
      }
    },
    dispatch: vi.fn()
  }
}

/**
 * 等待异步操作完成
 */
export async function waitFor(ms = 0) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 模拟 localStorage
 */
export function createMockLocalStorage() {
  const store = {}
  return {
    getItem: vi.fn(key => store[key] || null),
    setItem: vi.fn((key, value) => { store[key] = value }),
    removeItem: vi.fn(key => { delete store[key] }),
    clear: vi.fn(() => { Object.keys(store).forEach(k => delete store[k]) }),
    get length() { return Object.keys(store).length },
    key: vi.fn(i => Object.keys(store)[i] || null)
  }
}
