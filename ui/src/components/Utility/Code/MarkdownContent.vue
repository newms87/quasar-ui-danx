<template>
  <div class="dx-markdown-content">
    <template v-for="(token, index) in tokens" :key="index">
      <!-- Headings -->
      <component
        v-if="token.type === 'heading'"
        :is="'h' + token.level"
        v-html="parseInlineContent(token.content)"
      />

      <!-- Code blocks with syntax highlighting -->
      <div
        v-else-if="token.type === 'code_block'"
        class="dx-markdown-code-block"
      >
        <!-- Language toggle badge (only for json/yaml) -->
        <LanguageBadge
          v-if="isToggleableLanguage(token.language)"
          :format="getCodeBlockFormat(index, token.language)"
          :available-formats="['json', 'yaml']"
          :toggleable="true"
          @change="(fmt) => setCodeBlockFormat(index, fmt)"
        />
        <LanguageBadge
          v-else-if="token.language"
          :format="token.language"
          :available-formats="[]"
          :toggleable="false"
        />
        <pre><code
          :class="'language-' + getCodeBlockFormat(index, token.language)"
          v-html="highlightCodeBlock(index, token.content, token.language)"
        ></code></pre>
      </div>

      <!-- Blockquotes (recursive) -->
      <blockquote
        v-else-if="token.type === 'blockquote'"
        v-html="renderBlockquote(token.content)"
      />

      <!-- Unordered lists -->
      <ul v-else-if="token.type === 'ul'">
        <li
          v-for="(item, itemIndex) in token.items"
          :key="itemIndex"
        >
          <span v-html="parseInlineContent(item.content)" />
          <template v-if="item.children && item.children.length > 0">
            <template v-for="(child, childIndex) in item.children" :key="'child-' + childIndex">
              <!-- Nested unordered list -->
              <ul v-if="child.type === 'ul'">
                <li
                  v-for="(nestedItem, nestedIndex) in child.items"
                  :key="nestedIndex"
                  v-html="renderListItem(nestedItem)"
                />
              </ul>
              <!-- Nested ordered list -->
              <ol v-else-if="child.type === 'ol'" :start="child.start">
                <li
                  v-for="(nestedItem, nestedIndex) in child.items"
                  :key="nestedIndex"
                  v-html="renderListItem(nestedItem)"
                />
              </ol>
            </template>
          </template>
        </li>
      </ul>

      <!-- Ordered lists -->
      <ol
        v-else-if="token.type === 'ol'"
        :start="token.start"
      >
        <li
          v-for="(item, itemIndex) in token.items"
          :key="itemIndex"
        >
          <span v-html="parseInlineContent(item.content)" />
          <template v-if="item.children && item.children.length > 0">
            <template v-for="(child, childIndex) in item.children" :key="'child-' + childIndex">
              <!-- Nested unordered list -->
              <ul v-if="child.type === 'ul'">
                <li
                  v-for="(nestedItem, nestedIndex) in child.items"
                  :key="nestedIndex"
                  v-html="renderListItem(nestedItem)"
                />
              </ul>
              <!-- Nested ordered list -->
              <ol v-else-if="child.type === 'ol'" :start="child.start">
                <li
                  v-for="(nestedItem, nestedIndex) in child.items"
                  :key="nestedIndex"
                  v-html="renderListItem(nestedItem)"
                />
              </ol>
            </template>
          </template>
        </li>
      </ol>

      <!-- Task lists -->
      <ul
        v-else-if="token.type === 'task_list'"
        class="task-list"
      >
        <li
          v-for="(item, itemIndex) in token.items"
          :key="itemIndex"
          class="task-list-item"
        >
          <input
            type="checkbox"
            :checked="item.checked"
            disabled
          />
          <span v-html="parseInlineContent(item.content)" />
        </li>
      </ul>

      <!-- Tables -->
      <table v-else-if="token.type === 'table'">
        <thead>
          <tr>
            <th
              v-for="(header, hIndex) in token.headers"
              :key="hIndex"
              :style="token.alignments[hIndex] ? { textAlign: token.alignments[hIndex] } : {}"
              v-html="parseInlineContent(header)"
            />
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, rIndex) in token.rows" :key="rIndex">
            <td
              v-for="(cell, cIndex) in row"
              :key="cIndex"
              :style="token.alignments[cIndex] ? { textAlign: token.alignments[cIndex] } : {}"
              v-html="parseInlineContent(cell)"
            />
          </tr>
        </tbody>
      </table>

      <!-- Definition lists -->
      <dl v-else-if="token.type === 'dl'">
        <template v-for="(item, itemIndex) in token.items" :key="itemIndex">
          <dt v-html="parseInlineContent(item.term)" />
          <dd
            v-for="(def, defIndex) in item.definitions"
            :key="'def-' + defIndex"
            v-html="parseInlineContent(def)"
          />
        </template>
      </dl>

      <!-- Horizontal rules -->
      <hr v-else-if="token.type === 'hr'" />

      <!-- Paragraphs -->
      <p
        v-else-if="token.type === 'paragraph'"
        v-html="parseInlineContent(token.content).replace(/\n/g, '<br />')"
      />
    </template>

    <!-- Footnotes section -->
    <section v-if="hasFootnotes" class="footnotes">
      <hr />
      <ol class="footnote-list">
        <li
          v-for="fn in sortedFootnotes"
          :key="fn.id"
          :id="'fn-' + fn.id"
          class="footnote-item"
        >
          <span v-html="parseInlineContent(fn.content)" />
          <a :href="'#fnref-' + fn.id" class="footnote-backref">&#8617;</a>
        </li>
      </ol>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive } from "vue";
import { parse as parseYAML, stringify as stringifyYAML } from "yaml";
import { tokenizeBlocks, parseInline, renderMarkdown, getFootnotes, resetParserState } from "../../../helpers/formats/markdown";
import type { BlockToken, ListItem } from "../../../helpers/formats/markdown";
import { highlightJSON, highlightYAML } from "../../../helpers/formats/highlightSyntax";
import LanguageBadge from "./LanguageBadge.vue";

export interface MarkdownContentProps {
  content: string;
  defaultCodeFormat?: "json" | "yaml";
}

const props = withDefaults(defineProps<MarkdownContentProps>(), {
  content: ""
});

// Track format overrides for each code block (for toggling json<->yaml)
const codeBlockFormats = reactive<Record<number, string>>({});
// Cache converted content for each code block
const convertedContent = reactive<Record<number, string>>({});

// Tokenize the markdown content
const tokens = computed<BlockToken[]>(() => {
  if (!props.content) return [];
  // Reset parser state before tokenizing to clear refs from previous content
  // This ensures link refs and footnotes are freshly parsed for this content
  resetParserState();
  return tokenizeBlocks(props.content);
});

// Computed properties for footnotes
// IMPORTANT: Access tokens.value to ensure tokenizeBlocks runs first,
// which populates currentFootnotes and currentLinkRefs
const footnotes = computed(() => {
  // Force dependency on tokens - this ensures tokenizeBlocks has run
  // and populated the module-level currentFootnotes before we read it
  tokens.value;
  return getFootnotes();
});

const hasFootnotes = computed(() => Object.keys(footnotes.value).length > 0);

const sortedFootnotes = computed(() => {
  return Object.entries(footnotes.value)
    .sort((a, b) => a[1].index - b[1].index)
    .map(([id, fn]) => ({ id, content: fn.content, index: fn.index }));
});

// Check if a language is toggleable (json or yaml)
function isToggleableLanguage(language: string): boolean {
  if (!language) return false;
  const lang = language.toLowerCase();
  return lang === "json" || lang === "yaml";
}

// Get the current format for a code block (respecting user toggle, then default override, then original)
function getCodeBlockFormat(index: number, originalLanguage: string): string {
  // If user has toggled this block, use their choice
  if (codeBlockFormats[index]) {
    return codeBlockFormats[index];
  }

  // If a default is set and this is a toggleable language, use the default
  const lang = originalLanguage?.toLowerCase();
  if (props.defaultCodeFormat && (lang === "json" || lang === "yaml")) {
    return props.defaultCodeFormat;
  }

  // Otherwise use the original language
  return lang || "text";
}

// Get converted content for a code block (handles initial conversion for defaultCodeFormat)
function getConvertedContent(index: number, originalContent: string, originalLang: string): string {
  const format = getCodeBlockFormat(index, originalLang);

  // If format matches original, no conversion needed
  if (format === originalLang || !isToggleableLanguage(originalLang)) {
    return originalContent;
  }

  // Convert from original to target format
  try {
    let parsed: unknown;

    if (originalLang === "json") {
      parsed = JSON.parse(originalContent);
    } else if (originalLang === "yaml") {
      parsed = parseYAML(originalContent);
    }

    if (parsed !== undefined) {
      if (format === "json") {
        return JSON.stringify(parsed, null, 2);
      } else if (format === "yaml") {
        return stringifyYAML(parsed as object);
      }
    }
  } catch {
    // Conversion failed, return original
  }

  return originalContent;
}

// Set format for a code block (converts content to the new format)
function setCodeBlockFormat(index: number, newFormat: string) {
  const token = tokens.value[index];
  if (token?.type !== "code_block") return;

  const originalLang = token.language?.toLowerCase() || "json";
  const current = getCodeBlockFormat(index, originalLang);

  // No change needed if already in target format
  if (current === newFormat) return;

  // Convert the content
  try {
    // Use the currently displayed content (which may already be converted due to defaultCodeFormat)
    const sourceContent = convertedContent[index] || getConvertedContent(index, token.content, originalLang);
    let parsed: unknown;

    // Parse from current format
    if (current === "json") {
      parsed = JSON.parse(sourceContent);
    } else {
      parsed = parseYAML(sourceContent);
    }

    // Convert to new format
    if (newFormat === "json") {
      convertedContent[index] = JSON.stringify(parsed, null, 2);
    } else {
      convertedContent[index] = stringifyYAML(parsed as object);
    }

    codeBlockFormats[index] = newFormat;
  } catch {
    // If conversion fails, just set the format without converting
    codeBlockFormats[index] = newFormat;
  }
}

// Highlight code block content based on format
function highlightCodeBlock(index: number, originalContent: string, originalLanguage: string): string {
  const format = getCodeBlockFormat(index, originalLanguage);
  const originalLang = originalLanguage?.toLowerCase() || "text";

  // Get the content (converted if needed, or from cache if user toggled)
  const content = convertedContent[index] || getConvertedContent(index, originalContent, originalLang);

  // Apply syntax highlighting
  switch (format) {
    case "json":
      return highlightJSON(content);
    case "yaml":
      return highlightYAML(content);
    default:
      // For other languages, just escape HTML
      return content
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
  }
}

// Parse inline markdown (bold, italic, links, etc.)
function parseInlineContent(text: string): string {
  return parseInline(text, true);
}

// Render a list item with potential nested children
function renderListItem(item: ListItem): string {
  let html = parseInline(item.content, true);
  if (item.children && item.children.length > 0) {
    for (const child of item.children) {
      if (child.type === "ul") {
        const items = child.items.map((i) => `<li>${renderListItem(i)}</li>`).join("");
        html += `<ul>${items}</ul>`;
      } else if (child.type === "ol") {
        const items = child.items.map((i) => `<li>${renderListItem(i)}</li>`).join("");
        const startAttr = child.start !== 1 ? ` start="${child.start}"` : "";
        html += `<ol${startAttr}>${items}</ol>`;
      }
    }
  }
  return html;
}

// Render blockquote content (can contain nested markdown)
// Use preserveState to keep link refs and footnotes from parent document
function renderBlockquote(content: string): string {
  return renderMarkdown(content, { preserveState: true });
}
</script>

<style lang="scss">
.dx-markdown-code-block {
  position: relative;
  margin: 1em 0;

  pre {
    margin: 0;
    background: rgba(0, 0, 0, 0.3);
    padding: 1em;
    border-radius: 6px;
    overflow-x: auto;

    code {
      background: transparent;
      padding: 0;
      font-size: 0.875em;
      font-family: 'Fira Code', 'Monaco', monospace;
    }
  }
}
</style>
