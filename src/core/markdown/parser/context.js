/**
 * @file src/core/markdown/parser/context.js
 * @description 格式化上下文状态管理
 * 
 * 独立管理格式化过程中的所有状态，包括：
 * - 代码块状态
 * - 引用块状态 
 * - 主题信息
 * - 字体配置
 * - 处理选项
 */

/**
 * 格式化上下文类
 * 负责管理格式化过程中的所有状态信息
 */
export class FormatterContext {
  constructor() {
    this.reset();
  }

  /**
   * 重置上下文状态
   * @param {Object} preserveOptions - 需要保留的选项
   */
  reset(preserveOptions = {}) {
    // 保留的状态
    const currentTheme = preserveOptions.currentTheme || this.currentTheme || null;
    const codeTheme = preserveOptions.codeTheme || this.codeTheme || null;
    const themeSystem = preserveOptions.themeSystem || this.themeSystem || 'default';
    const fontSettings = preserveOptions.fontSettings || this.fontSettings || null;
    const options = preserveOptions.options || this.options || {};

    // 重置处理状态
    this.inCodeBlock = false;
    this.codeBlockContent = '';
    this.codeBlockLanguage = '';
    this.inBlockquote = false;
    this.blockquoteContent = [];

    // 保留的主题和选项
    this.currentTheme = currentTheme;
    this.codeTheme = codeTheme;
    this.themeSystem = themeSystem;
    this.fontSettings = fontSettings;
    this.options = options;
  }

  /**
   * 设置主题信息
   * @param {Object} currentTheme - 当前颜色主题
   * @param {Object} codeTheme - 代码高亮主题
   * @param {string} themeSystem - 排版系统
   */
  setThemes(currentTheme, codeTheme, themeSystem) {
    this.currentTheme = currentTheme;
    this.codeTheme = codeTheme;
    this.themeSystem = themeSystem;
  }

  /**
   * 设置字体配置
   * @param {Object} fontSettings - 字体设置对象
   */
  setFontSettings(fontSettings) {
    this.fontSettings = fontSettings;
  }

  /**
   * 设置处理选项
   * @param {Object} options - 选项对象
   */
  setOptions(options) {
    this.options = { ...this.options, ...options };
  }

  /**
   * 批量更新状态
   * @param {Object} updates - 要更新的状态
   */
  updateState(updates) {
    Object.assign(this, updates);
  }

  /**
   * 检查是否在代码块中
   * @returns {boolean}
   */
  isInCodeBlock() {
    return this.inCodeBlock;
  }

  /**
   * 检查是否在引用块中
   * @returns {boolean}
   */
  isInBlockquote() {
    return this.inBlockquote;
  }

  /**
   * 开始代码块
   * @param {string} language - 代码语言
   */
  startCodeBlock(language = '') {
    this.inCodeBlock = true;
    this.codeBlockContent = '';
    this.codeBlockLanguage = language;
  }

  /**
   * 结束代码块
   * @returns {Object} 代码块信息
   */
  endCodeBlock() {
    const blockInfo = {
      content: this.codeBlockContent,
      language: this.codeBlockLanguage
    };
    
    this.inCodeBlock = false;
    this.codeBlockContent = '';
    this.codeBlockLanguage = '';
    
    return blockInfo;
  }

  /**
   * 添加代码块内容
   * @param {string} line - 代码行
   */
  addCodeBlockContent(line) {
    this.codeBlockContent += line + '\n';
  }

  /**
   * 开始引用块
   */
  startBlockquote() {
    this.inBlockquote = true;
    this.blockquoteContent = [];
  }

  /**
   * 结束引用块
   * @returns {Array} 引用块内容
   */
  endBlockquote() {
    const content = [...this.blockquoteContent];
    this.inBlockquote = false;
    this.blockquoteContent = [];
    return content;
  }

  /**
   * 添加引用块内容
   * @param {string} line - 引用行
   */
  addBlockquoteContent(line) {
    this.blockquoteContent.push(line);
  }

  /**
   * 获取当前状态的副本
   * @returns {Object} 状态副本
   */
  getState() {
    return {
      inCodeBlock: this.inCodeBlock,
      codeBlockContent: this.codeBlockContent,
      codeBlockLanguage: this.codeBlockLanguage,
      inBlockquote: this.inBlockquote,
      blockquoteContent: [...this.blockquoteContent],
      currentTheme: this.currentTheme,
      codeTheme: this.codeTheme,
      themeSystem: this.themeSystem,
      options: { ...this.options }
    };
  }

  /**
   * 从状态对象恢复状态
   * @param {Object} state - 状态对象
   */
  setState(state) {
    this.inCodeBlock = state.inCodeBlock || false;
    this.codeBlockContent = state.codeBlockContent || '';
    this.codeBlockLanguage = state.codeBlockLanguage || '';
    this.inBlockquote = state.inBlockquote || false;
    this.blockquoteContent = state.blockquoteContent || [];
    this.currentTheme = state.currentTheme || null;
    this.codeTheme = state.codeTheme || null;
    this.themeSystem = state.themeSystem || 'default';
    this.options = state.options || {};
  }
} 