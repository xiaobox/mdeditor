<template>
  <div class="settings-footer">
    <button 
      class="apply-button"
      :style="{ backgroundColor: currentColorTheme.primary, borderColor: currentColorTheme.primary }"
      @click="$emit('apply')"
    >
      应用设置
    </button>
  </div>
</template>

<script setup>
defineProps({
  currentColorTheme: {
    type: Object,
    required: true
  }
})

defineEmits(['apply'])
</script>

<style scoped>
.settings-footer {
  padding: 32px 40px;
  background: linear-gradient(135deg, var(--theme-bg-secondary), var(--theme-bg-primary));
  border-top: 1px solid var(--theme-border-light);
  display: flex;
  justify-content: flex-end;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
}

.apply-button {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
  color: white;
  border: none;
  padding: 16px 32px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
  letter-spacing: -0.3px;
}

.apply-button::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transform: rotate(45deg);
  transition: all 0.3s ease;
  opacity: 0;
}

.apply-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.apply-button:hover::before {
  opacity: 1;
  animation: shimmer 0.6s ease-in-out;
}

.apply-button:active {
  transform: translateY(0);
}

@keyframes shimmer {
  0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
  100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
}
</style>
