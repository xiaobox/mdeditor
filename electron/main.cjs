const { app } = require('electron');

// 导入模块
const FileWatcher = require('./modules/fileWatcher.cjs');
const MenuManager = require('./modules/menuManager.cjs');
const IpcManager = require('./modules/ipcManager.cjs');
const WindowManager = require('./modules/windowManager.cjs');

// 开发环境热重载
// if (process.env.NODE_ENV === 'development') {
//   require('electron-reloader')(module, {
//     debug: true,
//     watchRenderer: true
//   });
// }

// 创建模块实例
const windowManager = new WindowManager();
const fileWatcher = new FileWatcher();
let menuManager = null;
let ipcManager = null;

function createWindow() {
  // 创建主窗口
  const mainWindow = windowManager.createMainWindow();
  
  // 创建菜单管理器
  menuManager = new MenuManager(mainWindow, fileWatcher);
  menuManager.createMenu();
  
  // 创建IPC管理器
  ipcManager = new IpcManager(mainWindow, fileWatcher);
}

// 当Electron完成初始化并准备创建浏览器窗口时调用此方法
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    // 在macOS上，当点击dock图标并且没有其他窗口打开时，
    // 通常在应用程序中重新创建一个窗口。
    if (!windowManager.hasWindow()) {
      createWindow();
    }
  });
});

// 当所有窗口都被关闭时退出
app.on('window-all-closed', () => {
  // 清理文件监视器
  fileWatcher.cleanupFileWatchers();
  
  // 在 macOS 上，除非用户用 Cmd + Q 确定地退出，
  // 否则绝大部分应用及其菜单栏会保持激活。
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// 应用退出时清理资源
app.on('before-quit', () => {
  fileWatcher.cleanupFileWatchers();
});




