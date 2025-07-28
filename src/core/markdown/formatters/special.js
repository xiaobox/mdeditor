/**
 * @file src/utils/formatters/special-format-processors.js
 * @description 特殊格式处理工具
 * 
 * 专门处理 Markdown 中的特殊格式，包括：
 * - 高亮文本（==text==）
 * - 下标文本（~text~）
 * - 上标文本（^text^）
 * - 键盘按键（<kbd>key</kbd>）
 * 
 * 从 text-processors.js 中提取出来，提高代码的模块化程度。
 */

/**
 * 处理高亮文本
 * 使用 ==text== 语法创建高亮效果
 * 支持微信公众号友好的样式
 * 
 * @param {string} text - 包含高亮标记的文本
 * @param {Object} theme - 主题对象
 * @returns {string} - 处理后的文本
 */
export function processHighlight(text, theme) {
  return text.replace(/==(.*?)==/g, (_, content) => {
    return `<mark style="background-color: ${theme.highlight}; color: ${theme.textPrimary}; padding: 1px 2px; border-radius: 2px;">${content}</mark>`;
  });
}

/**
 * 处理下标文本
 * 使用 ~text~ 语法创建下标效果
 * 常用于化学分子式、数学公式等
 * 
 * @param {string} text - 包含下标标记的文本
 * @param {Object} theme - 主题对象
 * @returns {string} - 处理后的文本
 */
export function processSubscript(text, theme) {
  return text.replace(/~([^~\s]+)~/g, (_, content) => {
    return `<sub style="color: ${theme.textSecondary}; font-size: 0.8em;">${content}</sub>`;
  });
}

/**
 * 处理上标文本
 * 使用 ^text^ 语法创建上标效果
 * 常用于数学幂次、脚注引用等
 * 
 * @param {string} text - 包含上标标记的文本
 * @param {Object} theme - 主题对象
 * @returns {string} - 处理后的文本
 */
export function processSuperscript(text, theme) {
  return text.replace(/\^([^\^\s]+)\^/g, (_, content) => {
    return `<sup style="color: ${theme.textSecondary}; font-size: 0.8em;">${content}</sup>`;
  });
}

/**
 * 处理键盘按键
 * 使用 <kbd>key</kbd> 语法创建键盘按键效果
 * 常用于显示快捷键、按键组合等
 * 
 * @param {string} text - 包含键盘按键标记的文本
 * @param {Object} theme - 主题对象
 * @returns {string} - 处理后的文本
 */
export function processKeyboard(text, theme) {
  return text.replace(/<kbd>(.*?)<\/kbd>/g, (_, content) => {
    return `<kbd style="background-color: ${theme.borderLight}; color: ${theme.textPrimary}; padding: 2px 6px; border-radius: 3px; border: 1px solid ${theme.borderMedium}; font-family: monospace; font-size: 0.9em; box-shadow: 0 1px 2px ${theme.shadowColor};">${content}</kbd>`;
  });
} 