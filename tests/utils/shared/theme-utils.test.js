/**
 * @file tests/utils/shared/theme-utils.test.js
 * @description 主题工具的单元测试
 */

import { describe, it, expect } from 'vitest';
import {
  ThemeUtils,
  getThemeSafe,
  getCodeStyleSafe,
  getThemeSystemSafe,
  getThemesSafe,
  isDarkTheme,
  mergeThemes,
  validateTheme
} from '../../../src/shared/utils/theme.js';



describe('ThemeUtils', () => {
  describe('getColorThemeSafe', () => {
    it('should return a theme object for null input', () => {
      const result = ThemeUtils.getColorThemeSafe(null);
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    });

    it('should return a theme object for undefined input', () => {
      const result = ThemeUtils.getColorThemeSafe(undefined);
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    });

    it('should merge object with default theme', () => {
      const customTheme = { background: '#000000' };
      const result = ThemeUtils.getColorThemeSafe(customTheme);

      expect(result).toBeDefined();
      expect(result.background).toBe('#000000');
    });

    it('should handle string input', () => {
      const result = ThemeUtils.getColorThemeSafe('test');
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    });

    it('should handle invalid string input', () => {
      const result = ThemeUtils.getColorThemeSafe('invalid');
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    });
  });

  describe('getCodeStyleSafe', () => {
    it('should return a style object for null input', () => {
      const result = ThemeUtils.getCodeStyleSafe(null);
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    });

    it('should merge object with default style', () => {
      const customStyle = { fontSize: '16px' };
      const result = ThemeUtils.getCodeStyleSafe(customStyle);

      expect(result).toBeDefined();
      expect(result.fontSize).toBe('16px');
    });
  });

  describe('getThemeSystemSafe', () => {
    it('should return a system object for null input', () => {
      const result = ThemeUtils.getThemeSystemSafe(null);
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    });

    it('should merge object with default system', () => {
      const customSystem = { layout: 'compact' };
      const result = ThemeUtils.getThemeSystemSafe(customSystem);

      expect(result).toBeDefined();
      expect(result.layout).toBe('compact');
    });
  });

  describe('getThemesSafe', () => {
    it('should return all safe themes', () => {
      const result = ThemeUtils.getThemesSafe({
        colorTheme: 'test',
        codeStyle: 'test-code',
        themeSystem: 'test-system'
      });

      expect(result).toBeDefined();
      expect(result.colorTheme).toBeDefined();
      expect(result.codeStyle).toBeDefined();
      expect(result.themeSystem).toBeDefined();
    });

    it('should handle empty input', () => {
      const result = ThemeUtils.getThemesSafe();

      expect(result).toBeDefined();
      expect(result.colorTheme).toBeDefined();
      expect(result.codeStyle).toBeDefined();
      expect(result.themeSystem).toBeDefined();
    });
  });

  describe('isDarkTheme', () => {
    it('should return false for light theme', () => {
      const lightTheme = { background: '#ffffff' };
      expect(ThemeUtils.isDarkTheme(lightTheme)).toBe(false);
    });

    it('should return true for dark theme with dark keyword', () => {
      const darkTheme = { background: 'dark' };
      expect(ThemeUtils.isDarkTheme(darkTheme)).toBe(true);
    });

    it('should return true for black theme', () => {
      const blackTheme = { background: '#000000' };
      expect(ThemeUtils.isDarkTheme(blackTheme)).toBe(true);
    });

    it('should return true for dark hex color', () => {
      const darkTheme = { background: '#1a1a1a' };
      expect(ThemeUtils.isDarkTheme(darkTheme)).toBe(true);
    });

    it('should return false for light hex color', () => {
      const lightTheme = { background: '#f0f0f0' };
      expect(ThemeUtils.isDarkTheme(lightTheme)).toBe(false);
    });

    it('should handle 3-digit hex colors', () => {
      const darkTheme = { background: '#111' };
      const lightTheme = { background: '#eee' };
      
      expect(ThemeUtils.isDarkTheme(darkTheme)).toBe(true);
      expect(ThemeUtils.isDarkTheme(lightTheme)).toBe(false);
    });

    it('should return false for null or invalid input', () => {
      expect(ThemeUtils.isDarkTheme(null)).toBe(false);
      expect(ThemeUtils.isDarkTheme({})).toBe(false);
    });
  });

  describe('mergeThemes', () => {
    it('should merge two theme objects', () => {
      const baseTheme = { a: 1, b: { c: 2 } };
      const overrideTheme = { b: { d: 3 }, e: 4 };
      
      const result = ThemeUtils.mergeThemes(baseTheme, overrideTheme);
      
      expect(result).toEqual({
        a: 1,
        b: { c: 2, d: 3 },
        e: 4
      });
    });

    it('should handle null override theme', () => {
      const baseTheme = { a: 1 };
      const result = ThemeUtils.mergeThemes(baseTheme, null);
      
      expect(result).toEqual(baseTheme);
    });

    it('should handle null base theme', () => {
      const overrideTheme = { a: 1 };
      const result = ThemeUtils.mergeThemes(null, overrideTheme);
      
      expect(result).toEqual(overrideTheme);
    });
  });

  describe('validateTheme', () => {
    const testTheme = {
      background: '#ffffff',
      text: {
        primary: '#333333',
        secondary: '#666666'
      }
    };

    it('should validate theme with required keys', () => {
      const result = ThemeUtils.validateTheme(testTheme, ['background', 'text.primary']);
      expect(result).toBe(true);
    });

    it('should fail validation for missing keys', () => {
      const result = ThemeUtils.validateTheme(testTheme, ['background', 'missing.key']);
      expect(result).toBe(false);
    });

    it('should handle null theme', () => {
      const result = ThemeUtils.validateTheme(null, ['background']);
      expect(result).toBe(false);
    });

    it('should handle empty required keys', () => {
      const result = ThemeUtils.validateTheme(testTheme, []);
      expect(result).toBe(true);
    });
  });

  describe('generateCSSVariables', () => {
    it('should generate CSS variables from theme object', () => {
      const theme = {
        background: '#ffffff',
        text: {
          primary: '#333333',
          secondary: '#666666'
        }
      };
      
      const result = ThemeUtils.generateCSSVariables(theme, '--test');
      
      expect(result).toEqual({
        '--test-background': '#ffffff',
        '--test-text-primary': '#333333',
        '--test-text-secondary': '#666666'
      });
    });
  });

  describe('getContrastColor', () => {
    it('should return black for white background', () => {
      expect(ThemeUtils.getContrastColor('#ffffff')).toBe('#000000');
      expect(ThemeUtils.getContrastColor('white')).toBe('#000000');
    });

    it('should return white for black background', () => {
      expect(ThemeUtils.getContrastColor('#000000')).toBe('#ffffff');
      expect(ThemeUtils.getContrastColor('black')).toBe('#ffffff');
    });

    it('should return white for dark colors', () => {
      expect(ThemeUtils.getContrastColor('#1a1a1a')).toBe('#ffffff');
    });

    it('should return black for light colors', () => {
      expect(ThemeUtils.getContrastColor('#f0f0f0')).toBe('#000000');
    });

    it('should handle empty input', () => {
      expect(ThemeUtils.getContrastColor('')).toBe('#000000');
      expect(ThemeUtils.getContrastColor(null)).toBe('#000000');
    });
  });

  describe('convenience functions', () => {
    it('should export convenience functions', () => {
      expect(typeof getThemeSafe).toBe('function');
      expect(typeof getCodeStyleSafe).toBe('function');
      expect(typeof getThemeSystemSafe).toBe('function');
      expect(typeof getThemesSafe).toBe('function');
      expect(typeof isDarkTheme).toBe('function');
      expect(typeof mergeThemes).toBe('function');
      expect(typeof validateTheme).toBe('function');
    });
  });
});
