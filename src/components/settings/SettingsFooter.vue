<template>
  <div class="settings-footer">
    <button 
      class="apply-button"
      @click="$emit('apply')"
    >
      {{ $t('settings.footer.apply') }}
    </button>
  </div>
</template>

<script setup>

defineEmits(['apply'])
</script>

<style scoped>
.settings-footer {
  padding: var(--spacing-xl) var(--spacing-3xl);
  background: linear-gradient(135deg, var(--theme-bg-secondary), var(--theme-bg-primary));
  border-top: 1px solid var(--theme-border-light);
  display: flex;
  justify-content: flex-end;
  box-shadow: var(--shadow-md);
}

.apply-button {
  background: var(--theme-primary);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
  letter-spacing: -0.3px;
}

.apply-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.18);
  background: var(--theme-primary-hover);
}

.apply-button:active {
  transform: translateY(0);
}
</style>
