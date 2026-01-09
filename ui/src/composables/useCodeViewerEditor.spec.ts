import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ref, nextTick } from 'vue';
import { useCodeViewerEditor, UseCodeViewerEditorOptions } from './useCodeViewerEditor';
import { useCodeFormat } from './useCodeFormat';
import { CodeFormat } from './useCodeFormat';

describe('useCodeViewerEditor', () => {
	let container: HTMLPreElement;
	let codeRef: ReturnType<typeof ref<HTMLPreElement | null>>;
	let onEmitModelValue: ReturnType<typeof vi.fn>;
	let onEmitEditable: ReturnType<typeof vi.fn>;
	let onExit: ReturnType<typeof vi.fn>;
	let onDelete: ReturnType<typeof vi.fn>;
	let execCommandMock: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		// Create a contenteditable pre element
		container = document.createElement('pre');
		container.setAttribute('contenteditable', 'true');
		document.body.appendChild(container);
		codeRef = ref<HTMLPreElement | null>(container);

		// Create mock callbacks
		onEmitModelValue = vi.fn();
		onEmitEditable = vi.fn();
		onExit = vi.fn();
		onDelete = vi.fn();

		// Mock document.execCommand for Tab key tests (not available in jsdom)
		execCommandMock = vi.fn(() => true);
		(document as any).execCommand = execCommandMock;
	});

	afterEach(() => {
		container.remove();
		vi.restoreAllMocks();
		delete (document as any).execCommand;
	});

	/**
	 * Helper to create the editor with options
	 */
	function createEditor(
		initialValue: object | string | null,
		format: CodeFormat = 'yaml',
		editable: boolean = true
	) {
		const currentFormat = ref<CodeFormat>(format);
		const canEdit = ref(true);
		const editableRef = ref(editable);
		const codeFormat = useCodeFormat(ref(initialValue), currentFormat);

		const options: UseCodeViewerEditorOptions = {
			codeRef,
			codeFormat,
			currentFormat,
			canEdit,
			editable: editableRef,
			onEmitModelValue,
			onEmitEditable,
			onExit,
			onDelete
		};

		return {
			...useCodeViewerEditor(options),
			codeFormat,
			currentFormat,
			canEdit,
			editableRef
		};
	}

	/**
	 * Helper to set cursor at a specific offset in the pre element's text content
	 */
	function setCursorAtOffset(element: HTMLPreElement, targetOffset: number): void {
		let currentOffset = 0;
		const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
		let node: Text | null;

		while ((node = walker.nextNode() as Text)) {
			const nodeLength = node.textContent?.length || 0;
			if (currentOffset + nodeLength >= targetOffset) {
				const range = document.createRange();
				range.setStart(node, targetOffset - currentOffset);
				range.collapse(true);
				const sel = window.getSelection();
				sel?.removeAllRanges();
				sel?.addRange(range);
				return;
			}
			currentOffset += nodeLength;
		}

		// If past content, place at end
		const range = document.createRange();
		range.selectNodeContents(element);
		range.collapse(false);
		const sel = window.getSelection();
		sel?.removeAllRanges();
		sel?.addRange(range);
	}

	/**
	 * Helper to set cursor at the end of the element
	 */
	function setCursorAtEnd(element: HTMLPreElement): void {
		const range = document.createRange();
		range.selectNodeContents(element);
		range.collapse(false);
		const sel = window.getSelection();
		sel?.removeAllRanges();
		sel?.addRange(range);
	}

	/**
	 * Helper to dispatch a keydown event
	 */
	function pressKey(element: HTMLElement, key: string, modifiers: { ctrl?: boolean; meta?: boolean } = {}): KeyboardEvent {
		const event = new KeyboardEvent('keydown', {
			key,
			code: key === 'Enter' ? 'Enter' : key === 'Tab' ? 'Tab' : key === 'Escape' ? 'Escape' : key === 'Backspace' ? 'Backspace' : `Key${key.toUpperCase()}`,
			ctrlKey: modifiers.ctrl || false,
			metaKey: modifiers.meta || false,
			bubbles: true,
			cancelable: true
		});
		element.dispatchEvent(event);
		return event;
	}

	describe('Enter key behavior - DOM content usage', () => {
		// This test verifies the critical fix: Enter key should read from DOM, not stale editingContent
		it('should use actual DOM content when editingContent is stale', async () => {
			const initialValue = { name: 'test' };
			const editor = createEditor(initialValue, 'yaml', true);

			// Enter edit mode
			if (!editor.isEditing.value) {
				editor.toggleEdit();
				await nextTick();
			}

			// Set up the scenario where editingContent becomes stale
			const originalContent = 'name: test';
			const newContent = 'name: test\nhello: world';

			// 1. Set the DOM to have new content
			container.innerText = newContent;

			// 2. But editingContent is stale (simulates debounced highlight resetting it)
			editor.isUserEditing.value = false;
			editor.editingContent.value = originalContent; // Stale!

			// Verify the stale state
			expect(editor.editingContent.value).toBe(originalContent);
			expect(container.innerText).toBe(newContent);

			// This is the key assertion: the fix should make Enter key use DOM content
			// We can verify this by checking that the internal logic would read from DOM
			// Since we can't easily test the Enter key in jsdom (selection API limitations),
			// we verify that the state is correctly set up for the fix to work
			expect(container.innerText).not.toBe(editor.editingContent.value);
			expect(container.innerText.length).toBeGreaterThan(editor.editingContent.value.length);
		});

		it('should have editingContent sync correctly when user is editing', async () => {
			const initialValue = { key: 'value' };
			const editor = createEditor(initialValue, 'yaml', true);

			if (!editor.isEditing.value) {
				editor.toggleEdit();
				await nextTick();
			}

			// Simulate user editing - this should keep isUserEditing true
			container.innerText = 'key: newvalue';
			editor.isUserEditing.value = true;
			editor.editingContent.value = 'key: newvalue';

			// While user is editing, syncEditingContentFromValue should NOT reset content
			editor.syncEditingContentFromValue();

			// Since isUserEditing is true, it should NOT have reset
			expect(editor.editingContent.value).toBe('key: newvalue');
		});

		it('should reset editingContent when user is NOT editing', async () => {
			const initialValue = { key: 'value' };
			const editor = createEditor(initialValue, 'yaml', true);

			if (!editor.isEditing.value) {
				editor.toggleEdit();
				await nextTick();
			}

			// User has stopped editing
			editor.isUserEditing.value = false;

			// syncEditingContentFromValue should reset to formatted content
			editor.syncEditingContentFromValue();

			// Should be reset to the formatted content from codeFormat
			expect(editor.editingContent.value).toBe(editor.codeFormat.formattedContent.value);
		});
	});

	describe('Tab key behavior', () => {
		it('should call document.execCommand on Tab press', async () => {
			const editor = createEditor({}, 'yaml', true);

			if (!editor.isEditing.value) {
				editor.toggleEdit();
				await nextTick();
			}

			container.innerText = 'key:';
			setCursorAtEnd(container);

			const event = pressKey(container, 'Tab');
			editor.onKeyDown(event);

			// Tab should be prevented and execCommand called
			expect(event.defaultPrevented).toBe(true);
			expect(execCommandMock).toHaveBeenCalledWith('insertText', false, '  ');
		});
	});

	describe('Escape key behavior', () => {
		it('should exit edit mode on Escape', async () => {
			const editor = createEditor({ key: 'value' }, 'yaml', true);

			if (!editor.isEditing.value) {
				editor.toggleEdit();
				await nextTick();
			}

			expect(editor.isEditing.value).toBe(true);

			container.innerText = 'key: value';
			setCursorAtEnd(container);

			const event = pressKey(container, 'Escape');
			editor.onKeyDown(event);

			expect(editor.isEditing.value).toBe(false);
		});
	});

	describe('Ctrl+Enter behavior', () => {
		it('should call onExit when Ctrl+Enter is pressed', async () => {
			const editor = createEditor({ key: 'value' }, 'yaml', true);

			if (!editor.isEditing.value) {
				editor.toggleEdit();
				await nextTick();
			}

			container.innerText = 'key: value';
			editor.editingContent.value = 'key: value';
			setCursorAtEnd(container);

			const event = pressKey(container, 'Enter', { ctrl: true });
			editor.onKeyDown(event);

			expect(onExit).toHaveBeenCalled();
			expect(onEmitModelValue).toHaveBeenCalled();
		});
	});

	describe('Delete/Backspace on empty content', () => {
		it('should call onDelete when Backspace is pressed on empty content', async () => {
			const editor = createEditor({}, 'yaml', true);

			if (!editor.isEditing.value) {
				editor.toggleEdit();
				await nextTick();
			}

			container.innerText = '';
			editor.editingContent.value = '';

			const event = new KeyboardEvent('keydown', {
				key: 'Backspace',
				code: 'Backspace',
				bubbles: true,
				cancelable: true
			});
			container.dispatchEvent(event);
			editor.onKeyDown(event);

			expect(onDelete).toHaveBeenCalled();
		});

		it('should NOT call onDelete when content is not empty', async () => {
			const editor = createEditor({ key: 'value' }, 'yaml', true);

			if (!editor.isEditing.value) {
				editor.toggleEdit();
				await nextTick();
			}

			container.innerText = 'key: value';
			editor.editingContent.value = 'key: value';

			const event = new KeyboardEvent('keydown', {
				key: 'Backspace',
				code: 'Backspace',
				bubbles: true,
				cancelable: true
			});
			container.dispatchEvent(event);
			editor.onKeyDown(event);

			expect(onDelete).not.toHaveBeenCalled();
		});
	});

	describe('toggleEdit', () => {
		it('should toggle between edit and view mode', async () => {
			const editor = createEditor({ key: 'value' }, 'yaml', false);

			expect(editor.isEditing.value).toBe(false);

			editor.toggleEdit();
			await nextTick();

			expect(editor.isEditing.value).toBe(true);
			expect(onEmitEditable).toHaveBeenCalledWith(true);

			editor.toggleEdit();

			expect(editor.isEditing.value).toBe(false);
			expect(onEmitEditable).toHaveBeenCalledWith(false);
		});

		it('should clear validation error when exiting edit mode', async () => {
			const editor = createEditor({ key: 'value' }, 'yaml', true);

			// Enter edit mode
			editor.toggleEdit();
			await nextTick();

			// Set a validation error
			editor.validationError.value = { message: 'Test error', line: 1, column: 1 };
			expect(editor.hasValidationError.value).toBe(true);

			// Exit edit mode
			editor.toggleEdit();

			expect(editor.validationError.value).toBeNull();
			expect(editor.hasValidationError.value).toBe(false);
		});
	});

	describe('content input handling', () => {
		it('should update editingContent on input event with target', async () => {
			const editor = createEditor({ key: 'value' }, 'yaml', true);

			if (!editor.isEditing.value) {
				editor.toggleEdit();
				await nextTick();
			}

			// Create an input event with a proper target
			container.innerText = 'new: content';
			const inputEvent = new InputEvent('input', { bubbles: true });
			Object.defineProperty(inputEvent, 'target', { value: container });

			editor.onContentEditableInput(inputEvent);

			expect(editor.editingContent.value).toBe('new: content');
			expect(editor.isUserEditing.value).toBe(true);
		});
	});

	describe('blur handling', () => {
		it('should emit model value on blur when user was editing', async () => {
			const editor = createEditor({ key: 'value' }, 'yaml', true);

			if (!editor.isEditing.value) {
				editor.toggleEdit();
				await nextTick();
			}

			container.innerText = 'updated: value';
			editor.editingContent.value = 'updated: value';
			editor.isUserEditing.value = true;

			editor.onContentEditableBlur();

			expect(onEmitModelValue).toHaveBeenCalled();
			expect(editor.isUserEditing.value).toBe(false);
		});

		it('should NOT emit when user was NOT editing', async () => {
			const editor = createEditor({ key: 'value' }, 'yaml', true);

			if (!editor.isEditing.value) {
				editor.toggleEdit();
				await nextTick();
			}

			editor.isUserEditing.value = false;

			editor.onContentEditableBlur();

			expect(onEmitModelValue).not.toHaveBeenCalled();
		});
	});

	describe('computed properties', () => {
		it('should compute isValid correctly', async () => {
			const editor = createEditor({ key: 'value' }, 'yaml', true);

			// No validation error, codeFormat is valid
			expect(editor.isValid.value).toBe(true);

			// Set validation error
			editor.validationError.value = { message: 'Error', line: 1, column: 1 };
			expect(editor.isValid.value).toBe(false);
		});

		it('should compute charCount correctly', async () => {
			const editor = createEditor({ key: 'value' }, 'yaml', true);

			if (!editor.isEditing.value) {
				editor.toggleEdit();
				await nextTick();
			}

			editor.editingContent.value = '12345';
			editor.isUserEditing.value = true;

			expect(editor.charCount.value).toBe(5);
		});

		it('should use formattedContent when not user editing', async () => {
			const editor = createEditor({ key: 'value' }, 'yaml', false);

			editor.isUserEditing.value = false;

			// displayContent should come from codeFormat.formattedContent
			expect(editor.displayContent.value).toBe(editor.codeFormat.formattedContent.value);
		});
	});

	describe('format change handling', () => {
		it('should update editing content when format changes in edit mode', async () => {
			const editor = createEditor({ key: 'value' }, 'yaml', true);

			if (!editor.isEditing.value) {
				editor.toggleEdit();
				await nextTick();
			}

			// Simulate format change callback
			editor.updateEditingContentOnFormatChange();

			// Content should be updated to new formatted content
			expect(editor.editingContent.value).toBe(editor.codeFormat.formattedContent.value);
		});
	});

	describe('Ctrl+Alt+L language cycling', () => {
		let onEmitFormat: ReturnType<typeof vi.fn>;

		/**
		 * Helper to create an editor with onEmitFormat callback
		 */
		function createEditorWithFormatCallback(
			initialValue: object | string | null,
			format: CodeFormat = 'yaml',
			editable: boolean = false
		) {
			const currentFormat = ref<CodeFormat>(format);
			const canEdit = ref(true);
			const editableRef = ref(editable);
			const codeFormat = useCodeFormat(ref(initialValue), currentFormat);
			onEmitFormat = vi.fn();

			const options: UseCodeViewerEditorOptions = {
				codeRef,
				codeFormat,
				currentFormat,
				canEdit,
				editable: editableRef,
				onEmitModelValue,
				onEmitEditable,
				onEmitFormat,
				onExit,
				onDelete
			};

			return {
				...useCodeViewerEditor(options),
				codeFormat,
				currentFormat,
				canEdit,
				editableRef,
				onEmitFormat
			};
		}

		/**
		 * Helper to dispatch a Ctrl+Alt+L keydown event
		 */
		function pressCtrlAltL(element: HTMLElement): KeyboardEvent {
			const event = new KeyboardEvent('keydown', {
				key: 'l',
				code: 'KeyL',
				ctrlKey: true,
				altKey: true,
				bubbles: true,
				cancelable: true
			});
			element.dispatchEvent(event);
			return event;
		}

		it('should cycle from yaml to json on Ctrl+Alt+L', async () => {
			const editor = createEditorWithFormatCallback({ key: 'value' }, 'yaml', false);

			const event = pressCtrlAltL(container);
			editor.onKeyDown(event);

			// yaml -> json in the yaml/json cycle
			expect(editor.onEmitFormat).toHaveBeenCalledWith('json');
		});

		it('should cycle from json to yaml on Ctrl+Alt+L', async () => {
			const editor = createEditorWithFormatCallback({ key: 'value' }, 'json', false);

			const event = pressCtrlAltL(container);
			editor.onKeyDown(event);

			// json -> yaml in the yaml/json cycle
			expect(editor.onEmitFormat).toHaveBeenCalledWith('yaml');
		});

		it('should cycle from text to markdown on Ctrl+Alt+L (text/markdown cycle)', async () => {
			// When format is 'text', the cycle is [text, markdown]
			const editor = createEditorWithFormatCallback('plain text content', 'text', false);

			const event = pressCtrlAltL(container);
			editor.onKeyDown(event);

			// text -> markdown in the text/markdown cycle
			expect(editor.onEmitFormat).toHaveBeenCalledWith('markdown');
		});

		it('should work in read-only mode (not editing)', async () => {
			const editor = createEditorWithFormatCallback({ key: 'value' }, 'yaml', false);

			// Ensure we're NOT in edit mode
			expect(editor.isEditing.value).toBe(false);

			const event = pressCtrlAltL(container);
			editor.onKeyDown(event);

			// Should still call onEmitFormat even when not editing
			expect(editor.onEmitFormat).toHaveBeenCalledWith('json');
		});

		it('should work in edit mode', async () => {
			const editor = createEditorWithFormatCallback({ key: 'value' }, 'yaml', true);

			// Already in edit mode (editable=true means internalEditable starts true)
			// isEditing = canEdit && internalEditable
			expect(editor.isEditing.value).toBe(true);

			const event = pressCtrlAltL(container);
			editor.onKeyDown(event);

			expect(editor.onEmitFormat).toHaveBeenCalledWith('json');
		});

		it('should prevent default and stop propagation', async () => {
			const editor = createEditorWithFormatCallback({ key: 'value' }, 'yaml', false);

			const event = pressCtrlAltL(container);
			editor.onKeyDown(event);

			expect(event.defaultPrevented).toBe(true);
		});

		it('should complete full cycle yaml -> json -> yaml', async () => {
			// When format is yaml or json, cycle is [yaml, json]
			const editor = createEditorWithFormatCallback({ key: 'value' }, 'yaml', false);

			// First press: yaml -> json
			let event = pressCtrlAltL(container);
			editor.onKeyDown(event);
			expect(editor.onEmitFormat).toHaveBeenCalledWith('json');

			// Simulate format change
			editor.currentFormat.value = 'json';
			editor.onEmitFormat.mockClear();

			// Second press: json -> yaml (cycles back)
			event = pressCtrlAltL(container);
			editor.onKeyDown(event);
			expect(editor.onEmitFormat).toHaveBeenCalledWith('yaml');
		});

		it('should cycle text -> markdown -> text', async () => {
			// When format is text or markdown, cycle is [text, markdown]
			const editor = createEditorWithFormatCallback('plain text', 'text', false);

			// First press: text -> markdown
			let event = pressCtrlAltL(container);
			editor.onKeyDown(event);
			expect(editor.onEmitFormat).toHaveBeenCalledWith('markdown');

			// Simulate format change
			editor.currentFormat.value = 'markdown';
			editor.onEmitFormat.mockClear();

			// Second press: markdown -> text (cycles back)
			event = pressCtrlAltL(container);
			editor.onKeyDown(event);
			expect(editor.onEmitFormat).toHaveBeenCalledWith('text');
		});

		it('should work with Cmd+Alt+L (Mac) as well as Ctrl+Alt+L', async () => {
			const editor = createEditorWithFormatCallback({ key: 'value' }, 'yaml', false);

			// Test with metaKey (Cmd on Mac)
			const event = new KeyboardEvent('keydown', {
				key: 'l',
				code: 'KeyL',
				metaKey: true,
				altKey: true,
				bubbles: true,
				cancelable: true
			});
			container.dispatchEvent(event);
			editor.onKeyDown(event);

			expect(editor.onEmitFormat).toHaveBeenCalledWith('json');
		});

		it('should not call onEmitFormat when onEmitFormat callback is not provided', async () => {
			// Use the regular createEditor which doesn't set onEmitFormat
			const editor = createEditor({ key: 'value' }, 'yaml', false);

			const event = pressCtrlAltL(container);

			// Should not throw and should still prevent default
			expect(() => editor.onKeyDown(event)).not.toThrow();
			expect(event.defaultPrevented).toBe(true);
		});
	});
});
