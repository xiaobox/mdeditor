/**
 * @file tests/utils/shared/text-utils.test.js
 * @description 文本工具的单元测试
 */

import { describe, it, expect } from 'vitest';
import {
  TextUtils,
  escapeHtml,
  cleanUrl,
  sanitizeAttribute
} from '../../../src/shared/utils/text.js';

describe('TextUtils', () => {
  describe('escapeHtml', () => {
    it('should escape HTML special characters', () => {
      const input = '<script>alert("XSS")</script>';
      const expected = '&lt;script&gt;alert(&quot;XSS&quot;)&lt;&#x2F;script&gt;';
      
      expect(TextUtils.escapeHtml(input)).toBe(expected);
    });

    it('should handle empty string', () => {
      expect(TextUtils.escapeHtml('')).toBe('');
    });

    it('should handle null and undefined', () => {
      expect(TextUtils.escapeHtml(null)).toBe('');
      expect(TextUtils.escapeHtml(undefined)).toBe('');
    });

    it('should escape all special characters', () => {
      const input = '&<>"\'\/';
      const expected = '&amp;&lt;&gt;&quot;&#39;&#x2F;';
      
      expect(TextUtils.escapeHtml(input)).toBe(expected);
    });
  });

  describe('unescapeHtml', () => {
    it('should unescape HTML entities', () => {
      const input = '&lt;script&gt;alert(&quot;XSS&quot;)&lt;&#x2F;script&gt;';
      const expected = '<script>alert("XSS")</script>';
      
      expect(TextUtils.unescapeHtml(input)).toBe(expected);
    });

    it('should handle empty string', () => {
      expect(TextUtils.unescapeHtml('')).toBe('');
    });

    it('should handle text without entities', () => {
      const input = 'Normal text';
      expect(TextUtils.unescapeHtml(input)).toBe(input);
    });
  });



  describe('cleanUrl', () => {
    it('should add default protocol', () => {
      const input = 'example.com';
      const result = TextUtils.cleanUrl(input);

      expect(result).toBe('https://example.com/');
    });

    it('should preserve existing protocol', () => {
      const input = 'http://example.com';
      const result = TextUtils.cleanUrl(input);

      expect(result).toBe('http://example.com/');
    });

    it('should handle mailto links', () => {
      const input = 'mailto:test@example.com';
      const result = TextUtils.cleanUrl(input);
      
      expect(result).toBe('mailto:test@example.com');
    });

    it('should reject invalid protocols', () => {
      const input = 'javascript:alert("XSS")';
      const result = TextUtils.cleanUrl(input);
      
      expect(result).toBe('');
    });

    it('should handle empty input', () => {
      expect(TextUtils.cleanUrl('')).toBe('');
      expect(TextUtils.cleanUrl(null)).toBe('');
    });
  });






  describe('sanitizeAttribute', () => {
    it('should sanitize attribute values', () => {
      const input = 'value with "quotes" and <tags>';
      const result = TextUtils.sanitizeAttribute(input);
      
      expect(result).toBe('value with &quot;quotes&quot; and &lt;tags&gt;');
    });

    it('should replace newlines with spaces', () => {
      const input = 'value\nwith\rnewlines';
      const result = TextUtils.sanitizeAttribute(input);
      
      expect(result).toBe('value with newlines');
    });
  });






  describe('convenience functions', () => {
    it('should export convenience functions', () => {
      expect(typeof escapeHtml).toBe('function');
      expect(typeof cleanUrl).toBe('function');
      expect(typeof sanitizeAttribute).toBe('function');
    });
  });
});
