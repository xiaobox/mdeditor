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
 */

import { ref, computed, onMounted, watch } from 'vue'
import { useGlobalThemeManager } from './index.js'
import { getColorThemeList } from '../core/theme/presets/color-themes.js'

export function useSettingsPanel(props, emit) {
  // 使用统一主题管理器
  const themeManager = useGlobalThemeManager()

  // 解构所需功能
  const {
    currentThemeSystemId: currentLayoutId,
    themeSystemList: layoutList,
    setThemeSystem: setLayout,
    currentColorThemeId,
    currentColorTheme,
    setColorTheme,
    currentCodeStyleId,
    codeStyleList,
    setCodeStyle,
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
  const selectedThemeSystemId = ref(currentLayoutId.value)
  const selectedThemeId = ref(currentColorThemeId.value)
  const selectedCodeStyleId = ref(currentCodeStyleId.value)
  const selectedFontFamily = ref(currentFontFamily.value)
  const selectedFontSize = ref(currentFontSize.value)
  const selectedLetterSpacing = ref(currentFontSettings.value.letterSpacing ?? 0)
  const selectedLineHeight = ref(currentFontSettings.value.lineHeight ?? 1.6)
  const showColorPicker = ref(false)
  const selectedCustomColor = ref('#3b82f6')
  const currentCustomColor = ref('#3b82f6')
  const isUsingCustomColor = ref(false)
  const currentCustomTheme = ref(null)

  // 保存面板打开时的初始设置，用于应用设置时的比较
  const initialFontFamily = ref(currentFontFamily.value)
  const initialFontSize = ref(currentFontSize.value)
  const initialLetterSpacing = ref(currentFontSettings.value.letterSpacing ?? 0)
  const initialLineHeight = ref(currentFontSettings.value.lineHeight ?? 1.6)
  const initialCustomColor = ref('#3b82f6')
  const initialIsUsingCustomColor = ref(false)

  // 计算属性
  const builtinColorThemes = computed(() => getColorThemeList())
  const isCustomColorActive = computed(() => isUsingCustomColor.value)

  // 应用设置标志位
  const isApplyingSettings = ref(false)

  // 主题选择方法
  const selectThemeSystem = (systemId) => {
    selectedThemeSystemId.value = systemId
  }

  const selectTheme = (themeId) => {
    selectedThemeId.value = themeId
    isUsingCustomColor.value = false
    currentCustomTheme.value = null

    // 清除临时自定义颜色和标记
    try {
      localStorage.removeItem('temp-custom-color')
      localStorage.removeItem('temp-custom-theme')

      // 清除临时主题标记
      if (themeManager.themeState) {
        themeManager.themeState.hasTemporaryCustomTheme = false
      }
    } catch (error) {
      console.warn('Failed to clear custom color from localStorage:', error)
    }

    // 立即应用选中主题的颜色到CSS变量，以便选中状态边框颜色实时更新
    import('../core/theme/presets/color-themes.js').then(({ getColorTheme }) => {
      const fullTheme = getColorTheme(themeId)
      if (fullTheme) {
        themeManager.cssManager.applyColorTheme(fullTheme)
      }
    })
  }

  const selectCodeStyle = (styleId) => {
    selectedCodeStyleId.value = styleId
  }

  const selectFontFamily = (fontId) => {
    selectedFontFamily.value = fontId
  }

  const updateFontSize = (size) => {
    selectedFontSize.value = size
  }

  const updateLetterSpacing = (value) => {
    selectedLetterSpacing.value = value
  }

  const updateLineHeight = (value) => {
    selectedLineHeight.value = value
  }

  // 颜色处理辅助函数
  const adjustColorBrightness = (color, factor) => {
    if (!color) return color

    // 处理十六进制颜色
    if (color.startsWith('#')) {
      const hex = color.slice(1)
      const num = parseInt(hex, 16)
      const r = Math.round((num >> 16) * factor)
      const g = Math.round(((num >> 8) & 0x00FF) * factor)
      const b = Math.round((num & 0x0000FF) * factor)
      return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
    }

    return color
  }

  // 自定义颜色相关方法
  const toggleColorPicker = () => {
    if (!showColorPicker.value) {
      // 打开颜色选择器时，如果当前有自定义颜色，则设置为选中的颜色
      if (isUsingCustomColor.value && currentCustomColor.value) {
        selectedCustomColor.value = currentCustomColor.value
      }
    }
    showColorPicker.value = !showColorPicker.value
  }

  const closeColorPicker = () => {
    showColorPicker.value = false
  }

  const onColorChange = (color) => {
    selectedCustomColor.value = color
  }

  const onColorConfirm = async (color) => {
    try {
      // 导入颜色生成器来创建临时主题
      const { ColorThemeGenerator } = await import('../core/theme/presets/color-themes.js')
      const tempTheme = ColorThemeGenerator.generateThemeColors(color)

      // 创建完整的主题对象
      const customTheme = {
        id: 'temp-custom',
        name: '自定义颜色',
        description: '临时自定义颜色',
        ...tempTheme
      }

      // 设置状态
      currentCustomColor.value = color
      currentCustomTheme.value = customTheme // 保存自定义主题引用
      isUsingCustomColor.value = true
      selectedThemeId.value = null // 清除选中的内置主题
      showColorPicker.value = false

      // 保存到localStorage以便刷新后恢复
      try {
        localStorage.setItem('temp-custom-color', color)
        localStorage.setItem('temp-custom-theme', JSON.stringify(customTheme))
      } catch (error) {
        console.warn('Failed to save custom color to localStorage:', error)
      }

      // 设置临时主题标记
      if (themeManager.themeState) {
        themeManager.themeState.hasTemporaryCustomTheme = true
      }

      // 立即应用自定义主题
      themeManager.cssManager.forceApplyColorTheme(customTheme)

      // 触发自定义主题变化事件，通知其他组件
      window.dispatchEvent(new CustomEvent('custom-theme-changed', {
        detail: { theme: customTheme, color }
      }))

    } catch (error) {
      console.error('Failed to apply custom color:', error)
      emit('show-notification', '应用自定义颜色失败，请重试', 'error')
    }
  }

  // 重置选择状态
  const resetSelections = () => {
    selectedThemeSystemId.value = currentLayoutId.value
    selectedCodeStyleId.value = currentCodeStyleId.value
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

    showColorPicker.value = false

    // 检查是否有临时自定义主题
    try {
      const tempTheme = localStorage.getItem('temp-custom-theme')
      const tempColor = localStorage.getItem('temp-custom-color')

      if (tempTheme && tempColor) {
        // 有自定义主题，设置自定义状态
        currentCustomTheme.value = JSON.parse(tempTheme)
        currentCustomColor.value = tempColor
        selectedCustomColor.value = tempColor // 同步选中的自定义颜色
        isUsingCustomColor.value = true
        selectedThemeId.value = null // 清除内置主题选择
        // 记录初始自定义颜色状态
        initialCustomColor.value = tempColor
        initialIsUsingCustomColor.value = true
      } else {
        // 没有自定义主题，使用内置主题
        selectedThemeId.value = currentColorThemeId.value
        isUsingCustomColor.value = false
        currentCustomTheme.value = null
        // 记录初始状态
        initialIsUsingCustomColor.value = false
      }
    } catch (error) {
      console.warn('Failed to restore custom theme state:', error)
      // 出错时使用内置主题
      selectedThemeId.value = currentColorThemeId.value
      isUsingCustomColor.value = false
      currentCustomTheme.value = null
      initialIsUsingCustomColor.value = false
    }

    // 只有在没有临时自定义主题时才恢复CSS变量
    if (!isUsingCustomColor.value) {
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
    let delay = 0

    // 设置标志位，防止watch监听器重复应用字体设置
    isApplyingSettings.value = true

    // 应用布局主题系统
    if (selectedThemeSystemId.value !== currentLayoutId.value) {
      setLayout(selectedThemeSystemId.value)
      setTimeout(() => {
        const systemName = selectedThemeSystemId.value === 'default' ? '默认主题' : '主题系统'
        emit('show-notification', `主题风格已更新为${systemName}`, 'success')
      }, delay)
      delay += 100 // 每个通知间隔100ms
    }

    // 应用颜色主题（内置主题）
    if (!isUsingCustomColor.value && selectedThemeId.value !== currentColorThemeId.value) {
      setColorTheme(selectedThemeId.value)
      setTimeout(() => {
        emit('show-notification', '主题色已更新', 'success')
      }, delay)
      delay += 100
    }

    // 应用自定义颜色主题 - 只在实际发生变化时显示通知
    const customColorChanged = (
      (isUsingCustomColor.value !== initialIsUsingCustomColor.value) ||
      (isUsingCustomColor.value && currentCustomColor.value !== initialCustomColor.value)
    )

    if (customColorChanged && isUsingCustomColor.value && currentCustomColor.value) {
      setTimeout(() => {
        emit('show-notification', `自定义颜色主题已应用 (${currentCustomColor.value})`, 'success')
      }, delay)
      delay += 100
    }

    // 应用代码样式
    if (selectedCodeStyleId.value !== currentCodeStyleId.value) {
      setCodeStyle(selectedCodeStyleId.value)
      setTimeout(() => {
        const styleName = selectedCodeStyleId.value === 'mac' ? 'Mac 风格' :
                         selectedCodeStyleId.value === 'github' ? 'GitHub 风格' :
                         selectedCodeStyleId.value === 'vscode' ? 'VS Code 风格' :
                         selectedCodeStyleId.value === 'terminal' ? '终端风格' : '代码样式'
        emit('show-notification', `代码样式已更新为${styleName}`, 'success')
      }, delay)
      delay += 100 // 增加延迟，确保通知不重叠
    }

    // 应用字体设置 - 与面板打开时的初始值比较
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
      setTimeout(() => {
        const fontName = fontFamilyList.value.find(f => f.id === selectedFontFamily.value)?.name || '字体'
        emit('show-notification', `字体族已更新为${fontName}`, 'success')
      }, delay)
      delay += 100
    }

    if (fontSizeChanged) {
      setTimeout(() => {
        emit('show-notification', `字号已更新为${selectedFontSize.value}px`, 'success')
      }, delay)
      delay += 100
    }

    if (letterSpacingChanged) {
      setTimeout(() => {
        emit('show-notification', `字间距已更新为${selectedLetterSpacing.value}px`, 'success')
      }, delay)
      delay += 100
    }

    if (lineHeightChanged) {
      setTimeout(() => {
        emit('show-notification', `行间距已更新为${selectedLineHeight.value}`, 'success')
      }, delay)
      delay += 100
    }

    // 重置标志位
    setTimeout(() => {
      isApplyingSettings.value = false
    }, delay + 100)

    // 如果使用自定义颜色，在所有设置应用后重新应用自定义主题
    if (isUsingCustomColor.value && currentCustomTheme.value) {
      setTimeout(() => {
        // 重新设置临时主题标记
        if (themeManager.themeState) {
          themeManager.themeState.hasTemporaryCustomTheme = true
        }

        // 重新应用自定义主题（只应用颜色，不触发额外事件）
        themeManager.cssManager.forceApplyColorTheme(currentCustomTheme.value)

        // 触发自定义主题变化事件，通知PreviewPane等组件更新
        window.dispatchEvent(new CustomEvent('custom-theme-changed', {
          detail: { theme: currentCustomTheme.value, color: currentCustomColor.value }
        }))
      }, delay + 50) // 稍微延迟以确保其他设置先应用
    }

    emit('close')
  }

  return {
    // 主题管理器
    themeManager,

    // 状态
    selectedThemeSystemId,
    selectedThemeId,
    selectedCodeStyleId,
    selectedFontFamily,
    selectedFontSize,
    selectedLetterSpacing,
    selectedLineHeight,
    showColorPicker,
    selectedCustomColor,
    currentCustomColor,
    isUsingCustomColor,
    currentCustomTheme,
    isApplyingSettings,

    // 计算属性
    builtinColorThemes,
    isCustomColorActive,
    layoutList,
    codeStyleList,
    fontFamilyList,
    currentColorTheme,

    // 方法
    selectThemeSystem,
    selectTheme,
    selectCodeStyle,
    selectFontFamily,
    updateFontSize,
    updateLetterSpacing,
    updateLineHeight,
    adjustColorBrightness,
    toggleColorPicker,
    closeColorPicker,
    onColorChange,
    onColorConfirm,
    resetSelections,
    applySettings
  }
}
