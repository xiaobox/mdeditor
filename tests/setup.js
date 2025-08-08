/**
 * @file tests/setup.js
 * @description Vitest 测试全局初始化
 */

import { beforeAll, afterAll, vi } from 'vitest'

// 模拟 window.scrollTo 等可能缺失的浏览器 API
if (typeof window !== 'undefined' && typeof window.scrollTo !== 'function') {
  window.scrollTo = vi.fn()
}

// 为 JSDOM 提供 requestAnimationFrame/cancelAnimationFrame polyfill（部分依赖需要）
if (typeof window !== 'undefined') {
  if (typeof window.requestAnimationFrame !== 'function') {
    window.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 16)
  }
  if (typeof window.cancelAnimationFrame !== 'function') {
    window.cancelAnimationFrame = (id) => clearTimeout(id)
  }
}

// 补齐 Range#getClientRects / getBoundingClientRect（CodeMirror 在测量时会调用）
if (typeof window !== 'undefined' && window.document && typeof window.document.createRange === 'function') {
  const originalCreateRange = window.document.createRange.bind(window.document)
  window.document.createRange = function patchedCreateRange() {
    const range = originalCreateRange()
    if (!range.getBoundingClientRect) {
      range.getBoundingClientRect = () => ({ x: 0, y: 0, width: 0, height: 0, top: 0, left: 0, right: 0, bottom: 0 })
    }
    if (!range.getClientRects) {
      range.getClientRects = () => ({ item: () => null, length: 0, [Symbol.iterator]: function* () {} })
    }
    return range
  }
}
// 确保 Range.prototype 上存在 getClientRects （避免测量阶段报错）
if (typeof window !== 'undefined' && window.Range) {
  if (typeof window.Range.prototype.getClientRects !== 'function') {
    window.Range.prototype.getClientRects = () => ({ item: () => null, length: 0, [Symbol.iterator]: function* () {} })
  }
  if (typeof window.Range.prototype.getBoundingClientRect !== 'function') {
    window.Range.prototype.getBoundingClientRect = () => ({ x: 0, y: 0, width: 0, height: 0, top: 0, left: 0, right: 0, bottom: 0 })
  }
}


beforeAll(() => {
  // 预置 localStorage 初始值，避免测试中读取空值
  try {
    localStorage.clear()
  } catch {}
})

afterAll(() => {
  try {
    localStorage.clear()
  } catch {}
})


