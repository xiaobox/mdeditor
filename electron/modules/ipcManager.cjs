const { ipcMain, dialog } = require('electron');

class IpcManager {
  constructor(mainWindow, fileWatcher) {
    this.mainWindow = mainWindow;
    this.fileWatcher = fileWatcher;
    this.setupIpcHandlers();
  }

  // 设置 IPC 处理器
  setupIpcHandlers() {
    // 保存文件
    ipcMain.handle('save-file', async (event, { content, filePath }) => {
      try {
        if (!filePath) {
          const result = await dialog.showSaveDialog(this.mainWindow, {
            filters: [
              { name: 'Markdown文件', extensions: ['md'] },
              { name: '文本文件', extensions: ['txt'] }
            ]
          });
          
          if (result.canceled) {
            return { success: false, message: '用户取消了保存' };
          }
          
          filePath = result.filePath;
        }
        
        const fs = require('fs');
        fs.writeFileSync(filePath, content, 'utf8');
        
        // 更新最后已知内容，避免保存后触发文件更新事件
        this.fileWatcher.updateContentRecord(filePath, content);
        
        return { success: true, filePath };
      } catch (error) {
        return { success: false, message: error.message };
      }
    });

    // 设置文件监视器
    ipcMain.handle('setup-file-watcher', async (event, { filePath }) => {
      try {
        this.fileWatcher.setupFileWatcher(filePath, this.mainWindow);
        return { success: true, message: '文件监视器设置成功' };
      } catch (error) {
        return { success: false, message: error.message };
      }
    });
  }
}

module.exports = IpcManager;
