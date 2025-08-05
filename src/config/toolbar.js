/**
 * @file src/config/toolbar.js
 * @description 工具栏配置文件
 * 
 * 定义了 Markdown 编辑器工具栏的所有按钮配置，包括图标、标题、操作等。
 * 这种数据驱动的方式使得添加、删除或重排按钮变得非常简单。
 */

/**
 * 创建工具栏配置
 * @param {Object} editorOperations - 编辑器操作方法对象
 * @returns {Array} 工具栏配置数组
 */
export function createToolbarConfig(editorOperations) {
  return [
    // 标题组
    {
      type: 'group',
      items: [
        {
          id: 'h1',
          title: '一级标题',
          icon: 'M3 4v6h4V6h4v12h-4v4h12v-4h-4V6h4v4h4V4H3z',
          width: 18,
          height: 18,
          action: () => editorOperations.heading(1)
        },
        {
          id: 'h2',
          title: '二级标题',
          icon: 'M5 4v3h5v12h3V7h5V4H5z',
          width: 16,
          height: 16,
          action: () => editorOperations.heading(2)
        },
        {
          id: 'h3',
          title: '三级标题',
          icon: 'M5 4v3h5v12h3V7h5V4H5z',
          width: 14,
          height: 14,
          action: () => editorOperations.heading(3)
        }
      ]
    },
    
    // 分割线
    { type: 'divider' },
    
    // 文本格式组
    {
      type: 'group',
      items: [
        {
          id: 'bold',
          title: '粗体 (Ctrl+B)',
          icon: 'M13.5,15.5H10V12.5H13.5A1.5,1.5 0 0,1 15,14A1.5,1.5 0 0,1 13.5,15.5M10,6.5H13A1.5,1.5 0 0,1 14.5,8A1.5,1.5 0 0,1 13,9.5H10M15.6,10.79C16.57,10.11 17.25,9 17.25,8C17.25,5.74 15.5,4 13.25,4H7V18H14.04C16.14,18 17.75,16.3 17.75,14.21C17.75,12.69 16.89,11.39 15.6,10.79Z',
          action: () => editorOperations.bold()
        },
        {
          id: 'italic',
          title: '斜体 (Ctrl+I)',
          icon: 'M10,4V7H12.21L8.79,15H6V18H14V15H11.79L15.21,7H18V4H10Z',
          action: () => editorOperations.italic()
        },
        {
          id: 'strikethrough',
          title: '删除线',
          icon: 'M23,12V14H18.61C19.61,16.14 19.56,22 12.38,22C4.05,22.05 4.37,15.5 4.37,15.5L8.34,15.55C8.34,15.55 8.14,18.82 11.5,18.82C14.86,18.82 15.12,16.5 14.5,14H1V12H23M3.41,10H20.59C20.59,10 20.75,5.23 15.19,5.23C12.82,5.23 10.73,6.41 10.73,8.55C10.73,10.68 12.91,10 12.91,10H3.41Z',
          action: () => editorOperations.strikethrough()
        }
      ]
    },
    
    // 分割线
    { type: 'divider' },
    
    // 链接和图片组
    {
      type: 'group',
      items: [
        {
          id: 'link',
          title: '插入链接 (Ctrl+K)',
          icon: 'M10.59,13.41C11,13.8 11,14.44 10.59,14.83C10.2,15.22 9.56,15.22 9.17,14.83C7.22,12.88 7.22,9.71 9.17,7.76V7.76L12.71,4.22C14.66,2.27 17.83,2.27 19.78,4.22C21.73,6.17 21.73,9.34 19.78,11.29L18.29,12.78C18.3,11.96 18.17,11.14 17.89,10.36L18.36,9.88C19.54,8.71 19.54,6.81 18.36,5.64C17.19,4.46 15.29,4.46 14.12,5.64L10.59,9.17C9.41,10.34 9.41,12.24 10.59,13.41M13.41,9.17C13.8,8.78 14.44,8.78 14.83,9.17C16.78,11.12 16.78,14.29 14.83,16.24V16.24L11.29,19.78C9.34,21.73 6.17,21.73 4.22,19.78C2.27,17.83 2.27,14.66 4.22,12.71L5.71,11.22C5.7,12.04 5.83,12.86 6.11,13.65L5.64,14.12C4.46,15.29 4.46,17.19 5.64,18.36C6.81,19.54 8.71,19.54 9.88,18.36L13.41,14.83C14.59,13.66 14.59,11.76 13.41,10.59C13,10.2 13,9.56 13.41,9.17Z',
          action: () => editorOperations.link()
        },
        {
          id: 'image',
          title: '插入图片',
          icon: 'M21,17H7V3H21M21,1H7A2,2 0 0,0 5,3V17A2,2 0 0,0 7,19H21A2,2 0 0,0 23,17V3A2,2 0 0,0 21,1M3,5H1V21A2,2 0 0,0 3,23H19V21H3M15.96,10.29L13.21,13.83L11.25,11.47L8.5,15H19.5L15.96,10.29Z',
          action: () => editorOperations.image()
        }
      ]
    },
    
    // 分割线
    { type: 'divider' },
    
    // 代码组
    {
      type: 'group',
      items: [
        {
          id: 'code',
          title: '行内代码',
          icon: 'M9.4,16.6L4.8,12L9.4,7.4L8,6L2,12L8,18L9.4,16.6M14.6,16.6L19.2,12L14.6,7.4L16,6L22,12L16,18L14.6,16.6Z',
          action: () => editorOperations.code()
        },
        {
          id: 'codeBlock',
          title: '代码块',
          icon: 'M8,3A2,2 0 0,0 6,5V9A2,2 0 0,1 4,11H3V13H4A2,2 0 0,1 6,15V19A2,2 0 0,0 8,21H10V19H8V14A2,2 0 0,0 6,12A2,2 0 0,0 8,10V5H10V3M16,3A2,2 0 0,1 18,5V9A2,2 0 0,0 20,11H21V13H20A2,2 0 0,0 18,15V19A2,2 0 0,1 16,21H14V19H16V14A2,2 0 0,1 18,12A2,2 0 0,1 16,10V5H14V3H16Z',
          action: () => editorOperations.codeBlock()
        }
      ]
    },
    
    // 分割线
    { type: 'divider' },
    
    // 列表和引用组
    {
      type: 'group',
      items: [
        {
          id: 'quote',
          title: '引用',
          icon: 'M14,17H17L19,13V7H13V13H16M6,17H9L11,13V7H5V13H8L6,17Z',
          action: () => editorOperations.quote()
        },
        {
          id: 'list',
          title: '无序列表',
          icon: 'M7,5H21V7H7V5M7,13V11H21V13H7M4,4.5A1.5,1.5 0 0,1 5.5,6A1.5,1.5 0 0,1 4,7.5A1.5,1.5 0 0,1 2.5,6A1.5,1.5 0 0,1 4,4.5M4,10.5A1.5,1.5 0 0,1 5.5,12A1.5,1.5 0 0,1 4,13.5A1.5,1.5 0 0,1 2.5,12A1.5,1.5 0 0,1 4,10.5M7,19V17H21V19H7M4,16.5A1.5,1.5 0 0,1 5.5,18A1.5,1.5 0 0,1 4,19.5A1.5,1.5 0 0,1 2.5,18A1.5,1.5 0 0,1 4,16.5Z',
          action: () => editorOperations.list()
        },
        {
          id: 'orderedList',
          title: '有序列表',
          icon: 'M7,13V11H21V13H7M7,19V17H21V19H7M7,7V5H21V7H7M3,8V5H2V4H4V8H3M2,17V16H5V20H2V19H4V18.5H3V17.5H4V17H2M4.25,10A0.75,0.75 0 0,1 5,10.75C5,10.95 4.92,11.14 4.79,11.27L3.12,13H5V14H2V13.08L4,11H2V10H4.25Z',
          action: () => editorOperations.orderedList()
        },
        {
          id: 'table',
          title: '插入表格',
          icon: 'M5,4H19A2,2 0 0,1 21,6V18A2,2 0 0,1 19,20H5A2,2 0 0,1 3,18V6A2,2 0 0,1 5,4M5,8V12H11V8H5M13,8V12H19V8H13M5,14V18H11V14H5M13,14V18H19V14H13Z',
          action: () => editorOperations.table()
        }
      ]
    },
    
    // 分割线按钮（单独的）
    {
      id: 'horizontalRule',
      title: '分割线',
      icon: 'M19,13H5V11H19V13Z',
      action: () => editorOperations.horizontalRule()
    }

    // 演示：如何轻松添加新按钮
    // 取消注释下面的代码即可添加撤销按钮
    /*
    // 分割线
    { type: 'divider' },

    // 编辑操作组
    {
      type: 'group',
      items: [
        {
          id: 'undo',
          title: '撤销 (Ctrl+Z)',
          icon: 'M12.5,8C9.85,8 7.45,9 5.6,10.6L2,7V16H11L7.38,12.38C8.77,11.22 10.54,10.5 12.5,10.5C16.04,10.5 19.05,12.81 20.1,16L22.47,15.22C21.08,11.03 17.15,8 12.5,8Z',
          action: () => editorOperations.undo && editorOperations.undo()
        },
        {
          id: 'redo',
          title: '重做 (Ctrl+Y)',
          icon: 'M18.4,10.6C16.55,9 14.15,8 11.5,8C6.85,8 2.92,11.03 1.53,15.22L3.9,16C4.95,12.81 7.96,10.5 11.5,10.5C13.46,10.5 15.23,11.22 16.62,12.38L13,16H22V7L18.4,10.6Z',
          action: () => editorOperations.redo && editorOperations.redo()
        }
      ]
    }
    */
  ]
}

/**
 * 默认工具栏配置（不依赖编辑器操作的静态配置）
 * 主要用于测试和预览
 */
export const defaultToolbarItems = [
  { id: 'h1', title: '一级标题', group: 'heading' },
  { id: 'h2', title: '二级标题', group: 'heading' },
  { id: 'h3', title: '三级标题', group: 'heading' },
  { id: 'bold', title: '粗体 (Ctrl+B)', group: 'format' },
  { id: 'italic', title: '斜体 (Ctrl+I)', group: 'format' },
  { id: 'strikethrough', title: '删除线', group: 'format' },
  { id: 'link', title: '插入链接 (Ctrl+K)', group: 'media' },
  { id: 'image', title: '插入图片', group: 'media' },
  { id: 'code', title: '行内代码', group: 'code' },
  { id: 'codeBlock', title: '代码块', group: 'code' },
  { id: 'quote', title: '引用', group: 'list' },
  { id: 'list', title: '无序列表', group: 'list' },
  { id: 'orderedList', title: '有序列表', group: 'list' },
  { id: 'table', title: '插入表格', group: 'list' },
  { id: 'horizontalRule', title: '分割线', group: 'misc' }
]
