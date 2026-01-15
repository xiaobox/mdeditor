/**
 * @file src/composables/useSettingsPanel.js
 * @description 设置面板逻辑管理 Composable
 *
 * 提供设置面板的所有状态管理和业务逻辑，包括：
 * - 本地状态管理
 * - 主题选择逻辑
 * - 自定义颜色处理
 * - 设置应用逻辑
 * - 颜色处理工具函数
 *
 * 本模块组合使用以下子模块：
 * - useColorSettings - 颜色相关逻辑
 * - useFontSettings - 字体相关逻辑
 * - useThemeSettings - 主题选择逻辑
 */

import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useGlobalThemeManager } from './index.js'
import { useColorSettings, useFontSettings, useThemeSettings } from './settings/index.js'

export function useSettingsPanel(props, emit) {
  // 使用统一主题管理器
  const themeManager = useGlobalThemeManager()

  // 组合子模块
  const colorSettings = useColorSettings(themeManager, emit)
  const fontSettings = useFontSettings(themeManager)
  const themeSettings = useThemeSettings(themeManager, colorSettings)

  // 应用设置标志位
  const isApplyingSettings = ref(false)

  // 存储所有 setTimeout ID，便于清理
  const pendingTimeouts = ref([])

  // 初始自定义颜色状态（用于比较变化）
  const initialCustomColor = ref('#3b82f6')
  const initialIsUsingCustomColor = ref(false)

  // 清理所有待处理的 setTimeout
  const clearPendingTimeouts = () => {
    pendingTimeouts.value.forEach(id => clearTimeout(id))
    pendingTimeouts.value = []
  }

  // 安全的 setTimeout 包装函数
  const safeSetTimeout = (callback, delay) => {
    const id = setTimeout(() => {
      // 执行后从列表中移除
      pendingTimeouts.value = pendingTimeouts.value.filter(tid => tid !== id)
      callback()
    }, delay)
    pendingTimeouts.value.push(id)
    return id
  }

  // 重置选择状态
  const resetSelections = () => {
    // 重置主题选择
    themeSettings.resetThemeSelections()

    // 重置字体选择
    fontSettings.resetFontSelections()

    // 重置颜色状态并获取初始值
    const colorState = colorSettings.resetColorState(themeSettings.currentColorThemeId.value)
    initialCustomColor.value = colorState.initialCustomColor
    initialIsUsingCustomColor.value = colorState.initialIsUsingCustomColor
    themeSettings.setSelectedThemeId(colorState.selectedThemeId)

    // 只有在没有临时自定义主题时才恢复CSS变量
    if (!colorSettings.isUsingCustomColor.value) {
      themeManager.updateAllCSS()
    }
  }

  // 当面板打开时重置选择
  onMounted(() => {
    resetSelections()
  })

  // 监听visible变化，当面板打开时重置选择，关闭时恢复主题
  watch(() => props.visible, (newVisible, oldVisible) => {
    if (newVisible) {
      resetSelections()
    } else if (oldVisible) {
      // 面板关闭时，只有在没有使用自定义主题时才恢复主题
      // 如果使用自定义主题，保持当前状态不变
      if (!themeManager.themeState.hasTemporaryCustomTheme) {
        themeManager.updateAllCSS()
      }
    }
  })

  // 应用设置方法
  const applySettings = () => {
    // 先清理之前可能未完成的定时器
    clearPendingTimeouts()

    // 设置标志位，防止watch监听器重复应用字体设置
    isApplyingSettings.value = true

    // 应用主题设置
    let delay = themeSettings.applyThemeSettings(
      safeSetTimeout,
      emit,
      0,
      { isUsingCustomColor: colorSettings.isUsingCustomColor.value }
    )

    // 应用自定义颜色主题 - 只在实际发生变化时显示通知
    const customColorChanged = (
      (colorSettings.isUsingCustomColor.value !== initialIsUsingCustomColor.value) ||
      (colorSettings.isUsingCustomColor.value && colorSettings.currentCustomColor.value !== initialCustomColor.value)
    )

    if (customColorChanged && colorSettings.isUsingCustomColor.value && colorSettings.currentCustomColor.value) {
      safeSetTimeout(() => {
        emit('show-notification', `自定义颜色主题已应用 (${colorSettings.currentCustomColor.value})`, 'success')
      }, delay)
      delay += 100
    }

    // 应用字体设置
    delay = fontSettings.applyFontSettings(safeSetTimeout, emit, delay)

    // 重置标志位
    safeSetTimeout(() => {
      isApplyingSettings.value = false
    }, delay + 100)

    // 如果使用自定义颜色，在所有设置应用后重新应用自定义主题
    if (colorSettings.isUsingCustomColor.value && colorSettings.currentCustomTheme.value) {
      safeSetTimeout(() => {
        colorSettings.reapplyCustomTheme()
      }, delay + 50) // 稍微延迟以确保其他设置先应用
    }

    emit('close')
  }

  // 组件卸载时清理定时器
  onUnmounted(() => {
    clearPendingTimeouts()
  })

  // 包装 onColorConfirm 以传递清除主题选择的回调
  const onColorConfirm = (color) => {
    colorSettings.onColorConfirm(color, themeSettings.clearThemeSelection)
  }

  return {
    // 主题管理器
    themeManager,

    // 状态 - 主题设置
    selectedThemeSystemId: themeSettings.selectedThemeSystemId,
    selectedThemeId: themeSettings.selectedThemeId,
    selectedCodeStyleId: themeSettings.selectedCodeStyleId,

    // 状态 - 字体设置
    selectedFontFamily: fontSettings.selectedFontFamily,
    selectedFontSize: fontSettings.selectedFontSize,
    selectedLetterSpacing: fontSettings.selectedLetterSpacing,
    selectedLineHeight: fontSettings.selectedLineHeight,

    // 状态 - 颜色设置
    showColorPicker: colorSettings.showColorPicker,
    selectedCustomColor: colorSettings.selectedCustomColor,
    currentCustomColor: colorSettings.currentCustomColor,
    isUsingCustomColor: colorSettings.isUsingCustomColor,
    currentCustomTheme: colorSettings.currentCustomTheme,

    // 应用设置标志
    isApplyingSettings,

    // 计算属性
    builtinColorThemes: themeSettings.builtinColorThemes,
    isCustomColorActive: colorSettings.isCustomColorActive,
    layoutList: themeSettings.layoutList,
    codeStyleList: themeSettings.codeStyleList,
    fontFamilyList: fontSettings.fontFamilyList,
    currentColorTheme: themeSettings.currentColorTheme,

    // 方法 - 主题选择
    selectThemeSystem: themeSettings.selectThemeSystem,
    selectTheme: themeSettings.selectTheme,
    selectCodeStyle: themeSettings.selectCodeStyle,

    // 方法 - 字体设置
    selectFontFamily: fontSettings.selectFontFamily,
    updateFontSize: fontSettings.updateFontSize,
    updateLetterSpacing: fontSettings.updateLetterSpacing,
    updateLineHeight: fontSettings.updateLineHeight,

    // 方法 - 颜色设置
    adjustColorBrightness: colorSettings.adjustColorBrightness,
    toggleColorPicker: colorSettings.toggleColorPicker,
    closeColorPicker: colorSettings.closeColorPicker,
    onColorChange: colorSettings.onColorChange,
    onColorConfirm,

    // 方法 - 通用
    resetSelections,
    applySettings
  }
}
