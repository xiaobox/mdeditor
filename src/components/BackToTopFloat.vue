<template>
  <transition name="btf-fade">
    <button
      v-if="visible"
      class="btf"
      :title="title || '回到顶部'"
      aria-label="回到顶部"
      @click="scrollToTop"
    >
      <svg viewBox="0 0 1024 1024" width="32" height="32" aria-hidden="true">
        <path fill="currentColor" d="M514.7 101.6c-228.3 0-413.3 185.1-413.3 413.3s185.1 413.3 413.3 413.3c228.2 0.1 413.3-185 413.3-413.2S742.9 101.6 514.7 101.6zM385.5 320.5h246.2c11.6 0 21.1 9.2 21.1 20.6 0 11.4-9.4 20.6-21.1 20.6H385.5c-11.6 0-21.1-9.2-21.1-20.6 0-11.4 9.4-20.6 21.1-20.6z m267.4 245.1c-10.2 9.9-26.7 9.9-36.8 0l-86.4-84.2v219.7c0 11.4-9.4 20.6-21.1 20.6-11.6 0-21.1-9.2-21.1-20.6V481.3l-86.4 84.2c-10.2 9.9-26.7 9.9-36.8 0-10.2-9.9-10.2-26 0-35.9L490.1 407s0-0.1 0.1-0.1c5.1-5 11.8-7.4 18.4-7.4 6.7 0 13.3 2.5 18.4 7.4 0 0 0 0.1 0.1 0.1l125.8 122.7c10.2 9.9 10.2 25.9 0 35.9z"/>
      </svg>
    </button>
  </transition>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  threshold: { type: Number, default: 50 },
  title: { type: String, default: '回到顶部' }
})

const visible = ref(false)
let editorScroller = null
let previewScroller = null
let domObserver = null
let rebindTimeout = null
let checkTimer = null

const updateVisibility = () => {
  try {
    const e = document.querySelector('.cm-scroller')
    const p = document.querySelector('.preview-rendered, .wysiwyg-rendered')
    const eTop = e ? e.scrollTop : 0
    const pTop = p ? p.scrollTop : 0
    visible.value = (eTop > props.threshold) || (pTop > props.threshold)
  } catch (e) {
    // ignore
  }
}

const onScroll = () => updateVisibility()

const bind = () => {
  unbind()
  editorScroller = document.querySelector('.cm-scroller')
  previewScroller = document.querySelector('.preview-rendered, .wysiwyg-rendered')
  if (editorScroller) editorScroller.addEventListener('scroll', onScroll, { passive: true })
  if (previewScroller) previewScroller.addEventListener('scroll', onScroll, { passive: true })
  updateVisibility()
}

const unbind = () => {
  if (editorScroller) editorScroller.removeEventListener('scroll', onScroll)
  if (previewScroller) previewScroller.removeEventListener('scroll', onScroll)
  editorScroller = null
  previewScroller = null
}

// Rebind helpers for dynamic view-mode changes
const scheduleRebind = () => {
  if (rebindTimeout) clearTimeout(rebindTimeout)
  rebindTimeout = setTimeout(() => {
    bind()
    updateVisibility()
  }, 150)
}

const scrollToTop = () => {
  try {
    const e = document.querySelector('.cm-scroller')
    const p = document.querySelector('.preview-rendered, .wysiwyg-rendered')
    if (typeof window !== 'undefined') window.__scrollSyncLock = true
    if (e && typeof e.scrollTo === 'function') e.scrollTo({ top: 0, behavior: 'smooth' })
    else if (e) e.scrollTop = 0
    if (p && typeof p.scrollTo === 'function') p.scrollTo({ top: 0, behavior: 'smooth' })
    else if (p) p.scrollTop = 0
    if (typeof window !== 'undefined') setTimeout(() => { window.__scrollSyncLock = false }, 200)
  } catch (err) {
    // ignore
  }
}

onMounted(() => {
  bind()
  document.addEventListener('visibilitychange', updateVisibility)

  // Observe DOM changes to rebind when panes mount/unmount (e.g., switching modes)
  const root = document.getElementById('app') || document.body
  if (root && typeof MutationObserver !== 'undefined') {
    domObserver = new MutationObserver(() => scheduleRebind())
    domObserver.observe(root, { childList: true, subtree: true })
  }

  // Fallback periodic check to ensure listeners are attached
  checkTimer = setInterval(() => {
    const eExists = !!document.querySelector('.cm-scroller')
    const pExists = !!document.querySelector('.preview-rendered, .wysiwyg-rendered')
    if ((eExists && !editorScroller) || (pExists && !previewScroller)) scheduleRebind()
  }, 1500)
})

onUnmounted(() => {
  document.removeEventListener('visibilitychange', updateVisibility)
  unbind()
  if (domObserver) { domObserver.disconnect(); domObserver = null }
  if (checkTimer) { clearInterval(checkTimer); checkTimer = null }
})
</script>

<style scoped>
.btf {
  position: fixed;
  right: var(--spacing-4xl);
  bottom: calc(var(--spacing-4xl) + 56px); /* 悬浮于 footer 上方 */
  width: 48px;
  height: 48px;
  border-radius: 12px;
  border: 1px solid var(--theme-border-light);
  background: var(--theme-bg-primary);
  color: var(--theme-primary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 6px 18px rgba(0,0,0,0.12);
  transition: all 0.2s ease;
  z-index: 1000;
}
.btf:hover {
  background: var(--theme-bg-secondary);
  color: var(--theme-primary-hover);
  border-color: var(--theme-primary);
  transform: translateY(-1px);
}
.btf:active {
  color: var(--theme-primary-dark);
  transform: translateY(0);
}

/* 小进入/离场动效 */
.btf-fade-enter-active, .btf-fade-leave-active { transition: opacity .15s, transform .15s; }
.btf-fade-enter-from, .btf-fade-leave-to { opacity: 0; transform: translateY(8px); }
</style>

