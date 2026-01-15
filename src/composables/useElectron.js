import { ref, onMounted, onUnmounted } from 'vue'

export function useElectron() {
  const isElectron = ref(false)
  const currentFilePath = ref('')
  const isModified = ref(false)

  // 存储监听器引用，用于精确清理
  const listeners = ref({
    openFile: null,
    saveFile: null,
    fileUpdate: null
  })

  // 监听菜单事件
  const setupMenuListeners = (callbacks) => {
    if (!isElectron.value || !window.electronAPI) {
      return
    }

    const { onOpenFile, onSaveFile } = callbacks

    if (onOpenFile) {
      listeners.value.openFile = onOpenFile
      window.electronAPI.onMenuOpenFile(onOpenFile)
    }

    if (onSaveFile) {
      listeners.value.saveFile = onSaveFile
      window.electronAPI.onMenuSaveFile(onSaveFile)
    }
  }

  // 设置文件内容更新监听器
  const setupFileUpdateListener = (callback) => {
    if (!isElectron.value || !window.electronAPI) {
      return
    }

    if (!window.electronAPI.onFileContentUpdated) {
      console.error('onFileContentUpdated 方法不可用')
      return
    }

    if (callback) {
      listeners.value.fileUpdate = callback
      window.electronAPI.onFileContentUpdated(callback)
    }
  }

  // 清理监听器
  const cleanupMenuListeners = () => {
    if (isElectron.value && window.electronAPI) {
      // 移除所有已注册的监听器
      window.electronAPI.removeAllListeners('menu-open-file')
      window.electronAPI.removeAllListeners('menu-save-file')
      window.electronAPI.removeAllListeners('file-content-updated')
      // 清空引用
      listeners.value = { openFile: null, saveFile: null, fileUpdate: null }
    }
  }

  // 检查是否在Electron环境中
  const checkElectron = () => {
    isElectron.value = window.electronAPI !== undefined
    return isElectron.value
  }

  // 打开文件
  const openFile = async (filePath, content) => {
    if (isElectron.value && window.electronAPI) {
      currentFilePath.value = filePath
      isModified.value = false
      return { filePath, content }
    }
    return null
  }

  // 保存文件
  const saveFile = async (content, filePath = null) => {
    if (isElectron.value && window.electronAPI) {
      try {
        const result = await window.electronAPI.saveFile(content, filePath || currentFilePath.value)

        if (result.success) {
          currentFilePath.value = result.filePath
          isModified.value = false
          return { success: true, filePath: result.filePath }
        } else {
          return { success: false, message: result.message }
        }
      } catch (error) {
        console.error('保存文件时发生错误:', error)
        return { success: false, message: error.message }
      }
    }
    return { success: false, message: '不在Electron环境中' }
  }


  onMounted(() => {
    checkElectron()
  })

  onUnmounted(() => {
    cleanupMenuListeners()
  })

  return {
    // 状态
    isElectron,
    currentFilePath,
    isModified,

    // 方法
    setupMenuListeners,
    setupFileUpdateListener,
    openFile,
    saveFile,
  }
}
