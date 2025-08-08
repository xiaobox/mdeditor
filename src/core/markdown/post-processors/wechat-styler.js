/**
 * @file src/core/markdown/post-processors/wechat-styler.js
 * @description WeChat HTML post-processor for styling and platform compatibility
 *
 * This module handles the final HTML styling and WeChat-specific formatting.
 * It's responsible for applying font styles, inline CSS, and platform-specific
 * optimizations after the core Markdown parsing is complete.
 */

/**
 * WeChat-specific inline style processor
 * Adds inline styles to HTML elements for precise font weight control
 * @param {string} html - Raw HTML content
 * @param {string} fontFamily - Font family string
 * @param {number} fontSize - Font size in pixels
 * @param {string} lineHeight - Line height value
 * @returns {string} - HTML with WeChat-compatible inline styles
 */
function addWeChatInlineStyles(html, fontFamily, fontSize, lineHeight, letterSpacing = 0) {
  const lh = parseFloat(lineHeight);
  const lineHeightCss = Number.isFinite(lh) ? `${Math.round(lh * 100)}%` : (/[empx%]/i.test(String(lineHeight)) ? String(lineHeight) : '160%');
  const baseStyle = `font-family: ${fontFamily}; color: #333; letter-spacing: ${letterSpacing}px;`;

  // Precise font weight control using numeric values instead of keywords
  const normalWeight = '400';  // Explicit normal weight
  const boldWeight = '700';    // Explicit bold weight
  const semiBoldWeight = '600'; // Semi-bold weight

  // Replace various HTML tags, adding inline styles with forced font-weight and enforced line-height
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

  // Ensure elements that already have style also get enforced line-height
  const enforce = (inputHtml, tag) => {
    const re = new RegExp(`<${tag}([^>]*?)style="([^"]*)"([^>]*)>`, 'gi');
    return inputHtml.replace(re, (m, pre, style, post) => {
      const cleaned = style.replace(/line-height\s*:\s*[^;]*;?/gi, '').trim();
      const merged = `line-height: ${lineHeightCss} !important; ${cleaned}`.trim();
      return `<${tag}${pre}style="${merged}"${post}>`;
    });
  };
  for (const t of ['section','p','h1','h2','h3','ul','ol','li','blockquote']) {
    out = enforce(out, t);
  }

  // Wrap inner content with span to propagate line-height if editor overrides ancestor styles
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
 * Font family mapping for WeChat compatibility
 * Uses the safest font settings for WeChat public account compatibility
 */
const FONT_FAMILY_MAP = {
  'microsoft-yahei': 'Microsoft YaHei, Arial, sans-serif',
  'pingfang-sc': 'PingFang SC, Microsoft YaHei, Arial, sans-serif',
  'hiragino-sans': 'Hiragino Sans GB, Microsoft YaHei, Arial, sans-serif',
  'arial': 'Arial, sans-serif',
  'system-safe': 'Microsoft YaHei, Arial, sans-serif'
};

/**
 * Calculate optimal line height based on font size
 * @param {number} fontSize - Font size in pixels
 * @returns {string} - Line height value
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
 * WeChat HTML wrapper and styler
 * Wraps HTML content with font styles using the successful doocs/md approach
 * @param {string} html - Raw HTML content
 * @param {Object} fontSettings - Font settings object
 * @returns {string} - Wrapped HTML with WeChat-compatible styling
 */
export function wrapWithFontStyles(html, fontSettings) {
  if (!fontSettings || !html) return html;

  const fontFamily = FONT_FAMILY_MAP[fontSettings.fontFamily] || FONT_FAMILY_MAP['microsoft-yahei'];
  const fontSize = fontSettings.fontSize || 16;
  const lineHeight = calculateLineHeight(fontSize, fontSettings.lineHeight);
  const letterSpacing = typeof fontSettings.letterSpacing === 'number' ? fontSettings.letterSpacing : 0;

  // WeChat public account doesn't support <style> tags, use inline styles instead
  // Add inline styles to HTML content for WeChat compatibility
  const styledHtml = addWeChatInlineStyles(html, fontFamily, fontSize, lineHeight, letterSpacing);

  // Use WeChat public account standard HTML structure with all styles inline
  // Explicitly control font weight for consistent rendering
  const lh2 = parseFloat(lineHeight);
  const lineHeightCss = Number.isFinite(lh2) ? `${Math.round(lh2 * 100)}%` : (/[empx%]/i.test(String(lineHeight)) ? String(lineHeight) : '160%');
  return `<section data-role="outer" class="rich_media_content" style="font-family: ${fontFamily}; font-size: ${fontSize}px; line-height: ${lineHeightCss} !important; letter-spacing: ${letterSpacing}px; font-weight: 400; color: #333; margin: 0; padding: 0;">
<section data-role="inner" style="font-family: ${fontFamily}; font-size: ${fontSize}px; line-height: ${lineHeightCss} !important; letter-spacing: ${letterSpacing}px; font-weight: 400; color: #333;">
${styledHtml}
</section>
</section>`;
}

/**
 * HTML post-processor for WeChat platform
 * Main entry point for applying WeChat-specific styling and formatting
 */
export class WeChatStyler {
  /**
   * Process HTML content for WeChat compatibility
   * @param {string} html - Raw HTML content
   * @param {Object} options - Processing options
   * @param {Object} options.fontSettings - Font settings object
   * @param {boolean} options.isPreview - Whether this is preview mode
   * @returns {string} - Processed HTML
   */
  static process(html, options = {}) {
    if (!html) return '';

    const { fontSettings, isPreview = false } = options;

    // Only apply font styling if not in preview mode and font settings are provided
    if (!isPreview && fontSettings) {
      return wrapWithFontStyles(html, fontSettings);
    }

    return html;
  }

  /**
   * Apply only inline styles without wrapper sections
   * Useful for partial content processing
   * @param {string} html - Raw HTML content
   * @param {Object} fontSettings - Font settings object
   * @returns {string} - HTML with inline styles applied
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
