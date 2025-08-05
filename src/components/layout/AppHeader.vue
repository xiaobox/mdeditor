<template>
  <header class="app-header">
    <div class="header-left">
      <h1>Modern MD Editor</h1>
      <span class="header-subtitle">现代化 Markdown 编辑器</span>
    </div>
    <div class="header-right">
      <!-- 视图切换按钮组 -->
      <div class="view-toggle-group">
        <button
          :class="['view-toggle-btn', { 'active': viewMode === 'both' }]"
          @click="$emit('set-view-mode', 'both')"
          title="显示编辑器和预览"
        >
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path fill="currentColor" d="M3,3H11V5H3V3M13,3H21V5H13V3M3,7H11V9H3V7M13,7H21V9H13V7M3,11H11V13H3V11M13,11H21V13H13V11M3,15H11V17H3V15M13,15H21V17H13V15M3,19H11V21H3V19M13,19H21V21H13V19Z"/>
          </svg>
        </button>
        <button
          :class="['view-toggle-btn', { 'active': viewMode === 'editor' }]"
          @click="$emit('set-view-mode', 'editor')"
          title="仅显示编辑器"
        >
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path fill="currentColor" d="M14.6,16.6L19.2,12L14.6,7.4L16,6L22,12L16,18L14.6,16.6M9.4,16.6L4.8,12L9.4,7.4L8,6L2,12L8,18L9.4,16.6Z"/>
          </svg>
        </button>
        <button
          :class="['view-toggle-btn', { 'active': viewMode === 'preview' }]"
          @click="$emit('set-view-mode', 'preview')"
          title="仅显示预览"
        >
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path fill="currentColor" d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z"/>
          </svg>
        </button>
      </div>

      <button
        class="header-btn"
        @click="$emit('toggle-settings')"
        :class="{ 'active': showSettingsPanel }"
      >
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path fill="currentColor" d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.22,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.22,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.68 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z"/>
        </svg>
        <span>设置</span>
      </button>

      <button class="header-btn" @click="$emit('show-guide')">
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path fill="currentColor" d="M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z"/>
        </svg>
        <span>语法指南</span>
      </button>

      <DropdownMenu
        :options="copyFormatOptions"
        :model-value="selectedCopyFormat"
        trigger-text="复制"
        trigger-class="header-btn"
        :disabled="!hasContent"
        @update:model-value="$emit('update:selected-copy-format', $event)"
        @select="$emit('copy-format-select', $event)"
      />

      <button class="header-btn" @click="$emit('open-github')" title="查看源码">
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path fill="currentColor" d="M12,2A10,10 0 0,0 2,12C2,16.42 4.87,20.17 8.84,21.5C9.34,21.58 9.5,21.27 9.5,21C9.5,20.77 9.5,20.14 9.5,19.31C6.73,19.91 6.14,17.97 6.14,17.97C5.68,16.81 5.03,16.5 5.03,16.5C4.12,15.88 5.1,15.9 5.1,15.9C6.1,15.97 6.63,16.93 6.63,16.93C7.5,18.45 8.97,18 9.54,17.76C9.63,17.11 9.89,16.67 10.17,16.42C7.95,16.17 5.62,15.31 5.62,11.5C5.62,10.39 6,9.5 6.65,8.79C6.55,8.54 6.2,7.5 6.75,6.15C6.75,6.15 7.59,5.88 9.5,7.17C10.29,6.95 11.15,6.84 12,6.84C12.85,6.84 13.71,6.95 14.5,7.17C16.41,5.88 17.25,6.15 17.25,6.15C17.8,7.5 17.45,8.54 17.35,8.79C18,9.5 18.38,10.39 18.38,11.5C18.38,15.32 16.04,16.16 13.81,16.41C14.17,16.72 14.5,17.33 14.5,18.26C14.5,19.6 14.5,20.68 14.5,21C14.5,21.27 14.66,21.59 15.17,21.5C19.14,20.16 22,16.42 22,12A10,10 0 0,0 12,2Z"/>
        </svg>
        <span>GitHub</span>
      </button>
    </div>
  </header>
</template>

<script setup>
import DropdownMenu from '../DropdownMenu.vue'

defineProps({
  showSettingsPanel: {
    type: Boolean,
    default: false
  },
  viewMode: {
    type: String,
    default: 'both'
  },
  copyFormatOptions: {
    type: Array,
    required: true
  },
  selectedCopyFormat: {
    type: Object,
    default: null
  },
  hasContent: {
    type: Boolean,
    default: false
  }
})

defineEmits([
  'open-github',
  'toggle-settings',
  'show-guide',
  'copy-format-select',
  'update:selected-copy-format',
  'set-view-mode'
])
</script>

<style scoped>
@import '../../styles/components/app-header.css';
</style>
