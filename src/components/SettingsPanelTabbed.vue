<template>
  <div class="settings-panel" :class="{ 'disable-hover': showColorPicker }" v-if="visible">
    <div class="settings-overlay" @click="$emit('close')" v-show="!showColorPicker"></div>
    <div class="settings-content">
      <!-- 设置面板头部 -->
      <SettingsHeader @close="$emit('close')" />

      <!-- 标签导航 -->
      <div class="settings-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="tab-button"
          :class="{ active: activeTab === tab.id }"
          @click="activeTab = tab.id"
        >
          <div class="tab-icon">
            <svg :viewBox="tab.icon.viewBox" width="20" height="20">
              <path :d="tab.icon.path" fill="currentColor" />
            </svg>
          </div>
          <span class="tab-label">{{ $t(tab.labelKey) }}</span>
        </button>
      </div>

      <!-- 设置内容区域 -->
      <div class="settings-body">
        <div class="settings-sections">
          <!-- 主题系统设置 -->
          <div v-show="activeTab === 'theme-system'" class="tab-content">
            <ThemeSystemSection
              :layout-list="layoutList"
              :selected-theme-system-id="selectedThemeSystemId"
              @select="selectThemeSystem"
            />
          </div>

          <!-- 主题色设置 -->
          <div v-show="activeTab === 'color-theme'" class="tab-content">
            <ColorThemeSection
              :builtin-color-themes="builtinColorThemes"
              :selected-theme-id="selectedThemeId"
              :is-custom-color-active="isCustomColorActive"
              :current-custom-color="currentCustomColor"
              @select-theme="selectTheme"
              @toggle-color-picker="toggleColorPicker"
            />
          </div>

          <!-- 代码样式设置 -->
          <div v-show="activeTab === 'code-style'" class="tab-content">
            <CodeStyleSection
              :code-style-list="codeStyleList"
              :selected-code-style-id="selectedCodeStyleId"
              @select="selectCodeStyle"
            />
          </div>

          <!-- 字体设置 -->
          <div v-show="activeTab === 'font-settings'" class="tab-content">
            <FontSettingsSection
              :font-family-list="fontFamilyList"
              :selected-font-family="selectedFontFamily"
              @select-font-family="selectFontFamily"
            />
          </div>

          <!-- 字号设置 -->
          <div v-show="activeTab === 'font-size-settings'" class="tab-content">
            <FontSizeSection
              :selected-font-family="selectedFontFamily"
              :selected-font-size="selectedFontSize"
              @update-font-size="updateFontSize"
            />
          </div>

          <!-- 间距设置 -->
          <div v-show="activeTab === 'spacing-settings'" class="tab-content">
            <SpacingSettingsSection
              :letter-spacing="selectedLetterSpacing"
              :line-height="selectedLineHeight"
              @update-letter-spacing="updateLetterSpacing"
              @update-line-height="updateLineHeight"
            />
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
import { ref } from 'vue'
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
  currentCustomColor,

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
  toggleColorPicker,
  closeColorPicker,
  onColorChange,
  onColorConfirm,
  resetSelections,
  applySettings
} = useSettingsPanel(props, emit)

// 标签导航状态
const activeTab = ref('theme-system')

// 标签配置
const tabs = ref([
  {
    id: 'theme-system',
    labelKey: 'settings.nav.themeSystem',
    icon: {
      viewBox: '0 0 24 24',
      path: 'M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z'
    }
  },
  {
    id: 'color-theme',
    labelKey: 'settings.nav.colorTheme',
    icon: {
      viewBox: '0 0 24 24',
      path: 'M17.5,12A1.5,1.5 0 0,1 16,10.5A1.5,1.5 0 0,1 17.5,9A1.5,1.5 0 0,1 19,10.5A1.5,1.5 0 0,1 17.5,12M14.5,8A1.5,1.5 0 0,1 13,6.5A1.5,1.5 0 0,1 14.5,5A1.5,1.5 0 0,1 16,6.5A1.5,1.5 0 0,1 14.5,8M9.5,8A1.5,1.5 0 0,1 8,6.5A1.5,1.5 0 0,1 9.5,5A1.5,1.5 0 0,1 11,6.5A1.5,1.5 0 0,1 9.5,8M6.5,12A1.5,1.5 0 0,1 5,10.5A1.5,1.5 0 0,1 6.5,9A1.5,1.5 0 0,1 8,10.5A1.5,1.5 0 0,1 6.5,12M12,3A9,9 0 0,0 3,12A9,9 0 0,0 12,21A1.5,1.5 0 0,0 13.5,19.5C13.5,19.11 13.35,18.76 13.11,18.5C12.88,18.23 12.73,17.88 12.73,17.5A1.5,1.5 0 0,1 14.23,16H16A5,5 0 0,0 21,11C21,6.58 16.97,3 12,3Z'
    }
  },
  {
    id: 'code-style',
    labelKey: 'settings.nav.codeStyle',
    icon: {
      viewBox: '0 0 24 24',
      path: 'M14.6,16.6L19.2,12L14.6,7.4L16,6L22,12L16,18L14.6,16.6M9.4,16.6L4.8,12L9.4,7.4L8,6L2,12L8,18L9.4,16.6Z'
    }
  },
  {
    id: 'font-settings',
    labelKey: 'settings.nav.font',
    icon: {
      viewBox: '0 0 24 24',
      path: 'M9,4V7H14V19H17V7H22V4H9M3,4V7H6V19H9V7H12V4H3Z'
    }
  },
  {
    id: 'font-size-settings',
    labelKey: 'settings.nav.fontSize',
    icon: {
      viewBox: '0 0 24 24',
      path: 'M11,7A2,2 0 0,1 13,9V17A2,2 0 0,1 11,19H9A2,2 0 0,1 7,17V9A2,2 0 0,1 9,7H11M9,9V17H11V9H9M12,2A2,2 0 0,1 14,4V6H12V4H10V6H8V4A2,2 0 0,1 10,2H12Z'
    }
  },
  {
    id: 'spacing-settings',
    labelKey: 'settings.nav.spacing',
    icon: {
      viewBox: '0 0 24 24',
      path: 'M3 11h18v2H3v-2m6-6h6v2H9V5m0 14h6v2H9v-2'
    }
  }
])

// 暴露方法给父组件
defineExpose({
  resetSelections
})
</script>

<style scoped>
@import '../styles/components/settings/index.css';

/* 标签导航样式 */
.settings-tabs {
  display: flex;
  gap: 4px;
  padding: 0 32px;
  margin-bottom: 24px;
  border-bottom: 1px solid var(--theme-border-light);
}

.tab-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: none;
  border: none;
  border-radius: 8px 8px 0 0;
  color: var(--theme-text-secondary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.tab-button:hover {
  background: var(--theme-bg-tertiary);
  color: var(--theme-text-primary);
}

.tab-button.active {
  background: var(--theme-bg-secondary);
  color: var(--theme-primary);
  border-bottom: 2px solid var(--theme-primary);
}

.tab-button.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--theme-primary);
}

.tab-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
}

.tab-label {
  white-space: nowrap;
}

/* 内容区域 */
.tab-content {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .settings-tabs {
    padding: 0 16px;
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  
  .settings-tabs::-webkit-scrollbar {
    display: none;
  }
  
  .tab-button {
    flex-shrink: 0;
    min-width: 120px;
    justify-content: center;
  }
}
</style>
