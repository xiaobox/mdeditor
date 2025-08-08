/**
 * @file tests/setup.js
 * @description Vitest 测试全局初始化
 */

import { beforeAll, afterAll, vi } from 'vitest'

// 模拟 window.scrollTo 等可能缺失的浏览器 API
if (typeof window !== 'undefined' && typeof window.scrollTo !== 'function') {
  window.scrollTo = vi.fn()
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


