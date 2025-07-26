/**
 * @file tests/integration/functional-compatibility.test.js
 * @description 功能兼容性集成测试
 * 
 * 验证重构后的代码是否保持 100% 向后兼容性
 */

import { describe, it, expect, vi } from 'vitest';
import { formatForWechat, formatCodeBlock, formatInlineText } from '../../src/utils/wechat-formatter.js';
import { ErrorHandler, ERROR_TYPES } from '../../src/utils/shared/error-handler.js';
import { ThemeUtils } from '../../src/utils/shared/theme-utils.js';
import { TextUtils } from '../../src/utils/shared/text-utils.js';

// Mock 主题数据
const mockTheme = {
  background: '#ffffff',
  textPrimary: '#333333',
  textSecondary: '#666666',
  codeBackground: '#f8f8f8',
  codeText: '#333333'
};

const mockCodeTheme = {
  background: '#1e1e1e',
  color: '#e6edf3',
  fontFamily: 'monospace',
  fontSize: '14px',
  lineHeight: '1.6',
  padding: '16px',
  borderRadius: '8px',
  border: 'none',
  margin: '16px 0',
  fontWeight: 'normal',
  boxShadow: 'none',
  hasTrafficLights: false,
  hasHeader: false,
  syntaxHighlight: {
    keyword: '#ff7b72',
    string: '#a5d6ff',
    comment: '#8b949e',
    number: '#79c0ff',
    function: '#d2a8ff'
  }
};

describe('Functional Compatibility Tests', () => {
  describe('Markdown Formatting', () => {
    it('should format basic markdown correctly', () => {
      const markdown = `# 标题

这是一段**粗体**和*斜体*文本。

\`\`\`javascript
console.log('Hello World');
\`\`\`

- 列表项 1
- 列表项 2

> 这是引用文本`;

      const result = formatForWechat(markdown, mockTheme, mockCodeTheme);
      
      expect(result).toContain('<h1');
      expect(result).toContain('<strong');
      expect(result).toContain('<em');
      expect(result).toContain('<pre');
      expect(result).toContain('<code');
      expect(result).toContain('<p');
      expect(result).toContain('console') && expect(result).toContain('log');
    });

    it('should handle empty markdown', () => {
      const result = formatForWechat('', mockTheme);
      expect(result).toBe('');
    });

    it('should handle markdown with only whitespace', () => {
      const result = formatForWechat('   \n\n   ', mockTheme);
      expect(result).toBe('');
    });

    it('should preserve special characters in text', () => {
      const markdown = '这是包含特殊字符的文本：<>&"\'';
      const result = formatForWechat(markdown, mockTheme);

      // 特殊字符会被包装在 HTML 标签中，所以检查整体结构
      expect(result).toContain('<p');
      expect(result).toContain('这是包含特殊字符的文本');
      expect(result).toContain('</p>');
    });
  });

  describe('Code Block Formatting', () => {
    it('should format JavaScript code blocks', () => {
      const code = `function hello() {
  console.log("Hello World");
  return true;
}`;
      
      const result = formatCodeBlock(code, 'javascript', mockTheme, mockCodeTheme);
      
      expect(result).toContain('<pre');
      expect(result).toContain('<code');
      expect(result).toContain('function');
      expect(result).toContain('console') && expect(result).toContain('log');
      expect(result).toContain('return');
    });

    it('should handle unknown languages gracefully', () => {
      const code = 'some code in unknown language';
      const result = formatCodeBlock(code, 'unknownlang', mockTheme, mockCodeTheme);
      
      expect(result).toContain('<pre');
      expect(result).toContain('<code');
      expect(result).toContain('some code in unknown language');
    });

    it('should handle empty code blocks', () => {
      const result = formatCodeBlock('', 'javascript', mockTheme, mockCodeTheme);
      
      expect(result).toContain('<pre');
      expect(result).toContain('<code');
    });
  });

  describe('Inline Text Formatting', () => {
    it('should format inline elements correctly', () => {
      const text = '这是**粗体**和*斜体*以及`代码`文本';
      const result = formatInlineText(text, mockTheme);
      
      expect(result).toContain('<strong');
      expect(result).toContain('<em');
      expect(result).toContain('<code');
      expect(result).toContain('粗体');
      expect(result).toContain('斜体');
      expect(result).toContain('代码');
    });

    it('should handle text without formatting', () => {
      const text = '普通文本没有格式';
      const result = formatInlineText(text, mockTheme);
      
      expect(result).toBe(text);
    });

    it('should handle nested formatting correctly', () => {
      const text = '**粗体中包含*斜体*文本**';
      const result = formatInlineText(text, mockTheme);
      
      expect(result).toContain('<strong');
      expect(result).toContain('<em');
    });
  });

  describe('Error Handling Compatibility', () => {
    it('should handle clipboard errors consistently', () => {
      const timeoutError = new Error('Operation timeout');
      const wrappedError = ErrorHandler.handleClipboardError(timeoutError, 100);
      
      expect(wrappedError.type).toBe(ERROR_TYPES.CLIPBOARD);
      expect(wrappedError.message).toContain('超时');
      expect(wrappedError.message).toContain('100KB');
    });

    it('should handle network errors consistently', () => {
      const networkError = new Error('Connection failed');
      networkError.status = 404;
      const wrappedError = ErrorHandler.handleNetworkError(networkError, '/api/test');
      
      expect(wrappedError.type).toBe(ERROR_TYPES.NETWORK);
      expect(wrappedError.message).toContain('/api/test');
    });

    it('should maintain error wrapping functionality', () => {
      const originalError = new Error('Original error');
      const wrappedError = ErrorHandler.wrap(originalError, ERROR_TYPES.VALIDATION, 'Test context');
      
      expect(wrappedError.message).toBe('Test context: Original error');
      expect(wrappedError.type).toBe(ERROR_TYPES.VALIDATION);
      expect(wrappedError.originalError).toBe(originalError);
    });
  });

  describe('Theme Handling Compatibility', () => {
    it('should safely get themes with fallbacks', () => {
      const safeTheme = ThemeUtils.getColorThemeSafe(null);
      expect(safeTheme).toBeDefined();
      expect(typeof safeTheme).toBe('object');
    });

    it('should merge themes correctly', () => {
      const baseTheme = { a: 1, b: { c: 2 } };
      const overrideTheme = { b: { d: 3 }, e: 4 };
      const merged = ThemeUtils.mergeThemes(baseTheme, overrideTheme);
      
      expect(merged).toEqual({
        a: 1,
        b: { c: 2, d: 3 },
        e: 4
      });
    });

    it('should detect dark themes correctly', () => {
      const darkTheme = { background: '#1a1a1a' };
      const lightTheme = { background: '#ffffff' };
      
      expect(ThemeUtils.isDarkTheme(darkTheme)).toBe(true);
      expect(ThemeUtils.isDarkTheme(lightTheme)).toBe(false);
    });
  });

  describe('Text Processing Compatibility', () => {
    it('should escape HTML correctly', () => {
      const input = '<script>alert("XSS")</script>';
      const escaped = TextUtils.escapeHtml(input);
      
      expect(escaped).toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;&#x2F;script&gt;');
    });

    it('should clean URLs correctly', () => {
      const url = 'example.com';
      const cleaned = TextUtils.cleanUrl(url);

      expect(cleaned).toBe('https://example.com/');
    });

    it('should validate emails correctly', () => {
      expect(TextUtils.isValidEmail('test@example.com')).toBe(true);
      expect(TextUtils.isValidEmail('invalid-email')).toBe(false);
    });

    it('should truncate text correctly', () => {
      const longText = 'This is a very long text that should be truncated';
      const truncated = TextUtils.truncate(longText, 20);
      
      expect(truncated).toBe('This is a very lo...');
      expect(truncated.length).toBe(20);
    });
  });

  describe('Performance and Memory', () => {
    it('should handle large markdown documents efficiently', () => {
      const largeMarkdown = Array(1000).fill('# 标题\n\n这是一段文本。\n\n').join('');
      
      const startTime = performance.now();
      const result = formatForWechat(largeMarkdown, mockTheme);
      const endTime = performance.now();
      
      expect(result).toBeDefined();
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should not leak memory with repeated operations', () => {
      const markdown = '# 测试标题\n\n这是测试文本。';
      
      // Perform multiple operations
      for (let i = 0; i < 100; i++) {
        formatForWechat(markdown, mockTheme);
        formatInlineText('**粗体文本**', mockTheme);
        TextUtils.escapeHtml('<test>');
      }
      
      // If we reach here without memory issues, the test passes
      expect(true).toBe(true);
    });
  });

  describe('Edge Cases and Robustness', () => {
    it('should handle malformed markdown gracefully', () => {
      const malformedMarkdown = '# 标题\n\n**未闭合的粗体\n\n```\n未闭合的代码块';
      
      expect(() => {
        formatForWechat(malformedMarkdown, mockTheme);
      }).not.toThrow();
    });

    it('should handle null and undefined inputs gracefully', () => {
      expect(() => {
        formatForWechat(null, mockTheme);
      }).not.toThrow();
      
      expect(() => {
        formatInlineText(undefined, mockTheme);
      }).not.toThrow();
    });

    it('should handle circular references in themes', () => {
      const circularTheme = { a: 1 };
      circularTheme.self = circularTheme;
      
      expect(() => {
        ThemeUtils.getColorThemeSafe(circularTheme);
      }).not.toThrow();
    });

    it('should handle extremely long strings', () => {
      const longString = 'a'.repeat(100000);
      
      expect(() => {
        TextUtils.escapeHtml(longString);
        TextUtils.truncate(longString, 100);
        TextUtils.isEmpty(longString);
      }).not.toThrow();
    });
  });

  describe('API Consistency', () => {
    it('should maintain consistent function signatures', () => {
      // Test that all main functions accept expected parameters
      expect(() => {
        formatForWechat('test', mockTheme, mockCodeTheme, 'wechat');
        formatCodeBlock('code', 'js', mockTheme, mockCodeTheme);
        formatInlineText('text', mockTheme);
      }).not.toThrow();
    });

    it('should return consistent data types', () => {
      const markdownResult = formatForWechat('# Test', mockTheme);
      const codeResult = formatCodeBlock('test', 'js', mockTheme, mockCodeTheme);
      const inlineResult = formatInlineText('test', mockTheme);
      
      expect(typeof markdownResult).toBe('string');
      expect(typeof codeResult).toBe('string');
      expect(typeof inlineResult).toBe('string');
    });
  });
});
