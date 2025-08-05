/**
 * @file src/composables/useNotification.js
 * @description 通知系统管理 Composable
 *
 * 专门管理通知系统，包括：
 * - 通知的创建和显示
 * - 通知的自动移除
 * - 通知的手动移除
 * - 通知动画处理
 */

import { ref } from 'vue'

/**
 * 通知系统管理 Composable
 * @returns {Object} 通知状态和控制方法
 */
export function useNotification() {
  // 状态
  const notifications = ref([])

  /**
   * 显示通知
   * @param {string} message - 通知消息
   * @param {string} type - 通知类型 ('info', 'success', 'warning', 'error')
   * @param {number} duration - 显示时长（毫秒），默认3000ms
   * @returns {string} 通知ID
   */
  const showNotification = (message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random()
    const notification = {
      id,
      message,
      type,
      timestamp: new Date(),
      isRemoving: false
    }
    
    notifications.value.push(notification)
    
    // 自动移除通知
    setTimeout(() => {
      removeNotification(id)
    }, duration)
    
    return id
  }

  /**
   * 移除通知
   * @param {string} id - 通知ID
   */
  const removeNotification = (id) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      // 添加 slide-out 类触发退出动画
      notifications.value[index].isRemoving = true

      // 等待动画完成后再从数组中移除
      setTimeout(() => {
        const currentIndex = notifications.value.findIndex(n => n.id === id)
        if (currentIndex > -1) {
          notifications.value.splice(currentIndex, 1)
        }
      }, 400) // 与 CSS 动画时长一致
    }
  }

  /**
   * 清除所有通知
   */
  const clearAllNotifications = () => {
    // 先标记所有通知为移除状态
    notifications.value.forEach(notification => {
      notification.isRemoving = true
    })

    // 等待动画完成后清空数组
    setTimeout(() => {
      notifications.value.splice(0)
    }, 400)
  }

  /**
   * 显示成功通知
   * @param {string} message - 通知消息
   * @param {number} duration - 显示时长
   * @returns {string} 通知ID
   */
  const showSuccess = (message, duration = 3000) => {
    return showNotification(message, 'success', duration)
  }

  /**
   * 显示错误通知
   * @param {string} message - 通知消息
   * @param {number} duration - 显示时长
   * @returns {string} 通知ID
   */
  const showError = (message, duration = 5000) => {
    return showNotification(message, 'error', duration)
  }

  /**
   * 显示警告通知
   * @param {string} message - 通知消息
   * @param {number} duration - 显示时长
   * @returns {string} 通知ID
   */
  const showWarning = (message, duration = 4000) => {
    return showNotification(message, 'warning', duration)
  }

  /**
   * 显示信息通知
   * @param {string} message - 通知消息
   * @param {number} duration - 显示时长
   * @returns {string} 通知ID
   */
  const showInfo = (message, duration = 3000) => {
    return showNotification(message, 'info', duration)
  }

  return {
    // 状态
    notifications,

    // 基础方法
    showNotification,
    removeNotification,
    clearAllNotifications,

    // 便捷方法
    showSuccess,
    showError,
    showWarning,
    showInfo
  }
}
