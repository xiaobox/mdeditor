/**
 * @file tests/shared/utils/performance.test.js
 * @description 性能工具（SimpleCache/memoize/debounce）测试
 */

import { describe, it, expect, vi } from 'vitest'
import { SimpleCache, memoize, debounce } from '../../../src/shared/utils/performance.js'

describe('SimpleCache', () => {
  it('应遵守最大容量并淘汰最早写入项', () => {
    const c = new SimpleCache(2)
    c.set('a', 1); c.set('b', 2); c.set('c', 3)
    expect(c.get('a')).toBeUndefined()
    expect(c.get('b')).toBe(2)
    expect(c.get('c')).toBe(3)
  })
})

describe('memoize', () => {
  it('应缓存相同参数的调用结果', () => {
    const spy = vi.fn((x, y) => x + y)
    const m = memoize(spy)
    expect(m(1, 2)).toBe(3)
    expect(m(1, 2)).toBe(3)
    expect(spy).toHaveBeenCalledTimes(1)
  })
})

describe('debounce', () => {
  it('应在延时后仅调用一次', async () => {
    vi.useFakeTimers()
    const fn = vi.fn()
    const d = debounce(fn, 50)
    d(); d(); d();
    vi.advanceTimersByTime(49)
    expect(fn).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(fn).toHaveBeenCalledTimes(1)
    vi.useRealTimers()
  })
})

