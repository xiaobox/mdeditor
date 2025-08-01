<template>
  <section class="settings-section">
    <div class="section-header">
      <div class="section-icon">
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path fill="currentColor" d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z"/>
        </svg>
      </div>
      <h3>主题风格</h3>
    </div>

    <div class="theme-system-grid">
      <div
        v-for="themeSystem in layoutList"
        :key="themeSystem.id"
        class="theme-system-card"
        :class="{ active: selectedThemeSystemId === themeSystem.id }"
        @click="$emit('select', themeSystem.id)"
      >
        <div class="theme-system-preview">
          <div class="theme-system-header">
            <div class="theme-system-title">{{ themeSystem.name }}</div>
            <div class="theme-system-colors">
              <span
                v-for="colorId in themeSystem.supportedColors.slice(0, 4)"
                :key="colorId"
                class="color-dot"
                :style="{ backgroundColor: getColorPreview(colorId) }"
              ></span>
              <span v-if="themeSystem.supportedColors.length > 4" class="color-more">
                +{{ themeSystem.supportedColors.length - 4 }}
              </span>
            </div>
          </div>
          <div class="theme-system-description">{{ themeSystem.description }}</div>
        </div>

        <div class="theme-system-check" v-if="selectedThemeSystemId === themeSystem.id">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="10" fill="var(--theme-primary, #10b981)"/>
            <path d="M6 10l3 3 5-6" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({
  layoutList: {
    type: Array,
    required: true
  },
  selectedThemeSystemId: {
    type: String,
    required: true
  }
})

defineEmits(['select'])

// 获取颜色预览
const getColorPreview = (colorId) => {
  const colorMap = {
    chijin: '#FF0097',
    dianlan: '#56004F',
    ehuang: '#FFA631',
    conglv: '#0AA344',
    shiliuhong: '#F20C00',
    meihei: '#312C20',
    ganziqing: '#003371',
    xuanse: '#622A1D'
  }
  return colorMap[colorId] || '#312C20'
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
  border-color: var(--primary-color);
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
  background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
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

.theme-system-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 20px;
}

.theme-system-card {
  position: relative;
  background: var(--theme-bg-secondary);
  border: 1px solid var(--theme-border-light);
  border-radius: 16px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.theme-system-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  border-color: var(--primary-color);
}

.theme-system-card.active {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px var(--primary-color), 0 8px 32px rgba(0, 0, 0, 0.15);
  transform: translateY(-3px);
  background: linear-gradient(135deg, var(--theme-bg-secondary), var(--theme-bg-primary));
}

.theme-system-preview {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.theme-system-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.theme-system-title {
  font-weight: 700;
  font-size: 18px;
  color: var(--theme-text-primary);
  transition: all 0.3s ease;
  letter-spacing: -0.3px;
}

.theme-system-card:hover .theme-system-title {
  color: var(--primary-color);
}

.theme-system-colors {
  display: flex;
  align-items: center;
  gap: 6px;
}

.color-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid var(--theme-bg-primary);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.theme-system-card:hover .color-dot {
  transform: scale(1.1);
}

.color-more {
  font-size: 12px;
  color: var(--theme-text-secondary);
  margin-left: 4px;
  font-weight: 600;
}

.theme-system-description {
  font-size: 14px;
  color: var(--theme-text-secondary);
  line-height: 1.5;
  font-weight: 500;
}

.theme-system-check {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 10;
  background: var(--theme-bg-primary);
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  border: 2px solid var(--primary-color);
}

@keyframes shimmer {
  0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
  100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
}
</style>
