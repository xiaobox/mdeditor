/**
 * @file src/examples/composables-usage.js
 * @description 演示重构后的 composables 独立使用方式
 * 
 * 这个文件展示了如何独立使用每个 composable，
 * 体现了重构后的高内聚、低耦合特性。
 */

// 1. 独立使用内容状态管理
import { useContentState } from '../composables/useContentState.js'

function exampleContentState() {
  console.log('📝 内容状态管理示例')
  
  const contentState = useContentState({
    onNotify: (message, type) => console.log(`通知: ${message} (${type})`)
  })

  // 独立管理内容
  contentState.updateMarkdownContent('# 新的标题\n\n这是新内容')
  console.log('字符数:', contentState.characterCount.value)
  console.log('有内容:', contentState.hasContent.value)
  
  // 清空内容
  contentState.clearContent()
  console.log('清空后字符数:', contentState.characterCount.value)
}

// 2. 独立使用UI状态管理
import { useUIState } from '../composables/useUIState.js'

function exampleUIState() {
  console.log('🎨 UI状态管理示例')
  
  const uiState = useUIState()

  // 独立管理UI状态
  console.log('设置面板显示:', uiState.showSettingsPanel.value)
  uiState.toggleSettingsPanel()
  console.log('切换后设置面板显示:', uiState.showSettingsPanel.value)
  
  uiState.showGuide()
  console.log('指南显示:', uiState.showMarkdownGuide.value)
}

// 3. 独立使用通知系统
import { useNotification } from '../composables/useNotification.js'

function exampleNotification() {
  console.log('🔔 通知系统示例')
  
  const notification = useNotification()

  // 独立管理通知
  const id1 = notification.showSuccess('操作成功！')
  const id2 = notification.showError('发生错误！')
  const id3 = notification.showWarning('警告信息')
  
  console.log('当前通知数量:', notification.notifications.value.length)
  
  // 移除特定通知
  notification.removeNotification(id1)
  console.log('移除后通知数量:', notification.notifications.value.length)
}

// 4. 独立使用剪贴板功能
import { useClipboard } from '../composables/useClipboard.js'

function exampleClipboard() {
  console.log('📋 剪贴板功能示例')
  
  const clipboard = useClipboard({
    onNotify: (message, type) => console.log(`剪贴板通知: ${message} (${type})`),
    getContent: () => '# 测试内容\n\n这是要复制的内容'
  })

  // 独立管理剪贴板功能
  console.log('可用格式:', clipboard.copyFormatOptions.value.map(opt => opt.label))
  console.log('当前选中格式:', clipboard.selectedCopyFormat.value.label)
  
  // 切换格式
  const markdownFormat = clipboard.getCopyFormatByValue('markdown')
  if (markdownFormat) {
    clipboard.setSelectedCopyFormat(markdownFormat)
    console.log('切换后格式:', clipboard.selectedCopyFormat.value.label)
  }
}

// 5. 组合使用示例 - 自定义组合
function exampleCustomComposition() {
  console.log('🔧 自定义组合示例')
  
  // 创建一个只需要内容和通知的轻量级编辑器
  const notification = useNotification()
  const contentState = useContentState({
    onNotify: notification.showNotification
  })
  
  // 自定义业务逻辑
  const saveContent = () => {
    if (contentState.hasContent.value) {
      // 模拟保存
      notification.showSuccess('内容已保存')
      return true
    } else {
      notification.showWarning('没有内容可保存')
      return false
    }
  }
  
  // 使用自定义组合
  contentState.updateMarkdownContent('# 我的文档\n\n内容...')
  saveContent()
}

// 6. 完整应用状态示例
import { useAppState } from '../composables/useAppState.js'

function exampleFullAppState() {
  console.log('🏗️ 完整应用状态示例')
  
  const appState = useAppState()
  
  // 所有功能都可用，接口保持兼容
  console.log('应用状态包含的功能:')
  console.log('- 内容管理:', !!appState.markdownContent)
  console.log('- UI状态:', !!appState.showSettingsPanel)
  console.log('- 通知系统:', !!appState.notifications)
  console.log('- 剪贴板:', !!appState.copyFormatOptions)
}

// 运行示例
export function runExamples() {
  console.log('🚀 Composables 使用示例\n')
  
  exampleContentState()
  console.log('\n' + '='.repeat(50) + '\n')
  
  exampleUIState()
  console.log('\n' + '='.repeat(50) + '\n')
  
  exampleNotification()
  console.log('\n' + '='.repeat(50) + '\n')
  
  exampleClipboard()
  console.log('\n' + '='.repeat(50) + '\n')
  
  exampleCustomComposition()
  console.log('\n' + '='.repeat(50) + '\n')
  
  exampleFullAppState()
  
  console.log('\n✅ 所有示例运行完成！')
  console.log('\n💡 重构优势:')
  console.log('1. 高内聚：每个 composable 专注单一职责')
  console.log('2. 低耦合：composables 之间相互独立')
  console.log('3. 可复用：可以在不同组件中独立使用')
  console.log('4. 易测试：每个 composable 可以独立测试')
  console.log('5. 易维护：功能边界清晰，修改影响范围小')
}

// 如果直接运行此文件
if (typeof window !== 'undefined') {
  // 在浏览器环境中，添加到全局对象以便调试
  window.composablesExamples = { runExamples }
  console.log('💡 在浏览器控制台中运行: composablesExamples.runExamples()')
}
