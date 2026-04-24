/**
 * @file src/core/editor/clipboard.js
 * @description 剪贴板操作处理器
 *
 * 本文件封装了将 HTML 内容复制到系统剪贴板的复杂逻辑，
 * 特别针对社交平台编辑器的怪异行为进行了优化。
 *
 * 主要功能:
 * 1.  **富文本复制**: 核心功能 `copyToSocialClean` 旨在将一段 HTML 字符串
 *     作为富文本（而不是纯文本）复制到剪贴板，这样粘贴到社交平台时能保留样式。
 * 2.  **动态 DOM 操作**: 为了实现复制，它会动态创建一个临时的 `div` 元素，
 *     将 HTML 内容注入其中，然后使用 `document.createRange` 和 `window.getSelection`
 *     来选中这个 `div` 的内容。
 * 3.  **渐进式增强与优雅降级**:
 *     - 优先尝试使用现代的、异步的 `navigator.clipboard.write` API，
 *       因为它更强大、更安全，并且能同时写入多种 MIME 类型（如 `text/html` 和 `text/plain`）。
 *     - 如果 `clipboard.write` 失败（例如在不支持的浏览器或非 HTTPS 环境中），
 *       会自动降级到传统的 `document.execCommand('copy')` 方法。
 * 4.  **健壮性与错误处理**:
 *     - 包含了超时机制，防止因内容过大或浏览器问题导致复制过程卡死。
 *     - 提供了详细的错误信息，帮助用户理解复制失败的原因（如权限问题、内容过大等）。
 * 5.  **社交平台特化容器**: `createRichTextContainer` 函数创建的容器带有一些特定的
 *     CSS 样式，旨在模拟社交平台的环境，提高样式兼容性。
 *
 * 设计思想:
 * - **封装复杂性**: 将与剪贴板交互的底层、繁琐且充满兼容性问题的代码封装起来，
 *   对外提供一个简单的 `copyToSocialClean(html)` 接口。
 * - **用户体验优先**: 尽管实现复杂，但目标是为用户提供一个"一键复制"的无缝体验。
 *   超时和明确的错误提示都是为了改善用户体验。
 * - **面向未来，兼容过去**: 优先使用现代 API，但保留了对旧 API 的支持，
 *   确保了在更广泛的浏览器环境中可用。
 */

import {
  TIMEOUTS,
  CLIPBOARD_ERRORS,
  EDITOR_CONFIG,
} from '../../config/constants/index.js';
import { ErrorHandler, ERROR_TYPES } from '../../shared/utils/error.js';
import { OFFSCREEN_STYLES, DOMUtils } from '../../shared/utils/dom.js';
import { TextUtils } from '../../shared/utils/text.js';
import { createModuleLogger } from '../../shared/utils/logger.js'
import { resolveCopyFontSettings } from '../markdown/social-adapters.js';

const log = createModuleLogger('Clipboard')

/**
 * 创建一个用于富文本复制的临时 DOM 容器。
 * @param {string} html - 要放入容器的 HTML 内容。
 * @param {Object} fontSettings - 字体设置对象（可选）
 * @returns {HTMLDivElement} - 创建的 div 元素。
 */
function createRichTextContainer(html, fontSettings = null) {
  const container = document.createElement('div');

  // 获取字体设置 - 使用默认的微信兼容字体
  let fontFamily = '"Microsoft YaHei", "微软雅黑", Arial, sans-serif'; // 默认使用微信兼容字体
  let fontSize = `${EDITOR_CONFIG.FONT_SIZE}px`;
  let lineHeight = EDITOR_CONFIG.LINE_HEIGHT;
  let letterSpacing = 0;

  if (fontSettings) {
    try {
      const resolvedFont = resolveCopyFontSettings(fontSettings);
      fontFamily = resolvedFont.fontFamily;
      fontSize = `${resolvedFont.fontSize}px`;
      lineHeight = resolvedFont.lineHeight;
      letterSpacing = resolvedFont.letterSpacing;
    } catch (error) {
      console.warn('Failed to apply font settings to clipboard container:', error);
    }
  }

  // 这些样式旨在模拟一个干净的、标准的富文本环境，
  // 以提高在不同粘贴目标（特别是社交平台）中的兼容性。
  container.style.cssText = `
    font-family: ${fontFamily};
    font-size: ${fontSize};
    line-height: ${lineHeight};
    letter-spacing: ${letterSpacing}px;
    font-weight: 400;
    color: #333;
    background-color: #ffffff;
    padding: 0;
    margin: 0;
    word-wrap: break-word;
    text-align: left;
  `;

  // 将其放置在屏幕外，用户不可见，并优化性能（使用统一的离屏样式）
  DOMUtils.applyStyles(container, OFFSCREEN_STYLES.absolute);

  container.innerHTML = html;
  return container;
}

/**
 * 尝试使用现代 Clipboard API 进行复制。
 * @private
 */
async function copyWithClipboardAPI(html, plainText) {
  const blobHtml = new Blob([html], { type: 'text/html' });
  const blobText = new Blob([plainText || TextUtils.stripHtmlTags(html)], { type: 'text/plain' });
  await navigator.clipboard.write([new ClipboardItem({ 'text/html': blobHtml, 'text/plain': blobText })]);
}

/**
 * 尝试使用传统的 execCommand 进行复制（拦截 copy 事件，无需改变选区）。
 * 这种方式可以最大程度避免页面滚动/抖动。
 * @private
 */
function copyWithExecCommandViaListener(html, plainText) {
  return new Promise((resolve, reject) => {
    let succeeded = false;
    const onCopy = (e) => {
      try {
        e.clipboardData.setData('text/html', html);
        e.clipboardData.setData('text/plain', plainText || TextUtils.stripHtmlTags(html));
        e.preventDefault();
        succeeded = true;
      } catch (err) {
        log.warn('clipboardData.setData failed in copy event listener', err)
      }
    };
    document.addEventListener('copy', onCopy, true);

    // 某些浏览器要求有选区才能触发 copy；使用 1x1 的隐藏编辑节点，尽量避免滚动
    const ghost = document.createElement('div');
    ghost.setAttribute('contenteditable', 'true');
    ghost.style.cssText = `
      position: fixed; top: 0; left: 0; width: 1px; height: 1px;
      opacity: 0; overflow: hidden; pointer-events: none; z-index: -1;
      contain: strict; transform: translateZ(0);
    `;
    ghost.textContent = '.';
    document.body.appendChild(ghost);

    const prevScrollX = window.scrollX; const prevScrollY = window.scrollY;
    const range = document.createRange();
    range.selectNodeContents(ghost);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);

    try {
      const ok = document.execCommand('copy');
      if (!ok && !succeeded) throw new Error('execCommand returned false.');
      resolve(true);
    } catch (err) {
      reject(err);
    } finally {
      selection.removeAllRanges();
      if (ghost.parentNode) ghost.parentNode.removeChild(ghost);
      if (typeof window.scrollTo === 'function') window.scrollTo(prevScrollX, prevScrollY);
      document.removeEventListener('copy', onCopy, true);
    }
  });
}

/**
 * 尝试使用传统的 execCommand 进行复制（选区方式，作为最终兜底）。
 * @private
 */
function copyWithExecCommand() {
  if (!document.execCommand('copy')) {
    throw new Error('execCommand returned false.');
  }
}

/**
 * 将 HTML 字符串作为富文本复制到剪贴板，并针对社交平台进行优化。
 * @param {string} html - 要复制的 HTML 内容。
 * @param {Object} fontSettings - 字体设置对象（可选）
 * @returns {Promise<boolean>} - 复制成功时 resolve(true)，否则 reject(error)。
 */
export async function copyToSocialClean(html, fontSettings = null) {
  if (!html) {
    throw ErrorHandler.wrap(
      new Error(CLIPBOARD_ERRORS.NO_CONTENT),
      ERROR_TYPES.CLIPBOARD,
      '剪贴板复制'
    );
  }

  const sizeKB = (html.length / 1024).toFixed(1);

  try {
    // 使用 Promise.race 实现超时控制
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('复制操作超时')), TIMEOUTS.CLIPBOARD_OPERATION);
    });

    const copyPromise = async () => {
      const plainText = TextUtils.stripHtmlTags(html);
      const containsSvg = /<svg\b/i.test(html);

      // 优先尝试 Clipboard API（支持 SVG 内容）
      if (navigator.clipboard && navigator.clipboard.write) {
        try {
          await copyWithClipboardAPI(html, plainText);
          return true;
        } catch (apiError) {
          // Clipboard API 失败，继续尝试其他方式
        }
      }

      // 尝试 copy 事件监听方式（不适用于 SVG）
      if (!containsSvg) {
        try {
          await copyWithExecCommandViaListener(html, plainText);
          return true;
        } catch (_) {
          // 继续兜底到选区复制
        }
      }

      // 选区复制兜底
      const container = createRichTextContainer(html, fontSettings);
      // SVG 需要可渲染的容器；非 SVG 使用更严格的隐藏样式
      DOMUtils.applyOffscreenStyles(container, containsSvg ? 'render' : 'clipboard');
      if (containsSvg) {
        container.style.visibility = 'visible';
      }
      document.body.appendChild(container);
      try {
        // 使用 DOMUtils 保存和恢复状态
        const scrollPos = DOMUtils.saveScrollPosition();
        const prevActive = DOMUtils.saveActiveElement();

        // 使用 DOMUtils 创建选区
        DOMUtils.createSelection(container);

        try {
          copyWithExecCommand();
        } finally {
          DOMUtils.clearSelection();
          DOMUtils.restoreScrollPosition(scrollPos);
          DOMUtils.restoreActiveElement(prevActive);
        }
        return true;
      } finally {
        DOMUtils.safeRemove(container);
      }
    };

    return await Promise.race([copyPromise(), timeoutPromise]);

  } catch (error) {
    throw ErrorHandler.handleClipboardError(error, parseFloat(sizeKB));
  }
}

// 向后兼容性导出
export const copyToWechatClean = copyToSocialClean;
