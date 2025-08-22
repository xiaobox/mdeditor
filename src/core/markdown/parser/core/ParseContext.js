/**
 * @file src/core/markdown/parser/core/ParseContext.js
 * @description 解析上下文（轻量外观，当前复用 FormatterContext 实现）
 */

import { FormatterContext } from '../context.js'

/**
 * ParseContext
 * 目前作为对 FormatterContext 的薄封装，便于未来替换或扩展。
 */
export class ParseContext extends FormatterContext {}

export default ParseContext

