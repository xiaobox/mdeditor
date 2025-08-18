const { contextBridge, ipcRenderer } = require('electron');

// 暴露受保护的API给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 文件操作
  saveFile: (content, filePath) => ipcRenderer.invoke('save-file', { content, filePath }),
  
  // 菜单事件监听
  onMenuOpenFile: (callback) => ipcRenderer.on('menu-open-file', callback),
  onMenuSaveFile: (callback) => ipcRenderer.on('menu-save-file', callback),
  
  // 移除监听器
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});

// 安全地暴露一些Node.js API（如果需要的话）
contextBridge.exposeInMainWorld('nodeAPI', {
  // 这里可以添加其他需要的Node.js API
  // 但要注意安全性
});
