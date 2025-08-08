<template>
  <section class="settings-section">
    <div class="section-header">
      <div class="section-icon">
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path fill="currentColor" d="M3 11h18v2H3v-2m6-6h6v2H9V5m0 14h6v2H9v-2"/>
        </svg>
      </div>
      <h3>间距</h3>
    </div>

    <!-- 字间距设置卡片 -->
    <div class="font-size-card">
      <div class="font-setting-group">
        <label class="font-setting-label">字间距</label>
        <div class="font-size-top-section">
          <!-- 左侧滑块区域 -->
          <div class="font-size-slider-area">
            <input
              class="font-size-slider"
              type="range"
              min="-1"
              max="5"
              step="0.5"
              :value="letterSpacing"
              @input="$emit('update-letter-spacing', parseFloat($event.target.value))"
            />
            <div class="font-size-marks">
              <span class="font-size-mark">-1</span>
              <span class="font-size-mark">2</span>
              <span class="font-size-mark">5</span>
            </div>
          </div>

          <!-- 右侧预览区域 -->
          <div class="font-size-preview-area">
            <div class="preview-display">
              <div class="preview-info">
                <span class="current-size">{{ letterSpacing }}</span>
                <span class="size-unit">px</span>
              </div>
              <div class="preview-char" :style="{ letterSpacing: letterSpacing + 'px' }">
                字间距
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 行间距设置卡片 -->
    <div class="font-size-card">
      <div class="font-setting-group">
        <label class="font-setting-label">行间距</label>
        <div class="font-size-top-section">
          <!-- 左侧滑块区域 -->
          <div class="font-size-slider-area">
            <input
              class="font-size-slider"
              type="range"
              min="1.2"
              max="2.4"
              step="0.1"
              :value="lineHeight"
              @input="$emit('update-line-height', parseFloat($event.target.value))"
            />
            <div class="font-size-marks">
              <span class="font-size-mark">1.2</span>
              <span class="font-size-mark">1.8</span>
              <span class="font-size-mark">2.4</span>
            </div>
          </div>

          <!-- 右侧预览区域 -->
          <div class="font-size-preview-area">
            <div class="preview-display">
              <div class="preview-info">
                <span class="current-size">{{ lineHeight }}</span>
                <span class="size-unit"></span>
              </div>
              <div class="preview-char" :style="{ lineHeight: lineHeight }">
                行<br>间<br>距
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const props = defineProps({
  letterSpacing: { type: Number, default: 0 },
  lineHeight: { type: Number, default: 1.6 }
})

defineEmits(['update-letter-spacing', 'update-line-height'])
</script>

<style scoped>
@import '../../styles/components/settings/section.css';
@import '../../styles/components/settings/font.css';

.font-setting-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--theme-text-primary);
  margin-bottom: 16px;
}
</style>

