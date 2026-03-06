/**
 * @file src/core/markdown/social-adapters.js
 * @description 社交平台复制适配器
 *
 * 合并以下处理逻辑：
 * - SocialStyler 类：统一的社交样式处理入口
 * - wrapWithFontStyles 函数：包裹 HTML 并注入字体样式
 * - breezeCopyAdapter 对象：Breeze 主题适配器
 * - getThemeCopyAdapter / registerThemeCopyAdapter：适配器注册表
 * - applySocialAdapter 函数：应用社交适配器的统一入口
 */

import { calculateLineHeight as calcLH } from '../../shared/utils/typography.js';

// ============================================================================
// 工具函数
// ============================================================================

function hexToRgb(hex) {
  if (!hex) return null;
  const m = String(hex).trim().replace('#', '');
  const v = m.length === 3 ? m.split('').map(c => c + c).join('') : m;
  const int = parseInt(v, 16);
  if (!Number.isFinite(int) || v.length !== 6) return null;
  return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 };
}

function blendWithWhite(hex, ratio = 0.04) {
  const rgb = hexToRgb(hex) || { r: 88, g: 101, b: 242 };
  const r = Math.round(rgb.r * ratio + 255 * (1 - ratio));
  const g = Math.round(rgb.g * ratio + 255 * (1 - ratio));
  const b = Math.round(rgb.b * ratio + 255 * (1 - ratio));
  const toHex = (n) => n.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function mixWithBlack(hex, percentPrimary = 0.6) {
  const rgb = hexToRgb(hex) || { r: 88, g: 101, b: 242 };
  const p = Math.max(0, Math.min(1, percentPrimary));
  const r = Math.round(rgb.r * p);
  const g = Math.round(rgb.g * p);
  const b = Math.round(rgb.b * p);
  const toHex = (n) => n.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

const FONT_FAMILY_MAP = {
  'microsoft-yahei': 'Microsoft YaHei, Arial, sans-serif',
  'pingfang-sc': 'PingFang SC, Microsoft YaHei, Arial, sans-serif',
  'hiragino-sans': 'Hiragino Sans GB, Microsoft YaHei, Arial, sans-serif',
  'arial': 'Arial, sans-serif',
  'system-safe': 'Microsoft YaHei, Arial, sans-serif'
};

// ============================================================================
// 内联样式注入
// ============================================================================

function addInlineStyles(html, fontFamily, fontSize, lineHeight, letterSpacing = 0) {
  const lh = parseFloat(lineHeight);
  const fallback = calcLH(fontSize, lh);
  const lineHeightCss = Number.isFinite(lh) ? String(lineHeight) : (/[empx%]/i.test(String(lineHeight)) ? String(lineHeight) : fallback);
  const baseStyle = `font-family: ${fontFamily}; color: #333; letter-spacing: ${letterSpacing}px;`;
  const normalWeight = '400';
  const boldWeight = '700';

  let out = html
    .replace(/<section\b(?![^>]*style=)/gi, `<section style="${baseStyle} line-height: ${lineHeightCss} !important;"`)
    .replace(/<strong\b(?![^>]*style=)/gi, `<strong style="${baseStyle} font-weight: ${boldWeight};"`)
    .replace(/<b\b(?![^>]*style=)/gi, `<b style="${baseStyle} font-weight: ${boldWeight};"`)
    .replace(/<em\b(?![^>]*style=)/gi, `<em style="${baseStyle} font-weight: ${normalWeight}; font-style: italic;"`)
    .replace(/<i\b(?![^>]*style=)/gi, `<i style="${baseStyle} font-weight: ${normalWeight}; font-style: italic;"`)
    .replace(/<img([^>]*?)data-md-caption=\"true\"([^>]*?)>/gi, (m, pre, post) => {
      const altMatch = m.match(/alt=\"([^\"]*)\"/i);
      const alt = altMatch ? altMatch[1] : '';
      const img = `<img${pre}data-md-caption=\"true\"${post}>`;
      const figureStyle = `${baseStyle} text-align: center; margin: 1em 0;`;
      const captionStyle = `${baseStyle} display: block; font-size: ${Math.max(12, Math.round(fontSize * 0.875))}px; color: #666; margin-top: 6px;`;
      return `<figure style=\"${figureStyle}\">${img}<figcaption style=\"${captionStyle}\">${alt}</figcaption></figure>`;
    });

  const enforce = (inputHtml, tag) => {
    const re = new RegExp(`<${tag}([^>]*?)style="([^"]*)"([^>]*)>`, 'gi');
    return inputHtml.replace(re, (_m, pre, style, post) => {
      let updated = style;
      if (/line-height\s*:/i.test(updated)) {
        updated = updated.replace(/line-height\s*:\s*[^;]*;?/gi, `line-height: ${lineHeightCss} !important;`);
      } else {
        const needsSemicolon = updated.trim().length > 0 && !(/[;\s]$/.test(updated.trim()));
        updated = `${updated}${needsSemicolon ? '; ' : ' '}line-height: ${lineHeightCss} !important;`;
      }
      return `<${tag}${pre}style="${updated}"${post}>`;
    });
  };
  for (const t of ['section', 'p', 'h1', 'h2', 'h3', 'ul', 'ol', 'li', 'blockquote']) out = enforce(out, t);

  const wrapInner = (inputHtml, tag) => {
    const re = new RegExp(`<${tag}([^>]*)>([\s\S]*?)<\/${tag}>`, 'gi');
    return inputHtml.replace(re, (m, attrs, inner) => {
      if (/data-wx-lh-wrap/.test(inner)) return m;
      if (/^\s*<(p|div|ul|ol|li|h1|h2|h3|blockquote|pre|table)\b/i.test(inner)) return m;
      const span = `<span data-wx-lh-wrap style="line-height: ${lineHeightCss} !important; letter-spacing: ${letterSpacing}px; display: inline-block; width: 100%;">${inner}</span>`;
      return `<${tag}${attrs}>${span}</${tag}>`;
    });
  };
  for (const t of ['p', 'li', 'blockquote', 'h1', 'h2', 'h3']) out = wrapInner(out, t);
  return out;
}

/**
 * 包裹 HTML 并注入字体样式
 */
export function wrapWithFontStyles(html, fontSettings) {
  if (!fontSettings || !html) return html;
  const fontFamily = FONT_FAMILY_MAP[fontSettings.fontFamily] || FONT_FAMILY_MAP['microsoft-yahei'];
  const fontSize = fontSettings.fontSize || 16;
  const lineHeight = calcLH(fontSize, fontSettings.lineHeight);
  const letterSpacing = typeof fontSettings.letterSpacing === 'number' ? fontSettings.letterSpacing : 0;
  const styledHtml = addInlineStyles(html, fontFamily, fontSize, lineHeight, letterSpacing);
  const lh2 = parseFloat(lineHeight);
  const fallback = calcLH(fontSize, lh2);
  const lhCss = Number.isFinite(lh2) ? String(lineHeight) : (/[empx%]/i.test(String(lineHeight)) ? String(lineHeight) : fallback);
  return `<section data-role="outer" class="rich_media_content" style="font-family: ${fontFamily}; font-size: ${fontSize}px; line-height: ${lhCss} !important; letter-spacing: ${letterSpacing}px; font-weight: 400; color: #333; margin: 0; padding: 0;">
<section data-role="inner" style="font-family: ${fontFamily}; font-size: ${fontSize}px; line-height: ${lhCss} !important; letter-spacing: ${letterSpacing}px; font-weight: 400; color: #333;">
${styledHtml}
</section>
</section>`;
}

// ============================================================================
// Breeze 适配器
// ============================================================================

function sanitizeHeadingInlineStyle(originalStyle, { marginTop, marginBottom } = {}) {
  const fallbackTop = marginTop || '1.6em';
  const fallbackBottom = marginBottom || '1em';
  return String(originalStyle || '')
    .replace(/background[^;]*;?/gi, '')
    .replace(/-webkit-background-clip[^;]*;?/gi, '')
    .replace(/-webkit-text-fill-color[^;]*;?/gi, '')
    .replace(/text-shadow[^;]*;?/gi, '')
    .replace(/filter[^;]*;?/gi, '')
    .replace(/padding[^;]*;?/gi, '')
    .replace(/gap[^;]*;?/gi, '')
    .replace(/display[^;]*;?/gi, '')
    .replace(/align-items[^;]*;?/gi, '')
    .replace(/border-left[^;]*;?/gi, '')
    .replace(/padding-left[^;]*;?/gi, '')
    .replace(/margin-top:[^;]*/gi, `margin-top: ${fallbackTop}`)
    .replace(/margin-bottom:[^;]*/gi, `margin-bottom: ${fallbackBottom}`);
}

function stripLeadingDecorativeSpan(html, tag) {
  const re = new RegExp(`<${tag}([^>]*)>(\s*)<span([^>]*)style="([^"]*?\\bwidth\\s*:\\s*\\d+px\\b[^"]*)"([^>]*)><\\/span>(\s*)`, 'gi');
  return html.replace(re, (m, pre, s1) => `<${tag}${pre}>${s1}`);
}

function ensureDecorativeSpan(html, tag, config, color) {
  const tagOpenRe = new RegExp(`<${tag}([^>]*)style=\"([^\"]*)\"([^>]*)>([\\s\\S]*?)<\/${tag}>`, 'gi');
  return html.replace(tagOpenRe, (m, pre, style, post, inner) => {
    const cleaned = sanitizeHeadingInlineStyle(style, { marginTop: config.marginTop, marginBottom: config.marginBottom });
    const innerStripped = inner.replace(/^(\s*)<span([^>]*)style=\"([^\"]*?\bwidth\s*:\s*\d+px\b[^\"]*)\"([^>]*)><\/span>(\s*)/i, '$1');

    const decoBar = [
      'display: block;',
      `width: ${config.widthPx}px;`,
      `height: ${config.heightEm}em;`,
      `border-radius: ${config.radiusPx}px;`,
      `background: ${color};`,
      'box-shadow: 0 0 6px rgba(0,0,0,0.08);'
    ].join(' ');

    const containerStyle = 'display: table; width: 100%;';
    const leftCellStyle = 'display: table-cell; vertical-align: middle; width: 1px;';
    const rightCellStyle = 'display: table-cell; vertical-align: middle; padding-left: 0.5em;';

    const content = `<span style=\"${leftCellStyle}\"><span style=\"${decoBar}\">&#8203;</span></span><span style=\"${rightCellStyle}\">${innerStripped}</span>`;
    return `<${tag}${pre}style=\"${cleaned}; ${containerStyle}\"${post}>${content}</${tag}>`;
  });
}

function applyInlineLinkStyle(html, primary) {
  return html.replace(/<a([^>]*)>/gi, (m, attrs) => {
    if (/style=/i.test(attrs)) {
      return m.replace(/style=\"([^\"]*)\"/i, (s, style) => `style=\"${style}; color: ${primary}; text-decoration: none; border-bottom: 1px solid rgba(0,0,0,0);\"`);
    }
    const trimmed = attrs.trim();
    return `<a${trimmed ? ' ' + trimmed : ''} style=\"color: ${primary}; text-decoration: none; border-bottom: 1px solid rgba(0,0,0,0);\">`;
  });
}

function applyInnerCardStyle(html, cardBg, primaryRgbStr) {
  return html.replace(/<section([^>]*)data-role=\"inner\"([^>]*)style=\"([^\"]*)\"([^>]*)>/i, (m, pre1, pre2, style, post) => {
    const cleaned = style
      .replace(/background(-color)?[^;]*;?/gi, '')
      .replace(/border-radius[^;]*;?/gi, '')
      .replace(/border[^;]*;?/gi, '')
      .replace(/padding[^;]*;?/gi, '');
    const extra = `background-color: ${cardBg}; border-radius: 12px; padding: 24px 20px; border: 1px solid rgba(${primaryRgbStr}, 0.12);`;
    return `<section${pre1}data-role=\"inner\"${pre2}style=\"${cleaned}; ${extra}\"${post}>`;
  });
}

function applyTableStyles(html, primary, primaryRgbStr) {
  const tableBorderColor = `rgba(${primaryRgbStr}, 0.18)`;
  const tableHeaderBg = blendWithWhite(primary, 0.06);
  let out = html;
  out = out.replace(/<table([^>]*)style=\"([^\"]*)\"([^>]*)>/gi, (m, pre, style, post) => {
    const cleaned = style
      .replace(/border-collapse[^;]*;?/gi, '')
      .replace(/border[^;]*;?/gi, '')
      .replace(/border-radius[^;]*;?/gi, '')
      .replace(/background[^;]*;?/gi, '')
      .replace(/margin[^;]*;?/gi, '');
    const extra = `border-collapse: collapse; width: 100%; border: 1px solid ${tableBorderColor}; border-radius: 12px; background: #fff; margin: 1.2em 0;`;
    return `<table${pre}style=\"${cleaned}; ${extra}\"${post}>`;
  });
  out = out.replace(/<table(?![^>]*style=)/gi, `<table style="border-collapse: collapse; width: 100%; border: 1px solid ${tableBorderColor}; border-radius: 12px; background: #fff; margin: 1.2em 0;"`);

  out = out.replace(/<thead>([\s\S]*?)<\/thead>/gi, (m, inner) => {
    const updated = inner.replace(/<th([^>]*)style=\"([^\"]*)\"([^>]*)>/gi, (m2, pre, style, post) => {
      const cleaned = style
        .replace(/background[^;]*;?/gi, '')
        .replace(/color[^;]*;?/gi, '')
        .replace(/font-weight[^;]*;?/gi, '')
        .replace(/border[^;]*;?/gi, '');
      const extra = `background: ${tableHeaderBg}; color: #1f2328; font-weight: 600; border-top: 1px solid ${tableBorderColor}; padding: 10px 12px;`;
      return `<th${pre}style=\"${cleaned}; ${extra}\"${post}>`;
    });
    return `<thead>${updated}</thead>`;
  });

  out = out.replace(/<table([^>]*)>([\s\S]*?)<\/table>/gi, (m, attrs, inner) => {
    const thead = inner.match(/<thead>([\s\S]*?)<\/thead>/i);
    if (!thead) return m;
    const theadContent = thead[1];
    let rest = inner.replace(/<thead>[\s\S]*?<\/thead>/i, '');
    if (/<tbody>/i.test(rest)) rest = rest.replace(/<tbody>/i, `<tbody>${theadContent}`);
    else rest = `<tbody>${theadContent}${rest}</tbody>`;
    return `<table${attrs}>${rest}</table>`;
  });

  out = out.replace(/<th([^>]*)style=\"([^\"]*)\"([^>]*)>/gi, (m, pre, style, post) => {
    const cleaned = style.replace(/border[^;]*;?/gi, '');
    const extra = `border-top: 1px solid ${tableBorderColor}; padding: 10px 12px;`;
    return `<th${pre}style=\"${cleaned}; ${extra}\"${post}>`;
  });
  out = out.replace(/<th(?![^>]*style=)/gi, `<th style="border-top: 1px solid ${tableBorderColor}; padding: 10px 12px;"`);
  out = out.replace(/<td([^>]*)style=\"([^\"]*)\"([^>]*)>/gi, (m, pre, style, post) => {
    const cleaned = style.replace(/border[^;]*;?/gi, '');
    const extra = `border-top: 1px solid ${tableBorderColor}; padding: 10px 12px;`;
    return `<td${pre}style=\"${cleaned}; ${extra}\"${post}>`;
  });
  out = out.replace(/<td(?![^>]*style=)/gi, `<td style="border-top: 1px solid ${tableBorderColor}; padding: 10px 12px;"`);
  return out;
}

export const breezeCopyAdapter = {
  transform(html, { primary, baseFontSize, themeSystem }) {
    const system = themeSystem || null;
    const copyCfg = (system && system.copy) || {};
    const headingsCfg = copyCfg.headings || {};
    const headingCfg = {
      h2: { widthPx: 6, heightEm: 1.2, radiusPx: 3, paddingLeftPx: 16, marginTop: '1.8em', marginBottom: '1.1em', ...((headingsCfg.h2 || {}).deco || {}), ...(headingsCfg.h2 || {}) },
      h3: { widthPx: 4, heightEm: 1.1, radiusPx: 2, paddingLeftPx: 12, marginTop: '1.2em', marginBottom: '0.8em', ...((headingsCfg.h3 || {}).deco || {}), ...(headingsCfg.h3 || {}) },
      h4: { widthPx: 3, heightEm: 1.05, radiusPx: 2, paddingLeftPx: 10, marginTop: '1em', marginBottom: '0.6em', ...((headingsCfg.h4 || {}).deco || {}), ...(headingsCfg.h4 || {}) }
    };

    const primaryRgb = hexToRgb(primary) || { r: 88, g: 101, b: 242 };
    const primaryRgbStr = `${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}`;

    // 1) H1 胶囊
    let out = html.replace(/<h1([^>]*)style=\"([^\"]*)\"([^>]*)>([\s\S]*?)<\/h1>/gi, (m, pre, style, post, inner) => {
      const cleaned = String(style)
        .replace(/background[^;]*;?/gi, '')
        .replace(/padding[^;]*;?/gi, '')
        .replace(/border-radius[^;]*;?/gi, '')
        .replace(/display[^;]*;?/gi, '')
        .replace(/margin[^;]*;?/gi, '')
        .replace(/font-size:[^;]*;?/gi, '')
        .replace(/text-align[^;]*;?/gi, '');
      const h1Style = `text-align: center; margin: 2.2em 0 1.6em;`;
      const pill = `display: inline-block; padding: 8px 16px; border-radius: 12px; background: ${primary}; color: #fff; font-size: ${baseFontSize}px; margin: 0 auto; box-shadow: 0 8px 20px rgba(${primaryRgbStr}, 0.22); letter-spacing: .5px;`;
      const unwrapped = inner.replace(/^\s*<span[^>]*data-wx-lh-wrap[^>]*>([\s\S]*?)<\/span>\s*$/i, '$1');
      const trimmed = unwrapped.replace(/[\u00A0\s]+$/g, '').replace(/^[\u00A0\s]+/g, '');
      const wrapper = `<span style=\"display:block; text-align:center;\"><span data-wx-h1-pill style=\"${pill}\">${trimmed}</span></span>`;
      const content = /data-wx-h1-pill/.test(inner) ? inner : wrapper;
      return `<h1${pre}style=\"${cleaned}; ${h1Style}\"${post}>${content}</h1>`;
    });

    // 2) H2/H3/H4 装饰
    out = stripLeadingDecorativeSpan(out, 'h2');
    out = stripLeadingDecorativeSpan(out, 'h3');
    out = stripLeadingDecorativeSpan(out, 'h4');
    const h3Color = mixWithBlack(primary, 0.6);
    const h4Color = mixWithBlack(primary, 0.35);
    out = ensureDecorativeSpan(out, 'h2', headingCfg.h2, primary);
    out = ensureDecorativeSpan(out, 'h3', headingCfg.h3, h3Color);
    out = ensureDecorativeSpan(out, 'h4', headingCfg.h4, h4Color);

    // 3) 链接、容器、表格
    out = applyInlineLinkStyle(out, primary);
    const innerShade = typeof copyCfg.innerCard?.shade === 'number' ? copyCfg.innerCard.shade : 0.04;
    out = applyInnerCardStyle(out, blendWithWhite(primary, innerShade), primaryRgbStr);
    out = applyTableStyles(out, primary, primaryRgbStr);

    // 4) 字号与行高
    const adjustHeading = (input, tag, fontPx, lineHeightEm) => {
      const re = new RegExp(`<${tag}([^>]*)style=\\"([^\\"]*)\\"([^>]*)>`, 'gi');
      return input.replace(re, (m, pre, style, post) => {
        let s = style.replace(/font-size\s*:\s*[^;]+;?/i, `font-size: ${fontPx}px;`);
        if (lineHeightEm) {
          if (/line-height\s*:/i.test(s)) s = s.replace(/line-height\s*:\s*[^;]+;?/i, `line-height: ${lineHeightEm} !important;`);
          else s = `${s}${s.trim().length > 0 && !(/[;\s]$/.test(s.trim())) ? '; ' : ' '}line-height: ${lineHeightEm} !important;`;
        }
        return `<${tag}${pre}style=\"${s}\"${post}>`;
      });
    };
    const h2Scale = headingsCfg.h2?.fontScale || 1.5;
    const h2Lh = headingsCfg.h2?.lineHeight || '1.35em';
    const h3Scale = headingsCfg.h3?.fontScale || 1.22;
    const h4Scale = headingsCfg.h4?.fontScale || 1.08;
    out = adjustHeading(out, 'h2', Math.round(baseFontSize * h2Scale), h2Lh);
    out = adjustHeading(out, 'h3', Math.round(baseFontSize * h3Scale));
    out = adjustHeading(out, 'h4', Math.round(baseFontSize * h4Scale));

    return out;
  }
};

// ============================================================================
// 适配器注册表
// ============================================================================

const registry = new Map();
registry.set('breeze', breezeCopyAdapter);

/**
 * 获取主题复制适配器
 */
export function getThemeCopyAdapter(themeSystem) {
  const id = typeof themeSystem === 'string' ? themeSystem : themeSystem?.id;
  return registry.get(id) || null;
}

/**
 * 注册主题复制适配器
 */
export function registerThemeCopyAdapter(id, adapter) {
  registry.set(id, adapter);
}

/**
 * 应用社交适配器（统一入口）
 */
export function applySocialAdapter(html, options = {}) {
  const { themeSystem, primary, baseFontSize } = options;
  const adapter = getThemeCopyAdapter(themeSystem);
  if (adapter && typeof adapter.transform === 'function') {
    return adapter.transform(html, { primary, baseFontSize, themeSystem });
  }
  return html;
}

// ============================================================================
// SocialStyler 类
// ============================================================================

export class SocialStyler {
  static process(html, options = {}) {
    if (!html) return '';
    const { fontSettings, themeSystem, colorTheme, isPreview = false } = options;

    // 预览模式
    if (isPreview) {
      const fontFamily = FONT_FAMILY_MAP[fontSettings?.fontFamily] || FONT_FAMILY_MAP['microsoft-yahei'];
      const fontSize = fontSettings?.fontSize || 16;
      const baseStyle = `font-family: ${fontFamily}; color: #333; letter-spacing: ${typeof fontSettings?.letterSpacing === 'number' ? fontSettings.letterSpacing : 0}px;`;
      const out = html.replace(/<img([^>]*?)data-md-caption="true"([^>]*?)>/gi, (m, pre, post) => {
        const altMatch = m.match(/alt="([^"]*)"/i);
        const alt = altMatch ? altMatch[1] : '';
        const img = `<img${pre}data-md-caption="true"${post}>`;
        const figureStyle = `${baseStyle} text-align: center; margin: 1em 0;`;
        const captionStyle = `${baseStyle} display: block; font-size: ${Math.max(12, Math.round(fontSize * 0.875))}px; color: #666; margin-top: 6px;`;
        return `<figure style="${figureStyle}">${img}<figcaption style="${captionStyle}">${alt}</figcaption></figure>`;
      });
      return out;
    }

    // 复制到公众号
    if (!isPreview && fontSettings) {
      let out = wrapWithFontStyles(html, fontSettings);
      const primary = (colorTheme && colorTheme.primary) ? colorTheme.primary : '#5865F2';
      const baseFontSize = Number(fontSettings?.fontSize) || 16;
      const primaryRgb = hexToRgb(primary) || { r: 88, g: 101, b: 242 };
      const primaryRgbStr = `${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}`;
      const adapter = getThemeCopyAdapter(themeSystem);
      if (adapter && typeof adapter.transform === 'function') {
        out = adapter.transform(out, { primary, baseFontSize, primaryRgbStr, themeSystem });
      }
      return out;
    }
    return html;
  }

  static applyInlineStyles(html, fontSettings) {
    if (!fontSettings || !html) return html;
    const fontFamily = FONT_FAMILY_MAP[fontSettings.fontFamily] || FONT_FAMILY_MAP['microsoft-yahei'];
    const fontSize = fontSettings.fontSize || 16;
    const lineHeight = calcLH(fontSize, fontSettings.lineHeight);
    const letterSpacing = typeof fontSettings.letterSpacing === 'number' ? fontSettings.letterSpacing : 0;
    return addInlineStyles(html, fontFamily, fontSize, lineHeight, letterSpacing);
  }
}
