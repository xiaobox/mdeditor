/**
 * @file src/core/markdown/post-processors/wechat-styler.js
 * @description 微信平台样式后处理器（WeChat 适配）
 *
 * 本模块在核心 Markdown 解析完成后，负责进行微信平台的样式补充与兼容性处理。
 * 主要职责：在 HTML 中追加字体样式、内联 CSS，以及针对平台的细节优化，
 * 确保在微信公众号富文本环境中还原一致的排版与视觉。
 */

/**
 * 微信环境下的内联样式处理器
 * 为元素添加内联样式以精确控制字重、行高等
 * @param {string} html - 原始 HTML 内容
 * @param {string} fontFamily - 字体族字符串
 * @param {number} fontSize - 字号（px）
 * @param {string} lineHeight - 行高值
 * @returns {string} - 已添加微信兼容内联样式的 HTML
 */
function addWeChatInlineStyles(html, fontFamily, fontSize, lineHeight, letterSpacing = 0) {
  const lh = parseFloat(lineHeight);
  const lineHeightCss = Number.isFinite(lh) ? String(lineHeight) : (/[empx%]/i.test(String(lineHeight)) ? String(lineHeight) : '1.6');
  const baseStyle = `font-family: ${fontFamily}; color: #333; letter-spacing: ${letterSpacing}px;`;

  // 使用数值字重以便在微信中稳定呈现
  const normalWeight = '400';  // 常规字重
  const boldWeight = '700';    // 粗体字重
  const semiBoldWeight = '600'; // 半粗体

  // 为常见标签追加内联样式，并强制设置行高
  let out = html
    .replace(/<section(?![^>]*style=)/gi, `<section style="${baseStyle} line-height: ${lineHeightCss} !important;"`)
    .replace(/<p(?![^>]*style=)/gi, `<p style="${baseStyle} font-size: ${fontSize}px; line-height: ${lineHeightCss} !important; margin: 1.5em 8px; font-weight: ${normalWeight};"`)
    .replace(/<h1(?![^>]*style=)/gi, `<h1 style="${baseStyle} font-size: ${Math.round(fontSize * 2.2)}px; line-height: 1.3em !important; font-weight: ${boldWeight}; margin: 1.8em 0 1.5em; text-align: center;"`)
    .replace(/<h2(?![^>]*style=)/gi, `<h2 style="${baseStyle} font-size: ${Math.round(fontSize * 1.5)}px; line-height: 1.4em !important; font-weight: ${semiBoldWeight}; margin: 2em 0 1.5em;"`)
    .replace(/<h3(?![^>]*style=)/gi, `<h3 style="${baseStyle} font-size: ${Math.round(fontSize * 1.3)}px; line-height: ${lineHeightCss} !important; font-weight: ${semiBoldWeight}; margin: 1.5em 0 1em;"`)
    .replace(/<li(?![^>]*style=)/gi, `<li style="${baseStyle} font-size: ${fontSize}px; line-height: ${lineHeightCss} !important; font-weight: ${normalWeight}; margin: 0.5em 0;"`)
    .replace(/<blockquote(?![^>]*style=)/gi, `<blockquote style="${baseStyle} font-size: ${fontSize}px; line-height: ${lineHeightCss} !important; margin: 1.5em 8px; padding: 1em 1em 1em 2em; border-left: 3px solid #dbdbdb; background-color: #f8f8f8; font-weight: ${normalWeight};"`)
    .replace(/<ul(?![^>]*style=)/gi, `<ul style="${baseStyle} font-size: ${fontSize}px; line-height: ${lineHeightCss} !important; margin: 1.5em 8px; padding-left: 25px; font-weight: ${normalWeight};"`)
    .replace(/<ol(?![^>]*style=)/gi, `<ol style="${baseStyle} font-size: ${fontSize}px; line-height: ${lineHeightCss} !important; margin: 1.5em 8px; padding-left: 25px; font-weight: ${normalWeight};"`)
    .replace(/<strong(?![^>]*style=)/gi, `<strong style="${baseStyle} font-weight: ${boldWeight};"`)
    .replace(/<b(?![^>]*style=)/gi, `<b style="${baseStyle} font-weight: ${boldWeight};"`)
    .replace(/<em(?![^>]*style=)/gi, `<em style="${baseStyle} font-weight: ${normalWeight}; font-style: italic;"`)
    .replace(/<i(?![^>]*style=)/gi, `<i style="${baseStyle} font-weight: ${normalWeight}; font-style: italic;"`);

  // 若元素已有 style，则追加或替换行高以确保统一
  const enforce = (inputHtml, tag) => {
    const re = new RegExp(`<${tag}([^>]*?)style="([^"]*)"([^>]*)>`, 'gi');
    return inputHtml.replace(re, (m, pre, style, post) => {
      let updated = style;
      if (/line-height\s*:/i.test(updated)) {
        updated = updated.replace(/line-height\s*:\s*[^;]*;?/gi, `line-height: ${lineHeightCss} !important;`);
      } else {
        const needsSemicolon = updated.trim().length > 0 && !/[;\s]$/.test(updated.trim());
        updated = `${updated}${needsSemicolon ? '; ' : ' '}line-height: ${lineHeightCss} !important;`;
      }
      return `<${tag}${pre}style="${updated}"${post}>`;
    });
  };
  for (const t of ['section','p','h1','h2','h3','ul','ol','li','blockquote']) {
    out = enforce(out, t);
  }

  // 包裹内部内容，防止编辑器层叠样式覆盖导致行高丢失
  const wrapInner = (inputHtml, tag) => {
    const re = new RegExp(`<${tag}([^>]*)>([\s\S]*?)<\/${tag}>`, 'gi');
    return inputHtml.replace(re, (m, attrs, inner) => {
      if (/data-wx-lh-wrap/.test(inner)) return m; // already wrapped
      // Avoid wrapping when inner already starts with a block element
      if (/^\s*<(p|div|ul|ol|li|h1|h2|h3|blockquote|pre|table)\b/i.test(inner)) return m;
      const span = `<span data-wx-lh-wrap style="line-height: ${lineHeightCss} !important; letter-spacing: ${letterSpacing}px; display: inline-block; width: 100%;">${inner}</span>`;
      return `<${tag}${attrs}>${span}</${tag}>`;
    });
  };
  for (const t of ['p','li','blockquote','h1','h2','h3']) {
    out = wrapInner(out, t);
  }

  return out;
}

/**
 * 微信兼容字体族映射
 * 选择在公众平台上渲染最稳定的字体组合
 */
const FONT_FAMILY_MAP = {
  'microsoft-yahei': 'Microsoft YaHei, Arial, sans-serif',
  'pingfang-sc': 'PingFang SC, Microsoft YaHei, Arial, sans-serif',
  'hiragino-sans': 'Hiragino Sans GB, Microsoft YaHei, Arial, sans-serif',
  'arial': 'Arial, sans-serif',
  'system-safe': 'Microsoft YaHei, Arial, sans-serif'
};

/**
 * 基于字号计算合适的行高
 * @param {number} fontSize - 字号（px）
 * @returns {string} - 行高
 */
function calculateLineHeight(fontSize, explicitLineHeight) {
  if (typeof explicitLineHeight === 'number' && isFinite(explicitLineHeight) && explicitLineHeight > 0) {
    return String(explicitLineHeight);
  }
  if (fontSize <= 14) return '1.7';
  if (fontSize <= 18) return '1.6';
  return '1.5';
}

/**
 * 微信 HTML 包裹与样式器
 * 采用纯内联样式（不使用 <style> 标签），符合公众号规范
 * @param {string} html - 原始 HTML 内容
 * @param {Object} fontSettings - 字体设置对象
 * @returns {string} - 包裹后的 HTML
 */
export function wrapWithFontStyles(html, fontSettings) {
  if (!fontSettings || !html) return html;

  const fontFamily = FONT_FAMILY_MAP[fontSettings.fontFamily] || FONT_FAMILY_MAP['microsoft-yahei'];
  const fontSize = fontSettings.fontSize || 16;
  const lineHeight = calculateLineHeight(fontSize, fontSettings.lineHeight);
  const letterSpacing = typeof fontSettings.letterSpacing === 'number' ? fontSettings.letterSpacing : 0;

  // 公众号不支持 <style> 标签，改用内联样式
  const styledHtml = addWeChatInlineStyles(html, fontFamily, fontSize, lineHeight, letterSpacing);

  // 使用公众号常见的外层结构，全部使用内联样式
  const lh2 = parseFloat(lineHeight);
  const lhCss = Number.isFinite(lh2) ? String(lineHeight) : (/[empx%]/i.test(String(lineHeight)) ? String(lineHeight) : '1.6');
  return `<section data-role="outer" class="rich_media_content" style="font-family: ${fontFamily}; font-size: ${fontSize}px; line-height: ${lhCss} !important; letter-spacing: ${letterSpacing}px; font-weight: 400; color: #333; margin: 0; padding: 0;">
<section data-role="inner" style="font-family: ${fontFamily}; font-size: ${fontSize}px; line-height: ${lhCss} !important; letter-spacing: ${letterSpacing}px; font-weight: 400; color: #333;">
${styledHtml}
</section>
</section>`;
}

/**
 * 微信平台 HTML 后处理器
 * 作为入口统一应用微信特定的样式与格式
 */
export class WeChatStyler {
  /**
   * 处理 HTML 内容以适配微信
   * @param {string} html - 原始 HTML 内容
   * @param {Object} options - 处理选项
   * @param {Object} options.fontSettings - 字体设置对象
   * @param {boolean} options.isPreview - 是否为预览模式
   * @returns {string} - 处理后的 HTML
   */
  static process(html, options = {}) {
    if (!html) return '';

    const { fontSettings, isPreview = false } = options;

    // 预览模式不强制追加字体样式
    if (!isPreview && fontSettings) {
      return wrapWithFontStyles(html, fontSettings);
    }

    return html;
  }

  /**
   * 仅追加内联样式，不包裹额外结构
   * 适用于片段内容的处理
   * @param {string} html - 原始 HTML 内容
   * @param {Object} fontSettings - 字体设置对象
   * @returns {string} - 添加内联样式后的 HTML
   */
  static applyInlineStyles(html, fontSettings) {
    if (!fontSettings || !html) return html;

    const fontFamily = FONT_FAMILY_MAP[fontSettings.fontFamily] || FONT_FAMILY_MAP['microsoft-yahei'];
    const fontSize = fontSettings.fontSize || 16;
    const lineHeight = calculateLineHeight(fontSize, fontSettings.lineHeight);
    const letterSpacing = typeof fontSettings.letterSpacing === 'number' ? fontSettings.letterSpacing : 0;

    return addWeChatInlineStyles(html, fontFamily, fontSize, lineHeight, letterSpacing);
  }
}
