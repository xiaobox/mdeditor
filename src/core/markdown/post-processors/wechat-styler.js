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
function addWeChatInlineStyles(html, fontFamily, fontSize, lineHeight) {
  const baseStyle = `font-family: ${fontFamily}; color: #333;`;

  // Precise font weight control using numeric values instead of keywords
  const normalWeight = '400';  // Explicit normal weight
  const boldWeight = '700';    // Explicit bold weight
  const semiBoldWeight = '600'; // Semi-bold weight

  // Replace various HTML tags, adding inline styles with forced font-weight
  return html
    .replace(/<p(?![^>]*style=)/g, `<p style="${baseStyle} font-size: ${fontSize}px; line-height: ${lineHeight}; margin: 1.5em 8px; font-weight: ${normalWeight};"`)
    .replace(/<h1(?![^>]*style=)/g, `<h1 style="${baseStyle} font-size: ${Math.round(fontSize * 2.2)}px; line-height: 1.3; font-weight: ${boldWeight}; margin: 1.8em 0 1.5em; text-align: center;"`)
    .replace(/<h2(?![^>]*style=)/g, `<h2 style="${baseStyle} font-size: ${Math.round(fontSize * 1.5)}px; line-height: 1.4; font-weight: ${semiBoldWeight}; margin: 2em 0 1.5em;"`)
    .replace(/<h3(?![^>]*style=)/g, `<h3 style="${baseStyle} font-size: ${Math.round(fontSize * 1.3)}px; line-height: ${lineHeight}; font-weight: ${semiBoldWeight}; margin: 1.5em 0 1em;"`)
    .replace(/<li(?![^>]*style=)/g, `<li style="${baseStyle} font-size: ${fontSize}px; line-height: ${lineHeight}; font-weight: ${normalWeight}; margin: 0.5em 0;"`)
    .replace(/<blockquote(?![^>]*style=)/g, `<blockquote style="${baseStyle} font-size: ${fontSize}px; line-height: ${lineHeight}; margin: 1.5em 8px; padding: 1em 1em 1em 2em; border-left: 3px solid #dbdbdb; background-color: #f8f8f8; font-weight: ${normalWeight};"`)
    .replace(/<ul(?![^>]*style=)/g, `<ul style="${baseStyle} font-size: ${fontSize}px; line-height: ${lineHeight}; margin: 1.5em 8px; padding-left: 25px; font-weight: ${normalWeight};"`)
    .replace(/<ol(?![^>]*style=)/g, `<ol style="${baseStyle} font-size: ${fontSize}px; line-height: ${lineHeight}; margin: 1.5em 8px; padding-left: 25px; font-weight: ${normalWeight};"`)
    .replace(/<strong(?![^>]*style=)/g, `<strong style="${baseStyle} font-weight: ${boldWeight};"`)
    .replace(/<b(?![^>]*style=)/g, `<b style="${baseStyle} font-weight: ${boldWeight};"`)
    .replace(/<em(?![^>]*style=)/g, `<em style="${baseStyle} font-weight: ${normalWeight}; font-style: italic;"`)
    .replace(/<i(?![^>]*style=)/g, `<i style="${baseStyle} font-weight: ${normalWeight}; font-style: italic;"`);
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
function calculateLineHeight(fontSize) {
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
  const lineHeight = calculateLineHeight(fontSize);

  // WeChat public account doesn't support <style> tags, use inline styles instead
  // Add inline styles to HTML content for WeChat compatibility
  const styledHtml = addWeChatInlineStyles(html, fontFamily, fontSize, lineHeight);

  // Use WeChat public account standard HTML structure with all styles inline
  // Explicitly control font weight for consistent rendering
  return `<section data-role="outer" class="rich_media_content" style="font-family: ${fontFamily}; font-size: ${fontSize}px; line-height: ${lineHeight}; font-weight: 400; color: #333; margin: 0; padding: 0;">
<section data-role="inner" style="font-family: ${fontFamily}; font-size: ${fontSize}px; line-height: ${lineHeight}; font-weight: 400; color: #333;">
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
    const lineHeight = calculateLineHeight(fontSize);

    return addWeChatInlineStyles(html, fontFamily, fontSize, lineHeight);
  }
}
