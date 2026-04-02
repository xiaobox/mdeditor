/**
 * @file src/composables/useScrollNavigation.js
 * @description 滚动导航 Composable - 处理侧边导航与内容区域的滚动同步
 */

import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue'

/**
 * 滚动导航 Composable
 * @param {Object} options - 配置选项
 * @param {string} options.containerSelector - 滚动容器的 CSS 选择器
 * @param {Array} options.sections - 导航区域配置数组，每项需包含 id 字段
 * @param {string} [options.defaultSection] - 默认激活的区域 id
 * @param {number} [options.scrollDebounceMs=500] - 点击滚动后禁用监听的时间（毫秒）
 * @param {Function} [options.getVisible] - 获取面板可见性的函数
 */
export function useScrollNavigation(options) {
  const {
    containerSelector,
    sections,
    defaultSection,
    scrollDebounceMs = 500,
    getVisible
  } = options

  // 当前激活的区域
  const activeSection = ref(defaultSection || sections[0]?.id || '')

  // 标记是否由点击导航触发的滚动（防止滚动监听造成闪烁）
  const isScrollingByClick = ref(false)

  // 缓存滚动容器引用，避免重复查询 DOM
  let scrollContainerCache = null
  // rAF 节流：pending 的 requestAnimationFrame ID
  let rafId = null

  /**
   * 获取滚动容器（带缓存）
   */
  const getScrollContainer = () => {
    if (!scrollContainerCache) {
      scrollContainerCache = document.querySelector(containerSelector)
    }
    return scrollContainerCache
  }

  /**
   * 清除容器缓存（面板关闭时调用）
   */
  const clearContainerCache = () => {
    scrollContainerCache = null
  }

  /**
   * 滚动到指定区域
   * @param {string} sectionId - 目标区域 id
   * @param {boolean} [smooth=true] - 是否使用平滑滚动
   */
  const scrollToSection = (sectionId, smooth = true) => {
    const element = document.getElementById(sectionId)
    if (!element) return

    // 标记为点击触发的滚动，暂时禁用滚动监听更新
    isScrollingByClick.value = true
    activeSection.value = sectionId

    element.scrollIntoView({
      behavior: smooth ? 'smooth' : 'auto',
      block: 'start',
      inline: 'nearest'
    })

    // 滚动动画结束后恢复滚动监听
    setTimeout(() => {
      isScrollingByClick.value = false
    }, scrollDebounceMs)
  }

  /**
   * 滚动事件的实际处理逻辑
   * 使用 scrollTop + offsetTop 代替 getBoundingClientRect()，避免强制同步布局重排
   */
  const updateActiveSection = () => {
    rafId = null

    // 如果是点击导航触发的滚动，跳过更新（避免闪烁）
    if (isScrollingByClick.value) return

    const container = getScrollContainer()
    if (!container) return

    const scrollTop = container.scrollTop
    const threshold = container.clientHeight / 3
    const sectionIds = sections.map(s => s.id)

    for (let i = sectionIds.length - 1; i >= 0; i--) {
      const element = document.getElementById(sectionIds[i])
      if (!element) continue

      // offsetTop 相对于 offsetParent，不触发布局重排
      if (element.offsetTop <= scrollTop + threshold) {
        activeSection.value = sectionIds[i]
        return
      }
    }
    // 滚动位置在所有 section 之前，激活第一个
    if (sectionIds.length) {
      activeSection.value = sectionIds[0]
    }
  }

  /**
   * 处理滚动事件（rAF 节流，避免高频回调）
   */
  const handleScroll = () => {
    if (rafId !== null) return
    rafId = requestAnimationFrame(updateActiveSection)
  }

  /**
   * 添加滚动监听器
   */
  const addScrollListener = () => {
    const container = getScrollContainer()
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true })
    }
  }

  /**
   * 移除滚动监听器
   */
  const removeScrollListener = () => {
    const container = getScrollContainer()
    if (container) {
      container.removeEventListener('scroll', handleScroll)
    }
    clearContainerCache()
  }

  /**
   * 初始化导航（面板打开时调用）
   */
  const initNavigation = () => {
    nextTick(() => {
      addScrollListener()
      // 定位到当前激活区域（不使用平滑滚动）
      scrollToSection(activeSection.value, false)
    })
  }

  /**
   * 销毁导航（面板关闭时调用）
   */
  const destroyNavigation = () => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
    removeScrollListener()
  }

  // 如果提供了 getVisible 函数，自动监听可见性变化
  if (getVisible) {
    watch(
      getVisible,
      (newVisible, oldVisible) => {
        if (newVisible && !oldVisible) {
          initNavigation()
        } else if (!newVisible && oldVisible) {
          destroyNavigation()
        }
      },
      { flush: 'post' }
    )
  }

  // 生命周期钩子
  onMounted(() => {
    // 如果组件挂载时面板已可见，初始化导航
    if (getVisible && getVisible()) {
      initNavigation()
    }
  })

  onUnmounted(() => {
    destroyNavigation()
  })

  return {
    activeSection,
    scrollToSection: (sectionId) => scrollToSection(sectionId, true),
    initNavigation,
    destroyNavigation
  }
}
