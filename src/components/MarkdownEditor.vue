<template>
  <div class="markdown-editor">
    <div class="editor-toolbar">
      <div class="toolbar-left">
        <template v-for="(group, groupIndex) in toolbarConfig" :key="groupIndex">
          <div v-if="group.type === 'group'" class="toolbar-group">
            <ToolbarButton
              v-for="item in group.items"
              :key="item.id"
              :title="item.title"
              :icon="item.icon"
              :width="item.width"
              :height="item.height"
              @click="item.action"
            />
          </div>
          <div v-else-if="group.type === 'divider'" class="toolbar-divider"></div>
          <ToolbarButton
            v-else
            :key="group.id"
            :title="group.title"
            :icon="group.icon"
            :width="group.width"
            :height="group.height"
            @click="group.action"
          />
        </template>
      </div>
      <div class="toolbar-right">
        <!-- 工具栏右侧预留 -->
      </div>
    </div>

    <div class="editor-container">
      <div ref="editorElement" class="codemirror-wrapper"></div>
    </div>
  </div>
</template>

<script>
import { watch, computed } from 'vue'
import { useMarkdownEditor } from '../composables/index.js'
import ToolbarButton from './ToolbarButton.vue'
import { createToolbarConfig } from '../config/toolbar.js'

export default {
  name: 'MarkdownEditor',
  components: {
    ToolbarButton
  },
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    theme: {
      type: String,
      default: 'light'
    }
  },
  emits: ['update:modelValue', 'showMarkdownGuide'],
  setup(props, { emit }) {
    // 滚动同步处理
    const handleEditorScroll = (scrollPercentage) => {
      // 同步到预览区
      const previewElement = document.querySelector('.preview-rendered')
      if (previewElement) {
        const previewMaxScrollTop = Math.max(0, previewElement.scrollHeight - previewElement.clientHeight)
        const targetScrollTop = Math.round(previewMaxScrollTop * scrollPercentage)
        previewElement.scrollTop = targetScrollTop
      }
    }

    // 使用编辑器 composable
    const editor = useMarkdownEditor({
      initialValue: props.modelValue,
      theme: props.theme,
      onContentChange: (content) => {
        emit('update:modelValue', content)
      },
      onScroll: handleEditorScroll
    })

    // 监听 props 变化
    watch(() => props.modelValue, (newValue) => {
      editor.updateContent(newValue)
    })

    // 工具栏配置
    const toolbarConfig = computed(() => createToolbarConfig(editor))

    return {
      ...editor,
      toolbarConfig
    }
  }
}
</script>
