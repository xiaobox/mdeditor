const fs = require('fs');
const path = require('path');

class FileWatcher {
  constructor() {
    // 文件监视器
    this.fileWatchers = new Map();
    // 存储每个文件的最后已知内容，用于避免本地保存触发更新
    this.lastKnownContent = new Map();
  }

  // 设置文件监视器
  setupFileWatcher(filePath, mainWindow) {
    // 如果已经有监视器，先移除
    if (this.fileWatchers.has(filePath)) {
      this.fileWatchers.get(filePath).close();
      this.fileWatchers.delete(filePath);
    }

    try {
      // 创建新的文件监视器
      const watcher = fs.watch(filePath, { persistent: true }, (eventType, filename) => {
        if (eventType === 'change' && filename) {
          // 读取文件新内容
          try {
            const newContent = fs.readFileSync(filePath, 'utf8');

            // 检查内容是否真的发生了变化（避免本地保存触发更新）
            if (this.lastKnownContent.has(filePath) && this.lastKnownContent.get(filePath) === newContent) {
              return;
            }

            // 发送新内容到渲染进程
            mainWindow.webContents.send('file-content-updated', {
              filePath,
              content: newContent
            });

            // 更新最后已知的内容
            this.lastKnownContent.set(filePath, newContent);
          } catch (error) {
            console.error('读取更新后的文件失败:', error);
          }
        }
      });

      this.fileWatchers.set(filePath, watcher);

      // 初始化最后已知内容
      try {
        const initialContent = fs.readFileSync(filePath, 'utf8');
        this.lastKnownContent.set(filePath, initialContent);
      } catch (error) {
        console.error('初始化文件内容记录失败:', error);
      }
    } catch (error) {
      console.error('设置文件监视器失败:', error);
    }
  }

  // 清理文件监视器
  cleanupFileWatchers() {
    this.fileWatchers.forEach((watcher, filePath) => {
      watcher.close();
    });
    this.fileWatchers.clear();

    // 清理内容记录
    this.lastKnownContent.clear();
  }

  // 更新文件内容记录（用于保存文件后）
  updateContentRecord(filePath, content) {
    this.lastKnownContent.set(filePath, content);
  }

  // 检查是否正在监视某个文件
  isWatching(filePath) {
    return this.fileWatchers.has(filePath);
  }

  // 获取监视的文件列表
  getWatchedFiles() {
    return Array.from(this.fileWatchers.keys());
  }

  // 获取文件内容记录
  getContentRecord(filePath) {
    return this.lastKnownContent.get(filePath);
  }

  // 移除特定文件的监视器
  removeFileWatcher(filePath) {
    if (this.fileWatchers.has(filePath)) {
      const watcher = this.fileWatchers.get(filePath);
      watcher.close();
      this.fileWatchers.delete(filePath);
      this.lastKnownContent.delete(filePath);
      return true;
    }
    return false;
  }
}

module.exports = FileWatcher;
