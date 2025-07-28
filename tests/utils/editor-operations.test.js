/**
 * @file tests/utils/editor-operations.test.js
 * @description 编辑器操作的单元测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  insertHeading,
  insertBold,
  insertItalic,
  insertStrikethrough,
  insertCode,
  insertCodeBlock,
  insertQuote,
  insertList,
  insertOrderedList,
  insertLink,
  insertImage,
  insertTable,
  insertHorizontalRule,
  toolbarOperations
} from '../../src/core/editor/operations.js';

// Mock EditorView
const createMockEditorView = (initialContent = '', selection = { from: 0, to: 0 }) => {
  const state = {
    doc: {
      toString: () => initialContent,
      length: initialContent.length,
      sliceString: (from, to) => initialContent.slice(from, to || initialContent.length)
    },
    selection: {
      main: selection
    }
  };

  const dispatch = vi.fn();
  const focus = vi.fn();

  return {
    state,
    dispatch,
    focus
  };
};

describe('Editor Operations', () => {
  let mockEditorView;

  beforeEach(() => {
    mockEditorView = createMockEditorView();
  });

  describe('insertHeading', () => {
    it('should insert default heading (level 2)', () => {
      insertHeading(mockEditorView);
      
      expect(mockEditorView.dispatch).toHaveBeenCalledWith({
        changes: {
          from: 0,
          to: 0,
          insert: '## 标题'
        },
        selection: {
          anchor: 3,
          head: 5
        },
        userEvent: 'input'
      });
      expect(mockEditorView.focus).toHaveBeenCalled();
    });

    it('should insert heading with specified level', () => {
      insertHeading(mockEditorView, 1);
      
      expect(mockEditorView.dispatch).toHaveBeenCalledWith({
        changes: {
          from: 0,
          to: 0,
          insert: '# 标题'
        },
        selection: {
          anchor: 2,
          head: 4
        },
        userEvent: 'input'
      });
    });

    it('should clamp heading level to valid range', () => {
      insertHeading(mockEditorView, 10); // Should be clamped to 6

      const dispatchCall = mockEditorView.dispatch.mock.calls[0][0];
      expect(dispatchCall.changes.insert).toBe('###### 标题');
    });

    it('should handle negative heading level', () => {
      insertHeading(mockEditorView, -1); // Should be clamped to 1
      
      const dispatchCall = mockEditorView.dispatch.mock.calls[0][0];
      expect(dispatchCall.changes.insert).toBe('# 标题');
    });
  });

  describe('insertBold', () => {
    it('should insert bold formatting', () => {
      insertBold(mockEditorView);
      
      expect(mockEditorView.dispatch).toHaveBeenCalledWith({
        changes: {
          from: 0,
          to: 0,
          insert: '**粗体文本**'
        },
        selection: {
          anchor: 2,
          head: 6
        },
        userEvent: 'input'
      });
    });

    it('should wrap selected text in bold', () => {
      mockEditorView = createMockEditorView('selected text', { from: 0, to: 13 });
      insertBold(mockEditorView);
      
      expect(mockEditorView.dispatch).toHaveBeenCalledWith({
        changes: {
          from: 0,
          to: 13,
          insert: '**selected text**'
        },
        selection: {
          anchor: 2,
          head: 15
        },
        userEvent: 'input'
      });
    });
  });

  describe('insertItalic', () => {
    it('should insert italic formatting', () => {
      insertItalic(mockEditorView);
      
      expect(mockEditorView.dispatch).toHaveBeenCalledWith({
        changes: {
          from: 0,
          to: 0,
          insert: '*斜体文本*'
        },
        selection: {
          anchor: 1,
          head: 5
        },
        userEvent: 'input'
      });
    });
  });

  describe('insertStrikethrough', () => {
    it('should insert strikethrough formatting', () => {
      insertStrikethrough(mockEditorView);
      
      expect(mockEditorView.dispatch).toHaveBeenCalledWith({
        changes: {
          from: 0,
          to: 0,
          insert: '~~删除线文本~~'
        },
        selection: {
          anchor: 2,
          head: 7
        },
        userEvent: 'input'
      });
    });
  });

  describe('insertCode', () => {
    it('should insert inline code formatting', () => {
      insertCode(mockEditorView);
      
      expect(mockEditorView.dispatch).toHaveBeenCalledWith({
        changes: {
          from: 0,
          to: 0,
          insert: '`代码`'
        },
        selection: {
          anchor: 1,
          head: 3
        },
        userEvent: 'input'
      });
    });
  });

  describe('insertCodeBlock', () => {
    it('should insert code block with default language', () => {
      insertCodeBlock(mockEditorView);
      
      const dispatchCall = mockEditorView.dispatch.mock.calls[0][0];
      expect(dispatchCall.changes.insert).toContain('```javascript');
      expect(dispatchCall.changes.insert).toContain('代码');
      expect(dispatchCall.changes.insert).toContain('```');
    });

    it('should insert code block with specified language', () => {
      insertCodeBlock(mockEditorView, 'python');
      
      const dispatchCall = mockEditorView.dispatch.mock.calls[0][0];
      expect(dispatchCall.changes.insert).toContain('```python');
    });
  });

  describe('insertQuote', () => {
    it('should insert blockquote formatting', () => {
      insertQuote(mockEditorView);
      
      expect(mockEditorView.dispatch).toHaveBeenCalledWith({
        changes: {
          from: 0,
          to: 0,
          insert: '> 引用内容'
        },
        selection: {
          anchor: 2,
          head: 6
        },
        userEvent: 'input'
      });
    });
  });

  describe('insertList', () => {
    it('should insert unordered list', () => {
      insertList(mockEditorView);
      
      expect(mockEditorView.dispatch).toHaveBeenCalledWith({
        changes: {
          from: 0,
          to: 0,
          insert: '- 列表项'
        },
        selection: {
          anchor: 2,
          head: 5
        },
        userEvent: 'input'
      });
    });
  });

  describe('insertOrderedList', () => {
    it('should insert ordered list', () => {
      insertOrderedList(mockEditorView);
      
      expect(mockEditorView.dispatch).toHaveBeenCalledWith({
        changes: {
          from: 0,
          to: 0,
          insert: '1. 列表项'
        },
        selection: {
          anchor: 3,
          head: 6
        },
        userEvent: 'input'
      });
    });
  });

  describe('insertLink', () => {
    it('should insert link formatting', () => {
      insertLink(mockEditorView);
      
      expect(mockEditorView.dispatch).toHaveBeenCalledWith({
        changes: {
          from: 0,
          to: 0,
          insert: '[链接文本](https://)'
        },
        selection: {
          anchor: 1,
          head: 5
        },
        userEvent: 'input'
      });
    });
  });

  describe('insertImage', () => {
    it('should insert image formatting', () => {
      insertImage(mockEditorView);
      
      expect(mockEditorView.dispatch).toHaveBeenCalledWith({
        changes: {
          from: 0,
          to: 0,
          insert: '![图片描述](https://)'
        },
        selection: {
          anchor: 2,
          head: 6
        },
        userEvent: 'input'
      });
    });
  });

  describe('insertTable', () => {
    it('should insert table with default dimensions', () => {
      insertTable(mockEditorView);
      
      const dispatchCall = mockEditorView.dispatch.mock.calls[0][0];
      const insertedText = dispatchCall.changes.insert;
      
      expect(insertedText).toContain('| 表头 | 表头 | 表头 |');
      expect(insertedText).toContain('| --- | --- | --- |');
      expect(insertedText).toContain('| 单元格 | 单元格 | 单元格 |');
    });

    it('should insert table with custom dimensions', () => {
      insertTable(mockEditorView, 3, 4);
      
      const dispatchCall = mockEditorView.dispatch.mock.calls[0][0];
      const insertedText = dispatchCall.changes.insert;
      
      // Should have 4 columns
      expect(insertedText).toContain('| 表头 | 表头 | 表头 | 表头 |');
      
      // Should have 2 data rows (3 total - 1 header)
      const rows = insertedText.split('\n').filter(line => line.includes('单元格'));
      expect(rows).toHaveLength(2);
    });
  });

  describe('insertHorizontalRule', () => {
    it('should insert horizontal rule', () => {
      insertHorizontalRule(mockEditorView);
      
      expect(mockEditorView.dispatch).toHaveBeenCalledWith({
        changes: {
          from: 0,
          to: 0,
          insert: '\n---\n'
        },
        selection: {
          anchor: 5,
          head: 5
        },
        userEvent: 'input'
      });
    });
  });

  describe('toolbarOperations', () => {
    it('should export all toolbar operations', () => {
      expect(toolbarOperations).toHaveProperty('heading');
      expect(toolbarOperations).toHaveProperty('bold');
      expect(toolbarOperations).toHaveProperty('italic');
      expect(toolbarOperations).toHaveProperty('strikethrough');
      expect(toolbarOperations).toHaveProperty('code');
      expect(toolbarOperations).toHaveProperty('codeBlock');
      expect(toolbarOperations).toHaveProperty('quote');
      expect(toolbarOperations).toHaveProperty('list');
      expect(toolbarOperations).toHaveProperty('orderedList');
      expect(toolbarOperations).toHaveProperty('link');
      expect(toolbarOperations).toHaveProperty('image');
      expect(toolbarOperations).toHaveProperty('table');
      expect(toolbarOperations).toHaveProperty('horizontalRule');
    });

    it('should map operations correctly', () => {
      expect(toolbarOperations.heading).toBe(insertHeading);
      expect(toolbarOperations.bold).toBe(insertBold);
      expect(toolbarOperations.italic).toBe(insertItalic);
      expect(toolbarOperations.strikethrough).toBe(insertStrikethrough);
      expect(toolbarOperations.code).toBe(insertCode);
      expect(toolbarOperations.codeBlock).toBe(insertCodeBlock);
      expect(toolbarOperations.quote).toBe(insertQuote);
      expect(toolbarOperations.list).toBe(insertList);
      expect(toolbarOperations.orderedList).toBe(insertOrderedList);
      expect(toolbarOperations.link).toBe(insertLink);
      expect(toolbarOperations.image).toBe(insertImage);
      expect(toolbarOperations.table).toBe(insertTable);
      expect(toolbarOperations.horizontalRule).toBe(insertHorizontalRule);
    });
  });
});
