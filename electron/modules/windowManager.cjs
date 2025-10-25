const { BrowserWindow, shell } = require('electron');
const path = require('path');

class WindowManager {
  constructor() {
    this.mainWindow = null;
  }

  // 创建主窗口
  createMainWindow() {
    this.mainWindow = new BrowserWindow({
      width: 1240,
      height: 800,
      minWidth: 800,
      minHeight: 600,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        enableRemoteModule: false,
        preload: path.join(__dirname, '../preload.cjs')
      },
      titleBarStyle: 'default',
      show: false
    });

    this.setupWindowEvents();
    this.loadContent();
    
    return this.mainWindow;
  }

  // 设置窗口事件
  setupWindowEvents() {
    // 当窗口准备好显示时显示
    this.mainWindow.once('ready-to-show', () => {
      console.log('🪟 窗口准备显示');
      this.mainWindow.show();
    });

    // 页面加载完成事件
    this.mainWindow.webContents.on('did-finish-load', () => {
      console.log('✅ 页面加载完成');
    });

    // 页面加载失败事件
    this.mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
      console.error('❌ 页面加载失败:', errorCode, errorDescription, validatedURL);
    });

    // 页面标题变化事件
    this.mainWindow.webContents.on('page-title-updated', (event, title) => {
      console.log('📝 页面标题:', title);
    });

    // 当窗口被关闭时发出
    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });

    // 处理外部链接
    this.mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      shell.openExternal(url);
      return { action: 'deny' };
    });
  }

  // 加载内容
  loadContent() {
    if (process.env.NODE_ENV === 'development') {
      // 开发环境：加载Vite开发服务器
      console.log('🔄 开发模式：尝试加载 http://localhost:3000');
      this.mainWindow.loadURL('http://localhost:3000').then(() => {
        console.log('✅ 成功加载开发服务器');
      }).catch((error) => {
        console.error('❌ 加载开发服务器失败:', error);
        // 尝试备用端口
        this.mainWindow.loadURL('http://localhost:3001').catch((err) => {
          console.error('❌ 备用端口也失败:', err);
        });
      });
      // 打开开发者工具（可选，通过环境变量控制）
      const openDevtoolsEnv = (process.env.ELECTRON_OPEN_DEVTOOLS || '').toLowerCase();
      const shouldOpenDevTools = openDevtoolsEnv === '1' || openDevtoolsEnv === 'true' || openDevtoolsEnv === 'yes';
      if (shouldOpenDevTools) {
        this.mainWindow.webContents.openDevTools({ mode: 'detach' });
      }

      if (!shouldOpenDevTools) {
        console.log('ℹ️ 开发者工具未自动打开。设置 ELECTRON_OPEN_DEVTOOLS=1 可在启动时打开。');
      }
    } else {
      // 生产环境：加载打包后的文件
      console.log('🔄 生产模式：加载本地文件');
      this.mainWindow.loadFile(path.join(__dirname, '../../dist/index.html')).catch((error) => {
        console.error('❌ 加载本地文件失败:', error);
      });
    }
  }

  // 获取主窗口
  getMainWindow() {
    return this.mainWindow;
  }

  // 检查窗口是否存在
  hasWindow() {
    return this.mainWindow !== null;
  }
}

module.exports = WindowManager;
