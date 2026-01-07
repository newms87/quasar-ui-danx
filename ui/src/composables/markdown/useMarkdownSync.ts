import { onUnmounted, Ref, ref } from "vue";
import { renderMarkdown } from "../../helpers/formats/markdown";

/**
 * Options for useMarkdownSync composable
 */
export interface UseMarkdownSyncOptions {
	contentRef: Ref<HTMLElement | null>;
	onEmitValue: (markdown: string) => void;
	debounceMs?: number;
}

/**
 * Return type for useMarkdownSync composable
 */
export interface UseMarkdownSyncReturn {
	renderedHtml: Ref<string>;
	isInternalUpdate: Ref<boolean>;
	syncFromMarkdown: (markdown: string) => void;
	syncFromHtml: () => void;
	debouncedSyncFromHtml: () => void;
}

/**
 * Convert HTML back to markdown
 * This handles the reverse conversion from rendered HTML to markdown source
 */
function htmlToMarkdown(html: string): string {
	// Create a temporary element to parse the HTML
	const temp = document.createElement("div");
	temp.innerHTML = html;

	return processNode(temp);
}

/**
 * Process a DOM node and convert it to markdown
 */
function processNode(node: Node): string {
	const parts: string[] = [];

	for (const child of Array.from(node.childNodes)) {
		if (child.nodeType === Node.TEXT_NODE) {
			parts.push(child.textContent || "");
		} else if (child.nodeType === Node.ELEMENT_NODE) {
			const element = child as Element;
			const tagName = element.tagName.toLowerCase();

			switch (tagName) {
				// Headings
				case "h1":
					parts.push(`# ${getTextContent(element)}\n\n`);
					break;
				case "h2":
					parts.push(`## ${getTextContent(element)}\n\n`);
					break;
				case "h3":
					parts.push(`### ${getTextContent(element)}\n\n`);
					break;
				case "h4":
					parts.push(`#### ${getTextContent(element)}\n\n`);
					break;
				case "h5":
					parts.push(`##### ${getTextContent(element)}\n\n`);
					break;
				case "h6":
					parts.push(`###### ${getTextContent(element)}\n\n`);
					break;

				// Paragraphs
				case "p":
					parts.push(`${processInlineContent(element)}\n\n`);
					break;

				// Line breaks
				case "br":
					parts.push("  \n");
					break;

				// Bold
				case "strong":
				case "b":
					parts.push(`**${processInlineContent(element)}**`);
					break;

				// Italic
				case "em":
				case "i":
					parts.push(`*${processInlineContent(element)}*`);
					break;

				// Inline code
				case "code":
					if (element.parentElement?.tagName.toLowerCase() !== "pre") {
						parts.push(`\`${element.textContent || ""}\``);
					} else {
						parts.push(element.textContent || "");
					}
					break;

				// Code blocks
				case "pre": {
					const codeElement = element.querySelector("code");
					const code = codeElement?.textContent || element.textContent || "";
					const langClass = codeElement?.className.match(/language-(\w+)/);
					const lang = langClass ? langClass[1] : "";
					parts.push(`\`\`\`${lang}\n${code}\n\`\`\`\n\n`);
					break;
				}

				// Blockquotes
				case "blockquote": {
					const content = processNode(element).trim();
					const quotedLines = content.split("\n").map(line => `> ${line}`).join("\n");
					parts.push(`${quotedLines}\n\n`);
					break;
				}

				// Unordered lists
				case "ul":
					parts.push(processListItems(element, "-"));
					break;

				// Ordered lists
				case "ol":
					parts.push(processListItems(element, "1."));
					break;

				// List items (handled by processListItems)
				case "li":
					parts.push(processInlineContent(element));
					break;

				// Links
				case "a": {
					const href = element.getAttribute("href") || "";
					const text = processInlineContent(element);
					parts.push(`[${text}](${href})`);
					break;
				}

				// Images
				case "img": {
					const src = element.getAttribute("src") || "";
					const alt = element.getAttribute("alt") || "";
					parts.push(`![${alt}](${src})`);
					break;
				}

				// Horizontal rules
				case "hr":
					parts.push("---\n\n");
					break;

				// Strikethrough
				case "del":
				case "s":
					parts.push(`~~${processInlineContent(element)}~~`);
					break;

				// Highlight
				case "mark":
					parts.push(`==${processInlineContent(element)}==`);
					break;

				// Superscript
				case "sup":
					parts.push(`^${processInlineContent(element)}^`);
					break;

				// Subscript
				case "sub":
					parts.push(`~${processInlineContent(element)}~`);
					break;

				// Divs - treat as paragraphs (browsers create DIVs when pressing Enter)
				case "div": {
					const content = processInlineContent(element);
					// Only add paragraph breaks if div has content
					if (content.trim()) {
						parts.push(`${content}\n\n`);
					}
					break;
				}

				// Spans - inline containers, just process children
				case "span":
					parts.push(processNode(element));
					break;

				// Tables
				case "table":
					parts.push(processTable(element));
					break;

				default:
					// Unknown elements - just get text content
					parts.push(processNode(element));
			}
		}
	}

	return parts.join("");
}

/**
 * Process inline content (text with inline formatting)
 */
function processInlineContent(element: Element): string {
	const parts: string[] = [];

	for (const child of Array.from(element.childNodes)) {
		if (child.nodeType === Node.TEXT_NODE) {
			parts.push(child.textContent || "");
		} else if (child.nodeType === Node.ELEMENT_NODE) {
			const el = child as Element;
			const tagName = el.tagName.toLowerCase();

			switch (tagName) {
				case "strong":
				case "b":
					parts.push(`**${processInlineContent(el)}**`);
					break;
				case "em":
				case "i":
					parts.push(`*${processInlineContent(el)}*`);
					break;
				case "code":
					parts.push(`\`${el.textContent || ""}\``);
					break;
				case "a": {
					const href = el.getAttribute("href") || "";
					parts.push(`[${processInlineContent(el)}](${href})`);
					break;
				}
				case "img": {
					const src = el.getAttribute("src") || "";
					const alt = el.getAttribute("alt") || "";
					parts.push(`![${alt}](${src})`);
					break;
				}
				case "del":
				case "s":
					parts.push(`~~${processInlineContent(el)}~~`);
					break;
				case "mark":
					parts.push(`==${processInlineContent(el)}==`);
					break;
				case "sup":
					parts.push(`^${processInlineContent(el)}^`);
					break;
				case "sub":
					parts.push(`~${processInlineContent(el)}~`);
					break;
				case "br":
					parts.push("  \n");
					break;
				default:
					parts.push(processInlineContent(el));
			}
		}
	}

	return parts.join("");
}

/**
 * Process list items
 */
function processListItems(listElement: Element, marker: string): string {
	const items: string[] = [];
	let index = 1;

	for (const child of Array.from(listElement.children)) {
		if (child.tagName.toLowerCase() === "li") {
			const prefix = marker === "1." ? `${index}. ` : `${marker} `;
			const content = processInlineContent(child);

			// Check for nested lists
			const nestedUl = child.querySelector("ul");
			const nestedOl = child.querySelector("ol");

			if (nestedUl || nestedOl) {
				// Get text content before nested list
				const textParts: string[] = [];
				for (const node of Array.from(child.childNodes)) {
					if (node.nodeType === Node.TEXT_NODE) {
						textParts.push(node.textContent || "");
					} else if (node.nodeType === Node.ELEMENT_NODE) {
						const el = node as Element;
						if (el.tagName.toLowerCase() !== "ul" && el.tagName.toLowerCase() !== "ol") {
							textParts.push(processInlineContent(el));
						}
					}
				}
				items.push(`${prefix}${textParts.join("").trim()}`);

				// Process nested list with indentation
				if (nestedUl) {
					const nestedItems = processListItems(nestedUl, "-").split("\n").filter(Boolean);
					items.push(...nestedItems.map(item => `  ${item}`));
				}
				if (nestedOl) {
					const nestedItems = processListItems(nestedOl, "1.").split("\n").filter(Boolean);
					items.push(...nestedItems.map(item => `  ${item}`));
				}
			} else {
				items.push(`${prefix}${content}`);
			}

			index++;
		}
	}

	return items.join("\n") + "\n\n";
}

/**
 * Process table element
 */
function processTable(table: Element): string {
	const rows: string[][] = [];
	const alignments: string[] = [];

	// Process thead
	const thead = table.querySelector("thead");
	if (thead) {
		const headerRow = thead.querySelector("tr");
		if (headerRow) {
			const cells: string[] = [];
			for (const th of Array.from(headerRow.querySelectorAll("th"))) {
				cells.push(processInlineContent(th).trim());
				// Detect alignment from style or class
				const style = th.getAttribute("style") || "";
				if (style.includes("text-align: center")) {
					alignments.push(":---:");
				} else if (style.includes("text-align: right")) {
					alignments.push("---:");
				} else {
					alignments.push("---");
				}
			}
			rows.push(cells);
		}
	}

	// Process tbody
	const tbody = table.querySelector("tbody") || table;
	for (const tr of Array.from(tbody.querySelectorAll("tr"))) {
		if (thead && tr.parentElement === thead) continue;
		const cells: string[] = [];
		for (const td of Array.from(tr.querySelectorAll("td, th"))) {
			cells.push(processInlineContent(td).trim());
		}
		if (cells.length > 0) {
			rows.push(cells);
		}
	}

	if (rows.length === 0) return "";

	// Build markdown table
	const lines: string[] = [];

	// Header row
	if (rows.length > 0) {
		lines.push(`| ${rows[0].join(" | ")} |`);
		// Separator with alignments
		if (alignments.length > 0) {
			lines.push(`| ${alignments.join(" | ")} |`);
		} else {
			lines.push(`| ${rows[0].map(() => "---").join(" | ")} |`);
		}
	}

	// Data rows
	for (let i = 1; i < rows.length; i++) {
		lines.push(`| ${rows[i].join(" | ")} |`);
	}

	return lines.join("\n") + "\n\n";
}

/**
 * Get plain text content of an element
 */
function getTextContent(element: Element): string {
	return element.textContent?.trim() || "";
}

/**
 * Composable for bidirectional markdown <-> HTML synchronization
 */
export function useMarkdownSync(options: UseMarkdownSyncOptions): UseMarkdownSyncReturn {
	const { contentRef, onEmitValue, debounceMs = 300 } = options;

	const renderedHtml = ref("");
	// Flag to track when changes originate from the editor itself (vs external prop changes)
	// This prevents cursor jumping when the watch triggers setMarkdown after internal edits
	const isInternalUpdate = ref(false);
	let syncTimeout: ReturnType<typeof setTimeout> | null = null;

	/**
	 * Convert markdown to HTML and update rendered content
	 */
	function syncFromMarkdown(markdown: string): void {
		renderedHtml.value = renderMarkdown(markdown);
	}

	/**
	 * Convert HTML from content element back to markdown and emit
	 */
	function syncFromHtml(): void {
		if (!contentRef.value) return;

		const html = contentRef.value.innerHTML;
		const markdown = htmlToMarkdown(html);

		// Clean up extra whitespace
		const cleaned = markdown.replace(/\n{3,}/g, "\n\n").trim();

		// Mark as internal update before emitting to prevent watch from triggering setMarkdown
		isInternalUpdate.value = true;
		onEmitValue(cleaned);
	}

	/**
	 * Debounced version of syncFromHtml for input handling
	 */
	function debouncedSyncFromHtml(): void {
		if (syncTimeout) {
			clearTimeout(syncTimeout);
		}
		syncTimeout = setTimeout(() => {
			syncFromHtml();
		}, debounceMs);
	}

	// Cleanup on unmount
	onUnmounted(() => {
		if (syncTimeout) {
			clearTimeout(syncTimeout);
		}
	});

	return {
		renderedHtml,
		isInternalUpdate,
		syncFromMarkdown,
		syncFromHtml,
		debouncedSyncFromHtml
	};
}
