/**
 * @file src/shared/utils/sanitize.js
 * @description HTML sanitization utility using DOMPurify
 *
 * Centralizes DOMPurify configuration for all v-html rendering boundaries.
 * Blocks XSS vectors while preserving inline styles, CSS classes, SVG (Mermaid),
 * and MathML (KaTeX/MathJax) content needed for preview rendering.
 *
 * Per D-09: Social copy and PDF/image export pipelines do NOT use this module.
 * They have independent sanitization and do not render through v-html.
 */

import DOMPurify from 'dompurify'

/**
 * DOMPurify configuration for the preview pipeline.
 *
 * Default allow-list already includes:
 *   - HTML tags (div, span, p, h1-h6, a, img, table, etc.)
 *   - SVG tags (svg, g, path, circle, rect, line, text, defs, etc.)
 *   - MathML tags (math, mi, mo, mn, mrow, mfrac, msqrt, etc.)
 *   - Attributes: style, class, d, viewBox, xmlns, fill, stroke, etc.
 *
 * Only FORBID_TAGS for defense-in-depth (per D-03) and
 * ALLOW_DATA_ATTR: false (per D-04) are configured.
 */
const SANITIZE_CONFIG = Object.freeze({
  FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input', 'textarea'],
  ALLOW_DATA_ATTR: false,
})

/**
 * Sanitize HTML for safe v-html rendering.
 *
 * Strips dangerous elements (script, iframe, object, embed, form, input, textarea)
 * and event handler attributes while preserving legitimate styled HTML, SVG, and MathML.
 *
 * @param {string} html - raw HTML string to sanitize
 * @returns {string} sanitized HTML string safe for v-html binding
 */
export function sanitizeHtml(html) {
  if (!html) return ''
  return DOMPurify.sanitize(html, SANITIZE_CONFIG)
}
