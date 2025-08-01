/**
 * @file src/shared/utils/performance.js
 * @description 简化的性能优化工具
 *
 * 只保留实际有用的功能：防抖、节流和简单缓存
 */

/**
 * 简单的缓存实现
 */
export class SimpleCache {
  constructor(maxSize = 50) {
    this.maxSize = maxSize;
    this.cache = new Map();
  }

  get(key) {
    return this.cache.get(key);
  }

  set(key, value) {
    if (this.cache.size >= this.maxSize) {
      // 删除第一个项
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  clear() {
    this.cache.clear();
  }
}

/**
 * 简单的 memoization 函数
 * @param {Function} fn - 要缓存的函数
 * @param {number} maxSize - 最大缓存大小
 * @returns {Function} 带缓存的函数
 */
export function memoize(fn, maxSize = 50) {
  const cache = new SimpleCache(maxSize);

  return function memoized(...args) {
    const key = JSON.stringify(args);
    const cached = cache.get(key);
    
    if (cached !== undefined) {
      return cached;
    }

    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

/**
 * 防抖函数
 * @param {Function} fn - 要防抖的函数
 * @param {number} delay - 延迟时间（毫秒）
 * @returns {Function} 防抖函数
 */
export function debounce(fn, delay) {
  let timeoutId;
  
  return function debounced(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}

