<template>
  <footer class="app-footer">
    <div class="footer-left">
      <div class="stat-item">
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path fill="currentColor" d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
        </svg>
        <span>{{ characterCount }} 字符</span>
      </div>
      <div class="stat-item">
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path fill="currentColor" d="M3,3H21V5H3V3M3,7H21V9H3V7M3,11H21V13H3V11M3,15H21V17H3V15M3,19H21V21H3V19Z"/>
        </svg>
        <span>{{ lineCount }} 行</span>
      </div>
      <div class="stat-item">
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path fill="currentColor" d="M17,7H22V17H17V19A1,1 0 0,0 18,20H20V22H17.5C16.95,22 16,21.55 16,21C16,21.55 15.05,22 14.5,22H12V20H14A1,1 0 0,0 15,19V5A1,1 0 0,0 14,4H12V2H14.5C15.05,2 16,2.45 16,3C16,2.45 16.95,2 17.5,2H20V4H18A1,1 0 0,0 17,5V7M2,7H13V9H4V15H13V17H2V7Z"/>
        </svg>
        <span>{{ wordCount }} 词</span>
      </div>
      <div class="stat-item">
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path fill="currentColor" d="M12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C6.47,22 2,17.5 2,12A10,10 0 0,1 12,2M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z"/>
        </svg>
        <span>{{ estimatedReadTime }} 分钟</span>
      </div>
    </div>

  </footer>
</template>

<script setup>
const props = defineProps({
  characterCount: { type: Number, required: true },
  lineCount: { type: Number, required: true },
  wordCount: { type: Number, required: true },
  estimatedReadTime: { type: Number, required: true },
})
</script>

<style scoped>
@import '../../styles/components/layout/app-footer.css';
</style>
