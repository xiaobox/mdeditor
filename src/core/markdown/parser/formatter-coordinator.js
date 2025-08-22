/**
 * @file src/core/markdown/parser/formatter-coordinator.js
 * @description 格式化协调器（提取自 coordinator.js，负责策略调度与状态管理）
 */

import { TableProcessor } from '../processors/table.js'
import { ListProcessor } from '../processors/list.js'
import { formatBlockquote } from '../formatters/legacy.js'
import { FormatterContext } from './context.js'

// 策略
import {
  CodeBlockContentStrategy,
  EmptyLineStrategy,
  BlockquoteEndCheckStrategy,
  TableProcessingStrategy,
  ListProcessingStrategy,
  LineProcessorStrategy,
  ParagraphStrategy
} from './strategies/index.js'

/**
 * 行处理策略注册表
 */
const LINE_PROCESSING_STRATEGIES = [
  new CodeBlockContentStrategy(),
  new EmptyLineStrategy(),
  new BlockquoteEndCheckStrategy(),
  new TableProcessingStrategy(),
  new ListProcessingStrategy(),
  new LineProcessorStrategy(),
  new ParagraphStrategy() // 必须放在最后作为兜底策略
]

/**
 * 格式化协调器类
 * 只负责策略调度，状态管理由 FormatterContext 负责
 */
export class FormatterCoordinator {
  constructor() {
    this.context = new FormatterContext()
    this.tableProcessor = new TableProcessor()
    this.listProcessor = new ListProcessor()
  }

  /** 重置协调器状态 */
  reset() {
    // 保留当前主题和选项
    const preserveOptions = {
      currentTheme: this.context.currentTheme,
      codeTheme: this.context.codeTheme,
      themeSystem: this.context.themeSystem,
      options: this.context.options
    }

    this.context.reset(preserveOptions)
    this.tableProcessor.reset()
    this.listProcessor.reset()
  }

  /** 设置附加选项 */
  setOptions(options) {
    this.context.setOptions(options)
  }

  /**
   * 处理单行内容
   * @returns {Object} 处理结果
   */
  processLine(line, trimmedLine, lines, index) {
    for (const strategy of LINE_PROCESSING_STRATEGIES) {
      if (strategy.canProcess(this.context, line, trimmedLine, lines, index)) {
        const result = strategy.process(this, line, trimmedLine, lines, index)
        if (result !== null) return result
      }
    }
    throw new Error('没有找到合适的处理策略')
  }

  /** 结束引用块 */
  endBlockquote() {
    const content = this.context.endBlockquote()
    if (content.length > 0) {
      const fontSize = this.context.fontSettings?.fontSize || 16
      return formatBlockquote(content, this.context.currentTheme, fontSize)
    }
    return ''
  }

  /** 更新上下文 */
  updateContext(updates) { this.context.updateState(updates) }

  /** 设置主题 */
  setThemes(currentTheme, codeTheme, themeSystem) { this.context.setThemes(currentTheme, codeTheme, themeSystem) }

  /** 设置字体配置 */
  setFontSettings(fontSettings) { this.context.setFontSettings(fontSettings) }

  /** 完成格式化处理 */
  finalize() {
    let result = ''
    if (this.tableProcessor.isProcessingTable()) {
      result += this.tableProcessor.completeTable(this.context.currentTheme)
    }
    if (this.context.isInBlockquote()) {
      result += this.endBlockquote()
    }
    return result
  }

  /** 获取当前上下文 */
  getContext() { return this.context.getState() }
}

export default FormatterCoordinator

