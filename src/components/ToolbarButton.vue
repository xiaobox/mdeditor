<template>
  <button 
    class="toolbar-btn" 
    :title="title"
    @click="handleClick"
  >
    <svg 
      viewBox="0 0 24 24" 
      :width="width" 
      :height="height"
    >
      <path fill="currentColor" :d="icon" />
    </svg>
  </button>
</template>

<script>
export default {
  name: 'ToolbarButton',
  props: {
    title: {
      type: String,
      required: true
    },
    icon: {
      type: String,
      required: true
    },
    width: {
      type: [String, Number],
      default: 20
    },
    height: {
      type: [String, Number],
      default: 20
    }
  },
  emits: ['click'],
  methods: {
    handleClick() {
      this.$emit('click')
    }
  }
}
</script>

<style scoped>
/* 工具栏按钮 - 与主题系统集成的 Neumorphism 风格 */
.toolbar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--spacing-toolbar);
  height: var(--spacing-toolbar);
  border: none;
  border-radius: var(--radius-xl);
  background: var(--gray-200);
  color: var(--primary-color);
  cursor: pointer;
  transition: var(--transition-all-normal);
  /* 移除 margin，让父容器的 gap 来控制间距 */
  box-shadow: var(--shadow-neumorphism-small);
}

.toolbar-btn:hover {
  color: var(--primary-hover);
  box-shadow: var(--shadow-neumorphism-pressed);
}

.toolbar-btn:active {
  color: var(--primary-dark);
  box-shadow:
    inset var(--spacing-xs) var(--spacing-xs) var(--spacing-md) rgba(163, 177, 198, 0.6),
    inset calc(-1 * var(--spacing-xs)) calc(-1 * var(--spacing-xs)) var(--spacing-md) rgba(255, 255, 255, 0.9);
}

.toolbar-btn svg {
  transition: all 0.2s ease;
}

/* 暗色主题适配 */
@media (prefers-color-scheme: dark) {
  .toolbar-btn {
    background: #2a2a2a;
    color: var(--primary-color);
    box-shadow:
      5px 5px 10px rgba(0, 0, 0, 0.3),
      -5px -5px 10px rgba(255, 255, 255, 0.05);
  }

  .toolbar-btn:hover {
    color: var(--primary-hover);
    box-shadow:
      inset 3px 3px 6px rgba(0, 0, 0, 0.4),
      inset -3px -3px 6px rgba(255, 255, 255, 0.08);
  }

  .toolbar-btn:active {
    color: var(--primary-dark);
    box-shadow:
      inset 4px 4px 8px rgba(0, 0, 0, 0.5),
      inset -4px -4px 8px rgba(255, 255, 255, 0.1);
  }
}
</style>
