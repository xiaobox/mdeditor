<template>
  <section class="settings-section">
    <div class="section-header">
      <div class="section-icon">
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path fill="currentColor" d="M9,4V7H14V4H16V7H17A1,1 0 0,1 18,8V18A1,1 0 0,1 17,19H7A1,1 0 0,1 6,18V8A1,1 0 0,1 7,7H8V4H9M8,9V17H16V9H8Z"/>
        </svg>
      </div>
      <h3>{{ $t('settings.nav.font') }}</h3>
    </div>

    <!-- OS 提示信息 -->
    <div class="font-os-notice">
      <svg class="notice-icon" viewBox="0 0 20 20" width="14" height="14">
        <path fill="currentColor" d="M10 2a8 8 0 100 16 8 8 0 000-16zm.75 4.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM9.25 9a.75.75 0 011.5 0v4a.75.75 0 01-1.5 0V9z"/>
      </svg>
      <span>
        {{ tn('settings.fontFamily.osNotice', `已识别当前系统为 ${availableFonts.osName}，以下是该系统支持的字体。`, { osName: availableFonts.osName }) }}
      </span>
    </div>

    <!-- 按类别分组 -->
    <div
      v-for="group in availableFonts.categories"
      :key="group.id"
      class="font-category-group"
    >
      <div class="font-category-label">
        {{ tn(`settings.fontFamily.category.${group.id}`, categoryNames[group.id]) }}
      </div>
      <div class="font-family-grid">
        <div
          v-for="font in group.fonts"
          :key="font.id"
          class="font-family-card"
          :class="{ active: selectedFontFamily === font.id }"
          @click="$emit('select-font-family', font.id)"
        >
          <div class="font-family-preview" :style="getFontPreviewStyle(font.id)">
            <div class="font-preview-text">{{ font.preview || 'Aa 中文' }}</div>
          </div>
          <div class="font-family-info">
            <div class="font-family-name">{{ tn(`settings.fontFamily.items.${font.id}.name`, font.id) }}</div>
            <div class="font-family-description">{{ tn(`settings.fontFamily.items.${font.id}.description`, '') }}</div>
          </div>
          <div class="font-family-check" v-if="selectedFontFamily === font.id">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="10" fill="var(--theme-primary, #10b981)"/>
              <path d="M6 10l3 3 5-6" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { fontSettingsUtils, FONT_CATEGORIES } from '../../core/theme/index.js'
import { useI18n } from 'vue-i18n'

const { t, te } = useI18n()
const tn = (key, fallback, values) => (te(key) ? t(key, values) : fallback)

const categoryNames = {
  [FONT_CATEGORIES.SANS_SERIF]: '无衬线字体',
  [FONT_CATEGORIES.SERIF]: '衬线字体',
  [FONT_CATEGORIES.MONOSPACE]: '等宽字体'
}

const props = defineProps({
  availableFonts: {
    type: Object,
    required: true
  },
  selectedFontFamily: {
    type: String,
    required: true
  }
})

defineEmits(['select-font-family'])

const getFontPreviewStyle = (fontId) => {
  return fontSettingsUtils.getPreviewStyle(fontId, 14)
}
</script>

<style scoped>
@import '../../styles/components/settings/section.css';
@import '../../styles/components/settings/font.css';
</style>
