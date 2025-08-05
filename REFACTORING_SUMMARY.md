# useAppState 重构总结

## 🎯 重构目标

将原本的"大杂烩" `useAppState.js` 按功能域拆分成更小的、更专注的 composables，实现高内聚、低耦合的模块化架构。

## 📋 重构前的问题

- **职责过多**: 一个文件管理了内容、UI、通知、复制等多个不同范畴的状态
- **难以维护**: 随着功能增加，文件会变得越来越庞大和复杂
- **测试困难**: 无法独立测试各个功能模块
- **复用性差**: 其他组件无法单独使用某个特定功能

## 🔧 重构方案

### 1. 功能域拆分

将原有的 `useAppState` 按功能域拆分为 4 个专门的 composables：

#### `useContentState.js` - 内容状态管理
- **职责**: 管理 Markdown 和 HTML 内容
- **状态**: `markdownContent`, `htmlContent`
- **计算属性**: `hasContent`, `isHtmlReady`, `characterCount`
- **方法**: `updateMarkdownContent`, `updateHtmlContent`, `clearContent`, `loadSample`

#### `useUIState.js` - UI状态管理
- **职责**: 管理界面元素的显示和隐藏
- **状态**: `showSettingsPanel`, `showMarkdownGuide`
- **方法**: `toggleSettingsPanel`, `closeSettingsPanel`, `showGuide`, `closeGuide`

#### `useNotification.js` - 通知系统
- **职责**: 管理通知的创建、显示和移除
- **状态**: `notifications`
- **方法**: `showNotification`, `removeNotification`, `showSuccess`, `showError`, `showWarning`, `showInfo`

#### `useClipboard.js` - 剪贴板功能
- **职责**: 管理复制格式选择和执行
- **状态**: `copyFormatOptions`, `selectedCopyFormat`
- **方法**: `handleCopyFormatSelect`, `getCurrentEffectiveTheme`

### 2. 组合器模式

重构后的 `useAppState.js` 作为组合器，整合所有功能域的 composables：

```javascript
export function useAppState() {
  // 初始化各个功能域的 composables
  const notification = useNotification()
  const contentState = useContentState({ onNotify: notification.showNotification })
  const uiState = useUIState()
  const clipboard = useClipboard({
    onNotify: notification.showNotification,
    getContent: () => contentState.markdownContent.value
  })

  // 返回组合后的接口，保持完全兼容性
  return {
    // 内容状态
    markdownContent: contentState.markdownContent,
    // ... 其他属性
  }
}
```

## ✅ 重构优势

### 1. 高内聚，低耦合
- 每个 composable 只负责一个特定的功能域
- composables 之间通过回调函数进行松耦合通信

### 2. 更易于测试
- 每个 composable 可以独立进行单元测试
- 测试覆盖率更高，测试更精确

### 3. 更好的复用性
- 其他组件可以单独引入需要的 composable
- 支持自定义组合，创建轻量级的功能集合

### 4. 向后兼容
- 保持了原有 `useAppState` 的完整接口
- 现有代码无需修改即可使用

### 5. 更清晰的依赖关系
- 通过参数传递明确了 composables 之间的依赖
- 便于理解和维护代码

## 📁 文件结构

```
src/composables/
├── useAppState.js          # 组合器，整合所有功能
├── useContentState.js      # 内容状态管理
├── useUIState.js          # UI状态管理
├── useNotification.js     # 通知系统
├── useClipboard.js        # 剪贴板功能
├── index.js               # 统一导出
└── __tests__/
    └── composables-integration.test.js  # 集成测试
```

## 🚀 使用示例

### 独立使用
```javascript
// 只需要通知功能
import { useNotification } from '@/composables/useNotification.js'
const notification = useNotification()
notification.showSuccess('操作成功！')

// 只需要内容管理
import { useContentState } from '@/composables/useContentState.js'
const content = useContentState()
content.updateMarkdownContent('# 新内容')
```

### 自定义组合
```javascript
// 创建轻量级编辑器
function useLightEditor() {
  const notification = useNotification()
  const content = useContentState({ onNotify: notification.showNotification })
  
  return { ...content, ...notification }
}
```

### 完整功能
```javascript
// 使用完整的应用状态（向后兼容）
import { useAppState } from '@/composables/useAppState.js'
const appState = useAppState()
// 所有原有功能都可用
```

## 🧪 测试验证

- ✅ 应用正常启动运行
- ✅ 所有原有功能正常工作
- ✅ 各个 composable 可以独立使用
- ✅ 接口完全向后兼容
- ✅ 无 TypeScript/ESLint 错误

## 📈 未来扩展

这种模块化架构为未来的功能扩展提供了良好的基础：

1. **新功能添加**: 可以创建新的专门 composable
2. **功能组合**: 可以灵活组合不同的 composables
3. **性能优化**: 可以按需加载特定功能
4. **代码分割**: 支持更细粒度的代码分割

## 🎉 总结

通过这次重构，我们成功地将一个庞大的"大杂烩"文件拆分成了多个职责单一、高度内聚的模块。这不仅提高了代码的可维护性和可测试性，还为未来的功能扩展奠定了良好的基础。同时，通过组合器模式保持了完全的向后兼容性，确保了重构的平滑过渡。
