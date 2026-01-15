/**
 * @file src/shared/utils/logger.js
 * @description 开发环境日志工具，生产环境静默
 */

const isDev = import.meta.env?.DEV ?? process.env.NODE_ENV === 'development'

// 空操作函数
const noop = () => {}

/**
 * 创建带前缀的日志函数
 * @param {string} prefix - 日志前缀
 * @returns {Object} 日志方法对象
 */
function createLogger(prefix = '') {
  if (!isDev) {
    return {
      debug: noop,
      info: noop,
      warn: noop,
      error: noop,
      group: noop,
      groupEnd: noop
    }
  }

  const formatMessage = (level, ...args) => {
    const timestamp = new Date().toLocaleTimeString()
    return [`[${timestamp}]${prefix ? ` ${prefix}` : ''}`, ...args]
  }

  return {
    debug: (...args) => console.debug(...formatMessage('DEBUG', ...args)),
    info: (...args) => console.info(...formatMessage('INFO', ...args)),
    warn: (...args) => console.warn(...formatMessage('WARN', ...args)),
    error: (...args) => console.error(...formatMessage('ERROR', ...args)),
    group: (label) => console.group(label),
    groupEnd: () => console.groupEnd()
  }
}

// 默认日志实例
export const logger = createLogger()

/**
 * 创建模块专用日志器
 * @param {string} moduleName - 模块名称
 * @returns {Object} 日志方法对象
 */
export function createModuleLogger(moduleName) {
  return createLogger(`[${moduleName}]`)
}

// 导出快捷方法
export const { debug, info, warn, error } = logger
