/**
 * @file src/core/theme/presets/font-settings.js
 * @description 字体设置预设定义
 * 
 * 定义了可用的字体族和字号选项，用于预览面板和复制功能的统一字体设置。
 */

/**
 * 可用的字体族选项 - 微信公众号兼容版本
 * 只包含微信公众号真正支持的字体，确保预览和复制效果一致
 */
export const fontFamilyOptions = [
  {
    id: 'microsoft-yahei',
    name: '微软雅黑',
    description: '微信公众号推荐字体，兼容性最佳',
    value: '"Microsoft YaHei", "微软雅黑", Arial, sans-serif',
    category: 'recommended'
  },
  {
    id: 'pingfang-sc',
    name: '苹方',
    description: 'Apple 设备优选，微信支持',
    value: '"PingFang SC", "苹方-简", "Microsoft YaHei", "微软雅黑", Arial, sans-serif',
    category: 'recommended'
  },
  {
    id: 'hiragino-sans',
    name: '冬青黑体',
    description: 'Mac 系统经典字体，微信支持',
    value: '"Hiragino Sans GB", "冬青黑体简体中文", "Microsoft YaHei", "微软雅黑", Arial, sans-serif',
    category: 'recommended'
  },
  {
    id: 'arial',
    name: 'Arial',
    description: '通用西文字体，全平台支持',
    value: 'Arial, sans-serif',
    category: 'basic'
  },
  {
    id: 'system-safe',
    name: '系统安全字体',
    description: '微信公众号安全字体组合',
    value: '"Microsoft YaHei", "微软雅黑", "PingFang SC", "Hiragino Sans GB", Arial, sans-serif',
    category: 'basic'
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
 * 字体族分组 - 微信公众号兼容版本
 */
export const fontFamilyGroups = {
  recommended: {
    name: '推荐字体',
    description: '微信公众号兼容性最佳的字体',
    options: fontFamilyOptions.filter(font => font.category === 'recommended')
  },
  basic: {
    name: '基础字体',
    description: '通用安全字体选择',
    options: fontFamilyOptions.filter(font => font.category === 'basic')
  }
};

/**
 * 默认字体设置 - 微信公众号优化
 */
export const defaultFontSettings = {
  fontFamily: 'microsoft-yahei', // 使用微信公众号兼容性最佳的字体
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
