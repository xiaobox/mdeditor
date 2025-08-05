/**
 * @file tests/core/markdown/post-processors/wechat-styler.test.js
 * @description Tests for WeChat HTML post-processor
 */

import { describe, it, expect } from 'vitest';
import { WeChatStyler, wrapWithFontStyles } from '../../../../src/core/markdown/post-processors/wechat-styler.js';

describe('WeChatStyler', () => {
  const mockFontSettings = {
    fontFamily: 'microsoft-yahei',
    fontSize: 16
  };

  const sampleHtml = '<p>Hello World</p><h1>Title</h1><strong>Bold text</strong>';

  describe('process', () => {
    it('should apply font styling when not in preview mode', () => {
      const result = WeChatStyler.process(sampleHtml, {
        fontSettings: mockFontSettings,
        isPreview: false
      });

      expect(result).toContain('data-role="outer"');
      expect(result).toContain('data-role="inner"');
      expect(result).toContain('Microsoft YaHei');
      expect(result).toContain('font-size: 16px');
    });

    it('should not apply font styling in preview mode', () => {
      const result = WeChatStyler.process(sampleHtml, {
        fontSettings: mockFontSettings,
        isPreview: true
      });

      expect(result).toBe(sampleHtml);
      expect(result).not.toContain('data-role="outer"');
    });

    it('should not apply font styling without font settings', () => {
      const result = WeChatStyler.process(sampleHtml, {
        isPreview: false
      });

      expect(result).toBe(sampleHtml);
    });

    it('should handle empty HTML', () => {
      const result = WeChatStyler.process('', {
        fontSettings: mockFontSettings,
        isPreview: false
      });

      expect(result).toBe('');
    });
  });

  describe('applyInlineStyles', () => {
    it('should add inline styles to HTML elements', () => {
      const result = WeChatStyler.applyInlineStyles(sampleHtml, mockFontSettings);

      expect(result).toContain('style="font-family: Microsoft YaHei');
      expect(result).toContain('font-size: 16px');
      expect(result).toContain('font-weight: 400');
      expect(result).toContain('font-weight: 700'); // for strong tag
    });

    it('should handle different font families', () => {
      const settings = { ...mockFontSettings, fontFamily: 'pingfang-sc' };
      const result = WeChatStyler.applyInlineStyles(sampleHtml, settings);

      expect(result).toContain('PingFang SC');
    });

    it('should handle different font sizes', () => {
      const settings = { ...mockFontSettings, fontSize: 18 };
      const result = WeChatStyler.applyInlineStyles(sampleHtml, settings);

      expect(result).toContain('font-size: 18px');
    });

    it('should return original HTML without font settings', () => {
      const result = WeChatStyler.applyInlineStyles(sampleHtml, null);
      expect(result).toBe(sampleHtml);
    });
  });

  describe('wrapWithFontStyles', () => {
    it('should wrap HTML with WeChat-compatible structure', () => {
      const result = wrapWithFontStyles(sampleHtml, mockFontSettings);

      expect(result).toContain('<section data-role="outer" class="rich_media_content"');
      expect(result).toContain('<section data-role="inner"');
      expect(result).toContain('font-family: Microsoft YaHei');
      expect(result).toContain('font-size: 16px');
      expect(result).toContain('font-weight: 400');
    });

    it('should calculate correct line height for different font sizes', () => {
      // Small font size should get 1.7 line height
      const smallFont = { ...mockFontSettings, fontSize: 14 };
      const smallResult = wrapWithFontStyles(sampleHtml, smallFont);
      expect(smallResult).toContain('line-height: 1.7');

      // Medium font size should get 1.6 line height
      const mediumFont = { ...mockFontSettings, fontSize: 16 };
      const mediumResult = wrapWithFontStyles(sampleHtml, mediumFont);
      expect(mediumResult).toContain('line-height: 1.6');

      // Large font size should get 1.5 line height
      const largeFont = { ...mockFontSettings, fontSize: 20 };
      const largeResult = wrapWithFontStyles(sampleHtml, largeFont);
      expect(largeResult).toContain('line-height: 1.5');
    });

    it('should handle missing font settings', () => {
      const result = wrapWithFontStyles(sampleHtml, null);
      expect(result).toBe(sampleHtml);
    });

    it('should handle empty HTML', () => {
      const result = wrapWithFontStyles('', mockFontSettings);
      expect(result).toBe('');
    });
  });

  describe('font family mapping', () => {
    it('should map font families correctly', () => {
      const testCases = [
        { input: 'microsoft-yahei', expected: 'Microsoft YaHei' },
        { input: 'pingfang-sc', expected: 'PingFang SC' },
        { input: 'hiragino-sans', expected: 'Hiragino Sans GB' },
        { input: 'arial', expected: 'Arial' },
        { input: 'unknown-font', expected: 'Microsoft YaHei' } // fallback
      ];

      testCases.forEach(({ input, expected }) => {
        const settings = { ...mockFontSettings, fontFamily: input };
        const result = wrapWithFontStyles(sampleHtml, settings);
        expect(result).toContain(expected);
      });
    });
  });

  describe('HTML element styling', () => {
    it('should style paragraph elements correctly', () => {
      const html = '<p>Test paragraph</p>';
      const result = WeChatStyler.applyInlineStyles(html, mockFontSettings);
      
      expect(result).toContain('<p style="font-family: Microsoft YaHei');
      expect(result).toContain('margin: 1.5em 8px');
      expect(result).toContain('font-weight: 400');
    });

    it('should style heading elements with different sizes', () => {
      const html = '<h1>Title</h1><h2>Subtitle</h2><h3>Section</h3>';
      const result = WeChatStyler.applyInlineStyles(html, mockFontSettings);
      
      // H1 should be 2.2x base font size
      expect(result).toContain('font-size: 35px'); // 16 * 2.2 = 35.2, rounded to 35
      
      // H2 should be 1.5x base font size
      expect(result).toContain('font-size: 24px'); // 16 * 1.5 = 24
      
      // H3 should be 1.3x base font size
      expect(result).toContain('font-size: 21px'); // 16 * 1.3 = 20.8, rounded to 21
    });

    it('should style emphasis elements correctly', () => {
      const html = '<strong>Bold</strong><em>Italic</em><b>Bold2</b><i>Italic2</i>';
      const result = WeChatStyler.applyInlineStyles(html, mockFontSettings);
      
      expect(result).toContain('<strong style="font-family: Microsoft YaHei');
      expect(result).toContain('font-weight: 700'); // bold weight
      expect(result).toContain('<em style="font-family: Microsoft YaHei');
      expect(result).toContain('font-style: italic');
    });
  });
});
