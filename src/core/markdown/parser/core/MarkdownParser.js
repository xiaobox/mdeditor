/**
 * @file src/core/markdown/parser/core/MarkdownParser.js
 * @description 核心 Markdown 解析器（负责调度与管道编排）
 */

import { getThemesSafe } from '../../../../shared/utils/theme.js'
import { cleanReferenceLinks } from '../../formatters/text.js'
import { FormatterCoordinator } from '../coordinator.js'
import { ThemeProcessor } from '../processors/ThemeProcessor.js'
import { FontProcessor } from '../processors/FontProcessor.js'
import { SocialStyler } from '../../post-processors/social-styler.js'

/**
 * MarkdownParser
 * - 负责将输入的 Markdown 文本解析为 HTML
 * - 对外暴露稳定的 parse 接口
 * - 内部调度 FormatterCoordinator 与后处理器
 */
export class MarkdownParser {
  /**
   * 解析 Markdown 文本为 HTML
   * @param {string} markdownText - 要解析的 Markdown 文本
   * @param {object} options - 解析器的配置选项
   * @returns {string} 生成的 HTML 字符串
   */
  parse(markdownText, options = {}) {
    if (!markdownText || typeof markdownText !== 'string') {
      return ''
    }

    // 获取安全的主题配置
    const { colorTheme, codeStyle, themeSystem } = getThemesSafe({
      colorTheme: options.theme,
      codeStyle: options.codeTheme,
      themeSystem: options.themeSystem
    })

    // 获取字体设置
    const fontSettings = options.fontSettings || null

    // 创建协调器实例
    const coordinator = new FormatterCoordinator()
    coordinator.setThemes(colorTheme, codeStyle, themeSystem)

    // 设置字体配置
    if (fontSettings) {
      coordinator.setFontSettings(fontSettings)
    }

    if (options.isPreview) {
      coordinator.setOptions({
        isPreview: true,
        cleanHtml: options.cleanHtml || false
      })
    }

    // 预处理：清理不兼容的语法
    const cleanedText = cleanReferenceLinks(markdownText)
    const lines = cleanedText.split('\n')
    let result = ''

    coordinator.reset() // 每次解析前重置状态

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const trimmedLine = line.trim()

      const processResult = coordinator.processLine(line, trimmedLine, lines, i)

      if (processResult.updateContext) {
        coordinator.updateContext(processResult.updateContext)
      }

      if (processResult.result) {
        result += processResult.result
      }

      if (processResult.reprocessLine) {
        i-- // 重新处理当前行
      }
    }

    result += coordinator.finalize() // 处理任何未结束的块

    // 解析完成后应用主题/字体处理（当前为无副作用挂点）
    result = ThemeProcessor.process(result, { colorTheme, themeSystem, isPreview: options.isPreview })
    result = FontProcessor.process(result, { fontSettings, isPreview: options.isPreview })

    // 使用后处理器应用字体样式和平台兼容性处理
    result = SocialStyler.process(result, {
      fontSettings,
      themeSystem,
      colorTheme,
      isPreview: options.isPreview
    })

    return result
  }
}

export default MarkdownParser

