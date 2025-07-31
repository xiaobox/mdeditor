<template>
  <main class="app-main">
    <!-- 左侧：Markdown编辑器 -->
    <div class="editor-panel">
      <div class="panel-header">
        <h3>
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="currentColor" d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
          </svg>
          Markdown 编辑器
        </h3>
        <div class="panel-actions">
          <button @click="$emit('clear-content')" class="btn-small" title="清空内容">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"/>
            </svg>
          </button>
          <button @click="$emit('load-sample')" class="btn-small" title="加载示例">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
            </svg>
          </button>
        </div>
      </div>
      <MarkdownEditor
        :model-value="markdownContent"
        @update:model-value="$emit('update:markdown-content', $event)"
        class="editor-content"
      />
    </div>

    <!-- 右侧：预览面板 -->
    <div class="preview-panel">
      <div class="panel-header">
        <h3>
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="currentColor" d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z"/>
          </svg>
          预览
        </h3>
        <div class="panel-actions">
          <!-- 预留扩展功能位置 -->
        </div>
      </div>
      
      <PreviewPane
        :markdown="markdownContent"
        @html-generated="$emit('html-generated', $event)"
        class="preview-content"
      />
    </div>
  </main>
</template>

<script setup>
import MarkdownEditor from '../MarkdownEditor.vue'
import PreviewPane from '../PreviewPane.vue'

defineProps({
  markdownContent: {
    type: String,
    required: true
  }
})

defineEmits([
  'update:markdown-content',
  'clear-content',
  'load-sample',
  'html-generated'
])
</script>

<style scoped>
.app-main {
  flex: 1;
  display: flex;
  gap: 24px;
  padding: 32px;
  overflow: hidden;
  background: linear-gradient(135deg,
    #f1f5f9 0%,
    #e2e8f0 25%,
    #cbd5e1 50%,
    #94a3b8 75%,
    #64748b 100%);
  position: relative;
}

.app-main::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.05) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(168, 85, 247, 0.05) 0%, transparent 50%),
    radial-gradient(circle at 40% 60%, rgba(34, 197, 94, 0.03) 0%, transparent 50%);
  pointer-events: none;
}

.editor-panel,
.preview-panel {
  flex: 1;
  min-width: 400px;
  background: linear-gradient(145deg,
    #ffffff 0%,
    #fefefe 25%,
    #fdfdfd 50%,
    #fafafa 75%,
    #f7f7f7 100%);
  border-radius: 20px;
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.12),
    0 8px 24px rgba(0, 0, 0, 0.08),
    0 4px 12px rgba(0, 0, 0, 0.04),
    inset 0 2px 0 rgba(255, 255, 255, 0.9),
    inset 0 -2px 0 rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: all 0.3s ease;
  position: relative;
}

.editor-panel:hover,
.preview-panel:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.12);
  border-color: var(--primary-color);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: linear-gradient(135deg, var(--theme-bg-secondary), var(--theme-bg-primary));
  border-bottom: 1px solid var(--theme-border-light);
  position: relative;
  overflow: hidden;
}

.panel-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--theme-text-primary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.panel-header h3 svg {
  opacity: 0.7;
}

.panel-actions {
  display: flex;
  gap: 8px;
}

.btn-small {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid var(--theme-border-light);
  border-radius: 6px;
  background: var(--theme-bg-primary);
  color: var(--theme-text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.btn-small:hover {
  background: var(--theme-bg-secondary);
  color: var(--theme-text-primary);
  border-color: var(--primary-color);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.btn-small:active {
  transform: translateY(0);
}

.editor-content,
.preview-content {
  flex: 1;
  overflow: hidden;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .app-main {
    flex-direction: column;
    gap: 20px;
    padding: 24px;
  }
  .editor-panel,
  .preview-panel {
    min-width: 100%;
    min-height: 400px;
  }
}

@media (max-width: 768px) {
  .panel-header {
    padding: 12px 16px;
  }
  
  .panel-header h3 {
    font-size: 14px;
  }
  
  .btn-small {
    width: 32px;
    height: 32px;
  }
  
  .btn-small svg {
    width: 16px;
    height: 16px;
  }
}



/* 滚动条样式 */
.editor-content::-webkit-scrollbar,
.preview-content::-webkit-scrollbar {
  width: 6px;
}

.editor-content::-webkit-scrollbar-track,
.preview-content::-webkit-scrollbar-track {
  background: var(--theme-bg-secondary);
}

.editor-content::-webkit-scrollbar-thumb,
.preview-content::-webkit-scrollbar-thumb {
  background: var(--theme-border-light);
  border-radius: 3px;
}

.editor-content::-webkit-scrollbar-thumb:hover,
.preview-content::-webkit-scrollbar-thumb:hover {
  background: var(--primary-color);
}
</style>
