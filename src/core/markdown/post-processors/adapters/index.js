/**
 * @file src/core/markdown/post-processors/adapters/index.js
 * @description 主题复制适配器注册表（用于复制到社交平台时的内联样式修饰）
 */

import { breezeCopyAdapter } from './breeze.js'

const registry = new Map()

// 预注册内置主题的适配器
registry.set('breeze', breezeCopyAdapter)

/**
 * 获取主题复制适配器
 * @param {string|object} themeSystem - 主题系统对象或其 id
 * @returns {{transform(html:string, ctx:Object):string}|null}
 */
export function getThemeCopyAdapter(themeSystem) {
  const id = typeof themeSystem === 'string' ? themeSystem : themeSystem?.id
  return registry.get(id) || null
}

/**
 * 动态注册适配器（为未来主题扩展）
 * @param {string} id
 * @param {{transform(html:string, ctx:Object):string}} adapter
 */
export function registerThemeCopyAdapter(id, adapter) {
  registry.set(id, adapter)
}


