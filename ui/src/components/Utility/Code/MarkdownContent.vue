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
          :toggleable="true"
          @toggle="toggleCodeBlockFormat(index)"
        />
        <LanguageBadge
          v-else-if="token.language"
          :format="token.language"
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
          v-html="parseInlineContent(item)"
        />
      </ul>

      <!-- Ordered lists -->
      <ol
        v-else-if="token.type === 'ol'"
        :start="token.start"
      >
        <li
          v-for="(item, itemIndex) in token.items"
          :key="itemIndex"
          v-html="parseInlineContent(item)"
        />
      </ol>

      <!-- Horizontal rules -->
      <hr v-else-if="token.type === 'hr'" />

      <!-- Paragraphs -->
      <p
        v-else-if="token.type === 'paragraph'"
        v-html="parseInlineContent(token.content).replace(/\n/g, '<br />')"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive } from "vue";
import { parse as parseYAML, stringify as stringifyYAML } from "yaml";
import { tokenizeBlocks, parseInline, renderMarkdown, BlockToken } from "../../../helpers/formats/renderMarkdown";
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
  return tokenizeBlocks(props.content);
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

// Toggle between json and yaml for a code block
function toggleCodeBlockFormat(index: number) {
  const token = tokens.value[index];
  if (token?.type !== "code_block") return;

  const originalLang = token.language?.toLowerCase() || "json";
  const current = getCodeBlockFormat(index, originalLang);  // FIX: use getCodeBlockFormat to respect defaultCodeFormat
  const newFormat = current === "json" ? "yaml" : "json";

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
    // If conversion fails, just toggle the format without converting
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

// Render blockquote content (can contain nested markdown)
function renderBlockquote(content: string): string {
  return renderMarkdown(content);
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
