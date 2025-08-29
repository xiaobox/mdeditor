<template>
  <div class="dropdown" ref="dropdownRef">
    <button
      class="dropdown-trigger"
      :class="[triggerClass, { 'dropdown-open': isOpen }]"
      @click="toggleDropdown"
      :disabled="disabled"
    >
      <slot name="trigger">
        <svg :viewBox="triggerViewBox || '0 0 24 24'" width="16" height="16">
          <template v-if="Array.isArray(triggerIcon)">
            <path v-for="(d, i) in triggerIcon" :key="i" fill="currentColor" :d="d" />
          </template>
          <path v-else fill="currentColor" :d="triggerIcon || 'M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z'"/>
        </svg>
        <span>{{ triggerText }}</span>
        <svg class="dropdown-arrow" :class="{ 'dropdown-arrow-open': isOpen }" viewBox="0 0 24 24" width="14" height="14">
          <path fill="currentColor" d="M7,10L12,15L17,10H7Z"/>
        </svg>
      </slot>
    </button>

    <Transition name="dropdown">
      <div v-if="isOpen" class="dropdown-menu" :class="menuClass">
        <div
          v-for="(option, index) in options"
          :key="option.value || index"
          class="dropdown-item"
          :class="{
            'dropdown-item-active': option.value === selectedValue,
            'dropdown-item-disabled': option.disabled
          }"
          @click="selectOption(option)"
        >
          <div class="dropdown-item-content">
            <svg v-if="option.icon" class="dropdown-item-icon" :viewBox="option.viewBox || '0 0 24 24'" width="16" height="16">
              <template v-if="Array.isArray(option.icon)">
                <path v-for="(d, idx) in option.icon" :key="idx" fill="currentColor" :d="d" />
              </template>
              <path v-else fill="currentColor" :d="option.icon"/>
            </svg>
            <span class="dropdown-item-text">{{ option.label }}</span>
            <svg v-if="option.value === selectedValue" class="dropdown-item-check" viewBox="0 0 24 24" width="16" height="16">
              <path fill="currentColor" d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z"/>
            </svg>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// Props
const props = defineProps({
  options: {
    type: Array,
    required: true,
    default: () => []
  },
  modelValue: {
    type: [String, Number, Object],
    default: null
  },
  triggerText: {
    type: String,
    default: '选择选项'
  },
  triggerClass: {
    type: String,
    default: ''
  },
  menuClass: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  // 可选：用于自定义触发器默认图标（也可通过 slot 手动传入）
  triggerIcon: {
    type: [String, Array],
    default: null
  },
  triggerViewBox: {
    type: String,
    default: '0 0 24 24'
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'select'])

// Reactive data
const isOpen = ref(false)
const dropdownRef = ref(null)
const selectedValue = ref(props.modelValue)

// Methods
const toggleDropdown = () => {
  if (!props.disabled) {
    isOpen.value = !isOpen.value
  }
}

const selectOption = (option) => {
  if (option.disabled) return

  selectedValue.value = option.value
  emit('update:modelValue', option.value)
  emit('select', option)
  isOpen.value = false
}

const closeDropdown = () => {
  isOpen.value = false
}

const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    closeDropdown()
  }
}

const handleEscape = (event) => {
  if (event.key === 'Escape') {
    closeDropdown()
  }
}

// Lifecycle
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleEscape)
})
</script>

<style scoped>
.dropdown {
  position: relative;
  display: inline-block;
}



.dropdown-arrow {
  transition: transform 0.2s ease;
}

.dropdown-arrow-open {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  min-width: 220px;
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  box-shadow:
    0 10px 40px rgba(0, 0, 0, 0.12),
    0 4px 16px rgba(0, 0, 0, 0.08),
    0 1px 4px rgba(0, 0, 0, 0.04);
  z-index: 9999;
  overflow: hidden;
  margin-top: 8px;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.dropdown-item {
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.dropdown-item:hover:not(.dropdown-item-disabled) {
  background-color: var(--gray-100, #f3f4f6);
}

.dropdown-item:active:not(.dropdown-item-disabled) {
  background-color: var(--gray-200, #e5e7eb);
}

.dropdown-item-active {
  background-color: var(--theme-primary-light);
  border-left: 3px solid var(--theme-primary);
}

.dropdown-item-disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.dropdown-item-content {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  position: relative;
  z-index: 1;
}

.dropdown-item-icon {
  flex-shrink: 0;
  color: var(--theme-primary);
}

.dropdown-item-text {
  flex: 1;
  font-size: 14px;
  color: var(--text-primary, #333);
  font-weight: 500;
}

.dropdown-item-check {
  flex-shrink: 0;
  color: var(--theme-primary);
}

/* Transition animations */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.15s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.95);
}

.dropdown-enter-to,
.dropdown-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}

/* 专用的复制按钮样式类 - 与其他按钮保持一致 */
.btn-copy-custom {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 12px;
  border: 1px solid var(--theme-border-light);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  white-space: nowrap;
  background: var(--theme-bg-tertiary);
  color: var(--theme-text-secondary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
}

.btn-copy-custom:hover:not(:disabled) {
  background: var(--theme-bg-secondary);
  color: var(--theme-text-primary);
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  border-color: var(--theme-primary);
}

.btn-copy-custom:active:not(:disabled) {
  transform: translateY(0);
}

.btn-copy-custom:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* 支持 header-btn 类的简洁 Neumorphism 样式 - 跟随主题色 */
.dropdown-trigger.header-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-lg);
  border: none;
  border-radius: var(--radius-2xl);
  background: var(--gray-100);
  color: var(--theme-primary);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-tight);
  text-decoration: none;
  cursor: pointer;
  transition: var(--transition-all-normal);
  white-space: nowrap;
  user-select: none;
  position: relative;
  box-shadow: var(--shadow-neumorphism-small);
}

.dropdown-trigger.header-btn:hover:not(:disabled) {
  color: var(--theme-primary-hover);
  font-weight: var(--font-weight-bold);
  box-shadow: var(--shadow-neumorphism-pressed);
}

.dropdown-trigger.header-btn:active:not(:disabled) {
  color: var(--theme-primary-dark);
  box-shadow:
    inset var(--spacing-xs) var(--spacing-xs) var(--spacing-md) rgba(163, 177, 198, 0.5),
    inset calc(-1 * var(--spacing-xs)) calc(-1 * var(--spacing-xs)) var(--spacing-md) rgba(255, 255, 255, 0.9);
}

.dropdown-trigger.header-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  color: var(--gray-400);
  box-shadow: var(--shadow-xs);
}

.dropdown-trigger.header-btn svg {
  flex-shrink: 0;
  transition: all 0.2s ease;
  opacity: 0.9;
  color: var(--theme-primary);
}

.dropdown-trigger.header-btn:hover svg {
  opacity: 1;
  color: var(--theme-primary-hover);
  transform: scale(1.05);
}

.dropdown-trigger.header-btn:active svg {
  color: var(--theme-primary-dark);
}

.dropdown-trigger.header-btn:disabled:hover {
  color: var(--gray-400);
  box-shadow: var(--shadow-xs);
}

/* 焦点状态（无障碍） - 与其他 header-btn 保持一致 */
.dropdown-trigger.header-btn:focus-visible {
  outline: none;
  box-shadow:
    6px 6px 12px rgba(163, 177, 198, 0.6),
    -6px -6px 12px rgba(255, 255, 255, 0.8),
    0 0 0 3px rgba(var(--theme-primary-rgb), 0.3);
}

  /* 小按钮风格（与 AppMain 的 .btn-small 视觉一致） */
  .dropdown-trigger.btn-small {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    padding: 0;
    gap: 0;
    border: 1px solid var(--theme-border-light);
    border-radius: 6px;
    background: var(--theme-bg-primary);
    color: var(--theme-text-secondary);
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  }

  .dropdown-trigger.btn-small:hover:not(:disabled) {
    background: var(--theme-bg-secondary);
    color: var(--theme-text-primary);
    border-color: var(--theme-primary);
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .dropdown-trigger.btn-small:active:not(:disabled) {
    transform: translateY(0);
  }

  .dropdown-trigger.btn-small:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }



</style>
