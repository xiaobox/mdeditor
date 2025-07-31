<template>
  <footer class="app-footer">
    <div class="footer-left">
      <span>字符数: {{ characterCount }}</span>
      <span>预计阅读时间: {{ estimatedReadTime }}分钟</span>
    </div>
    <div class="footer-right">
      <span :class="['status-indicator', isReady ? 'ready' : 'pending']">
        {{ isReady ? '已生成' : '待生成' }}
      </span>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  characterCount: {
    type: Number,
    required: true
  },
  isReady: {
    type: Boolean,
    default: false
  }
})

// 计算属性
const estimatedReadTime = computed(() => {
  const wordsPerMinute = 200 // 中文阅读速度约200字/分钟
  return Math.max(1, Math.ceil(props.characterCount / wordsPerMinute))
})



// 移除不需要的计算属性
</script>

<style scoped>
.app-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 32px;
  background: linear-gradient(135deg,
    #94a3b8 0%,
    #cbd5e1 25%,
    #e2e8f0 50%,
    #f1f5f9 75%,
    #f8fafc 100%);
  border-top: 1px solid rgba(148, 163, 184, 0.2);
  box-shadow:
    0 -8px 32px rgba(0, 0, 0, 0.06),
    0 -4px 16px rgba(0, 0, 0, 0.04),
    inset 0 -1px 0 rgba(255, 255, 255, 0.8);
  flex-shrink: 0;
  position: relative;
}

.app-footer::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg,
    var(--primary-color) 0%,
    var(--primary-hover) 50%,
    var(--primary-color) 100%);
  opacity: 0.8;
  box-shadow: 0 1px 3px rgba(var(--primary-rgb), 0.3);
}

.footer-left,
.footer-right {
  display: flex;
  align-items: center;
  gap: 24px;
}

.footer-left span,
.footer-right span {
  font-size: 14px;
  color: var(--theme-text-secondary);
  font-weight: 600;
  letter-spacing: 0.2px;
}

.status-indicator {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: var(--radius-full);
  font-size: 12px;
  font-weight: 600;
  transition: all var(--transition-fast);
}

.status-indicator::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  transition: all var(--transition-fast);
}

.status-indicator.ready {
  background-color: var(--primary-light);
  color: var(--primary-color);
}

.status-indicator.ready::before {
  background-color: var(--primary-color);
  animation: pulse 2s infinite;
}

.status-indicator.pending {
  background-color: var(--theme-bg-tertiary);
  color: var(--theme-text-tertiary);
}

.status-indicator.pending::before {
  background-color: var(--gray-400);
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .app-footer {
    padding: 10px 16px;
    flex-direction: column;
    gap: 8px;
    text-align: center;
  }
  
  .footer-left {
    gap: 16px;
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .stat-item {
    font-size: 12px;
  }
  
  .status-indicator {
    font-size: 11px;
    padding: 4px 8px;
  }
}

@media (max-width: 480px) {
  .footer-left {
    gap: 12px;
  }
  
  .stat-item span {
    display: none;
  }
  
  .stat-item {
    flex-direction: column;
    gap: 2px;
    font-size: 11px;
  }
}
</style>
