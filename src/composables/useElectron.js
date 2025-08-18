import { ref, onMounted, onUnmounted } from 'vue'

export function useElectron() {
  const isElectron = ref(false)
  const currentFilePath = ref('')
  const isModified = ref(false)

  // 监听菜单事件
  const setupMenuListeners = (callbacks) => {
    console.log('🎧 开始设置菜单监听器...');
    console.log('🔍 检查Electron环境:', isElectron.value);
    console.log('🔌 检查electronAPI:', !!window.electronAPI);
    
    if (!isElectron.value || !window.electronAPI) {
      console.log('❌ 无法设置菜单监听器：不在Electron环境中或electronAPI不可用');
      return
    }
    
    const { onOpenFile, onSaveFile } = callbacks
    console.log('📋 可用的回调函数:', { onOpenFile: !!onOpenFile, onSaveFile: !!onSaveFile });
    
    if (onOpenFile) {
      console.log('📁 设置打开文件监听器...');
      window.electronAPI.onMenuOpenFile(onOpenFile)
      console.log('✅ 打开文件监听器设置成功');
    }
    
    if (onSaveFile) {
      console.log('💾 设置保存文件监听器...');
      window.electronAPI.onMenuSaveFile(onSaveFile)
      console.log('✅ 保存文件监听器设置成功');
    }
    
    console.log('🎉 菜单监听器设置完成');
  }
  
  // 清理监听器
  const cleanupMenuListeners = () => {
    if (isElectron.value && window.electronAPI) {
      window.electronAPI.removeAllListeners('menu-open-file')
      window.electronAPI.removeAllListeners('menu-save-file')
    }
  }

  // 检查是否在Electron环境中
  const checkElectron = () => {
    console.log('🔍 检查Electron环境...');
    console.log('🌐 window.electronAPI:', window.electronAPI);
    console.log('🔧 window.electronAPI类型:', typeof window.electronAPI);
    
    isElectron.value = window.electronAPI !== undefined
    
    if (isElectron.value) {
      console.log('🔌 可用的API方法:', Object.keys(window.electronAPI));
    } else {
      console.log('🌍 检测到Web环境');
    }
    
    return isElectron.value
  }
  

  
  // 打开文件
  const openFile = async (filePath, content) => {
    if (isElectron.value && window.electronAPI) {
      console.log('📁 设置当前文件路径:', filePath);
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
        console.log('💾 开始保存文件...');
        console.log('📁 当前文件路径:', currentFilePath.value);
        console.log('📝 内容长度:', content.length);
        
        const result = await window.electronAPI.saveFile(content, filePath || currentFilePath.value)
        console.log('📋 保存结果:', result);
        
        if (result.success) {
          currentFilePath.value = result.filePath
          isModified.value = false
          console.log('✅ 文件保存成功，更新当前路径:', result.filePath);
          return { success: true, filePath: result.filePath }
        } else {
          console.log('❌ 文件保存失败:', result.message);
          return { success: false, message: result.message }
        }
      } catch (error) {
        console.error('💥 保存文件时发生错误:', error);
        return { success: false, message: error.message }
      }
    }
    console.log('❌ 不在Electron环境中，无法保存文件');
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
    openFile,
    saveFile,
  }
}
