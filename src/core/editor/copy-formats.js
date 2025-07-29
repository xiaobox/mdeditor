/**
 * @file src/core/editor/copy-formats.js
 * @description 多格式复制功能
 *
 * 提供不同格式的内容复制功能：
 * - 公众号格式：带内联样式的HTML，适合微信公众号
 * - MD格式：原始Markdown文本
 */

import { parseMarkdown } from '../markdown/parser/index.js';
import { copyToWechatClean } from './clipboard.js';

/**
 * 生成微信公众号格式HTML（带内联样式）
 * @param {string} markdownText - Markdown文本
 * @param {Object} options - 解析选项
 * @returns {string} 微信格式HTML
 */
function generateWechatHtml(markdownText, options = {}) {
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
      return successful;
    }
  } catch (error) {
    console.error('文本复制失败:', error);
    return false;
  }
}

/**
 * 复制公众号格式
 * @param {string} markdownText - Markdown文本
 * @param {Object} options - 解析选项
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function copyWechatFormat(markdownText, options = {}) {
  if (!markdownText.trim()) {
    return {
      success: false,
      message: '请先编辑内容'
    };
  }

  try {
    const wechatHtml = generateWechatHtml(markdownText, options);
    const success = await copyToWechatClean(wechatHtml);
    
    return {
      success,
      message: success ? '🎉 公众号格式已复制！可以粘贴到微信公众号编辑器' : '❌ 复制失败，请重试'
    };
  } catch (error) {
    console.error('复制公众号格式失败:', error);
    return {
      success: false,
      message: `❌ 复制失败：${error.message}`
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
      message: success ? '📝 Markdown格式已复制到剪贴板' : '❌ 复制失败，请重试'
    };
  } catch (error) {
    console.error('复制Markdown格式失败:', error);
    return {
      success: false,
      message: `❌ 复制失败：${error.message}`
    };
  }
}

/**
 * 获取所有可用的复制格式选项
 * @returns {Array} 格式选项数组
 */
export function getCopyFormatOptions() {
  return [
    {
      value: 'wechat',
      label: '公众号格式',
      icon: 'M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M8.5,9A1.5,1.5 0 0,1 10,10.5A1.5,1.5 0 0,1 8.5,12A1.5,1.5 0 0,1 7,10.5A1.5,1.5 0 0,1 8.5,9M15.5,9A1.5,1.5 0 0,1 17,10.5A1.5,1.5 0 0,1 15.5,12A1.5,1.5 0 0,1 14,10.5A1.5,1.5 0 0,1 15.5,9M12,17.23C10.25,17.23 8.71,16.5 7.81,15.42L9.23,14C9.68,14.72 10.75,15.23 12,15.23C13.25,15.23 14.32,14.72 14.77,14L16.19,15.42C15.29,16.5 13.75,17.23 12,17.23Z'
    },
    {
      value: 'markdown',
      label: 'MD 格式',
      icon: 'M22.269,19.385H1.731A1.73,1.73 0 0,1 0,17.655V6.345A1.73,1.73 0 0,1 1.731,4.615H22.269A1.73,1.73 0 0,1 24,6.345V17.655A1.73,1.73 0 0,1 22.269,19.385ZM16.5,13L13.5,9.5L15.5,9.5L15.5,7L17.5,7L17.5,9.5L19.5,9.5L16.5,13ZM7,7L9,7L9,10.5L11,7L13,7L13,15L11,15L11,11.5L9,15L7,15L7,7Z'
    }
  ];
}
