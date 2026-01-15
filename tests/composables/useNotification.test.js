/**
 * @file tests/composables/useNotification.test.js
 * @description useNotification composable 测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock Vue 的 onUnmounted，避免在测试环境中因为不在组件上下文而报错
vi.mock('vue', async () => {
  const actual = await vi.importActual('vue')
  return {
    ...actual,
    onUnmounted: vi.fn() // 在测试环境中忽略 onUnmounted
  }
})

describe('useNotification', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.useRealTimers()
  })

  it('应该能够显示通知', async () => {
    const { useNotification } = await import('@/composables/useNotification.js')
    const { showNotification, notifications } = useNotification()

    showNotification('测试消息', 'success')

    expect(notifications.value.length).toBe(1)
    expect(notifications.value[0].message).toBe('测试消息')
    expect(notifications.value[0].type).toBe('success')
  })

  it('应该返回通知 ID', async () => {
    const { useNotification } = await import('@/composables/useNotification.js')
    const { showNotification } = useNotification()

    const id = showNotification('测试消息', 'info')

    expect(id).toBeDefined()
    expect(typeof id).toBe('number')
  })

  it('应该在超时后自动移除通知', async () => {
    const { useNotification } = await import('@/composables/useNotification.js')
    const { showNotification, notifications } = useNotification()

    showNotification('测试消息', 'success', 1000)
    expect(notifications.value.length).toBe(1)

    // 等待自动移除定时器触发
    vi.advanceTimersByTime(1100)

    // 通知会被标记为 isRemoving
    expect(notifications.value[0].isRemoving).toBe(true)

    // 再等待动画完成（400ms）
    vi.advanceTimersByTime(500)

    expect(notifications.value.length).toBe(0)
  })

  it('应该能够手动移除通知', async () => {
    const { useNotification } = await import('@/composables/useNotification.js')
    const { showNotification, removeNotification, notifications } = useNotification()

    const id = showNotification('测试消息', 'info', 10000) // 长时间，避免自动移除
    expect(notifications.value.length).toBe(1)

    removeNotification(id)

    // 通知会被标记为 isRemoving
    expect(notifications.value[0].isRemoving).toBe(true)

    // 等待动画完成
    vi.advanceTimersByTime(500)

    expect(notifications.value.length).toBe(0)
  })

  it('应该支持多个通知同时存在', async () => {
    const { useNotification } = await import('@/composables/useNotification.js')
    const { showNotification, notifications } = useNotification()

    showNotification('消息1', 'info', 10000)
    showNotification('消息2', 'success', 10000)
    showNotification('消息3', 'warning', 10000)

    expect(notifications.value.length).toBe(3)
    expect(notifications.value[0].message).toBe('消息1')
    expect(notifications.value[1].message).toBe('消息2')
    expect(notifications.value[2].message).toBe('消息3')
  })

  it('应该能够清除所有通知', async () => {
    const { useNotification } = await import('@/composables/useNotification.js')
    const { showNotification, clearAllNotifications, notifications } = useNotification()

    showNotification('消息1', 'info', 10000)
    showNotification('消息2', 'success', 10000)
    expect(notifications.value.length).toBe(2)

    clearAllNotifications()

    // 所有通知被标记为 isRemoving
    notifications.value.forEach(n => {
      expect(n.isRemoving).toBe(true)
    })

    // 等待动画完成
    vi.advanceTimersByTime(500)

    expect(notifications.value.length).toBe(0)
  })

  it('应该提供便捷方法 showSuccess', async () => {
    const { useNotification } = await import('@/composables/useNotification.js')
    const { showSuccess, notifications } = useNotification()

    showSuccess('成功消息')

    expect(notifications.value.length).toBe(1)
    expect(notifications.value[0].type).toBe('success')
  })

  it('应该提供便捷方法 showError', async () => {
    const { useNotification } = await import('@/composables/useNotification.js')
    const { showError, notifications } = useNotification()

    showError('错误消息')

    expect(notifications.value.length).toBe(1)
    expect(notifications.value[0].type).toBe('error')
  })

  it('应该提供便捷方法 showWarning', async () => {
    const { useNotification } = await import('@/composables/useNotification.js')
    const { showWarning, notifications } = useNotification()

    showWarning('警告消息')

    expect(notifications.value.length).toBe(1)
    expect(notifications.value[0].type).toBe('warning')
  })

  it('应该提供便捷方法 showInfo', async () => {
    const { useNotification } = await import('@/composables/useNotification.js')
    const { showInfo, notifications } = useNotification()

    showInfo('信息消息')

    expect(notifications.value.length).toBe(1)
    expect(notifications.value[0].type).toBe('info')
  })

  it('通知应该包含时间戳', async () => {
    const { useNotification } = await import('@/composables/useNotification.js')
    const { showNotification, notifications } = useNotification()

    showNotification('测试消息', 'info')

    expect(notifications.value[0].timestamp).toBeInstanceOf(Date)
  })
})
