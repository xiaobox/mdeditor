/**
 * @file tests/config/formatting-regex.test.js
 * @description REGEX_PATTERNS 基础匹配测试
 */

import { describe, it, expect } from 'vitest'
import { REGEX_PATTERNS, MARKDOWN_SYNTAX } from '../../src/config/constants/formatting.js'

describe('REGEX_PATTERNS', () => {
  it('应匹配标题/粗体/斜体/删除线/代码/链接/图片', () => {
    expect(REGEX_PATTERNS.HEADING.test('# Title')).toBe(true)
    expect('**b**'.match(REGEX_PATTERNS.BOLD)).toBeTruthy()
    expect('*i*'.match(REGEX_PATTERNS.ITALIC)).toBeTruthy()
    expect('~~s~~'.match(REGEX_PATTERNS.STRIKETHROUGH)).toBeTruthy()
    expect('`c`'.match(REGEX_PATTERNS.CODE)).toBeTruthy()
    expect('[t](https://a)'.match(REGEX_PATTERNS.LINK)).toBeTruthy()
    expect('![a](https://b)'.match(REGEX_PATTERNS.IMAGE)).toBeTruthy()
  })

  it('应识别无序/有序/任务列表与表格行/分隔', () => {
    expect(REGEX_PATTERNS.UNORDERED_LIST.test('- item')).toBe(true)
    expect(REGEX_PATTERNS.ORDERED_LIST.test('1. item')).toBe(true)
    expect(REGEX_PATTERNS.TASK_LIST.test('- [x] done')).toBe(true)
    expect(REGEX_PATTERNS.TABLE_ROW.test('| a | b |')).toBe(true)
    expect(REGEX_PATTERNS.TABLE_SEPARATOR.test('| --- | :---: | ---: |')).toBe(true)
  })

  it('应识别引用/代码块/水平分割线', () => {
    expect(REGEX_PATTERNS.BLOCKQUOTE.test('> hi')).toBe(true)
    expect(REGEX_PATTERNS.CODE_BLOCK.test('```js')).toBe(true)
    expect(REGEX_PATTERNS.HORIZONTAL_RULE.test('---')).toBe(true)
  })

  it('MARKDOWN_SYNTAX 常量定义应包含基础标识', () => {
    expect(MARKDOWN_SYNTAX.BOLD).toBe('**')
    expect(MARKDOWN_SYNTAX.ITALIC).toBe('*')
    expect(MARKDOWN_SYNTAX.CODE_BLOCK).toBe('```')
  })
})

