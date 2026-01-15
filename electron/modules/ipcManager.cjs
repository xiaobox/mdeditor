const { ipcMain, dialog, app } = require('electron');
const path = require('path');

class IpcManager {
  constructor(mainWindow, fileWatcher) {
    this.mainWindow = mainWindow;
    this.fileWatcher = fileWatcher;
    this.setupIpcHandlers();
  }

  // 验证文件路径安全性，防止路径遍历攻击
  isPathSafe(filePath) {
    if (!filePath || typeof filePath !== 'string') {
      return false;
    }

    // 规范化路径
    const normalizedPath = path.normalize(filePath);

    // 检查是否包含路径遍历字符
    if (normalizedPath.includes('..')) {
      return false;
    }

    // 获取允许的目录列表
    const allowedDirs = [
      app.getPath('documents'),
      app.getPath('desktop'),
      app.getPath('downloads'),
      app.getPath('home')
    ];

    // 检查路径是否在允许的目录内
    const isInAllowedDir = allowedDirs.some(dir => {
      const resolvedPath = path.resolve(normalizedPath);
      const resolvedDir = path.resolve(dir);
      return resolvedPath.startsWith(resolvedDir + path.sep) || resolvedPath === resolvedDir;
    });

    // 检查文件扩展名是否为允许的类型
    const allowedExtensions = ['.md', '.txt', '.markdown'];
    const ext = path.extname(normalizedPath).toLowerCase();
    const hasValidExtension = allowedExtensions.includes(ext);

    return isInAllowedDir && hasValidExtension;
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

        // 验证路径安全性
        if (!this.isPathSafe(filePath)) {
          return { success: false, message: '不安全的文件路径' };
        }

        const fs = require('fs').promises;
        await fs.writeFile(filePath, content, 'utf8');
        
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
