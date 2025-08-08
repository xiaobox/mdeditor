<template>
  <div class="settings-panel" :class="{ 'disable-hover': showColorPicker }" v-if="visible">
    <div class="settings-overlay" @click="$emit('close')" v-show="!showColorPicker"></div>
    <div class="settings-content">
      <!-- 设置面板头部 -->
      <SettingsHeader @close="$emit('close')" />

      <div class="settings-body">
        <!-- 侧边导航栏 -->
        <div class="settings-navigation">
          <div class="nav-title">快速导航</div>
          <nav class="nav-menu">
            <a
              v-for="section in navigationSections"
              :key="section.id"
              class="nav-item"
              :class="{ active: activeSection === section.id }"
              @click="scrollToSection(section.id)"
            >
              <div class="nav-icon">
                <svg :viewBox="section.icon.viewBox" width="18" height="18">
                  <path :d="section.icon.path" fill="currentColor" />
                </svg>
              </div>
              <span class="nav-label">{{ section.label }}</span>
            </a>
          </nav>
        </div>

        <!-- 设置内容区域 -->
        <div class="settings-content-area">
          <div class="settings-sections">
            <!-- 主题系统设置 -->
            <section id="theme-system" class="settings-section-wrapper">
              <ThemeSystemSection
                :layout-list="layoutList"
                :selected-theme-system-id="selectedThemeSystemId"
                @select="selectThemeSystem"
              />
            </section>

            <!-- 主题色设置 -->
            <section id="color-theme" class="settings-section-wrapper">
              <ColorThemeSection
                :builtin-color-themes="builtinColorThemes"
                :selected-theme-id="selectedThemeId"
                :is-custom-color-active="isCustomColorActive"
                :current-custom-color="currentCustomColor"
                @select-theme="selectTheme"
                @toggle-color-picker="toggleColorPicker"
              />
            </section>

            <!-- 代码样式设置 -->
            <section id="code-style" class="settings-section-wrapper">
              <CodeStyleSection
                :code-style-list="codeStyleList"
                :selected-code-style-id="selectedCodeStyleId"
                @select="selectCodeStyle"
              />
            </section>

            <!-- 字体设置 -->
            <section id="font-settings" class="settings-section-wrapper">
              <FontSettingsSection
                :font-family-list="fontFamilyList"
                :selected-font-family="selectedFontFamily"
                @select-font-family="selectFontFamily"
              />
            </section>

            <!-- 字号设置 -->
            <section id="font-size-settings" class="settings-section-wrapper">
              <FontSizeSection
                :selected-font-family="selectedFontFamily"
                :selected-font-size="selectedFontSize"
                @update-font-size="updateFontSize"
              />
            </section>

            <!-- 间距设置 -->
            <section id="spacing-settings" class="settings-section-wrapper">
              <SpacingSettingsSection
                :letter-spacing="selectedLetterSpacing"
                :line-height="selectedLineHeight"
                @update-letter-spacing="updateLetterSpacing"
                @update-line-height="updateLineHeight"
              />
            </section>
          </div>
        </div>
      </div>

      <!-- 设置面板底部 -->
      <SettingsFooter
        :current-color-theme="currentColorTheme"
        @apply="applySettings"
      />
    </div>

    <!-- 颜色选择器弹窗 -->
    <div v-if="showColorPicker" class="color-picker-overlay" @click="closeColorPicker">
      <div class="color-picker-modal" @click.stop>
        <ColorPicker
          :initial-color="currentCustomColor"
          @change="onColorChange"
          @confirm="onColorConfirm"
          @cancel="closeColorPicker"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useSettingsPanel } from '../composables/useSettingsPanel.js'
import SettingsHeader from './settings/SettingsHeader.vue'
import SettingsFooter from './settings/SettingsFooter.vue'
import ThemeSystemSection from './settings/ThemeSystemSection.vue'
import ColorThemeSection from './settings/ColorThemeSection.vue'
import CodeStyleSection from './settings/CodeStyleSection.vue'
import FontSettingsSection from './settings/FontSettingsSection.vue'
import FontSizeSection from './settings/FontSizeSection.vue'
import SpacingSettingsSection from './settings/SpacingSettingsSection.vue'
import ColorPicker from './ColorPicker.vue'

// Props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['close', 'show-notification'])

// 使用设置面板 composable
const {
  // 状态
  selectedThemeSystemId,
  selectedThemeId,
  selectedCodeStyleId,
  selectedFontFamily,
  selectedFontSize,
    selectedLetterSpacing,
    selectedLineHeight,
  showColorPicker,
  selectedCustomColor,
  currentCustomColor,
  isUsingCustomColor,
  currentCustomTheme,

  // 计算属性
  builtinColorThemes,
  isCustomColorActive,
  layoutList,
  codeStyleList,
  fontFamilyList,
  currentColorTheme,

  // 方法
  selectThemeSystem,
  selectTheme,
  selectCodeStyle,
  selectFontFamily,
  updateFontSize,
  updateLetterSpacing,
  updateLineHeight,
  adjustColorBrightness,
  toggleColorPicker,
  closeColorPicker,
  onColorChange,
  onColorConfirm,
  resetSelections,
  applySettings
} = useSettingsPanel(props, emit)

// 导航相关状态
const activeSection = ref('theme-system')

// 导航配置
  const navigationSections = ref([
  {
    id: 'theme-system',
    label: '主题系统',
    icon: {
      viewBox: '0 0 24 24',
      path: 'M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z'
    }
  },
  {
    id: 'color-theme',
    label: '主题色',
    icon: {
      viewBox: '0 0 24 24',
      path: 'M17.5,12A1.5,1.5 0 0,1 16,10.5A1.5,1.5 0 0,1 17.5,9A1.5,1.5 0 0,1 19,10.5A1.5,1.5 0 0,1 17.5,12M14.5,8A1.5,1.5 0 0,1 13,6.5A1.5,1.5 0 0,1 14.5,5A1.5,1.5 0 0,1 16,6.5A1.5,1.5 0 0,1 14.5,8M9.5,8A1.5,1.5 0 0,1 8,6.5A1.5,1.5 0 0,1 9.5,5A1.5,1.5 0 0,1 11,6.5A1.5,1.5 0 0,1 9.5,8M6.5,12A1.5,1.5 0 0,1 5,10.5A1.5,1.5 0 0,1 6.5,9A1.5,1.5 0 0,1 8,10.5A1.5,1.5 0 0,1 6.5,12M12,3A9,9 0 0,0 3,12A9,9 0 0,0 12,21A1.5,1.5 0 0,0 13.5,19.5C13.5,19.11 13.35,18.76 13.11,18.5C12.88,18.23 12.73,17.88 12.73,17.5A1.5,1.5 0 0,1 14.23,16H16A5,5 0 0,0 21,11C21,6.58 16.97,3 12,3Z'
    }
  },
  {
    id: 'code-style',
    label: '代码样式',
    icon: {
      viewBox: '0 0 24 24',
      path: 'M14.6,16.6L19.2,12L14.6,7.4L16,6L22,12L16,18L14.6,16.6M9.4,16.6L4.8,12L9.4,7.4L8,6L2,12L8,18L9.4,16.6Z'
    }
  },
  {
    id: 'font-settings',
    label: '字体',
    icon: {
      viewBox: '0 0 24 24',
      path: 'M9,4V7H14V19H17V7H22V4H9M3,4V7H6V19H9V7H12V4H3Z'
    }
  },
  {
    id: 'font-size-settings',
    label: '字号',
    icon: {
      viewBox: '0 0 24 24',
      path: 'M11,7A2,2 0 0,1 13,9V17A2,2 0 0,1 11,19H9A2,2 0 0,1 7,17V9A2,2 0 0,1 9,7H11M9,9V17H11V9H9M12,2A2,2 0 0,1 14,4V6H12V4H10V6H8V4A2,2 0 0,1 10,2H12Z'
    }
  },
  {
    id: 'spacing-settings',
    label: '间距',
    icon: {
      viewBox: '0 0 24 24',
      path: 'M3 11h18v2H3v-2m6-6h6v2H9V5m0 14h6v2H9v-2'
    }
  }
])

// 滚动到指定区域
const scrollToSection = (sectionId) => {
  const element = document.getElementById(sectionId)
  if (element) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest'
    })
    activeSection.value = sectionId
  }
}

// 监听滚动事件，更新当前激活的导航项
const handleScroll = () => {
  const sections = navigationSections.value.map(section => section.id)
  const scrollContainer = document.querySelector('.settings-content-area')

  if (!scrollContainer) return

  const containerHeight = scrollContainer.clientHeight

  for (const sectionId of sections) {
    const element = document.getElementById(sectionId)
    if (element) {
      const rect = element.getBoundingClientRect()
      const containerRect = scrollContainer.getBoundingClientRect()
      const relativeTop = rect.top - containerRect.top

      // 如果元素在视口的上半部分，则认为是当前激活的区域
      if (relativeTop <= containerHeight / 3 && relativeTop >= -rect.height / 2) {
        activeSection.value = sectionId
        break
      }
    }
  }
}

// 生命周期钩子
onMounted(() => {
  const scrollContainer = document.querySelector('.settings-content-area')
  if (scrollContainer) {
    scrollContainer.addEventListener('scroll', handleScroll)
  }
})

onUnmounted(() => {
  const scrollContainer = document.querySelector('.settings-content-area')
  if (scrollContainer) {
    scrollContainer.removeEventListener('scroll', handleScroll)
  }
})

// 暴露方法给父组件
defineExpose({
  resetSelections
})
</script>

<style scoped>
@import '../styles/components/settings/index.css';

/* 设置面板主体布局 */
.settings-body {
  display: flex;
  gap: 24px;
  height: calc(100vh - 200px);
  overflow: hidden;
}

/* 侧边导航栏 */
.settings-navigation {
  flex-shrink: 0;
  width: 200px;
  background: var(--theme-bg-secondary);
  border: 1px solid var(--theme-border-light);
  border-radius: 12px;
  padding: 20px 16px;
  height: fit-content;
  position: sticky;
  top: 0;
}

.nav-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--theme-text-secondary);
  margin-bottom: 16px;
  padding: 0 8px;
}

.nav-menu {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 8px;
  border-radius: 8px;
  color: var(--theme-text-secondary);
  text-decoration: none;
  transition: all 0.2s ease;
  cursor: pointer;
  font-size: 14px;
}

.nav-item:hover {
  background: var(--theme-bg-tertiary);
  color: var(--theme-text-primary);
}

.nav-item.active {
  background: var(--primary-color);
  color: white;
}

.nav-item.active .nav-icon {
  color: white;
}

.nav-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  color: var(--theme-text-tertiary);
  transition: color 0.2s ease;
}

.nav-label {
  font-weight: 500;
}

/* 设置内容区域 */
.settings-content-area {
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;
}

.settings-content-area::-webkit-scrollbar {
  width: 6px;
}

.settings-content-area::-webkit-scrollbar-track {
  background: transparent;
}

.settings-content-area::-webkit-scrollbar-thumb {
  background: var(--theme-border-light);
  border-radius: 3px;
}

.settings-content-area::-webkit-scrollbar-thumb:hover {
  background: var(--theme-border-medium);
}

/* 设置区域包装器 */
.settings-section-wrapper {
  margin-bottom: 32px;
  scroll-margin-top: 20px;
}

.settings-section-wrapper:last-child {
  margin-bottom: 0;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .settings-navigation {
    width: 180px;
  }

  .nav-label {
    font-size: 13px;
  }
}

@media (max-width: 1000px) {
  .settings-body {
    flex-direction: column;
    height: auto;
  }

  .settings-navigation {
    width: 100%;
    position: static;
  }

  .nav-menu {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 8px;
  }

  .nav-item {
    flex: 1;
    min-width: 120px;
    justify-content: center;
  }
}
</style>