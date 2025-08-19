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
    console.log(`🔍 开始设置文件监视器: ${filePath}`);
    
    // 如果已经有监视器，先移除
    if (this.fileWatchers.has(filePath)) {
      console.log(`🔄 移除现有监视器: ${filePath}`);
      this.fileWatchers.get(filePath).close();
      this.fileWatchers.delete(filePath);
    }
    
    try {
      // 创建新的文件监视器
      const watcher = fs.watch(filePath, { persistent: true }, (eventType, filename) => {
        console.log(`📝 文件变化事件: ${eventType}, 文件名: ${filename}`);
        
        if (eventType === 'change' && filename) {
          console.log(`📝 文件 ${filePath} 发生变化`);
          
          // 读取文件新内容
          try {
            const newContent = fs.readFileSync(filePath, 'utf8');
            console.log(`🔄 读取到新内容，长度: ${newContent.length}`);
            
            // 检查内容是否真的发生了变化（避免本地保存触发更新）
            if (this.lastKnownContent.has(filePath) && this.lastKnownContent.get(filePath) === newContent) {
              console.log('ℹ️ 内容相同，可能是本地保存，跳过更新');
              return;
            }
            
            console.log('🔄 内容确实发生变化，发送更新事件');
            
            // 发送新内容到渲染进程
            mainWindow.webContents.send('file-content-updated', { 
              filePath, 
              content: newContent 
            });
            
            // 更新最后已知的内容
            this.lastKnownContent.set(filePath, newContent);
            
            console.log(`✅ 文件内容已发送到渲染进程`);
          } catch (error) {
            console.error('❌ 读取更新后的文件失败:', error);
          }
        }
      });
      
      this.fileWatchers.set(filePath, watcher);
      console.log(`👀 成功设置文件监视器: ${filePath}`);
      
      // 初始化最后已知内容
      try {
        const initialContent = fs.readFileSync(filePath, 'utf8');
        this.lastKnownContent.set(filePath, initialContent);
        console.log(`📝 初始化文件内容记录，长度: ${initialContent.length}`);
      } catch (error) {
        console.error('❌ 初始化文件内容记录失败:', error);
      }
      
      // 测试文件监视器是否工作
      console.log(`📊 文件监视器状态: ${watcher.listenerCount('change')} 个监听器`);
    } catch (error) {
      console.error('❌ 设置文件监视器失败:', error);
    }
  }

  // 清理文件监视器
  cleanupFileWatchers() {
    this.fileWatchers.forEach((watcher, filePath) => {
      watcher.close();
      console.log(`👋 停止监视文件: ${filePath}`);
    });
    this.fileWatchers.clear();
    
    // 清理内容记录
    this.lastKnownContent.clear();
    console.log('🧹 已清理文件内容记录');
  }

  // 更新文件内容记录（用于保存文件后）
  updateContentRecord(filePath, content) {
    this.lastKnownContent.set(filePath, content);
    console.log(`💾 更新文件内容记录: ${filePath}`);
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
      console.log(`👋 移除文件监视器: ${filePath}`);
      return true;
    }
    return false;
  }
}

module.exports = FileWatcher;
