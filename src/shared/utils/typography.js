/**
 * @file src/shared/utils/typography.js
 * @description 排版相关工具函数（共享给 FontProcessor / SocialStyler）
 */

/**
 * 计算推荐的行高（字符串形式，不带单位，供 CSS 直接使用）
 * 规则：
 * - 显式为正数则直接使用（字符串化）
 * - 否则按字号分段：<=14 -> 1.7，<=18 -> 1.6，其余 -> 1.5
 * 与 SocialStyler 旧实现保持一致
 * @param {number} fontSize
 * @param {number|string|undefined} explicitLineHeight
 * @returns {string}
 */
export function calculateLineHeight(fontSize, explicitLineHeight) {
  if (typeof explicitLineHeight === 'number' && isFinite(explicitLineHeight) && explicitLineHeight > 0) {
    return String(explicitLineHeight)
  }
  if (fontSize <= 14) return '1.7'
  if (fontSize <= 18) return '1.6'
  return '1.5'
}

export default {
  calculateLineHeight,
}

