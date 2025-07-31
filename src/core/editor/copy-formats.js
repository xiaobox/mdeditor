/**
 * @file src/core/editor/copy-formats.js
 * @description 多格式复制功能
 *
 * 提供不同格式的内容复制功能：
 * - 公众号格式：带内联样式的HTML，适合社交平台
 * - MD格式：原始Markdown文本
 */

import { parseMarkdown } from '../markdown/parser/index.js';
import { copyToSocialClean } from './clipboard.js';

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
export async function copySocialFormat(markdownText, options = {}) {
  if (!markdownText.trim()) {
    return {
      success: false,
      message: '请先编辑内容'
    };
  }

  try {
    const socialHtml = generateSocialHtml(markdownText, options);
    const success = await copyToSocialClean(socialHtml, options.fontSettings);

    return {
      success,
      message: success ? '🎉 公众号格式已复制！可以粘贴到社交平台编辑器' : '❌ 复制失败，请重试'
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
      value: 'social',
      label: '公众号格式',
      icon: 'M849.92 51.2H174.08c-67.8656 0-122.88 55.0144-122.88 122.88v675.84c0 67.8656 55.0144 122.88 122.88 122.88h675.84c67.8656 0 122.88-55.0144 122.88-122.88V174.08c0-67.8656-55.0144-122.88-122.88-122.88zM448.18432 230.94272c176.98304-53.95968 267.17696 110.98624 267.17696 110.98624-32.59392-17.78176-130.39104-37.53472-235.09504 16.7936s-126.4384 172.87168-126.4384 172.87168c-42.56256-45.4144-44.4928-118.6304-44.4928-118.6304 5.03296-137.41568 138.84928-182.02112 138.84928-182.02112zM393.50784 796.42112c-256.12288-49.6384-197.85216-273.38752-133.81632-371.95264 0 0-2.88256 138.13248 130.22208 214.4 0 0 15.82592 7.1936 10.79296 30.21312l-5.03808 29.49632s-6.656 20.1472 6.02624 22.30272c0 0 4.04992 0 13.39904-6.4768l48.92672-32.37376s10.07104-7.1936 23.01952-5.03808c12.94848 2.16064 95.68768 23.74656 177.70496-44.60032-0.00512 0-15.10912 213.67296-271.23712 164.02944z m256.8448-19.42016c16.54784-7.9104 97.1264-102.8864 58.98752-231.66464s-167.6288-157.55776-167.6288-157.55776c66.19136-28.0576 143.89248-7.19872 143.89248-7.19872 117.9904 34.5344 131.6608 146.77504 131.6608 146.77504 23.01952 200.71936-166.912 249.64608-166.912 249.64608z',
      viewBox: '0 0 1024 1024'
    },
    {
      value: 'markdown',
      label: 'MD 格式',
      icon: 'M895.318 192 128.682 192C93.008 192 64 220.968 64 256.616l0 510.698C64 802.986 93.008 832 128.682 832l766.636 0C930.992 832 960 802.986 960 767.312L960 256.616C960 220.968 930.992 192 895.318 192zM568.046 704l-112.096 0 0-192-84.08 107.756L287.826 512l0 192L175.738 704 175.738 320l112.088 0 84.044 135.96 84.08-135.96 112.096 0L568.046 704 568.046 704zM735.36 704l-139.27-192 84 0 0-192 112.086 0 0 192 84.054 0-140.906 192L735.36 704z',
      viewBox: '0 0 1024 1024'
    }
  ];
}

// 向后兼容性导出
export const copyWechatFormat = copySocialFormat;
export const generateWechatHtml = generateSocialHtml;
