/**
 * @file src/core/theme/presets/font-settings.js
 * @description 字体设置预设定义
 * 
 * 定义了可用的字体族和字号选项，用于预览面板和复制功能的统一字体设置。
 */

/**
 * 可用的字体族选项
 */
export const fontFamilyOptions = [
  {
    id: 'system-default',
    name: '系统默认',
    description: '使用系统默认字体',
    value: '-apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑", Arial, sans-serif',
    category: 'system'
  },
  {
    id: 'microsoft-yahei',
    name: '微软雅黑',
    description: '经典的中文显示字体',
    value: '"Microsoft YaHei", "微软雅黑", Arial, sans-serif',
    category: 'chinese'
  },
  {
    id: 'pingfang-sc',
    name: '苹方',
    description: 'Apple 设计的中文字体',
    value: '"PingFang SC", "苹方-简", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
    category: 'chinese'
  },
  {
    id: 'source-han-sans',
    name: '思源黑体',
    description: 'Adobe 和 Google 联合开发',
    value: '"Source Han Sans SC", "Noto Sans CJK SC", "Microsoft YaHei", sans-serif',
    category: 'chinese'
  },
  {
    id: 'helvetica-neue',
    name: 'Helvetica Neue',
    description: '经典的西文字体',
    value: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    category: 'western'
  },
  {
    id: 'roboto',
    name: 'Roboto',
    description: 'Google 设计的现代字体',
    value: 'Roboto, "Helvetica Neue", Arial, sans-serif',
    category: 'western'
  },
  {
    id: 'inter',
    name: 'Inter',
    description: '专为屏幕显示优化',
    value: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    category: 'western'
  }
];

/**
 * 字号选项配置
 */
export const fontSizeOptions = {
  min: 12,
  max: 24,
  default: 16,
  step: 1,
  presets: [
    { value: 12, label: '小号 (12px)' },
    { value: 14, label: '较小 (14px)' },
    { value: 16, label: '标准 (16px)' },
    { value: 18, label: '较大 (18px)' },
    { value: 20, label: '大号 (20px)' },
    { value: 22, label: '特大 (22px)' },
    { value: 24, label: '超大 (24px)' }
  ]
};

/**
 * 字体族分组
 */
export const fontFamilyGroups = {
  system: {
    name: '系统字体',
    description: '使用系统默认字体族',
    options: fontFamilyOptions.filter(font => font.category === 'system')
  },
  chinese: {
    name: '中文字体',
    description: '专为中文显示优化的字体',
    options: fontFamilyOptions.filter(font => font.category === 'chinese')
  },
  western: {
    name: '西文字体',
    description: '经典的西文字体族',
    options: fontFamilyOptions.filter(font => font.category === 'western')
  }
};

/**
 * 默认字体设置
 */
export const defaultFontSettings = {
  fontFamily: 'system-default',
  fontSize: 16
};

/**
 * 根据 ID 获取字体族配置
 * @param {string} fontId - 字体 ID
 * @returns {object|null} 字体配置对象
 */
export function getFontFamily(fontId) {
  return fontFamilyOptions.find(font => font.id === fontId) || null;
}

/**
 * 获取字体族列表（用于 UI 显示）
 * @returns {Array} 简化的字体族列表
 */
export function getFontFamilyList() {
  return fontFamilyOptions.map(font => ({
    id: font.id,
    name: font.name,
    description: font.description,
    category: font.category
  }));
}

/**
 * 验证字号是否在有效范围内
 * @param {number} fontSize - 字号值
 * @returns {boolean} 是否有效
 */
export function isValidFontSize(fontSize) {
  return typeof fontSize === 'number' && 
         fontSize >= fontSizeOptions.min && 
         fontSize <= fontSizeOptions.max;
}

/**
 * 获取最接近的有效字号
 * @param {number} fontSize - 输入的字号
 * @returns {number} 有效的字号
 */
export function getValidFontSize(fontSize) {
  if (!isValidFontSize(fontSize)) {
    return fontSizeOptions.default;
  }
  return Math.round(fontSize);
}

/**
 * 生成字体相关的 CSS 变量
 * @param {object} fontSettings - 字体设置
 * @param {string} fontSettings.fontFamily - 字体族 ID
 * @param {number} fontSettings.fontSize - 字号
 * @returns {object} CSS 变量对象
 */
export function generateFontCSSVariables(fontSettings) {
  const fontFamily = getFontFamily(fontSettings.fontFamily);
  const fontSize = getValidFontSize(fontSettings.fontSize);
  
  return {
    '--markdown-font-family': fontFamily ? fontFamily.value : fontFamilyOptions[0].value,
    '--markdown-font-size': `${fontSize}px`,
    '--markdown-line-height': fontSize <= 14 ? '1.7' : fontSize <= 18 ? '1.6' : '1.5'
  };
}

/**
 * 字体设置工具函数集合
 */
export const fontSettingsUtils = {
  getFontFamily,
  getFontFamilyList,
  isValidFontSize,
  getValidFontSize,
  generateFontCSSVariables,
  
  /**
   * 获取字体预览样式
   * @param {string} fontId - 字体 ID
   * @param {number} fontSize - 字号
   * @returns {object} 样式对象
   */
  getPreviewStyle(fontId, fontSize) {
    const fontFamily = getFontFamily(fontId);
    return {
      fontFamily: fontFamily ? fontFamily.value : 'inherit',
      fontSize: `${getValidFontSize(fontSize)}px`,
      lineHeight: fontSize <= 14 ? '1.7' : fontSize <= 18 ? '1.6' : '1.5'
    };
  },
  
  /**
   * 检查字体是否可用
   * @param {string} fontId - 字体 ID
   * @returns {boolean} 是否可用
   */
  isFontAvailable(fontId) {
    return fontFamilyOptions.some(font => font.id === fontId);
  }
};
