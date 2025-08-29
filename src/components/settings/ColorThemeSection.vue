<template>
  <section class="settings-section">
    <div class="section-header">
      <div class="section-icon">
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path fill="currentColor" d="M17.5,12A1.5,1.5 0 0,1 16,10.5A1.5,1.5 0 0,1 17.5,9A1.5,1.5 0 0,1 19,10.5A1.5,1.5 0 0,1 17.5,12M14.5,8A1.5,1.5 0 0,1 13,6.5A1.5,1.5 0 0,1 14.5,5A1.5,1.5 0 0,1 16,6.5A1.5,1.5 0 0,1 14.5,8M9.5,8A1.5,1.5 0 0,1 8,6.5A1.5,1.5 0 0,1 9.5,5A1.5,1.5 0 0,1 11,6.5A1.5,1.5 0 0,1 9.5,8M6.5,12A1.5,1.5 0 0,1 5,10.5A1.5,1.5 0 0,1 6.5,9A1.5,1.5 0 0,1 8,10.5A1.5,1.5 0 0,1 6.5,12M12,3A9,9 0 0,0 3,12A9,9 0 0,0 12,21A8.5,8.5 0 0,0 16.5,19C15.9,18.7 15.2,18.4 14.5,18.1C13.3,17.6 12,17 12,17C12,17 13.3,17.6 14.5,18.1C15.2,18.4 15.9,18.7 16.5,19A8.5,8.5 0 0,0 12,3Z"/>
        </svg>
      </div>
      <h3>{{ $t('settings.nav.colorTheme') }}</h3>
    </div>

    <div class="theme-grid">
      <!-- 内置主题 -->
      <div
        v-for="theme in builtinColorThemes"
        :key="theme.id"
        class="theme-card"
        :class="{ active: selectedThemeId === theme.id }"
        @click="$emit('select-theme', theme.id)"
      >
        <div class="theme-preview">
          <div class="theme-color-bar" :style="{ backgroundColor: theme.primary }"></div>
          <div class="theme-content">
            <div class="theme-title" :style="{ color: theme.primary }">{{ tn(`settings.colorTheme.items.${theme.id}.name`, theme.name) }}</div>
            <div class="theme-description">{{ tn(`settings.colorTheme.items.${theme.id}.description`, theme.description) }}</div>
          </div>
        </div>

        <div class="theme-check" v-if="selectedThemeId === theme.id">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="10" :fill="theme.primary"/>
            <path d="M6 10l3 3 5-6" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>

      <!-- 自定义颜色选择器 -->
      <div
        class="theme-card custom-color-card"
        :class="{ active: isCustomColorActive }"
        @click="$emit('toggle-color-picker')"
      >
        <div class="custom-color-preview">
          <!-- 动态渐变背景 -->
          <div
            class="custom-gradient-bg"
            :style="isCustomColorActive && currentCustomColor ?
              { background: `linear-gradient(135deg, ${currentCustomColor} 0%, ${adjustColorBrightness(currentCustomColor, 0.7)} 100%)` } :
              {}"
          ></div>

          <!-- 内容区域 -->
          <div class="custom-content">
            <div class="custom-icon">
              <svg viewBox="0 0 24 24" width="18" height="18">
                <path fill="currentColor" d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z"/>
              </svg>
            </div>
            <div class="custom-text">
              <div class="custom-title">{{ $t('settings.color.customColor') }}</div>
              <div class="custom-subtitle">{{ $t('settings.color.pickAny') }}</div>
            </div>
          </div>

          <!-- 选中状态指示器 -->
          <div v-if="isCustomColorActive" class="custom-check-indicator">
            <!-- 如果有自定义颜色，显示颜色圆圈 + 勾选 -->
            <div
              v-if="currentCustomColor"
              class="color-check-combo"
              :style="{ backgroundColor: currentCustomColor }"
            >
              <svg viewBox="0 0 24 24" width="12" height="12">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="white"/>
              </svg>
            </div>
            <!-- 如果没有自定义颜色，显示普通勾选 -->
            <div v-else class="simple-check">
              <svg viewBox="0 0 24 24" width="14" height="14">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="white"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
const { t, te } = useI18n()
const tn = (key, fallback) => (te(key) ? t(key) : fallback)

defineProps({
  builtinColorThemes: {
    type: Array,
    required: true
  },
  selectedThemeId: {
    type: String,
    default: null
  },
  isCustomColorActive: {
    type: Boolean,
    default: false
  },
  currentCustomColor: {
    type: String,
    default: null
  }
})

defineEmits(['select-theme', 'toggle-color-picker'])

// 颜色处理辅助函数
const adjustColorBrightness = (color, factor) => {
  if (!color) return color

  // 处理十六进制颜色
  if (color.startsWith('#')) {
    const hex = color.slice(1)
    const num = parseInt(hex, 16)
    const r = Math.round((num >> 16) * factor)
    const g = Math.round(((num >> 8) & 0x00FF) * factor)
    const b = Math.round((num & 0x0000FF) * factor)
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
  }

  return color
}
</script>

<style scoped>
.settings-section {
  background: var(--theme-bg-primary);
  border: 1px solid var(--theme-border-light);
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.settings-section:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border-color: var(--theme-primary);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--theme-border-light);
}

.section-icon {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, var(--theme-primary), var(--theme-primary-hover));
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.section-icon::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transform: rotate(45deg);
  animation: shimmer 3s infinite;
}

.section-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--theme-text-primary);
  letter-spacing: -0.5px;
}

.theme-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
}

.theme-card {
  position: relative;
  background: var(--theme-bg-secondary);
  border: 1px solid var(--theme-border-light);
  border-radius: 16px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.theme-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  border-color: var(--theme-primary);
}

.theme-card.active {
  border-color: var(--theme-primary);
  box-shadow: 0 0 0 2px var(--theme-primary), 0 8px 32px rgba(0, 0, 0, 0.15);
  transform: translateY(-3px);
  background: linear-gradient(135deg, var(--theme-bg-secondary), var(--theme-bg-primary));
}

.theme-preview {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.theme-color-bar {
  height: 6px;
  border-radius: 3px;
  width: 100%;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.theme-card:hover .theme-color-bar {
  height: 8px;
  transform: scaleX(1.02);
}

.theme-content {
  flex: 1;
}

.theme-title {
  font-weight: 700;
  font-size: 16px;
  margin-bottom: 6px;
  transition: all 0.3s ease;
  letter-spacing: -0.3px;
}

.theme-card:hover .theme-title {
  transform: translateX(3px);
}

.theme-description {
  font-size: 13px;
  color: var(--theme-text-secondary);
  font-weight: 500;
  line-height: 1.4;
}

.theme-check {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
}

/* 自定义颜色卡片样式 */
.custom-color-card {
  position: relative;
  overflow: hidden;
}

.custom-color-preview {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 16px;
  border-radius: 12px;
  overflow: hidden;
}

.custom-gradient-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg,
    #667eea 0%,
    #764ba2 25%,
    #f093fb 50%,
    #f5576c 75%,
    #4facfe 100%);
  background-size: 300% 300%;
  animation: gradientShift 8s ease infinite;
  opacity: 0.9;
}

.custom-color-card.active .custom-gradient-bg {
  opacity: 1;
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.custom-content {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 12px;
  color: white;
}

.custom-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.custom-icon svg {
  opacity: 0.9;
}

.custom-text {
  flex: 1;
}

.custom-title {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 2px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.custom-subtitle {
  font-size: 12px;
  opacity: 0.9;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

/* 选中状态指示器 */
.custom-check-indicator {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 3;
}

.color-check-combo {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
}

.simple-check {
  width: 22px;
  height: 22px;
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

/* 悬停效果 */
.custom-color-card:hover .custom-gradient-bg {
  animation-duration: 4s;
  opacity: 1;
}

.custom-color-card:hover .custom-icon {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
  transition: all 0.3s ease;
}

/* 选中状态 */
.custom-color-card.active {
  border-color: rgba(255, 255, 255, 0.6);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.custom-color-card.active .custom-icon {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
}

.custom-color-card .theme-title {
  color: white !important;
}

.custom-color-card .theme-description {
  color: rgba(255, 255, 255, 0.8);
}

@keyframes shimmer {
  0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
  100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
}
</style>
