const { app, BrowserWindow, Menu, shell, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

// 保持对窗口对象的全局引用，避免垃圾回收的时候，窗口会被自动地关闭
let mainWindow;

function createWindow() {
  // 创建浏览器窗口
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.cjs')
    },
    // icon: path.join(__dirname, '../public/icon.png'), // 如果有图标的话
    titleBarStyle: 'default',
    show: false
  });

  // 当窗口准备好显示时显示
  mainWindow.once('ready-to-show', () => {
    console.log('🪟 窗口准备显示');
    mainWindow.show();
  });

  // 页面加载完成事件
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('✅ 页面加载完成');
  });

  // 页面加载失败事件
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('❌ 页面加载失败:', errorCode, errorDescription, validatedURL);
  });

  // 页面标题变化事件
  mainWindow.webContents.on('page-title-updated', (event, title) => {
    console.log('📝 页面标题:', title);
  });

  // 加载应用的 index.html
  if (process.env.NODE_ENV === 'development') {
    // 开发环境：加载Vite开发服务器
    console.log('🔄 开发模式：尝试加载 http://localhost:3000');
    mainWindow.loadURL('http://localhost:3000').then(() => {
      console.log('✅ 成功加载开发服务器');
    }).catch((error) => {
      console.error('❌ 加载开发服务器失败:', error);
      // 尝试备用端口
      mainWindow.loadURL('http://localhost:3001').catch((err) => {
        console.error('❌ 备用端口也失败:', err);
      });
    });
    // 打开开发工具
    mainWindow.webContents.openDevTools();
  } else {
    // 生产环境：加载打包后的文件
    console.log('🔄 生产模式：加载本地文件');
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html')).catch((error) => {
      console.error('❌ 加载本地文件失败:', error);
    });
  }

  // 当窗口被关闭时发出
  mainWindow.on('closed', () => {
    // 取消引用 window 对象，如果你的应用支持多窗口的话，
    // 通常会把多个 window 对象存放在一个数组里面，
    // 与此同时，你应该删除相应的元素。
    mainWindow = null;
  });

  // 处理外部链接
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

// 当Electron完成初始化并准备创建浏览器窗口时调用此方法
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    // 在macOS上，当点击dock图标并且没有其他窗口打开时，
    // 通常在应用程序中重新创建一个窗口。
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// 当所有窗口都被关闭时退出
app.on('window-all-closed', () => {
  // 在 macOS 上，除非用户用 Cmd + Q 确定地退出，
  // 否则绝大部分应用及其菜单栏会保持激活。
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// 创建应用菜单
function createMenu() {
  const template = [
    {
      label: '文件',
      submenu: [

        {
          label: '打开',
          accelerator: 'CmdOrCtrl+O',
          click: async () => {
            console.log('📂 用户点击了"打开文件"菜单');
            const result = await dialog.showOpenDialog(mainWindow, {
              properties: ['openFile'],
              filters: [
                { name: 'Markdown文件', extensions: ['md', 'markdown'] },
                { name: '文本文件', extensions: ['txt'] },
                { name: '所有文件', extensions: ['*'] }
              ]
            });
            
            console.log('📋 文件选择对话框结果:', result);
            
            if (!result.canceled && result.filePaths.length > 0) {
              const filePath = result.filePaths[0];
              console.log('📁 选择的文件路径:', filePath);
              try {
                const content = fs.readFileSync(filePath, 'utf8');
                console.log('📤 发送文件内容到渲染进程...');
                mainWindow.webContents.send('menu-open-file', { filePath, content });
                console.log('✅ 文件内容已发送到渲染进程');
              } catch (error) {
                console.error('❌ 读取文件失败:', error);
                dialog.showErrorBox('错误', `无法读取文件: ${error.message}`);
              }
            } else {
              console.log('🚫 用户取消了文件选择');
            }
          }
        },
        {
          label: '保存',
          accelerator: 'CmdOrCtrl+S',
          click: async () => {
            mainWindow.webContents.send('menu-save-file');
          }
        },

        { type: 'separator' },
        {
          label: '退出',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: '编辑',
      submenu: [
        { role: 'undo', label: '撤销' },
        { role: 'redo', label: '重做' },
        { type: 'separator' },
        { role: 'cut', label: '剪切' },
        { role: 'copy', label: '复制' },
        { role: 'paste', label: '粘贴' },
        { role: 'selectall', label: '全选' }
      ]
    },
    {
      label: '视图',
      submenu: [
        { role: 'reload', label: '重新加载' },
        { role: 'forceReload', label: '强制重新加载' },
        { role: 'toggleDevTools', label: '切换开发者工具' },
        { type: 'separator' },
        { role: 'resetZoom', label: '实际大小' },
        { role: 'zoomIn', label: '放大' },
        { role: 'zoomOut', label: '缩小' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: '切换全屏' }
      ]
    },
    {
      label: '帮助',
      submenu: [
        {
          label: '关于',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: '关于',
              message: '社交平台Markdown编辑器',
              detail: '版本 1.0.0\n一个功能强大的Markdown编辑器'
            });
          }
        },{
            label: 'github',
            click: () => {
                dialog.showMessageBox(mainWindow, {
                    type: 'info',
                    title: 'github',
                    message: 'https://github.com/xiaobox/mdeditor'
                })
            }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// 当应用准备就绪时创建菜单
app.whenReady().then(createMenu);

// IPC通信处理
ipcMain.handle('save-file', async (event, { content, filePath }) => {
  try {
    if (!filePath) {
      const result = await dialog.showSaveDialog(mainWindow, {
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
    
    fs.writeFileSync(filePath, content, 'utf8');
    return { success: true, filePath };
  } catch (error) {
    return { success: false, message: error.message };
  }
});


