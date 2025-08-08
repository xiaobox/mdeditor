/**
 * @file tests/core/editor/clipboard.test.js
 * @description copyToSocialClean 剪贴板复制路径测试（现代API/降级/失败）
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { copyToSocialClean } from '../../../src/core/editor/clipboard.js'
import { AppError } from '../../../src/shared/utils/error.js'

describe('copyToSocialClean', () => {
  const origClipboard = global.navigator?.clipboard
  const origClipboardItem = global.ClipboardItem
  const origExec = document.execCommand
  const origGetSel = window.getSelection

  beforeEach(() => {
    // 清理 spy
    vi.restoreAllMocks()
  })

  afterEach(() => {
    // 还原全局
    if (origClipboard) {
      global.navigator.clipboard = origClipboard
    } else if (global.navigator) {
      delete global.navigator.clipboard
    }
    if (typeof origClipboardItem !== 'undefined') {
      global.ClipboardItem = origClipboardItem
    } else {
      delete global.ClipboardItem
    }
    document.execCommand = origExec
    window.getSelection = origGetSel
  })

  it('空内容应抛出 AppError', async () => {
    await expect(copyToSocialClean('')).rejects.toBeInstanceOf(AppError)
  })

  it('现代 Clipboard API 成功路径：不应创建 DOM 容器', async () => {
    // 模拟 ClipboardItem 与 clipboard.write 成功
    global.ClipboardItem = class ClipboardItem { constructor(items) { this.items = items } }
    global.navigator = { ...(global.navigator || {}), clipboard: { write: vi.fn(async () => true) } }
    const appendSpy = vi.spyOn(document.body, 'appendChild')

    const ok = await copyToSocialClean('<b>hi</b>')
    expect(ok).toBe(true)
    expect(global.navigator.clipboard.write).toHaveBeenCalled()
    expect(appendSpy).not.toHaveBeenCalled()
  })

  it('降级到 execCommand 成功路径', async () => {
    // 模拟 clipboard 不可用
    global.navigator = { ...(global.navigator || {}), clipboard: undefined }

    // 提供选择 API 与 execCommand
    window.getSelection = () => ({
      removeAllRanges: () => {},
      addRange: () => {}
    })
    document.execCommand = vi.fn(() => true)

    const ok = await copyToSocialClean('<i>x</i>')
    expect(ok).toBe(true)
    expect(document.execCommand).toHaveBeenCalledWith('copy')
  })

  it('execCommand 返回 false 或抛错时应抛出 AppError', async () => {
    global.navigator = { ...(global.navigator || {}), clipboard: undefined }
    window.getSelection = () => ({ removeAllRanges: () => {}, addRange: () => {} })
    document.execCommand = vi.fn(() => false)

    await expect(copyToSocialClean('<p>x</p>')).rejects.toBeInstanceOf(AppError)
  })
})

