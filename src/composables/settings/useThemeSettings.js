/**
 * @file src/composables/settings/useThemeSettings.js
 * @description 主题选择相关逻辑
 *
 * 提供主题相关的状态管理和方法：
 * - 主题系统选择
 * - 颜色主题选择
 * - 代码样式选择
 */

import { ref, computed } from 'vue'
import { getColorThemeList } from '../../core/theme/index.js'

/**
 * 主题设置 Composable
 * @param {Object} themeManager - 主题管理器实例
 * @param {Object} colorSettings - 颜色设置模块返回值
 * @returns {Object} 主题相关状态和方法
 */
export function useThemeSettings(themeManager, colorSettings) {
  const {
    currentThemeSystemId: currentLayoutId,
    themeSystemList: layoutList,
    setThemeSystem: setLayout,
    currentColorThemeId,
    currentColorTheme,
    setColorTheme,
    currentCodeStyleId,
    codeStyleList,
    setCodeStyle
  } = themeManager

  // 本地状态
  const selectedThemeSystemId = ref(currentLayoutId.value)
  const selectedThemeId = ref(currentColorThemeId.value)
  const selectedCodeStyleId = ref(currentCodeStyleId.value)

  // 计算属性
  const builtinColorThemes = computed(() => getColorThemeList())

  /**
   * 选择主题系统
   * @param {string} systemId - 主题系统ID
   */
  const selectThemeSystem = (systemId) => {
    selectedThemeSystemId.value = systemId
  }

  /**
   * 选择颜色主题
   * @param {string} themeId - 主题ID
   */
  const selectTheme = (themeId) => {
    selectedThemeId.value = themeId

    // 清除自定义颜色状态
    if (colorSettings) {
      colorSettings.clearCustomColor()
    }

    // 立即应用选中主题的颜色到CSS变量，以便选中状态边框颜色实时更新
    import('../../core/theme/index.js').then(({ getColorTheme }) => {
      const fullTheme = getColorTheme(themeId)
      if (fullTheme) {
        themeManager.cssManager.applyColorTheme(fullTheme)
      }
    })
  }

  /**
   * 选择代码样式
   * @param {string} styleId - 样式ID
   */
  const selectCodeStyle = (styleId) => {
    selectedCodeStyleId.value = styleId
  }

  /**
   * 重置主题选择状态
   */
  const resetThemeSelections = () => {
    selectedThemeSystemId.value = currentLayoutId.value
    selectedCodeStyleId.value = currentCodeStyleId.value
  }

  /**
   * 设置选中的主题ID
   * @param {string|null} themeId - 主题ID
   */
  const setSelectedThemeId = (themeId) => {
    selectedThemeId.value = themeId
  }

  /**
   * 清除主题选择（用于自定义颜色确认时）
   */
  const clearThemeSelection = () => {
    selectedThemeId.value = null
  }

  /**
   * 应用主题设置
   * @param {Function} safeSetTimeout - 安全的 setTimeout 包装函数
   * @param {Function} emit - Vue emit 函数
   * @param {number} startDelay - 起始延迟时间
   * @param {Object} colorState - 颜色状态
   * @returns {number} 累计延迟时间
   */
  const applyThemeSettings = (safeSetTimeout, emit, startDelay = 0, colorState = {}) => {
    let delay = startDelay

    // 应用布局主题系统
    if (selectedThemeSystemId.value !== currentLayoutId.value) {
      setLayout(selectedThemeSystemId.value)
      safeSetTimeout(() => {
        const selected = layoutList.value.find(i => i.id === selectedThemeSystemId.value)
        const systemName = selected?.name || selectedThemeSystemId.value
        emit('show-notification', `主题风格已更新为「${systemName}」`, 'success')
      }, delay)
      delay += 100 // 每个通知间隔100ms
    }

    // 应用颜色主题（内置主题）
    const { isUsingCustomColor } = colorState
    if (!isUsingCustomColor && selectedThemeId.value !== currentColorThemeId.value) {
      setColorTheme(selectedThemeId.value)
      safeSetTimeout(() => {
        emit('show-notification', '主题色已更新', 'success')
      }, delay)
      delay += 100
    }

    // 应用代码样式
    if (selectedCodeStyleId.value !== currentCodeStyleId.value) {
      setCodeStyle(selectedCodeStyleId.value)
      safeSetTimeout(() => {
        const styleName = selectedCodeStyleId.value === 'mac' ? 'Mac 风格' :
                         selectedCodeStyleId.value === 'github' ? 'GitHub 风格' :
                         selectedCodeStyleId.value === 'vscode' ? 'VS Code 风格' :
                         selectedCodeStyleId.value === 'terminal' ? '终端风格' : '代码样式'
        emit('show-notification', `代码样式已更新为${styleName}`, 'success')
      }, delay)
      delay += 100
    }

    return delay
  }

  return {
    // 状态
    selectedThemeSystemId,
    selectedThemeId,
    selectedCodeStyleId,

    // 计算属性
    builtinColorThemes,

    // 列表数据
    layoutList,
    codeStyleList,
    currentColorTheme,
    currentColorThemeId,
    currentLayoutId,

    // 方法
    selectThemeSystem,
    selectTheme,
    selectCodeStyle,
    resetThemeSelections,
    setSelectedThemeId,
    clearThemeSelection,
    applyThemeSettings
  }
}
