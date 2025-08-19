const { Menu, dialog, shell } = require('electron');
const fs = require('fs');

class MenuManager {
  constructor(mainWindow, fileWatcher) {
    this.mainWindow = mainWindow;
    this.fileWatcher = fileWatcher;
  }

  // 创建应用菜单
  createMenu() {
    const template = [
      {
        label: '文件',
        submenu: [
          {
            label: '打开',
            accelerator: 'CmdOrCtrl+O',
            click: async () => {
              console.log('📂 用户点击了"打开文件"菜单');
              const result = await dialog.showOpenDialog(this.mainWindow, {
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
                  this.mainWindow.webContents.send('menu-open-file', { filePath, content });
                  console.log('✅ 文件内容已发送到渲染进程');
                  
                  // 直接设置文件监视器
                  this.fileWatcher.setupFileWatcher(filePath, this.mainWindow);
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
              this.mainWindow.webContents.send('menu-save-file');
            }
          },
          
          { type: 'separator' },
          {
            label: '退出',
            accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
            click: () => {
              require('electron').app.quit();
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
              dialog.showMessageBox(this.mainWindow, {
                type: 'info',
                title: '关于',
                message: '社交平台Markdown编辑器',
                detail: '版本 1.0.0\n一个功能强大的Markdown编辑器'
              });
            }
          },{
            label: 'github',
            click: () => {
              dialog.showMessageBox(this.mainWindow, {
                type: 'info',
                title: 'github',
                message: 'https://github.com/xiaobox/mdeditor'
              });
            }
          }
        ]
      }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  }
}

module.exports = MenuManager;
