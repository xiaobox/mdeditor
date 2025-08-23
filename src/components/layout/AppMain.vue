<template>
  <main class="app-main" :class="`view-mode-${viewMode}`">
    <!-- 左侧：Markdown编辑器 -->
    <div v-if="viewMode === 'both' || viewMode === 'editor'" class="editor-panel">
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
          <!-- 新增：导入 .md（更新图标） -->
          <button @click="$emit('import-markdown')" class="btn-small" title="导入 .md 文件">
            <svg viewBox="0 0 1024 1024" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
              <path d="M628.1 357.9h107.4c2.8 0 5.7 0.7 8.1 2.4 18.4 13.1 18.2 34.3 6.4 46.3L532.4 627.5c-11.1 11.2-29.2 11.4-40.4 0.3l-0.3-0.3-217.6-220.9c-11.1-11.3-10.9-29.4 0.4-40.4 5.3-5.2 12.5-8.2 19.9-8.2H396V142.3c0-7.9 6.4-14.3 14.3-14.3h203.5c7.9 0 14.3 6.4 14.3 14.3v215.6zM283.4 652.4v87.5c0 7.9 6.4 14.3 14.3 14.3h428.8c7.9 0 14.3-6.4 14.3-14.3v-87.5c0-7.9 6.4-14.3 14.3-14.3H898c7.9 0 14.3 6.4 14.3 14.3V914c0 7.9-6.4 14.3-14.3 14.3H126.2c-7.9 0-14.3-6.4-14.3-14.3V652.4c0-7.9 6.4-14.3 14.3-14.3h142.9c7.9 0 14.3 6.4 14.3 14.3z" fill="currentColor"></path>
            </svg>
          </button>
        </div>
      </div>
      <MarkdownEditor
        :model-value="markdownContent"
        :sync-scroll-enabled="syncScrollEnabled"
        @update:model-value="$emit('update:markdown-content', $event)"
        class="editor-content"
      />
    </div>

    <!-- 右侧：预览/WYSIWYG 面板 -->
    <div v-if="viewMode === 'both' || viewMode === 'preview' || viewMode === 'wysiwyg'" class="preview-panel">
      <div class="panel-header">
        <h3>
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="currentColor" d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z"/>
          </svg>
          {{ viewMode === 'wysiwyg' ? '所见即所得' : '预览' }}
        </h3>
        <div class="panel-actions"></div>
      </div>

      <component
        :is="viewMode === 'wysiwyg' ? WysiwygPane : PreviewPane"
        v-bind="viewMode === 'wysiwyg' ? { modelValue: markdownContent } : { markdown: markdownContent, syncScrollEnabled }"
        @update:model-value="(val) => $emit('update:markdown-content', val)"
        @html-generated="(val) => viewMode !== 'wysiwyg' && $emit('html-generated', val)"
        class="preview-content"
      />
    </div>
  </main>
</template>

<script setup>
import MarkdownEditor from '../MarkdownEditor.vue'
import PreviewPane from '../PreviewPane.vue'
import WysiwygPane from '../WysiwygPane.vue'
import { } from 'vue'

const props = defineProps({
  markdownContent: {
    type: String,
    required: true
  },
  syncScrollEnabled: {
    type: Boolean,
    default: true
  },
  viewMode: {
    type: String,
    default: 'both'
  }
})

const emit = defineEmits([
  'update:markdown-content',
  'clear-content',
  'load-sample',
  'html-generated',
  'import-markdown'
])
</script>

<style scoped>
.app-main {
  flex: 1;
  display: flex;
  gap: var(--spacing-3xl);
  padding: var(--spacing-4xl);
  overflow: hidden;
  background: #f5f5f5;
  position: relative;
}

.editor-panel,
.preview-panel {
  flex: 1;
  min-width: 400px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: all 0.3s ease;
  position: relative;
}

.editor-panel:hover,
.preview-panel:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-color: #d0d0d0;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: #f8f8f8;
  border-bottom: 1px solid #e0e0e0;
  position: relative;
  overflow: visible; /* 允许下拉菜单溢出显示 */
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
  border-color: var(--theme-primary);
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
  background: var(--theme-primary);
}
</style>
