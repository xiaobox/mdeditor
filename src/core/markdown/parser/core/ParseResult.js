/**
 * @file src/core/markdown/parser/core/ParseResult.js
 * @description 解析结果对象（占位实现）
 */

/**
 * 解析结果结构
 * 为未来扩展保留（如抽取目录、引用统计等）。
 */
export class ParseResult {
  constructor(html = '') {
    this.html = html
  }
}

export default ParseResult

