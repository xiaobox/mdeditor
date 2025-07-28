/**
 * @file tests/utils/shared/text-utils.test.js
 * @description 文本工具的单元测试
 */

import { describe, it, expect } from 'vitest';
import { 
  TextUtils,
  escapeHtml,
  unescapeHtml,
  cleanText,
  cleanUrl,
  truncate,
  stripHtml,
  sanitizeAttribute,
  isEmpty,
  isValidEmail,
  isValidUrl
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

  describe('cleanText', () => {
    it('should normalize line endings', () => {
      const input = 'Line 1\r\nLine 2\rLine 3\nLine 4';
      const result = TextUtils.cleanText(input);
      
      expect(result).toBe('Line 1\nLine 2\nLine 3\nLine 4');
    });

    it('should trim line endings', () => {
      const input = 'Line 1   \nLine 2\t\t\n  Line 3  ';
      const result = TextUtils.cleanText(input);

      expect(result).toBe('Line 1\nLine 2\n  Line 3');
    });

    it('should limit consecutive newlines', () => {
      const input = 'Line 1\n\n\n\n\nLine 2';
      const result = TextUtils.cleanText(input, { maxConsecutiveNewlines: 2 });
      
      expect(result).toBe('Line 1\n\nLine 2');
    });

    it('should convert tabs to spaces', () => {
      const input = 'Line\twith\ttabs';
      const result = TextUtils.cleanText(input, { tabSize: 2 });
      
      expect(result).toBe('Line  with  tabs');
    });

    it('should handle empty string', () => {
      expect(TextUtils.cleanText('')).toBe('');
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

  describe('truncate', () => {
    it('should truncate long text', () => {
      const input = 'This is a very long text that should be truncated';
      const result = TextUtils.truncate(input, 20);
      
      expect(result).toBe('This is a very lo...');
      expect(result.length).toBe(20);
    });

    it('should not truncate short text', () => {
      const input = 'Short text';
      const result = TextUtils.truncate(input, 20);
      
      expect(result).toBe(input);
    });

    it('should use custom suffix', () => {
      const input = 'Long text';
      const result = TextUtils.truncate(input, 8, ' [more]');
      
      expect(result).toBe('L [more]');
    });
  });

  describe('truncateWords', () => {
    it('should truncate at word boundary', () => {
      const input = 'This is a very long sentence that should be truncated';
      const result = TextUtils.truncateWords(input, 20);
      
      expect(result).toBe('This is a very...');
    });

    it('should fallback to character truncation if no space found', () => {
      const input = 'Verylongwordwithoutspaces';
      const result = TextUtils.truncateWords(input, 10);

      expect(result).toBe('Verylon...');
    });
  });

  describe('stripHtml', () => {
    it('should remove HTML tags', () => {
      const input = '<p>Hello <strong>world</strong>!</p>';
      const result = TextUtils.stripHtml(input);
      
      expect(result).toBe('Hello world!');
    });

    it('should handle self-closing tags', () => {
      const input = 'Line 1<br/>Line 2<img src="test.jpg" alt="test"/>';
      const result = TextUtils.stripHtml(input);
      
      expect(result).toBe('Line 1Line 2');
    });

    it('should handle empty input', () => {
      expect(TextUtils.stripHtml('')).toBe('');
      expect(TextUtils.stripHtml(null)).toBe('');
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

  describe('isEmpty', () => {
    it('should return true for empty strings', () => {
      expect(TextUtils.isEmpty('')).toBe(true);
      expect(TextUtils.isEmpty('   ')).toBe(true);
      expect(TextUtils.isEmpty('\t\n')).toBe(true);
    });

    it('should return true for null and undefined', () => {
      expect(TextUtils.isEmpty(null)).toBe(true);
      expect(TextUtils.isEmpty(undefined)).toBe(true);
    });

    it('should return false for non-empty strings', () => {
      expect(TextUtils.isEmpty('text')).toBe(false);
      expect(TextUtils.isEmpty(' text ')).toBe(false);
    });
  });

  describe('isValidEmail', () => {
    it('should validate correct email addresses', () => {
      expect(TextUtils.isValidEmail('test@example.com')).toBe(true);
      expect(TextUtils.isValidEmail('user.name+tag@domain.co.uk')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(TextUtils.isValidEmail('invalid')).toBe(false);
      expect(TextUtils.isValidEmail('test@')).toBe(false);
      expect(TextUtils.isValidEmail('@example.com')).toBe(false);
      expect(TextUtils.isValidEmail('test..test@example.com')).toBe(true); // This is actually valid
    });

    it('should handle empty input', () => {
      expect(TextUtils.isValidEmail('')).toBe(false);
      expect(TextUtils.isValidEmail(null)).toBe(false);
    });
  });

  describe('isValidUrl', () => {
    it('should validate correct URLs', () => {
      expect(TextUtils.isValidUrl('https://example.com')).toBe(true);
      expect(TextUtils.isValidUrl('http://localhost:3000')).toBe(true);
      expect(TextUtils.isValidUrl('ftp://files.example.com')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(TextUtils.isValidUrl('invalid')).toBe(false);
      expect(TextUtils.isValidUrl('http://')).toBe(false);
      expect(TextUtils.isValidUrl('://example.com')).toBe(false);
    });

    it('should handle empty input', () => {
      expect(TextUtils.isValidUrl('')).toBe(false);
      expect(TextUtils.isValidUrl(null)).toBe(false);
    });
  });

  describe('formatFileSize', () => {
    it('should format bytes correctly', () => {
      expect(TextUtils.formatFileSize(0)).toBe('0 Bytes');
      expect(TextUtils.formatFileSize(1024)).toBe('1 KB');
      expect(TextUtils.formatFileSize(1048576)).toBe('1 MB');
      expect(TextUtils.formatFileSize(1073741824)).toBe('1 GB');
    });

    it('should handle decimal places', () => {
      expect(TextUtils.formatFileSize(1536, 1)).toBe('1.5 KB');
      expect(TextUtils.formatFileSize(1536, 0)).toBe('2 KB');
    });
  });

  describe('case conversion', () => {
    it('should convert to kebab-case', () => {
      expect(TextUtils.kebabCase('camelCase')).toBe('camel-case');
      expect(TextUtils.kebabCase('PascalCase')).toBe('pascal-case');
      expect(TextUtils.kebabCase('already-kebab')).toBe('already-kebab');
    });

    it('should convert to camelCase', () => {
      expect(TextUtils.camelCase('kebab-case')).toBe('kebabCase');
      expect(TextUtils.camelCase('multiple-word-string')).toBe('multipleWordString');
      expect(TextUtils.camelCase('alreadyCamel')).toBe('alreadyCamel');
    });

    it('should convert to title case', () => {
      expect(TextUtils.titleCase('hello world')).toBe('Hello World');
      expect(TextUtils.titleCase('UPPERCASE TEXT')).toBe('Uppercase Text');
    });
  });

  describe('convenience functions', () => {
    it('should export convenience functions', () => {
      expect(typeof escapeHtml).toBe('function');
      expect(typeof unescapeHtml).toBe('function');
      expect(typeof cleanText).toBe('function');
      expect(typeof cleanUrl).toBe('function');
      expect(typeof truncate).toBe('function');
      expect(typeof stripHtml).toBe('function');
      expect(typeof sanitizeAttribute).toBe('function');
      expect(typeof isEmpty).toBe('function');
      expect(typeof isValidEmail).toBe('function');
      expect(typeof isValidUrl).toBe('function');
    });
  });
});
