/**
 * @file src/core/markdown/parser/strategies/paragraph-strategy.js
 * @description 普通段落处理策略（默认策略）
 */

import { LineProcessingStrategy } from './base-strategy.js';
import { processInlineFormatsWithoutEscapes } from '../../formatters/text.js';

/**
 * 普通段落处理策略（默认策略）
 * 现在包含完整的段落处理逻辑，不再依赖协调器的具体实现
 */
export class ParagraphStrategy extends LineProcessingStrategy {
  canProcess(_context, _line, _trimmedLine, _lines, _index) {
    return true; // 总是可以处理（作为兜底策略）
  }

  process(coordinator, _line, trimmedLine, _lines, _index) {
    const context = coordinator.context;

    // 获取字体设置
    const fontSettings = context.fontSettings;
    const fontSize = fontSettings?.fontSize || 16;
    const lineHeight = fontSettings?.fontSize <= 14 ? '1.7' : fontSettings?.fontSize <= 18 ? '1.6' : '1.5';

    const formattedText = processInlineFormatsWithoutEscapes(trimmedLine, context.currentTheme, fontSize);

    const result = `<p style="margin: 12px 0; line-height: ${lineHeight}; font-size: ${fontSize}px; font-weight: normal;">${formattedText}</p>`;

    return {
      result,
      shouldContinue: true,
      updateContext: {}
    };
  }
}