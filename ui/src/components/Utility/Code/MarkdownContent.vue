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
      <CodeViewer
        v-else-if="token.type === 'code_block'"
        :model-value="token.content"
        :format="normalizeLanguage(token.language)"
        :default-code-format="defaultCodeFormat"
        :can-edit="false"
        :collapsible="false"
        hide-footer
        allow-any-language
        class="markdown-code-block"
      />

      <!-- Blockquotes (recursive) -->
      <blockquote
        v-else-if="token.type === 'blockquote'"
        v-html="renderBlockquote(token.content)"
      />

      <!-- Unordered lists -->
      <ul v-else-if="token.type === 'ul'">
        <li v-for="(item, itemIndex) in token.items" :key="itemIndex">
          <span v-html="parseInlineContent(item.content)" />
          <template v-if="item.children && item.children.length > 0">
            <template
              v-for="(child, childIndex) in item.children"
              :key="'child-' + childIndex"
            >
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
      <ol v-else-if="token.type === 'ol'" :start="token.start">
        <li v-for="(item, itemIndex) in token.items" :key="itemIndex">
          <span v-html="parseInlineContent(item.content)" />
          <template v-if="item.children && item.children.length > 0">
            <template
              v-for="(child, childIndex) in item.children"
              :key="'child-' + childIndex"
            >
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
      <ul v-else-if="token.type === 'task_list'" class="task-list">
        <li
          v-for="(item, itemIndex) in token.items"
          :key="itemIndex"
          class="task-list-item"
        >
          <input type="checkbox" :checked="item.checked" disabled />
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
              :style="
                token.alignments[hIndex]
                  ? { textAlign: token.alignments[hIndex] }
                  : {}
              "
              v-html="parseInlineContent(header)"
            />
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, rIndex) in token.rows" :key="rIndex">
            <td
              v-for="(cell, cIndex) in row"
              :key="cIndex"
              :style="
                token.alignments[cIndex]
                  ? { textAlign: token.alignments[cIndex] }
                  : {}
              "
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
import { computed } from "vue";
import {
  tokenizeBlocks,
  parseInline,
  renderMarkdown,
  getFootnotes,
  resetParserState,
} from "../../../helpers/formats/markdown";
import type { BlockToken, ListItem } from "../../../helpers/formats/markdown";
import CodeViewer from "./CodeViewer.vue";

export interface MarkdownContentProps {
  content: string;
  defaultCodeFormat?: "json" | "yaml";
}

const props = withDefaults(defineProps<MarkdownContentProps>(), {
  content: "",
});

// Normalize language aliases to standard names
function normalizeLanguage(lang?: string): string {
  if (!lang) return "text";
  const aliases: Record<string, string> = {
    js: "javascript",
    ts: "typescript",
    py: "python",
    rb: "ruby",
    yml: "yaml",
    md: "markdown",
    sh: "bash",
    shell: "bash",
  };
  return aliases[lang.toLowerCase()] || lang.toLowerCase();
}

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
        const items = child.items
          .map((i) => `<li>${renderListItem(i)}</li>`)
          .join("");
        html += `<ul>${items}</ul>`;
      } else if (child.type === "ol") {
        const items = child.items
          .map((i) => `<li>${renderListItem(i)}</li>`)
          .join("");
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
