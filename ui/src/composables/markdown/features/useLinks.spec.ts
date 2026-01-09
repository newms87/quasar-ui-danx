import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { useLinks } from "./useLinks";
import { createTestEditor, TestEditorResult } from "../../../test/helpers/editorTestUtils";

describe("useLinks", () => {
	let editor: TestEditorResult;
	let onContentChange: ReturnType<typeof vi.fn>;

	afterEach(() => {
		if (editor) {
			editor.destroy();
		}
		vi.restoreAllMocks();
	});

	function createLinks() {
		return useLinks({
			contentRef: editor.contentRef,
			onContentChange
		});
	}

	describe("insertLink", () => {
		describe("with selected text", () => {
			beforeEach(() => {
				onContentChange = vi.fn();
			});

			it("wraps selected text in anchor tag with prompted URL", () => {
				editor = createTestEditor("<p>Hello world</p>");
				vi.spyOn(window, "prompt").mockReturnValue("https://example.com");
				const links = createLinks();
				editor.selectInBlock(0, 0, 5); // Select "Hello"

				links.insertLink();

				expect(editor.getHtml()).toBe('<p><a href="https://example.com">Hello</a> world</p>');
				expect(onContentChange).toHaveBeenCalled();
			});

			it("wraps middle text in anchor tag", () => {
				editor = createTestEditor("<p>Hello beautiful world</p>");
				vi.spyOn(window, "prompt").mockReturnValue("https://test.com");
				const links = createLinks();
				editor.selectInBlock(0, 6, 15); // Select "beautiful"

				links.insertLink();

				expect(editor.getHtml()).toBe('<p>Hello <a href="https://test.com">beautiful</a> world</p>');
			});

			it("trims whitespace from URL", () => {
				editor = createTestEditor("<p>Hello world</p>");
				vi.spyOn(window, "prompt").mockReturnValue("  https://example.com  ");
				const links = createLinks();
				editor.selectInBlock(0, 0, 5);

				links.insertLink();

				expect(editor.getHtml()).toBe('<p><a href="https://example.com">Hello</a> world</p>');
			});

			it("does nothing when user cancels prompt", () => {
				editor = createTestEditor("<p>Hello world</p>");
				vi.spyOn(window, "prompt").mockReturnValue(null);
				const links = createLinks();
				editor.selectInBlock(0, 0, 5);

				links.insertLink();

				expect(editor.getHtml()).toBe("<p>Hello world</p>");
				expect(onContentChange).not.toHaveBeenCalled();
			});

			it("does nothing when user enters empty URL", () => {
				editor = createTestEditor("<p>Hello world</p>");
				vi.spyOn(window, "prompt").mockReturnValue("");
				const links = createLinks();
				editor.selectInBlock(0, 0, 5);

				links.insertLink();

				expect(editor.getHtml()).toBe("<p>Hello world</p>");
				expect(onContentChange).not.toHaveBeenCalled();
			});

			it("does nothing when user enters whitespace-only URL", () => {
				editor = createTestEditor("<p>Hello world</p>");
				vi.spyOn(window, "prompt").mockReturnValue("   ");
				const links = createLinks();
				editor.selectInBlock(0, 0, 5);

				links.insertLink();

				expect(editor.getHtml()).toBe("<p>Hello world</p>");
				expect(onContentChange).not.toHaveBeenCalled();
			});

			it("selects the wrapped content after wrapping", () => {
				editor = createTestEditor("<p>Hello world</p>");
				vi.spyOn(window, "prompt").mockReturnValue("https://example.com");
				const links = createLinks();
				editor.selectInBlock(0, 0, 5);

				links.insertLink();

				const selection = window.getSelection();
				expect(selection?.toString()).toBe("Hello");
			});
		});

		describe("without selection (cursor only)", () => {
			beforeEach(() => {
				onContentChange = vi.fn();
			});

			it("inserts link with URL as text when no selection", () => {
				editor = createTestEditor("<p>Hello world</p>");
				vi.spyOn(window, "prompt").mockReturnValue("https://example.com");
				const links = createLinks();
				editor.setCursorInBlock(0, 6); // After "Hello "

				links.insertLink();

				expect(editor.getHtml()).toContain('<a href="https://example.com">https://example.com</a>');
				expect(onContentChange).toHaveBeenCalled();
			});

			it("does nothing when user cancels prompt", () => {
				editor = createTestEditor("<p>Hello world</p>");
				vi.spyOn(window, "prompt").mockReturnValue(null);
				const links = createLinks();
				editor.setCursorInBlock(0, 6);

				links.insertLink();

				expect(editor.getHtml()).toBe("<p>Hello world</p>");
				expect(onContentChange).not.toHaveBeenCalled();
			});

			it("does nothing when user enters empty URL", () => {
				editor = createTestEditor("<p>Hello world</p>");
				vi.spyOn(window, "prompt").mockReturnValue("");
				const links = createLinks();
				editor.setCursorInBlock(0, 6);

				links.insertLink();

				expect(editor.getHtml()).toBe("<p>Hello world</p>");
				expect(onContentChange).not.toHaveBeenCalled();
			});

			it("selects the inserted link text after insertion", () => {
				editor = createTestEditor("<p>Hello world</p>");
				vi.spyOn(window, "prompt").mockReturnValue("https://example.com");
				const links = createLinks();
				editor.setCursorInBlock(0, 6);

				links.insertLink();

				const selection = window.getSelection();
				expect(selection?.toString()).toBe("https://example.com");
			});
		});

		describe("editing existing link", () => {
			beforeEach(() => {
				onContentChange = vi.fn();
			});

			it("prompts with current URL prefilled when cursor is in link", () => {
				editor = createTestEditor('<p><a href="https://old.com">Hello</a> world</p>');
				const promptSpy = vi.spyOn(window, "prompt").mockReturnValue("https://new.com");
				const links = createLinks();
				const linkEl = editor.container.querySelector("a");
				editor.setCursor(linkEl!.firstChild!, 3); // Inside "Hello"

				links.insertLink();

				expect(promptSpy).toHaveBeenCalledWith("Edit link URL:", "https://old.com");
			});

			it("updates URL when user provides new URL", () => {
				editor = createTestEditor('<p><a href="https://old.com">Hello</a> world</p>');
				vi.spyOn(window, "prompt").mockReturnValue("https://new.com");
				const links = createLinks();
				const linkEl = editor.container.querySelector("a");
				editor.setCursor(linkEl!.firstChild!, 3);

				links.insertLink();

				expect(editor.getHtml()).toBe('<p><a href="https://new.com">Hello</a> world</p>');
				expect(onContentChange).toHaveBeenCalled();
			});

			it("removes link when user enters empty URL", () => {
				editor = createTestEditor('<p><a href="https://example.com">Hello</a> world</p>');
				vi.spyOn(window, "prompt").mockReturnValue("");
				const links = createLinks();
				const linkEl = editor.container.querySelector("a");
				editor.setCursor(linkEl!.firstChild!, 3);

				links.insertLink();

				expect(editor.getHtml()).toBe("<p>Hello world</p>");
				expect(onContentChange).toHaveBeenCalled();
			});

			it("does nothing when user cancels prompt on existing link", () => {
				editor = createTestEditor('<p><a href="https://example.com">Hello</a> world</p>');
				vi.spyOn(window, "prompt").mockReturnValue(null);
				const links = createLinks();
				const linkEl = editor.container.querySelector("a");
				editor.setCursor(linkEl!.firstChild!, 3);

				links.insertLink();

				expect(editor.getHtml()).toBe('<p><a href="https://example.com">Hello</a> world</p>');
				expect(onContentChange).not.toHaveBeenCalled();
			});

			it("handles link with empty href attribute", () => {
				editor = createTestEditor('<p><a href="">Hello</a> world</p>');
				const promptSpy = vi.spyOn(window, "prompt").mockReturnValue("https://new.com");
				const links = createLinks();
				const linkEl = editor.container.querySelector("a");
				editor.setCursor(linkEl!.firstChild!, 3);

				links.insertLink();

				expect(promptSpy).toHaveBeenCalledWith("Edit link URL:", "");
				expect(editor.getHtml()).toBe('<p><a href="https://new.com">Hello</a> world</p>');
			});
		});
	});

	describe("isInLink", () => {
		beforeEach(() => {
			onContentChange = vi.fn();
		});

		it("returns true when cursor is inside a link", () => {
			editor = createTestEditor('<p><a href="https://example.com">Hello</a> world</p>');
			const links = createLinks();
			const linkEl = editor.container.querySelector("a");
			editor.setCursor(linkEl!.firstChild!, 3);

			expect(links.isInLink()).toBe(true);
		});

		it("returns false when cursor is outside a link", () => {
			editor = createTestEditor('<p><a href="https://example.com">Hello</a> world</p>');
			const links = createLinks();
			editor.setCursorInBlock(0, 8); // In " world"

			expect(links.isInLink()).toBe(false);
		});

		it("returns false when there are no links in content", () => {
			editor = createTestEditor("<p>Hello world</p>");
			const links = createLinks();
			editor.setCursorInBlock(0, 5);

			expect(links.isInLink()).toBe(false);
		});

		it("returns false when contentRef is null", () => {
			editor = createTestEditor("<p>Hello world</p>");
			const links = useLinks({
				contentRef: { value: null },
				onContentChange
			});

			expect(links.isInLink()).toBe(false);
		});

		it("returns false when no selection exists", () => {
			editor = createTestEditor('<p><a href="https://example.com">Hello</a> world</p>');
			const links = createLinks();

			// Clear any selection
			window.getSelection()?.removeAllRanges();

			expect(links.isInLink()).toBe(false);
		});
	});

	describe("edge cases", () => {
		beforeEach(() => {
			onContentChange = vi.fn();
		});

		it("does nothing when contentRef is null", () => {
			editor = createTestEditor("<p>Hello world</p>");
			const links = useLinks({
				contentRef: { value: null },
				onContentChange
			});

			links.insertLink();

			expect(editor.getHtml()).toBe("<p>Hello world</p>");
			expect(onContentChange).not.toHaveBeenCalled();
		});

		it("does nothing when selection is outside content area", () => {
			editor = createTestEditor("<p>Hello world</p>");
			const links = createLinks();

			// Create a selection outside the editor
			const externalDiv = document.createElement("div");
			externalDiv.textContent = "External text";
			document.body.appendChild(externalDiv);

			const range = document.createRange();
			range.selectNodeContents(externalDiv);
			const sel = window.getSelection();
			sel?.removeAllRanges();
			sel?.addRange(range);

			links.insertLink();

			expect(editor.getHtml()).toBe("<p>Hello world</p>");
			expect(onContentChange).not.toHaveBeenCalled();

			externalDiv.remove();
		});

		it("does nothing when no selection exists", () => {
			editor = createTestEditor("<p>Hello world</p>");
			const links = createLinks();

			// Clear any selection
			window.getSelection()?.removeAllRanges();

			links.insertLink();

			expect(editor.getHtml()).toBe("<p>Hello world</p>");
			expect(onContentChange).not.toHaveBeenCalled();
		});

		it("handles nested elements within selection", () => {
			editor = createTestEditor("<p><strong>Hello</strong> world</p>");
			vi.spyOn(window, "prompt").mockReturnValue("https://example.com");
			const links = createLinks();
			editor.selectInBlock(0, 0, 5); // Select "Hello" (inside strong)

			links.insertLink();

			// The link should wrap the strong element
			expect(editor.getHtml()).toContain("https://example.com");
			expect(onContentChange).toHaveBeenCalled();
		});
	});

	describe("return type", () => {
		beforeEach(() => {
			onContentChange = vi.fn();
			editor = createTestEditor("<p>test</p>");
		});

		it("returns insertLink and isInLink functions", () => {
			const links = createLinks();

			expect(typeof links.insertLink).toBe("function");
			expect(typeof links.isInLink).toBe("function");
		});
	});
});
