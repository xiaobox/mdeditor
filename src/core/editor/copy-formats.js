/**
 * @file src/core/editor/copy-formats.js
 * @description 多格式复制功能
 *
 * 提供不同格式的内容复制功能：
 * - 公众号格式：带内联样式的HTML，适合社交平台
 * - MD格式：原始Markdown文本
 */

import { parseMarkdown } from '../markdown/index.js';
import { copyToSocialClean } from './clipboard.js';
import mermaid from 'mermaid';
import { DOMUtils, OFFSCREEN_STYLES } from '../../shared/utils/dom.js';
import { solveMathForWeChat } from '../markdown/math/image-converter.js';
import { createModuleLogger } from '../../shared/utils/logger.js'

const log = createModuleLogger('CopyFormats')

/**
 * 运行 mermaid，将容器内的 mermaid 元素转换为 SVG
 * 在离屏容器调用，保证复制到公众号时也包含已渲染的 SVG
 */
async function renderMermaidInContainer(container) {
  try {
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'strict',
      deterministicIds: true,
      deterministicIDSeed: 'copy-mermaid',
      flowchart: {
        htmlLabels: false,
        useMaxWidth: true,
        diagramPadding: 20  // 增加图表边距，防止右侧文字被截断
      },
      // gantt/pie 各子图的主题变量统一字体，避免外链字体
      themeVariables: {
        fontFamily: '"Microsoft YaHei", "微软雅黑", Arial, sans-serif'
      },
      gantt: {
        fontFamily: '"Microsoft YaHei", "微软雅黑", Arial, sans-serif'
      },
      pie: {
        useMaxWidth: true
      }
    });

    // 仅在离屏容器内逐个渲染，完全避免全局查询
    container.querySelectorAll('.mermaid svg').forEach(s => s.remove());
    const mermaidBlocks = Array.from(container.querySelectorAll('.mermaid'));

    // 隔离 mermaid 的错误输出，避免写入到页面 body（使用统一的离屏样式）
    const sandbox = DOMUtils.createOffscreenContainer('', 'fixed');
    sandbox.style.width = '0';
    sandbox.style.height = '0';
    document.body.appendChild(sandbox);

    try {
      for (let i = 0; i < mermaidBlocks.length; i++) {
        const el = mermaidBlocks[i];
        const def = (el.textContent || '').trim();
        if (!def) continue;
        const id = `mmd-${i}-${Math.random().toString(36).slice(2)}`;
        try {
          const { svg } = await mermaid.render(id, def, undefined, sandbox);
          // 扩展 viewBox 右侧边距，防止中文字符被截断
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = svg;
          const svgEl = tempDiv.querySelector('svg');
          if (svgEl) {
            const viewBox = svgEl.getAttribute('viewBox');
            if (viewBox) {
              const parts = viewBox.split(/\s+/).map(Number);
              if (parts.length === 4) {
                parts[2] = parts[2] * 1.03;
                svgEl.setAttribute('viewBox', parts.join(' '));
              }
            }
            // 关键修复：设置 overflow: visible 防止文字被裁剪
            svgEl.style.overflow = 'visible';
          }
          // 直接替换为 SVG，避免 run() 对全局的副作用
          el.outerHTML = tempDiv.innerHTML;
        } catch (err) {
          console.warn('单个 Mermaid 渲染失败（复制流程继续）：', err);
        }
      }
    } finally {
      DOMUtils.safeRemove(sandbox);
    }
  } catch (e) {
    console.warn('Mermaid 渲染失败（复制流程继续）：', e);
  }
}

/**
 * 清理 SVG 中可能导致 canvas 污染的外部引用（如外链图片/@import 等）
 * 仅保留内部引用（如 url(#id)），移除外链（http/https/// 开头）。
 * 特别保护 mermaid 的文本元素和字体样式。
 */
function sanitizeSvgForRasterize(svg) {
  const clone = svg.cloneNode(true);

  // 移除 <script>、<foreignObject>
  // 仅移除 <script>，保留 <foreignObject>（Mermaid 在 htmlLabels 开启时用于渲染节点文字）
  clone.querySelectorAll('script').forEach(n => n.remove());

  // 移除外链 <image>（保留 data:）
  clone.querySelectorAll('image').forEach(img => {
    const href = img.getAttribute('href') || img.getAttribute('xlink:href') || '';
    if (href && !href.startsWith('data:') && /^(https?:)?\/\//i.test(href)) {
      img.remove();
    }
  });

  // 清理 <style> 中的 @import 或 url(外链)，但保留字体和文本样式
  clone.querySelectorAll('style').forEach(style => {
    let txt = style.textContent || '';
    // 去掉 @import 语句
    txt = txt.replace(/@import[^;]*;/ig, '');
    // 去掉外链 url()，但保留内部引用 url(#xxx)
    txt = txt.replace(/url\((?:\s*["'])?(https?:)?\/\/[^)]*\)/ig, '');
    style.textContent = txt;
  });

  // 清理行内 style 中的外链 url()，但保留字体相关属性
  clone.querySelectorAll('*').forEach(el => {
    const st = el.getAttribute && el.getAttribute('style');
    if (st && /url\((?:\s*['"])?(https?:)?\/\//i.test(st)) {
      // 只移除外链 url()，保留其他样式
      const cleanStyle = st.replace(/url\((?:\s*["'])?(https?:)?\/\/[^)]*\)/ig, '');
      el.setAttribute('style', cleanStyle);
    }

    // 对于 fill/stroke/filter/mask 属性，只移除外链，保留内部引用和颜色值
    ['fill', 'stroke', 'filter', 'mask'].forEach(attr => {
      const v = el.getAttribute && el.getAttribute(attr);
      if (v && /url\((?:\s*['"])?(https?:)?\/\//i.test(v)) {
        // 如果是外链 url()，移除该属性；如果是内部引用 url(#xxx) 或颜色值，保留
        if (!/url\((?:\s*['"])?#/i.test(v)) {
          el.removeAttribute(attr);
        }
      }
    });
  });

  return clone;
}


/**
 * 将容器内非数学公式的 SVG 转为 PNG 图片，以适配会过滤 SVG 的编辑器（如微信）
 */
async function rasterizeMermaidSvgs(container, scale = 2) {
  const svgs = Array.from(container.querySelectorAll('svg')).filter(svg => {
    if (svg.closest('.math-inline, .math-block, .block-equation, [data-formula]')) {
      return false;
    }
    return !svg.querySelector('[data-mml-node]');
  });
  for (const svg of svgs) {
    try {
      // 先基于实际内容计算紧致边界，消除右下偏移与过大留白
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      let maxStroke = 0;
      // 扩展选择器：包含 use, tspan, foreignObject 等 KaTeX 数学公式可能使用的元素
      const targets = svg.querySelectorAll('g, path, rect, circle, ellipse, line, polyline, polygon, text, use, tspan, foreignObject, image');
      targets.forEach(el => {
        try {
          const b = el.getBBox();
          if (!b || !isFinite(b.width) || !isFinite(b.height)) return;
          if (b.width <= 0 && b.height <= 0) return;
          minX = Math.min(minX, b.x);
          minY = Math.min(minY, b.y);
          maxX = Math.max(maxX, b.x + b.width);
          maxY = Math.max(maxY, b.y + b.height);
          const cs = window.getComputedStyle(el);
          const sw = parseFloat(cs.strokeWidth || '0');
          if (Number.isFinite(sw)) maxStroke = Math.max(maxStroke, sw);
        } catch (err) {
          log.debug('SVG element getBBox measurement failed', err)
        }
      });

      let w = 0, h = 0, x0 = 0, y0 = 0;

      // 优先使用根 SVG 的整体边界，避免分组/变换导致的偏移与留白
      try {
        const rootBBox = svg.getBBox();
        if (rootBBox && isFinite(rootBBox.width) && isFinite(rootBBox.height)) {
          // 增加额外边距以防止数学公式被裁切（公式渲染可能超出计算边界）
          const extraPadding = 8; // 为数学公式预留额外空间
          const padInSvgUnit = Math.max(2, Math.ceil(maxStroke / 2) + 1) + extraPadding;
          x0 = Math.floor(rootBBox.x - padInSvgUnit);
          y0 = Math.floor(rootBBox.y - padInSvgUnit);
          w = Math.ceil(rootBBox.width + padInSvgUnit * 2);
          h = Math.ceil(rootBBox.height + padInSvgUnit * 2);
          svg.setAttribute('viewBox', `${x0} ${y0} ${w} ${h}`);
          svg.setAttribute('width', `${w}px`);
          svg.setAttribute('height', `${h}px`);
        }
      } catch (err) {
        log.debug('SVG root getBBox measurement failed', err)
      }

      if (!w || !h) {
        if (isFinite(minX) && isFinite(minY) && isFinite(maxX) && isFinite(maxY)) {
          const padInSvgUnit = Math.max(2, Math.ceil(maxStroke / 2) + 1);
          x0 = Math.floor(minX - padInSvgUnit);
          y0 = Math.floor(minY - padInSvgUnit);
          w = Math.ceil((maxX - minX) + padInSvgUnit * 2);
          h = Math.ceil((maxY - minY) + padInSvgUnit * 2);
          svg.setAttribute('viewBox', `${x0} ${y0} ${w} ${h}`);
          svg.setAttribute('width', `${w}px`);
          svg.setAttribute('height', `${h}px`);
        } else {
          // 兜底：以原有 viewBox/尺寸为准
          const viewBox = svg.getAttribute('viewBox');
          if (viewBox) {
            const parts = viewBox.split(/\s+/).map(Number);
            if (parts.length === 4) { w = Math.max(1, Math.ceil(parts[2])); h = Math.max(1, Math.ceil(parts[3])); }
          }
          if (!w || !h) {
            w = Math.max(1, parseInt(svg.getAttribute('width')) || svg.clientWidth || 300);
            h = Math.max(1, parseInt(svg.getAttribute('height')) || svg.clientHeight || 150);
          }
        }
      }

      // 画布边距按像素再次增加，防止导出后被压缩裁切
      const pad = Math.max(2, Math.ceil(maxStroke / 2) + 1);

      // 使用经过清理的 SVG，避免外链污染 Canvas
      const safeSvg = sanitizeSvgForRasterize(svg);
      const svgHtml = safeSvg.outerHTML;
      const url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgHtml);
      const img = new Image();
      img.crossOrigin = 'anonymous';

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = url;
      });
      if (img.decode) { try { await img.decode(); } catch (err) { log.debug('Image decode optional step failed', err) } }

      const baseW = Math.max(1, Math.floor(w + pad * 2));
      const baseH = Math.max(1, Math.floor(h + pad * 2));
      // 自适应缩放，避免超大图被公众号拒绝（限制最大维度）
      const MAX_DIM = 1600; // 可按需调整
      let effScale = scale;
      const maxWH = Math.max(baseW, baseH);
      if (maxWH * effScale > MAX_DIM) {
        effScale = Math.max(0.5, MAX_DIM / maxWH);
      }

      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.floor(baseW * effScale));
      canvas.height = Math.max(1, Math.floor(baseH * effScale));
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const sW = img.naturalWidth || w;
      const sH = img.naturalHeight || h;
      // 将整张图均匀缩放填充到 w x h 区域，四周留出对称 pad
      ctx.drawImage(
        img,
        0, 0, sW, sH,
        Math.floor(pad * effScale), Math.floor(pad * effScale),
        Math.floor(w * effScale), Math.floor(h * effScale)
      );
      // 仅对 blob: URL 进行释放；data: URL 不需要也不应调用 revokeObjectURL
      if (typeof url === 'string' && url.startsWith('blob:')) {
        try { URL.revokeObjectURL(url) } catch (err) { log.debug('URL.revokeObjectURL cleanup failed', err) }
      }

      const dataUrl = canvas.toDataURL('image/png');
      const imageEl = document.createElement('img');
      imageEl.setAttribute('src', dataUrl);
      imageEl.setAttribute('width', String(w + pad * 2));
      imageEl.setAttribute('height', String(h + pad * 2));
      imageEl.setAttribute('alt', 'mermaid diagram');
      imageEl.style.display = 'inline-block';
      imageEl.style.margin = '0';
      imageEl.style.maxWidth = '100%';
      imageEl.style.height = 'auto';

      // 用一个居中的容器包裹，适配微信编辑器对 <img> 的居中规则
      const wrapper = document.createElement('p');
      wrapper.style.textAlign = 'center';
      wrapper.style.margin = '0.6em 0';
      wrapper.style.lineHeight = '0';
      wrapper.appendChild(imageEl);

      svg.replaceWith(wrapper);
    } catch (e) {
      // 要求：复制到公众号时不应保留任何 SVG。
      // 若单个 SVG 栅格化失败，则以占位 PNG 强制替换，避免残留 SVG。
      console.warn('SVG 栅格化失败，使用占位 PNG 替换（不保留 SVG）：', e);
      try {
        const fallbackCanvas = document.createElement('canvas');
        // 尽量基于原尺寸，失败则使用 300x150 的兜底尺寸
        const fw = Math.max(1, parseInt(svg.getAttribute('width')) || svg.clientWidth || 300);
        const fh = Math.max(1, parseInt(svg.getAttribute('height')) || svg.clientHeight || 150);
        fallbackCanvas.width = fw;
        fallbackCanvas.height = fh;
        const dataUrl = fallbackCanvas.toDataURL('image/png');
        const imageEl = document.createElement('img');
        imageEl.setAttribute('src', dataUrl);
        imageEl.setAttribute('width', String(fw));
        imageEl.setAttribute('height', String(fh));
        imageEl.setAttribute('alt', 'mermaid diagram');
        imageEl.style.display = 'inline-block';
        imageEl.style.margin = '0';
        imageEl.style.maxWidth = '100%';
        imageEl.style.height = 'auto';

        const wrapper = document.createElement('p');
        wrapper.style.textAlign = 'center';
        wrapper.style.margin = '0.6em 0';
        wrapper.style.lineHeight = '0';
        wrapper.appendChild(imageEl);
        svg.replaceWith(wrapper);
      } catch (_) {
        // 最终兜底：移除该 SVG，确保不会复制到公众号
        try { svg.remove(); } catch (removeErr) {
          log.debug('SVG DOM removal cleanup failed', removeErr)
        }
      }
    }
  }
}

/**
 * 生成公众号格式HTML（带内联样式）
 * @param {string} markdownText - Markdown文本
 * @param {Object} options - 解析选项
 * @returns {string} 公众号格式HTML
 */
function generateSocialHtml(markdownText, options = {}) {
  // 使用非预览模式生成HTML，这样会包含内联样式
  return parseMarkdown(markdownText, {
    ...options,
    isPreview: false
  });
}
/**
 * 复制纯文本到剪贴板
 * @param {string} text - 要复制的文本
 * @returns {Promise<boolean>} 复制是否成功
 */
async function copyTextToClipboard(text) {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // 降级到传统方法
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      textArea.style.top = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful; // 旧 API 兜底分支，保留兼容，不影响功能
    }
  } catch (error) {
    return false;
  }
}

/**
 * 复制公众号格式
 * @param {string} markdownText - Markdown文本
 * @param {Object} options - 解析选项
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function copySocialFormat(markdownText, options = {}) {
  if (!markdownText.trim()) {
    return {
      success: false,
      message: '请先编辑内容'
    };
  }

  try {
    // 1) 先生成社交版 HTML（含 mermaid 容器）
    const socialHtml = generateSocialHtml(markdownText, options);

    // 2) 创建离屏容器，渲染 mermaid 为 SVG
    const container = DOMUtils.createOffscreenContainer(socialHtml, 'render');
    document.body.appendChild(container);

    await renderMermaidInContainer(container);

    // 将 Mermaid SVG 栅格化为 PNG，避开平台过滤问题
    await rasterizeMermaidSvgs(container, 2);

    // 处理数学公式 SVG，使其兼容微信公众号
    solveMathForWeChat(container);

    // 3) 获取最终 HTML 并复制
    const finalHtml = container.innerHTML;

    DOMUtils.safeRemove(container);

    const success = await copyToSocialClean(finalHtml, options.fontSettings);

    return {
      success,
      message: success ? '🎉 公众号格式已复制，可以粘贴到社交平台编辑器' : '❌ 复制失败，请重试'
    };
  } catch (error) {
    return {
      success: false,
      message: `❌ 复制失败: ${error.message}`
    };
  }
}

/**
 * 复制Markdown格式
 * @param {string} markdownText - Markdown文本
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function copyMarkdownFormat(markdownText) {
  if (!markdownText.trim()) {
    return {
      success: false,
      message: '请先编辑内容'
    };
  }

  try {
    const success = await copyTextToClipboard(markdownText);

    return {
      success,
      message: success ? '📝 Markdown 格式已复制到剪贴板' : '❌ 复制失败，请重试'
    };
  } catch (error) {
    return {
      success: false,
      message: `❌ 复制失败: ${error.message}`
    };
  }
}

/**
 * 获取所有可用的复制格式选项
 * @returns {Array} 格式选项数组
 */
import { i18n } from '../../plugins/i18n.js';

export function getCopyFormatOptions() {
  const t = (key) => (i18n && i18n.global && i18n.global.t ? i18n.global.t(key) : key)
  return [
    {
      value: 'social',
      label: t('copyFormat.social'),
      icon: 'M849.92 51.2H174.08c-67.8656 0-122.88 55.0144-122.88 122.88v675.84c0 67.8656 55.0144 122.88 122.88 122.88h675.84c67.8656 0 122.88-55.0144 122.88-122.88V174.08c0-67.8656-55.0144-122.88-122.88-122.88zM448.18432 230.94272c176.98304-53.95968 267.17696 110.98624 267.17696 110.98624-32.59392-17.78176-130.39104-37.53472-235.09504 16.7936s-126.4384 172.87168-126.4384 172.87168c-42.56256-45.4144-44.4928-118.6304-44.4928-118.6304 5.03296-137.41568 138.84928-182.02112 138.84928-182.02112zM393.50784 796.42112c-256.12288-49.6384-197.85216-273.38752-133.81632-371.95264 0 0-2.88256 138.13248 130.22208 214.4 0 0 15.82592 7.1936 10.79296 30.21312l-5.03808 29.49632s-6.656 20.1472 6.02624 22.30272c0 0 4.04992 0 13.39904-6.4768l48.92672-32.37376s10.07104-7.1936 23.01952-5.03808c12.94848 2.16064 95.68768 23.74656 177.70496-44.60032-0.00512 0-15.10912 213.67296-271.23712 164.02944z m256.8448-19.42016c16.54784-7.9104 97.1264-102.8864 58.98752-231.66464s-167.6288-157.55776-167.6288-157.55776c66.19136-28.0576 143.89248-7.19872 143.89248-7.19872 117.9904 34.5344 131.6608 146.77504 131.6608 146.77504 23.01952 200.71936-166.912 249.64608-166.912 249.64608z',
      viewBox: '0 0 1024 1024'
    },
    {
      value: 'markdown',
      label: t('copyFormat.markdown'),
      icon: 'M895.318 192 128.682 192C93.008 192 64 220.968 64 256.616l0 510.698C64 802.986 93.008 832 128.682 832l766.636 0C930.992 832 960 802.986 960 767.312L960 256.616C960 220.968 930.992 192 895.318 192zM568.046 704l-112.096 0 0-192-84.08 107.756L287.826 512l0 192L175.738 704 175.738 320l112.088 0 84.044 135.96 84.08-135.96 112.096 0L568.046 704 568.046 704zM735.36 704l-139.27-192 84 0 0-192 112.086 0 0 192 84.054 0-140.906 192L735.36 704z',
      viewBox: '0 0 1024 1024'
    }
  ];
}

// 向后兼容性导出
export const copyWechatFormat = copySocialFormat;
export const generateWechatHtml = generateSocialHtml;

// 导出内部工具函数，供导出模块复用
export { generateSocialHtml, renderMermaidInContainer, rasterizeMermaidSvgs };
