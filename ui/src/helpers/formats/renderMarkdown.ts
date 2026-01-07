/**
 * Lightweight markdown to HTML renderer
 * Zero external dependencies, XSS-safe by default
 */

export interface MarkdownRenderOptions {
	sanitize?: boolean; // XSS protection (default: true)
	preserveState?: boolean; // Don't reset link refs and footnotes (for nested rendering)
}

/**
 * Link reference for reference-style links
 */
type LinkReference = {
	url: string;
	title?: string;
};

/**
 * Footnote definition for footnote references
 */
export type FootnoteDefinition = {
	content: string;
	index: number; // For numbered display
};

/**
 * Module-level storage for link references extracted during tokenization
 * Used to share link definitions between tokenizeBlocks and parseInline
 */
let currentLinkRefs: Record<string, LinkReference> = {};

/**
 * Module-level storage for footnotes extracted during tokenization
 * Used to share footnote definitions between tokenizeBlocks and renderMarkdown
 */
let currentFootnotes: Record<string, FootnoteDefinition> = {};
let footnoteCounter = 0;


/**
 * Get the current footnotes (useful for Vue component rendering)
 */
export function getFootnotes(): Record<string, FootnoteDefinition> {
	return currentFootnotes;
}

/**
 * Reset the parser state (link refs and footnotes)
 * Call this before starting a new document parse
 */
export function resetParserState(): void {
	currentLinkRefs = {};
	currentFootnotes = {};
	footnoteCounter = 0;
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
 * List item type supporting nested content
 */
export type ListItem = {
	content: string;
	children?: BlockToken[]; // Nested lists or other block content
};

/**
 * Token types for block-level parsing
 */
export type BlockToken =
	| { type: "heading"; level: number; content: string }
	| { type: "code_block"; language: string; content: string }
	| { type: "blockquote"; content: string }
	| { type: "ul"; items: ListItem[] }
	| { type: "ol"; items: ListItem[]; start: number }
	| { type: "task_list"; items: Array<{ checked: boolean; content: string }> }
	| { type: "table"; headers: string[]; alignments: ("left" | "center" | "right" | null)[]; rows: string[][] }
	| { type: "dl"; items: Array<{ term: string; definitions: string[] }> }
	| { type: "hr" }
	| { type: "paragraph"; content: string };

/**
 * Escape sequences mapping - character to Unicode placeholder
 * Using Private Use Area characters (U+E000-U+F8FF) to avoid conflicts
 */
const ESCAPE_MAP: Record<string, string> = {
	"\\*": "\uE000",
	"\\_": "\uE001",
	"\\~": "\uE002",
	"\\`": "\uE003",
	"\\[": "\uE004",
	"\\]": "\uE005",
	"\\#": "\uE006",
	"\\&gt;": "\uE007", // Escaped > becomes &gt; after HTML escaping
	"\\-": "\uE008",
	"\\+": "\uE009",
	"\\.": "\uE00A",
	"\\!": "\uE00B",
	"\\=": "\uE00C",
	"\\^": "\uE00D"
};

/**
 * Reverse mapping - placeholder back to literal character
 */
const UNESCAPE_MAP: Record<string, string> = {
	"\uE000": "*",
	"\uE001": "_",
	"\uE002": "~",
	"\uE003": "`",
	"\uE004": "[",
	"\uE005": "]",
	"\uE006": "#",
	"\uE007": "&gt;",
	"\uE008": "-",
	"\uE009": "+",
	"\uE00A": ".",
	"\uE00B": "!",
	"\uE00C": "=",
	"\uE00D": "^"
};

/**
 * Parse inline markdown elements within text
 * Order matters: more specific patterns first
 */
export function parseInline(text: string, sanitize: boolean = true): string {
	if (!text) return "";

	// Escape HTML if sanitizing (before applying markdown)
	let result = sanitize ? escapeHtml(text) : text;

	// 1. ESCAPE SEQUENCES - Pre-process backslash escapes to placeholders
	// Must be first so escaped characters aren't treated as markdown
	for (const [pattern, placeholder] of Object.entries(ESCAPE_MAP)) {
		result = result.split(pattern).join(placeholder);
	}

	// 2. HARD LINE BREAKS - Two trailing spaces + newline becomes <br />
	result = result.replace(/ {2,}\n/g, "<br />\n");

	// 3. AUTOLINKS - Must be before regular link parsing
	// URL autolinks: <https://example.com>
	result = result.replace(/&lt;(https?:\/\/[^&]+)&gt;/g, '<a href="$1">$1</a>');
	// Email autolinks: <user@example.com>
	result = result.replace(/&lt;([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})&gt;/g, '<a href="mailto:$1">$1</a>');

	// 2.5. FOOTNOTE REFERENCES: [^id]
	// Must be before regular link/image parsing to avoid conflicts
	result = result.replace(/\[\^([^\]]+)\]/g, (match, fnId) => {
		const fn = currentFootnotes[fnId];
		if (fn) {
			return `<sup class="footnote-ref"><a href="#fn-${fnId}" id="fnref-${fnId}">[${fn.index}]</a></sup>`;
		}
		return match; // Keep original if footnote not defined
	});

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

	// 2.5. REFERENCE-STYLE LINKS - Process after regular links
	// Full reference: [text][ref-id]
	result = result.replace(/\[([^\]]+)\]\[([^\]]+)\]/g, (match, text, refId) => {
		const ref = currentLinkRefs[refId.toLowerCase()];
		if (ref) {
			const title = ref.title ? ` title="${escapeHtml(ref.title)}"` : "";
			return `<a href="${ref.url}"${title}>${text}</a>`;
		}
		return match; // Keep original if ref not found
	});

	// Collapsed reference: [text][]
	result = result.replace(/\[([^\]]+)\]\[\]/g, (match, text) => {
		const ref = currentLinkRefs[text.toLowerCase()];
		if (ref) {
			const title = ref.title ? ` title="${escapeHtml(ref.title)}"` : "";
			return `<a href="${ref.url}"${title}>${text}</a>`;
		}
		return match;
	});

	// Shortcut reference: [ref] alone (must not match [text](url) or [text][ref])
	// Only match [word] not followed by ( or [
	result = result.replace(/\[([^\]]+)\](?!\(|\[)/g, (match, text) => {
		const ref = currentLinkRefs[text.toLowerCase()];
		if (ref) {
			const title = ref.title ? ` title="${escapeHtml(ref.title)}"` : "";
			return `<a href="${ref.url}"${title}>${text}</a>`;
		}
		return match;
	});

	// Inline code: `code` (escape the content again if already escaped)
	result = result.replace(/`([^`]+)`/g, "<code>$1</code>");

	// 4. STRIKETHROUGH: ~~text~~ - Must be before subscript (single tilde)
	result = result.replace(/~~([^~]+)~~/g, "<del>$1</del>");

	// 5. HIGHLIGHT: ==text==
	result = result.replace(/==([^=]+)==/g, "<mark>$1</mark>");

	// 6. SUPERSCRIPT: X^2^ - Must be before subscript
	result = result.replace(/\^([^\^]+)\^/g, "<sup>$1</sup>");

	// 7. SUBSCRIPT: H~2~O - Single tilde, use negative lookbehind/lookahead to avoid ~~
	result = result.replace(/(?<!~)~([^~]+)~(?!~)/g, "<sub>$1</sub>");

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

	// LAST: Restore escaped characters from placeholders to literals
	for (const [placeholder, char] of Object.entries(UNESCAPE_MAP)) {
		result = result.split(placeholder).join(char);
	}

	return result;
}

/**
 * Parse a pipe-delimited table row into cells
 */
function parsePipeRow(line: string): string[] {
	// Remove leading/trailing pipes and split
	let trimmed = line.trim();
	if (trimmed.startsWith("|")) trimmed = trimmed.slice(1);
	if (trimmed.endsWith("|")) trimmed = trimmed.slice(0, -1);
	return trimmed.split("|").map(cell => cell.trim());
}

/**
 * Get indentation level of a line (count leading spaces/tabs)
 * Tabs are counted as 2 spaces for indentation purposes
 */
function getIndent(line: string): number {
	const match = line.match(/^(\s*)/);
	if (!match) return 0;
	// Count tabs as 2 spaces for indentation purposes
	return match[1].replace(/\t/g, "  ").length;
}

/**
 * Parse a list starting at current position, supporting nested lists
 */
function parseList(lines: string[], startIndex: number, baseIndent: number): { tokens: BlockToken[]; endIndex: number } {
	const tokens: BlockToken[] = [];
	let i = startIndex;

	while (i < lines.length) {
		const line = lines[i];
		const trimmed = line.trim();
		const indent = getIndent(line);

		// Empty line - could be end of list or spacing within
		if (!trimmed) {
			i++;
			continue;
		}

		// If indent is less than base, we've exited this list level
		if (indent < baseIndent && trimmed) {
			break;
		}

		// Check for list markers at this indent level
		const ulMatch = trimmed.match(/^[-*+]\s+(.*)$/);
		const olMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);

		if (ulMatch && indent === baseIndent) {
			// Start or continue unordered list
			const items: ListItem[] = [];

			while (i < lines.length) {
				const itemLine = lines[i];
				const itemTrimmed = itemLine.trim();
				const itemIndent = getIndent(itemLine);

				if (!itemTrimmed) {
					i++;
					continue;
				}

				if (itemIndent < baseIndent) break;

				const itemMatch = itemTrimmed.match(/^[-*+]\s+(.*)$/);
				if (itemMatch && itemIndent === baseIndent) {
					const content = itemMatch[1];
					i++;

					// Check for nested content (items indented more than base)
					const nestedIndent = baseIndent + 2;
					const nested = parseList(lines, i, nestedIndent);

					items.push({
						content,
						children: nested.tokens.length > 0 ? nested.tokens : undefined
					});
					i = nested.endIndex;
				} else if (itemIndent > baseIndent) {
					// This is nested content, let recursion handle it
					break;
				} else {
					break;
				}
			}

			if (items.length > 0) {
				tokens.push({ type: "ul", items });
			}
			continue;
		}

		if (olMatch && indent === baseIndent) {
			// Start or continue ordered list
			const items: ListItem[] = [];
			const startNum = parseInt(olMatch[1], 10);

			while (i < lines.length) {
				const itemLine = lines[i];
				const itemTrimmed = itemLine.trim();
				const itemIndent = getIndent(itemLine);

				if (!itemTrimmed) {
					i++;
					continue;
				}

				if (itemIndent < baseIndent) break;

				const itemMatch = itemTrimmed.match(/^\d+\.\s+(.*)$/);
				if (itemMatch && itemIndent === baseIndent) {
					const content = itemMatch[1];
					i++;

					// Check for nested content
					const nestedIndent = baseIndent + 2;
					const nested = parseList(lines, i, nestedIndent);

					items.push({
						content,
						children: nested.tokens.length > 0 ? nested.tokens : undefined
					});
					i = nested.endIndex;
				} else if (itemIndent > baseIndent) {
					break;
				} else {
					break;
				}
			}

			if (items.length > 0) {
				tokens.push({ type: "ol", items, start: startNum });
			}
			continue;
		}

		// Not a list item at this level
		break;
	}

	return { tokens, endIndex: i };
}

/**
 * Tokenize markdown into block-level elements
 */
export function tokenizeBlocks(markdown: string): BlockToken[] {
	const tokens: BlockToken[] = [];
	const rawLines = markdown.split("\n");

	// Note: State is reset explicitly by the caller using resetParserState()
	// This allows nested rendering (e.g., blockquotes) to preserve link refs and footnotes
	// First pass: Extract link reference definitions and footnote definitions
	// Link pattern: [ref]: url "optional title" or [ref]: url 'optional title' or [ref]: <url> "title"
	// Footnote pattern: [^id]: content
	const lines: string[] = [];

	for (const line of rawLines) {
		// Match footnote definition: [^id]: content
		const footnoteDefMatch = line.match(/^\s*\[\^([^\]]+)\]:\s+(.+)$/);
		if (footnoteDefMatch) {
			const [, fnId, content] = footnoteDefMatch;
			footnoteCounter++;
			currentFootnotes[fnId] = { content, index: footnoteCounter };
			// Don't add this line to filtered output (remove from rendered content)
			continue;
		}

		// Match link definition: [ref-id]: URL "optional title"
		// URL can optionally be wrapped in angle brackets
		const refMatch = line.match(/^\s*\[([^\]]+)\]:\s+<?([^>\s]+)>?(?:\s+["']([^"']+)["'])?\s*$/);

		if (refMatch) {
			const [, refId, url, title] = refMatch;
			currentLinkRefs[refId.toLowerCase()] = { url, title };
			// Don't add this line to filtered output (remove from rendered content)
		} else {
			lines.push(line);
		}
	}

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

		// Setext-style headings: text followed by === or ---
		// Must check BEFORE hr detection since --- could be either
		if (i + 1 < lines.length) {
			const nextLine = lines[i + 1].trim();
			if (/^=+$/.test(nextLine) && trimmedLine.length > 0) {
				tokens.push({
					type: "heading",
					level: 1,
					content: trimmedLine
				});
				i += 2; // Skip both lines
				continue;
			}
			if (/^-+$/.test(nextLine) && trimmedLine.length > 0 && !/^[-*+]\s+/.test(trimmedLine)) {
				tokens.push({
					type: "heading",
					level: 2,
					content: trimmedLine
				});
				i += 2;
				continue;
			}
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

		// Task lists: - [ ] or - [x] or * [ ] or * [x]
		// Must be before regular unordered list detection
		const taskListMatch = trimmedLine.match(/^[-*+]\s+\[([ xX])\]\s+(.*)$/);
		if (taskListMatch) {
			const items: Array<{ checked: boolean; content: string }> = [];

			while (i < lines.length) {
				const taskLine = lines[i].trim();
				const itemMatch = taskLine.match(/^[-*+]\s+\[([ xX])\]\s+(.*)$/);

				if (itemMatch) {
					items.push({
						checked: itemMatch[1].toLowerCase() === "x",
						content: itemMatch[2]
					});
					i++;
				} else if (taskLine === "") {
					i++;
					const nextNonEmpty = lines.slice(i).find((l) => l.trim() !== "");
					if (!nextNonEmpty || !/^[-*+]\s+\[([ xX])\]/.test(nextNonEmpty.trim())) {
						break;
					}
				} else {
					break;
				}
			}

			tokens.push({ type: "task_list", items });
			continue;
		}

		// Unordered lists: -, *, + (supports nesting)
		if (/^[-*+]\s+/.test(trimmedLine)) {
			const result = parseList(lines, i, getIndent(line));
			tokens.push(...result.tokens);
			i = result.endIndex;
			continue;
		}

		// Ordered lists: 1., 2., etc. (supports nesting)
		if (/^\d+\.\s+/.test(trimmedLine)) {
			const result = parseList(lines, i, getIndent(line));
			tokens.push(...result.tokens);
			i = result.endIndex;
			continue;
		}

		// Indented code blocks: 4+ spaces or tab at start
		if (/^( {4}|\t)/.test(line)) {
			const contentLines: string[] = [];

			while (i < lines.length) {
				const codeLine = lines[i];
				if (/^( {4}|\t)/.test(codeLine)) {
					// Remove the 4 spaces or tab prefix
					contentLines.push(codeLine.replace(/^( {4}|\t)/, ""));
					i++;
				} else if (codeLine.trim() === "") {
					// Empty lines within indented block are kept
					contentLines.push("");
					i++;
				} else {
					break;
				}
			}

			// Remove trailing empty lines
			while (contentLines.length > 0 && contentLines[contentLines.length - 1] === "") {
				contentLines.pop();
			}

			if (contentLines.length > 0) {
				tokens.push({
					type: "code_block",
					language: "",
					content: contentLines.join("\n")
				});
				continue;
			}
		}

		// Tables: | col | col |
		// Header row followed by separator row |---|---|
		if (trimmedLine.startsWith("|") || trimmedLine.includes(" | ")) {
			// Check if next line is a separator
			if (i + 1 < lines.length) {
				const nextLine = lines[i + 1].trim();
				// Separator pattern: |---|---| or |:---|---:| etc
				if (/^\|?[\s:]*-+[\s:]*(\|[\s:]*-+[\s:]*)+\|?$/.test(nextLine)) {
					// Parse header row
					const headers = parsePipeRow(trimmedLine);

					// Parse separator to get alignments
					const separatorCells = parsePipeRow(nextLine);
					const alignments: ("left" | "center" | "right" | null)[] = separatorCells.map(cell => {
						const trimmed = cell.trim();
						const leftColon = trimmed.startsWith(":");
						const rightColon = trimmed.endsWith(":");
						if (leftColon && rightColon) return "center";
						if (rightColon) return "right";
						if (leftColon) return "left";
						return null;
					});

					// Collect body rows
					const rows: string[][] = [];
					i += 2; // Skip header and separator

					while (i < lines.length) {
						const rowLine = lines[i].trim();
						if (!rowLine || (!rowLine.startsWith("|") && !rowLine.includes(" | "))) {
							break;
						}
						rows.push(parsePipeRow(rowLine));
						i++;
					}

					tokens.push({
						type: "table",
						headers,
						alignments,
						rows
					});
					continue;
				}
			}
		}

		// Definition lists: Term followed by : definition
		// Check if current line could be a term (non-empty, doesn't start with special chars)
		// and next line starts with `: `
		if (
			trimmedLine &&
			!trimmedLine.startsWith(":") &&
			!/^[-*+#>\d]/.test(trimmedLine) &&
			i + 1 < lines.length
		) {
			const nextLine = lines[i + 1].trim();
			if (nextLine.startsWith(": ")) {
				// This is a definition list
				const items: Array<{ term: string; definitions: string[] }> = [];

				while (i < lines.length) {
					const termLine = lines[i].trim();

					// Empty line ends the definition list
					if (!termLine) {
						i++;
						// Check if there's another term after empty line
						if (i < lines.length && lines[i].trim() && !lines[i].trim().startsWith(":")) {
							const afterEmpty = lines[i + 1]?.trim();
							if (afterEmpty?.startsWith(": ")) {
								continue; // Another term-definition pair follows
							}
						}
						break;
					}

					// If line starts with :, it's a definition for previous term
					if (termLine.startsWith(": ")) {
						// Add to last item's definitions if exists
						if (items.length > 0) {
							items[items.length - 1].definitions.push(termLine.slice(2));
						}
						i++;
						continue;
					}

					// Check if this could be a new term
					if (!termLine.startsWith(":") && i + 1 < lines.length) {
						const nextDef = lines[i + 1].trim();
						if (nextDef.startsWith(": ")) {
							// New term
							items.push({
								term: termLine,
								definitions: []
							});
							i++;
							continue;
						}
					}

					// Not part of definition list anymore
					break;
				}

				if (items.length > 0 && items.some(item => item.definitions.length > 0)) {
					tokens.push({ type: "dl", items });
					continue;
				}
			}
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
					.map((item) => {
						let content = parseInline(item.content, sanitize);
						if (item.children && item.children.length > 0) {
							content += renderTokens(item.children, sanitize);
						}
						return `<li>${content}</li>`;
					})
					.join("");
				htmlParts.push(`<ul>${items}</ul>`);
				break;
			}

			case "ol": {
				const items = token.items
					.map((item) => {
						let content = parseInline(item.content, sanitize);
						if (item.children && item.children.length > 0) {
							content += renderTokens(item.children, sanitize);
						}
						return `<li>${content}</li>`;
					})
					.join("");
				const startAttr = token.start !== 1 ? ` start="${token.start}"` : "";
				htmlParts.push(`<ol${startAttr}>${items}</ol>`);
				break;
			}

			case "task_list": {
				const items = token.items
					.map((item) => {
						const checkbox = item.checked
							? "<input type=\"checkbox\" checked disabled />"
							: "<input type=\"checkbox\" disabled />";
						return `<li class="task-list-item">${checkbox} ${parseInline(item.content, sanitize)}</li>`;
					})
					.join("");
				htmlParts.push(`<ul class="task-list">${items}</ul>`);
				break;
			}

			case "table": {
				const alignStyle = (align: "left" | "center" | "right" | null) => {
					if (!align) return "";
					return ` style="text-align: ${align}"`;
				};

				const headerCells = token.headers
					.map((h, idx) => `<th${alignStyle(token.alignments[idx])}>${parseInline(h, sanitize)}</th>`)
					.join("");

				const bodyRows = token.rows
					.map(row => {
						const cells = row
							.map((cell, idx) => `<td${alignStyle(token.alignments[idx])}>${parseInline(cell, sanitize)}</td>`)
							.join("");
						return `<tr>${cells}</tr>`;
					})
					.join("");

				htmlParts.push(`<table><thead><tr>${headerCells}</tr></thead><tbody>${bodyRows}</tbody></table>`);
				break;
			}

			case "dl": {
				let dlHtml = "<dl>";
				for (const item of token.items) {
					dlHtml += `<dt>${parseInline(item.term, sanitize)}</dt>`;
					for (const def of item.definitions) {
						dlHtml += `<dd>${parseInline(def, sanitize)}</dd>`;
					}
				}
				dlHtml += "</dl>";
				htmlParts.push(dlHtml);
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
 * - Headings (# through ###### and setext-style with === or ---)
 * - Paragraphs (double newlines)
 * - Code blocks (```language ... ``` and indented with 4 spaces or tab)
 * - Blockquotes (> text)
 * - Unordered lists (-, *, +)
 * - Ordered lists (1., 2., etc.)
 * - Task lists (- [ ] unchecked, - [x] checked)
 * - Definition lists (Term followed by : Definition)
 * - Tables (| col | col | with alignment support)
 * - Horizontal rules (---, ***, ___)
 * - Bold (**text** or __text__)
 * - Italic (*text* or _text_)
 * - Bold+Italic (***text***)
 * - Inline code (`code`)
 * - Links [text](url)
 * - Reference-style links ([text][ref], [text][], [ref] with [ref]: url definitions)
 * - Images ![alt](url)
 * - Escape sequences (\* \_ \~ etc.)
 * - Hard line breaks (two trailing spaces)
 * - Autolinks (<https://...> and <email@...>)
 * - Strikethrough (~~text~~)
 * - Highlight (==text==)
 * - Superscript (X^2^)
 * - Subscript (H~2~O)
 * - Footnotes ([^id] with [^id]: content definitions)
 */
export function renderMarkdown(markdown: string, options?: MarkdownRenderOptions): string {
	if (!markdown) return "";

	const sanitize = options?.sanitize ?? true;
	const preserveState = options?.preserveState ?? false;

	// Reset state for fresh document parse (unless preserving for nested rendering)
	if (!preserveState) {
		resetParserState();
	}

	const tokens = tokenizeBlocks(markdown);
	let html = renderTokens(tokens, sanitize);

	// Append footnotes section if any exist (only for top-level rendering)
	if (!preserveState && Object.keys(currentFootnotes).length > 0) {
		const footnoteEntries = Object.entries(currentFootnotes)
			.sort((a, b) => a[1].index - b[1].index);

		let footnotesHtml = "<section class=\"footnotes\"><hr /><ol class=\"footnote-list\">";

		for (const [fnId, fn] of footnoteEntries) {
			footnotesHtml += `<li id="fn-${fnId}" class="footnote-item">`;
			footnotesHtml += parseInline(fn.content, sanitize);
			footnotesHtml += ` <a href="#fnref-${fnId}" class="footnote-backref">\u21a9</a>`;
			footnotesHtml += "</li>";
		}

		footnotesHtml += "</ol></section>";
		html += footnotesHtml;
	}

	return html;
}
