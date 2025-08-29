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

    <!-- 字体族选择 -->
    <div class="font-setting-group">
      <label class="font-setting-label">{{ $t('settings.font.family') }}</label>
      <div class="font-family-grid">
        <div
          v-for="font in fontFamilyList"
          :key="font.id"
          class="font-family-card"
          :class="{ active: selectedFontFamily === font.id }"
          @click="$emit('select-font-family', font.id)"
        >
          <div class="font-family-preview" :style="getFontPreviewStyle(font.id)">
            <div class="font-preview-text">Aa</div>
          </div>
          <div class="font-family-info">
            <div class="font-family-name">{{ tn(`settings.fontFamily.items.${font.id}.name`, font.name) }}</div>
            <div class="font-family-description">{{ tn(`settings.fontFamily.items.${font.id}.description`, font.description) }}</div>
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
import { fontSettingsUtils } from '../../core/theme/index.js'
import { useI18n } from 'vue-i18n'

const { t, te } = useI18n()
const tn = (key, fallback) => (te(key) ? t(key) : fallback)

const props = defineProps({
  fontFamilyList: {
    type: Array,
    required: true
  },
  selectedFontFamily: {
    type: String,
    required: true
  }
})

defineEmits(['select-font-family'])

// 字体预览相关方法
const getFontPreviewStyle = (fontId) => {
  return fontSettingsUtils.getPreviewStyle(fontId, 14)
}
</script>

<style scoped>
@import '../../styles/components/settings/section.css';
@import '../../styles/components/settings/font.css';


</style>
