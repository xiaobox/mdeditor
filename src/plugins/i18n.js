/**
 * @file src/plugins/i18n.js
 * Vue I18n plugin setup
 */
import { createI18n } from 'vue-i18n'
import zhCN from '../locales/zh-CN.json'
import en from '../locales/en.json'

const SUPPORTED = ['zh-CN', 'en']

function detectLocale() {
  try {
    const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('locale') : null
    if (saved && SUPPORTED.includes(saved)) return saved
  } catch {}
  // 默认显示中文
  return 'zh-CN'
}

export const i18n = createI18n({
  legacy: false,
  locale: detectLocale(),
  fallbackLocale: 'en',
  messages: {
    'zh-CN': zhCN,
    en
  }
})

export function setI18nLocale(newLocale) {
  if (!SUPPORTED.includes(newLocale)) return
  i18n.global.locale.value = newLocale
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem('locale', newLocale)
  } catch {}
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('lang', newLocale)
  }
}

// Initialize document lang on load
if (typeof document !== 'undefined') {
  document.documentElement.setAttribute('lang', i18n.global.locale.value)
}

