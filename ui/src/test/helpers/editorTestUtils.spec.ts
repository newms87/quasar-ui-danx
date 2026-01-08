import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createTestEditor, TestEditorResult } from './editorTestUtils';

describe('editorTestUtils', () => {
	let editor: TestEditorResult;

	afterEach(() => {
		if (editor) {
			editor.destroy();
		}
	});

	describe('createTestEditor', () => {
		it('should create a contenteditable container', () => {
			editor = createTestEditor('<p>Hello World</p>');

			expect(editor.container).toBeInstanceOf(HTMLElement);
			expect(editor.container.getAttribute('contenteditable')).toBe('true');
			expect(editor.container.innerHTML).toBe('<p>Hello World</p>');
		});

		it('should trim whitespace from initial HTML', () => {
			editor = createTestEditor('  <p>Test</p>  ');

			expect(editor.container.innerHTML).toBe('<p>Test</p>');
		});
	});

	describe('getHtml', () => {
		it('should return current HTML content', () => {
			editor = createTestEditor('<p>Initial</p>');

			expect(editor.getHtml()).toBe('<p>Initial</p>');

			// Modify content
			editor.container.innerHTML = '<p>Modified</p>';
			expect(editor.getHtml()).toBe('<p>Modified</p>');
		});
	});

	describe('getMarkdown', () => {
		it('should convert HTML to markdown', () => {
			editor = createTestEditor('<p>Hello <strong>bold</strong> text</p>');

			const markdown = editor.getMarkdown();
			expect(markdown).toBe('Hello **bold** text');
		});

		it('should handle headings', () => {
			editor = createTestEditor('<h2>Heading Two</h2>');

			expect(editor.getMarkdown()).toBe('## Heading Two');
		});

		it('should handle lists', () => {
			editor = createTestEditor('<ul><li>Item 1</li><li>Item 2</li></ul>');

			const markdown = editor.getMarkdown();
			expect(markdown).toContain('- Item 1');
			expect(markdown).toContain('- Item 2');
		});
	});

	describe('getBlock and getBlocks', () => {
		beforeEach(() => {
			editor = createTestEditor('<p>First</p><p>Second</p><p>Third</p>');
		});

		it('should get a block by index', () => {
			const block0 = editor.getBlock(0);
			const block1 = editor.getBlock(1);
			const block2 = editor.getBlock(2);

			expect(block0?.textContent).toBe('First');
			expect(block1?.textContent).toBe('Second');
			expect(block2?.textContent).toBe('Third');
		});

		it('should return null for invalid index', () => {
			expect(editor.getBlock(10)).toBeNull();
			expect(editor.getBlock(-1)).toBeNull();
		});

		it('should get all blocks', () => {
			const blocks = editor.getBlocks();

			expect(blocks).toHaveLength(3);
			expect(blocks[0].textContent).toBe('First');
			expect(blocks[2].textContent).toBe('Third');
		});
	});

	describe('setCursor and getCursorPosition', () => {
		beforeEach(() => {
			editor = createTestEditor('<p>Hello World</p>');
		});

		it('should set cursor position in a text node', () => {
			const textNode = editor.getBlock(0)?.firstChild;
			if (!textNode) throw new Error('Text node not found');

			editor.setCursor(textNode, 5);

			const pos = editor.getCursorPosition();
			expect(pos.node).toBe(textNode);
			expect(pos.offset).toBe(5);
		});

		it('should return null node when no selection', () => {
			// Clear any existing selection
			window.getSelection()?.removeAllRanges();

			const pos = editor.getCursorPosition();
			expect(pos.node).toBeNull();
			expect(pos.offset).toBe(0);
		});
	});

	describe('setCursorInBlock and getCursorOffsetInBlock', () => {
		beforeEach(() => {
			editor = createTestEditor('<p>First paragraph</p><p>Second paragraph</p>');
		});

		it('should set cursor at offset within a block', () => {
			editor.setCursorInBlock(0, 6);

			const offset = editor.getCursorOffsetInBlock(0);
			expect(offset).toBe(6); // After "First "
		});

		it('should set cursor in second block', () => {
			editor.setCursorInBlock(1, 7);

			const offset = editor.getCursorOffsetInBlock(1);
			expect(offset).toBe(7); // After "Second "
		});

		it('should return -1 for invalid block index', () => {
			editor.setCursorInBlock(0, 0);

			expect(editor.getCursorOffsetInBlock(10)).toBe(-1);
		});

		it('should return -1 when cursor is not in the specified block', () => {
			editor.setCursorInBlock(0, 0);

			expect(editor.getCursorOffsetInBlock(1)).toBe(-1);
		});
	});

	describe('selectRange and selectInBlock', () => {
		beforeEach(() => {
			editor = createTestEditor('<p>Hello World</p>');
		});

		it('should select a text range', () => {
			const textNode = editor.getBlock(0)?.firstChild;
			if (!textNode) throw new Error('Text node not found');

			editor.selectRange(textNode, 0, textNode, 5);

			const sel = window.getSelection();
			expect(sel?.toString()).toBe('Hello');
		});

		it('should select text within a block by offsets', () => {
			editor.selectInBlock(0, 6, 11);

			const sel = window.getSelection();
			expect(sel?.toString()).toBe('World');
		});
	});

	describe('pressKey', () => {
		beforeEach(() => {
			editor = createTestEditor('<p>Test</p>');
		});

		it('should dispatch keydown event', () => {
			let receivedEvent: KeyboardEvent | null = null;
			editor.container.addEventListener('keydown', (e) => {
				receivedEvent = e;
			});

			editor.pressKey('a');

			expect(receivedEvent).not.toBeNull();
			expect(receivedEvent!.key).toBe('a');
			expect(receivedEvent!.code).toBe('KeyA');
		});

		it('should include modifier keys', () => {
			let receivedEvent: KeyboardEvent | null = null;
			editor.container.addEventListener('keydown', (e) => {
				receivedEvent = e;
			});

			editor.pressKey('b', { ctrl: true, shift: true });

			expect(receivedEvent!.ctrlKey).toBe(true);
			expect(receivedEvent!.shiftKey).toBe(true);
			expect(receivedEvent!.altKey).toBe(false);
			expect(receivedEvent!.metaKey).toBe(false);
		});

		it('should handle special keys', () => {
			let receivedEvent: KeyboardEvent | null = null;
			editor.container.addEventListener('keydown', (e) => {
				receivedEvent = e;
			});

			editor.pressKey('Enter');

			expect(receivedEvent!.key).toBe('Enter');
			expect(receivedEvent!.code).toBe('Enter');
		});
	});

	describe('type', () => {
		beforeEach(() => {
			editor = createTestEditor('<p>Hello</p>');
		});

		it('should insert text at cursor position', () => {
			const textNode = editor.getBlock(0)?.firstChild;
			if (!textNode) throw new Error('Text node not found');

			editor.setCursor(textNode, 5);
			editor.type(' World');

			expect(editor.container.textContent).toContain('Hello');
			expect(editor.container.textContent).toContain('World');
		});

		it('should dispatch input event', () => {
			let inputFired = false;
			editor.container.addEventListener('input', () => {
				inputFired = true;
			});

			const textNode = editor.getBlock(0)?.firstChild;
			if (!textNode) throw new Error('Text node not found');

			editor.setCursor(textNode, 0);
			editor.type('X');

			expect(inputFired).toBe(true);
		});
	});

	describe('contentRef', () => {
		it('should provide a Vue ref to the container', () => {
			editor = createTestEditor('<p>Test</p>');

			expect(editor.contentRef.value).toBe(editor.container);
		});
	});

	describe('destroy', () => {
		it('should remove the container from DOM', () => {
			editor = createTestEditor('<p>Test</p>');
			const container = editor.container;

			expect(document.body.contains(container)).toBe(true);

			editor.destroy();

			expect(document.body.contains(container)).toBe(false);
		});
	});

	describe('complex content handling', () => {
		it('should handle nested inline formatting', () => {
			editor = createTestEditor('<p>This is <strong><em>bold italic</em></strong> text</p>');

			editor.selectInBlock(0, 8, 19);

			const sel = window.getSelection();
			expect(sel?.toString()).toBe('bold italic');
		});

		it('should handle multiple blocks with cursor operations', () => {
			editor = createTestEditor('<p>Line 1</p><p>Line 2</p><p>Line 3</p>');

			// Set cursor in middle block
			editor.setCursorInBlock(1, 3);

			const offset = editor.getCursorOffsetInBlock(1);
			expect(offset).toBe(3);

			// Verify cursor is not in other blocks
			expect(editor.getCursorOffsetInBlock(0)).toBe(-1);
			expect(editor.getCursorOffsetInBlock(2)).toBe(-1);
		});
	});
});
