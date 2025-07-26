/**
 * @file src/utils/clipboard-handler.js
 * @description 剪贴板操作处理器
 *
 * 本文件封装了将 HTML 内容复制到系统剪贴板的复杂逻辑，
 * 特别针对微信公众号编辑器的怪异行为进行了优化。
 *
 * 主要功能:
 * 1.  **富文本复制**: 核心功能 `copyToWechatClean` 旨在将一段 HTML 字符串
 *     作为富文本（而不是纯文本）复制到剪贴板，这样粘贴到微信编辑器时能保留样式。
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
 * 5.  **微信特化容器**: `createRichTextContainer` 函数创建的容器带有一些特定的
 *     CSS 样式，旨在模拟微信编辑器的环境，提高样式兼容性。
 *
 * 设计思想:
 * - **封装复杂性**: 将与剪贴板交互的底层、繁琐且充满兼容性问题的代码封装起来，
 *   对外提供一个简单的 `copyToWechatClean(html)` 接口。
 * - **用户体验优先**: 尽管实现复杂，但目标是为用户提供一个“一键复制”的无缝体验。
 *   超时和明确的错误提示都是为了改善用户体验。
 * - **面向未来，兼容过去**: 优先使用现代 API，但保留了对旧 API 的支持，
 *   确保了在更广泛的浏览器环境中可用。
 */

import {
  TIMEOUTS,
  CLIPBOARD_ERRORS,
  EDITOR_CONFIG,
} from '../config/constants/index.js';
import { ErrorHandler, ERROR_TYPES } from './shared/error-handler.js';

/**
 * 创建一个用于富文本复制的临时 DOM 容器。
 * @param {string} html - 要放入容器的 HTML 内容。
 * @returns {HTMLDivElement} - 创建的 div 元素。
 */
function createRichTextContainer(html) {
  const container = document.createElement('div');

  // 这些样式旨在模拟一个干净的、标准的富文本环境，
  // 以提高在不同粘贴目标（特别是微信）中的兼容性。
  container.style.cssText = `
    font-family: ${EDITOR_CONFIG.FONT_FAMILY};
    font-size: ${EDITOR_CONFIG.FONT_SIZE};
    line-height: ${EDITOR_CONFIG.LINE_HEIGHT};
    color: #333;
    background-color: #ffffff;
    padding: 0;
    margin: 0;
    word-wrap: break-word;
    text-align: left;
  `;

  // 将其放置在屏幕外，用户不可见。
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';

  container.innerHTML = html;
  return container;
}

/**
 * 将 HTML 字符串作为富文本复制到剪贴板，并针对微信公众号进行优化。
 * @param {string} html - 要复制的 HTML 内容。
 * @returns {Promise<boolean>} - 复制成功时 resolve(true)，否则 reject(error)。
 */
export async function copyToWechatClean(html) {
  if (!html) {
    throw ErrorHandler.wrap(
      new Error(CLIPBOARD_ERRORS.NO_CONTENT),
      ERROR_TYPES.CLIPBOARD,
      '剪贴板复制'
    );
  }

  const sizeKB = (html.length / 1024).toFixed(1);
  console.log(`准备复制内容，大小: ${sizeKB}KB`);

  const container = createRichTextContainer(html);
  document.body.appendChild(container);

  try {
    // 使用 Promise.race 实现超时控制
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('复制操作超时')), TIMEOUTS.CLIPBOARD_OPERATION);
    });

    const copyPromise = (async () => {
      // 选中临时容器中的内容
      const range = document.createRange();
      range.selectNodeContents(container);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);

      let success = false;
      let lastError = null;

      // 方法1: 尝试使用现代的 Clipboard API
      if (navigator.clipboard && navigator.clipboard.write) {
        try {
          console.log('尝试使用 Clipboard API...');
          const blobHtml = new Blob([container.outerHTML], { type: 'text/html' });
          const blobText = new Blob([container.textContent], { type: 'text/plain' });
          await navigator.clipboard.write([new ClipboardItem({ 'text/html': blobHtml, 'text/plain': blobText })]);
          success = true;
          console.log('Clipboard API 复制成功');
        } catch (modernError) {
          console.warn('Clipboard API 失败:', modernError.message);
          lastError = modernError;
        }
      }

      // 方法2: 如果现代 API 失败或不可用，降级到传统的 execCommand
      if (!success) {
        try {
          console.log('尝试使用 execCommand...');
          success = document.execCommand('copy');
          if (success) {
            console.log('execCommand 复制成功');
          } else {
            console.warn('execCommand 复制失败');
            lastError = lastError || new Error('execCommand returned false.');
          }
        } catch (execError) {
          console.warn('execCommand 失败:', execError.message);
          lastError = execError;
        }
      }

      if (!success) {
        throw lastError || new Error('所有复制方法都失败了');
      }

      return true;
    })();

    return await Promise.race([copyPromise, timeoutPromise]);

  } catch (error) {
    console.error('复制失败:', error);
    // 使用统一的错误处理器
    throw ErrorHandler.handleClipboardError(error, parseFloat(sizeKB));
  } finally {
    // 无论成功与否，都清理 DOM
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
    // 清理选区
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
    }
    console.log(`复制流程结束，内容大小: ${sizeKB}KB`);
  }
}