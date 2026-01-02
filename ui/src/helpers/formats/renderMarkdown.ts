/**
 * Lightweight markdown to HTML renderer
 * Zero external dependencies, XSS-safe by default
 */

export interface MarkdownRenderOptions {
	sanitize?: boolean; // XSS protection (default: true)
}

/**
 * Escape HTML entities to prevent XSS
 */
function escapeHtml(text: string): string {
	return text
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}

/**
 * Token types for block-level parsing
 */
export type BlockToken =
	| { type: "heading"; level: number; content: string }
	| { type: "code_block"; language: string; content: string }
	| { type: "blockquote"; content: string }
	| { type: "ul"; items: string[] }
	| { type: "ol"; items: string[]; start: number }
	| { type: "hr" }
	| { type: "paragraph"; content: string };

/**
 * Parse inline markdown elements within text
 * Order matters: more specific patterns first
 */
export function parseInline(text: string, sanitize: boolean = true): string {
	if (!text) return "";

	// Escape HTML if sanitizing (before applying markdown)
	let result = sanitize ? escapeHtml(text) : text;

	// Images: ![alt](url) - must be before links
	result = result.replace(
		/!\[([^\]]*)\]\(([^)]+)\)/g,
		'<img src="$2" alt="$1" />'
	);

	// Links: [text](url)
	result = result.replace(
		/\[([^\]]+)\]\(([^)]+)\)/g,
		'<a href="$2">$1</a>'
	);

	// Inline code: `code` (escape the content again if already escaped)
	result = result.replace(/`([^`]+)`/g, "<code>$1</code>");

	// Bold + Italic: ***text*** or ___text___
	result = result.replace(/\*\*\*([^*]+)\*\*\*/g, "<strong><em>$1</em></strong>");
	result = result.replace(/___([^_]+)___/g, "<strong><em>$1</em></strong>");

	// Bold: **text** or __text__
	result = result.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
	result = result.replace(/__([^_]+)__/g, "<strong>$1</strong>");

	// Italic: *text* or _text_ (but not inside words for underscores)
	// For asterisks, match any single asterisk pairs
	result = result.replace(/\*([^*]+)\*/g, "<em>$1</em>");
	// For underscores, only match at word boundaries
	result = result.replace(/(^|[^a-zA-Z0-9])_([^_]+)_([^a-zA-Z0-9]|$)/g, "$1<em>$2</em>$3");

	return result;
}

/**
 * Tokenize markdown into block-level elements
 */
export function tokenizeBlocks(markdown: string): BlockToken[] {
	const tokens: BlockToken[] = [];
	const lines = markdown.split("\n");
	let i = 0;

	while (i < lines.length) {
		const line = lines[i];
		const trimmedLine = line.trim();

		// Skip empty lines between blocks
		if (!trimmedLine) {
			i++;
			continue;
		}

		// Code blocks: ```language ... ```
		if (trimmedLine.startsWith("```")) {
			const language = trimmedLine.slice(3).trim();
			const contentLines: string[] = [];
			i++;

			while (i < lines.length && !lines[i].trim().startsWith("```")) {
				contentLines.push(lines[i]);
				i++;
			}

			tokens.push({
				type: "code_block",
				language,
				content: contentLines.join("\n")
			});

			// Skip closing ```
			if (i < lines.length) i++;
			continue;
		}

		// Headings: # through ######
		const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
		if (headingMatch) {
			tokens.push({
				type: "heading",
				level: headingMatch[1].length,
				content: headingMatch[2]
			});
			i++;
			continue;
		}

		// Horizontal rules: ---, ***, ___
		if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmedLine)) {
			tokens.push({ type: "hr" });
			i++;
			continue;
		}

		// Blockquotes: > text
		if (trimmedLine.startsWith(">")) {
			const quoteLines: string[] = [];

			while (i < lines.length && lines[i].trim().startsWith(">")) {
				// Remove the leading > and optional space
				quoteLines.push(lines[i].trim().replace(/^>\s?/, ""));
				i++;
			}

			tokens.push({
				type: "blockquote",
				content: quoteLines.join("\n")
			});
			continue;
		}

		// Unordered lists: -, *, +
		if (/^[-*+]\s+/.test(trimmedLine)) {
			const items: string[] = [];

			while (i < lines.length) {
				const listLine = lines[i].trim();
				const listMatch = listLine.match(/^[-*+]\s+(.+)$/);

				if (listMatch) {
					items.push(listMatch[1]);
					i++;
				} else if (listLine === "") {
					// Empty line might end the list or just be spacing
					i++;
					// Check if next non-empty line continues the list
					const nextNonEmpty = lines.slice(i).find((l) => l.trim() !== "");
					if (!nextNonEmpty || !/^[-*+]\s+/.test(nextNonEmpty.trim())) {
						break;
					}
				} else {
					break;
				}
			}

			tokens.push({ type: "ul", items });
			continue;
		}

		// Ordered lists: 1., 2., etc.
		const orderedMatch = trimmedLine.match(/^(\d+)\.\s+(.+)$/);
		if (orderedMatch) {
			const items: string[] = [];
			const startNum = parseInt(orderedMatch[1], 10);

			while (i < lines.length) {
				const listLine = lines[i].trim();
				const listMatch = listLine.match(/^\d+\.\s+(.+)$/);

				if (listMatch) {
					items.push(listMatch[1]);
					i++;
				} else if (listLine === "") {
					i++;
					// Check if next non-empty line continues the list
					const nextNonEmpty = lines.slice(i).find((l) => l.trim() !== "");
					if (!nextNonEmpty || !/^\d+\.\s+/.test(nextNonEmpty.trim())) {
						break;
					}
				} else {
					break;
				}
			}

			tokens.push({ type: "ol", items, start: startNum });
			continue;
		}

		// Paragraph: collect consecutive non-empty lines
		const paragraphLines: string[] = [];

		while (i < lines.length) {
			const pLine = lines[i];
			const pTrimmed = pLine.trim();

			// Stop on empty line or block-level element
			if (!pTrimmed) {
				i++;
				break;
			}

			// Check for block-level starters
			if (
				pTrimmed.startsWith("#") ||
				pTrimmed.startsWith("```") ||
				pTrimmed.startsWith(">") ||
				/^[-*+]\s+/.test(pTrimmed) ||
				/^\d+\.\s+/.test(pTrimmed) ||
				/^(-{3,}|\*{3,}|_{3,})$/.test(pTrimmed)
			) {
				break;
			}

			paragraphLines.push(pLine);
			i++;
		}

		if (paragraphLines.length > 0) {
			tokens.push({
				type: "paragraph",
				content: paragraphLines.join("\n")
			});
		}
	}

	return tokens;
}

/**
 * Render tokens to HTML
 */
function renderTokens(tokens: BlockToken[], sanitize: boolean): string {
	const htmlParts: string[] = [];

	for (const token of tokens) {
		switch (token.type) {
			case "heading": {
				const content = parseInline(token.content, sanitize);
				htmlParts.push(`<h${token.level}>${content}</h${token.level}>`);
				break;
			}

			case "code_block": {
				// Always escape code block content for safety
				const escapedContent = escapeHtml(token.content);
				const langAttr = token.language ? ` class="language-${escapeHtml(token.language)}"` : "";
				htmlParts.push(`<pre><code${langAttr}>${escapedContent}</code></pre>`);
				break;
			}

			case "blockquote": {
				// Recursively parse blockquote content
				const innerTokens = tokenizeBlocks(token.content);
				const innerHtml = renderTokens(innerTokens, sanitize);
				htmlParts.push(`<blockquote>${innerHtml}</blockquote>`);
				break;
			}

			case "ul": {
				const items = token.items
					.map((item) => `<li>${parseInline(item, sanitize)}</li>`)
					.join("");
				htmlParts.push(`<ul>${items}</ul>`);
				break;
			}

			case "ol": {
				const items = token.items
					.map((item) => `<li>${parseInline(item, sanitize)}</li>`)
					.join("");
				const startAttr = token.start !== 1 ? ` start="${token.start}"` : "";
				htmlParts.push(`<ol${startAttr}>${items}</ol>`);
				break;
			}

			case "hr": {
				htmlParts.push("<hr />");
				break;
			}

			case "paragraph": {
				const content = parseInline(token.content, sanitize);
				// Convert single newlines to <br> within paragraphs
				const withBreaks = content.replace(/\n/g, "<br />");
				htmlParts.push(`<p>${withBreaks}</p>`);
				break;
			}
		}
	}

	return htmlParts.join("\n");
}

/**
 * Convert markdown text to HTML
 *
 * Supports:
 * - Headings (# through ######)
 * - Paragraphs (double newlines)
 * - Code blocks (```language ... ```)
 * - Blockquotes (> text)
 * - Unordered lists (-, *, +)
 * - Ordered lists (1., 2., etc.)
 * - Horizontal rules (---, ***, ___)
 * - Bold (**text** or __text__)
 * - Italic (*text* or _text_)
 * - Bold+Italic (***text***)
 * - Inline code (`code`)
 * - Links [text](url)
 * - Images ![alt](url)
 */
export function renderMarkdown(markdown: string, options?: MarkdownRenderOptions): string {
	if (!markdown) return "";

	const sanitize = options?.sanitize ?? true;
	const tokens = tokenizeBlocks(markdown);
	return renderTokens(tokens, sanitize);
}
