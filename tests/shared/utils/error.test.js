/**
 * @file tests/shared/utils/error.test.js
 * @description 错误工具（AppError/ErrorHandler）测试
 */

import { describe, it, expect } from 'vitest'
import { AppError, ErrorHandler, ERROR_TYPES } from '../../../src/shared/utils/error.js'

describe('AppError', () => {
  it('应设置类型与时间戳', () => {
    const e = new AppError('msg', ERROR_TYPES.NETWORK)
    expect(e.type).toBe(ERROR_TYPES.NETWORK)
    expect(e.timestamp).toBeTruthy()
  })
})

describe('ErrorHandler.wrap/getUserMessage', () => {
  it('wrap 应将原始错误包装为 AppError', () => {
    const err = new Error('boom')
    const wrapped = ErrorHandler.wrap(err, ERROR_TYPES.FILE, 'ctx')
    expect(wrapped).toBeInstanceOf(AppError)
    expect(wrapped.message).toContain('ctx')
    expect(wrapped.type).toBe(ERROR_TYPES.FILE)
  })

  it('getUserMessage: AppError 返回自身消息，非 AppError 返回通用消息', () => {
    const ae = new AppError('x')
    expect(ErrorHandler.getUserMessage(ae)).toBe('x')
    expect(ErrorHandler.getUserMessage(new Error('y')).length).toBeGreaterThan(0)
  })
})

describe('ErrorHandler.handleClipboardError/handleNetworkError', () => {
  it('handleClipboardError: 超时/权限', () => {
    const timeout = new Error('timeout')
    const e1 = ErrorHandler.handleClipboardError(timeout, 10)
    expect(e1.message).toContain('超时')

    const perm = new Error('Permission denied')
    const e2 = ErrorHandler.handleClipboardError(perm)
    expect(e2.message).not.toContain('超时')
  })

  it('handleNetworkError: 根据状态码与超时组装消息', () => {
    const eTimeout = ErrorHandler.handleNetworkError(new Error('timeout'), '/api')
    expect(eTimeout.message).toContain('超时')

    const e404 = ErrorHandler.handleNetworkError(new Error('x'), '/404', 404)
    expect(e404.message).toContain('未找到')

    const e500 = ErrorHandler.handleNetworkError({ message: 'x', status: 500 }, '/500')
    expect(e500.message).toContain('服务器错误')
  })
})

describe('ErrorHandler.retry/safeExecute', () => {
  it('retry 成功与失败路径', async () => {
    let count = 0
    const ok = await ErrorHandler.retry(async () => {
      if (count++ < 1) throw new Error('boom')
      return 'done'
    }, { maxAttempts: 2, delay: 0 })
    expect(ok).toBe('done')

    await expect(ErrorHandler.retry(async () => { throw new Error('boom') }, { maxAttempts: 2, delay: 0 }))
      .rejects.toBeInstanceOf(AppError)
  })

  it('safeExecute 应将异常包装并重新抛出', async () => {
    await expect(ErrorHandler.safeExecute(async () => { throw new Error('bad') }, 'ctx'))
      .rejects.toBeInstanceOf(AppError)
  })
})

