/**
 * @file src/composables/settings/useFontSettings.js
 * @description 字体设置相关逻辑
 *
 * 提供字体相关的状态管理和方法：
 * - 字体族选择
 * - 字号调整
 * - 字间距调整
 * - 行高调整
 */

import { ref } from 'vue'

/**
 * 字体设置 Composable
 * @param {Object} themeManager - 主题管理器实例
 * @returns {Object} 字体相关状态和方法
 */
export function useFontSettings(themeManager) {
  const {
    currentFontFamily,
    currentFontSize,
    currentFontSettings,
    fontFamilyList,
    setFontFamily,
    setFontSize,
    setLetterSpacing,
    setLineHeight
  } = themeManager

  // 本地状态
  const selectedFontFamily = ref(currentFontFamily.value)
  const selectedFontSize = ref(currentFontSize.value)
  const selectedLetterSpacing = ref(currentFontSettings.value.letterSpacing ?? 0)
  const selectedLineHeight = ref(currentFontSettings.value.lineHeight ?? 1.6)

  // 初始值管理（用于比较变化）
  const initialFontFamily = ref(currentFontFamily.value)
  const initialFontSize = ref(currentFontSize.value)
  const initialLetterSpacing = ref(currentFontSettings.value.letterSpacing ?? 0)
  const initialLineHeight = ref(currentFontSettings.value.lineHeight ?? 1.6)

  /**
   * 选择字体族
   * @param {string} fontId - 字体ID
   */
  const selectFontFamily = (fontId) => {
    selectedFontFamily.value = fontId
  }

  /**
   * 更新字号
   * @param {number} size - 字号大小 (px)
   */
  const updateFontSize = (size) => {
    selectedFontSize.value = size
  }

  /**
   * 更新字间距
   * @param {number} value - 字间距值 (px)
   */
  const updateLetterSpacing = (value) => {
    selectedLetterSpacing.value = value
  }

  /**
   * 更新行高
   * @param {number} value - 行高倍数
   */
  const updateLineHeight = (value) => {
    selectedLineHeight.value = value
  }

  /**
   * 重置字体选择状态
   */
  const resetFontSelections = () => {
    // 使用字体设置的ID而不是对象
    selectedFontFamily.value = currentFontSettings.value.fontFamily
    selectedFontSize.value = currentFontSettings.value.fontSize
    selectedLetterSpacing.value = currentFontSettings.value.letterSpacing ?? 0
    selectedLineHeight.value = currentFontSettings.value.lineHeight ?? 1.6

    // 更新初始设置值
    initialFontFamily.value = currentFontSettings.value.fontFamily
    initialFontSize.value = currentFontSettings.value.fontSize
    initialLetterSpacing.value = currentFontSettings.value.letterSpacing ?? 0
    initialLineHeight.value = currentFontSettings.value.lineHeight ?? 1.6
  }

  /**
   * 应用字体设置
   * @param {Function} safeSetTimeout - 安全的 setTimeout 包装函数
   * @param {Function} emit - Vue emit 函数
   * @param {number} startDelay - 起始延迟时间
   * @returns {number} 累计延迟时间
   */
  const applyFontSettings = (safeSetTimeout, emit, startDelay = 0) => {
    let delay = startDelay
    let fontFamilyChanged = false
    let fontSizeChanged = false
    let letterSpacingChanged = false
    let lineHeightChanged = false

    if (selectedFontFamily.value !== initialFontFamily.value) {
      setFontFamily(selectedFontFamily.value)
      fontFamilyChanged = true
    }
    if (selectedFontSize.value !== initialFontSize.value) {
      setFontSize(selectedFontSize.value)
      fontSizeChanged = true
    }
    if (selectedLetterSpacing.value !== initialLetterSpacing.value) {
      setLetterSpacing(selectedLetterSpacing.value)
      letterSpacingChanged = true
    }
    if (selectedLineHeight.value !== initialLineHeight.value) {
      setLineHeight(selectedLineHeight.value)
      lineHeightChanged = true
    }

    // 分别处理字体族和字号的通知
    if (fontFamilyChanged) {
      safeSetTimeout(() => {
        const fontName = fontFamilyList.value.find(f => f.id === selectedFontFamily.value)?.name || '字体'
        emit('show-notification', `字体族已更新为${fontName}`, 'success')
      }, delay)
      delay += 100
    }

    if (fontSizeChanged) {
      safeSetTimeout(() => {
        emit('show-notification', `字号已更新为${selectedFontSize.value}px`, 'success')
      }, delay)
      delay += 100
    }

    if (letterSpacingChanged) {
      safeSetTimeout(() => {
        emit('show-notification', `字间距已更新为${selectedLetterSpacing.value}px`, 'success')
      }, delay)
      delay += 100
    }

    if (lineHeightChanged) {
      safeSetTimeout(() => {
        emit('show-notification', `行间距已更新为${selectedLineHeight.value}`, 'success')
      }, delay)
      delay += 100
    }

    return delay
  }

  return {
    // 状态
    selectedFontFamily,
    selectedFontSize,
    selectedLetterSpacing,
    selectedLineHeight,

    // 初始值（供外部比较使用）
    initialFontFamily,
    initialFontSize,
    initialLetterSpacing,
    initialLineHeight,

    // 列表数据
    fontFamilyList,

    // 方法
    selectFontFamily,
    updateFontSize,
    updateLetterSpacing,
    updateLineHeight,
    resetFontSelections,
    applyFontSettings
  }
}
