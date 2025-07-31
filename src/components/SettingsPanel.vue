<template>
  <div class="settings-panel" :class="{ 'disable-hover': showColorPicker }" v-if="visible">
    <div class="settings-overlay" @click="$emit('close')" v-show="!showColorPicker"></div>
    <div class="settings-content">
      <!-- 设置面板头部 -->
      <SettingsHeader @close="$emit('close')" />

      <div class="settings-body">
        <div class="settings-sections">
          <!-- 主题系统设置 -->
          <ThemeSystemSection
            :layout-list="layoutList"
            :selected-theme-system-id="selectedThemeSystemId"
            @select="selectThemeSystem"
          />

          <!-- 主题色设置 -->
          <ColorThemeSection
            :builtin-color-themes="builtinColorThemes"
            :selected-theme-id="selectedThemeId"
            :is-custom-color-active="isCustomColorActive"
            :current-custom-color="currentCustomColor"
            @select-theme="selectTheme"
            @toggle-color-picker="toggleColorPicker"
          />

          <!-- 代码样式设置 -->
          <CodeStyleSection
            :code-style-list="codeStyleList"
            :selected-code-style-id="selectedCodeStyleId"
            @select="selectCodeStyle"
          />

          <!-- 字体设置 -->
          <FontSettingsSection
            :font-family-list="fontFamilyList"
            :selected-font-family="selectedFontFamily"
            :selected-font-size="selectedFontSize"
            @select-font-family="selectFontFamily"
            @update-font-size="updateFontSize"
          />
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
import { useSettingsPanel } from '../composables/useSettingsPanel.js'
import SettingsHeader from './settings/SettingsHeader.vue'
import SettingsFooter from './settings/SettingsFooter.vue'
import ThemeSystemSection from './settings/ThemeSystemSection.vue'
import ColorThemeSection from './settings/ColorThemeSection.vue'
import CodeStyleSection from './settings/CodeStyleSection.vue'
import FontSettingsSection from './settings/FontSettingsSection.vue'
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
  adjustColorBrightness,
  toggleColorPicker,
  closeColorPicker,
  onColorChange,
  onColorConfirm,
  resetSelections,
  applySettings
} = useSettingsPanel(props, emit)

// 暴露方法给父组件
defineExpose({
  resetSelections
})
</script>

<style scoped>
@import '../styles/components/settings/index.css';
</style>