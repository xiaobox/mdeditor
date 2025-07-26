# Composables 重构迁移指南

## 📋 重构概述

本次重构优化了 Composables 的结构，提供了更清晰的 API 和更好的开发体验。

## 🎯 主要改进

### 1. **统一入口文件**
- ✅ 重新创建了 `src/composables/index.js` 作为统一入口
- ✅ 提供清晰的导入路径和使用建议
- ✅ 支持按需导入和批量导入

### 2. **简化包装器**
- ✅ 简化了 `useTheme.js`、`useCodeStyle.js`、`useLayout.js`
- ✅ 添加了 `@deprecated` 标记，推荐使用统一管理器
- ✅ 保持向后兼容性

### 3. **增强编辑器集成**
- ✅ `useMarkdownEditor` 集成了主题系统
- ✅ 支持 `theme: 'auto'` 自动跟随全局主题
- ✅ 提供主题管理器访问

### 4. **优化配置结构**
- ✅ 简化了 `src/config/themes/index.js`
- ✅ 减少重复导出
- ✅ 提供清晰的默认导出

## 🚀 推荐使用方式

### 新代码（推荐）

```javascript
// 使用统一主题管理器
import { useGlobalThemeManager } from '@/composables'

const themeManager = useGlobalThemeManager()

// 访问所有主题功能
const {
  currentColorTheme,
  currentCodeStyle,
  currentThemeSystem,
  setColorTheme,
  setCodeStyle,
  setThemeSystem
} = themeManager
```

### 现有代码（继续支持）

```javascript
// 继续使用包装器（向后兼容）
import { useColorTheme, useCodeStyle, useLayout } from '@/composables'

const { currentColorTheme, setColorTheme } = useColorTheme()
const { currentCodeStyle, setCodeStyle } = useCodeStyle()
const { currentLayout, setLayout } = useLayout()
```

### 编辑器使用

```javascript
// 自动跟随主题
import { useMarkdownEditor } from '@/composables'

const editor = useMarkdownEditor({
  theme: 'auto', // 自动跟随全局主题
  initialValue: '',
  onContentChange: (content) => {
    // 处理内容变化
  }
})
```

## 📁 文件结构

```
src/composables/
├── index.js              # 🎯 统一入口（推荐使用）
├── useThemeManager.js     # 🎯 核心主题管理器
├── useMarkdownEditor.js   # 📝 编辑器（已集成主题）
├── useTheme.js           # 🔄 颜色主题包装器（向后兼容）
├── useCodeStyle.js       # 🔄 代码样式包装器（向后兼容）
└── useLayout.js          # 🔄 布局主题包装器（向后兼容）
```

## 🔄 迁移步骤

### 立即可做（无破坏性）

1. **更新导入路径**
   ```javascript
   // 之前
   import { useColorTheme } from './composables/useTheme.js'
   
   // 现在
   import { useColorTheme } from './composables/index.js'
   ```

2. **使用自动主题编辑器**
   ```javascript
   // 编辑器自动跟随主题
   const editor = useMarkdownEditor({ theme: 'auto' })
   ```

### 逐步迁移（推荐）

1. **新功能使用统一管理器**
   ```javascript
   import { useGlobalThemeManager } from '@/composables'
   ```

2. **现有代码保持不变**
   - 包装器继续工作
   - 无需立即修改

## ⚠️ 注意事项

1. **向后兼容性**
   - 所有现有 API 继续工作
   - 无破坏性变更

2. **性能优化**
   - 统一管理器共享状态，性能更好
   - 包装器有轻微的性能开销

3. **未来计划**
   - 包装器标记为 `@deprecated`
   - 建议新代码使用统一管理器

## 🎯 最佳实践

1. **新项目**：直接使用 `useGlobalThemeManager`
2. **现有项目**：逐步迁移，先更新导入路径
3. **编辑器**：使用 `theme: 'auto'` 获得最佳体验
4. **配置**：从 `@/config/themes` 导入配置

## 📞 支持

如有问题，请查看：
- 代码注释中的使用示例
- `src/composables/index.js` 中的推荐用法
- 现有组件的使用方式
