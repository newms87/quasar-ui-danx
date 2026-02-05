<script setup lang="ts">
import { defineComponent, h, ref } from "vue";
import { MarkdownEditor, TokenRenderer } from "quasar-ui-danx";

const markdown = ref(`# Markdown Editor Playground

This is a **live playground** for testing the MarkdownEditor component with HMR.

## Features to Test

- **Bold** and *italic* text
- [Links](https://example.com)
- Code blocks with syntax highlighting

\`\`\`javascript
const greeting = "Hello, World!";
console.log(greeting);
\`\`\`

## Token Renderer Testing

Below are sample tokens that will be rendered by custom token renderers:

- Prompt Definition: {{123}}
- Another token: {{456}}

Try editing the tokens above to test round-trip conversion.

## Lists

1. First item
2. Second item
3. Third item

- Bullet one
- Bullet two
- Bullet three

## Table

| Feature | Status |
|---------|--------|
| Bold | ✅ |
| Italic | ✅ |
| Links | ✅ |
| Code | ✅ |
| Tables | ✅ |
`);

// Sample TokenPill component for demonstration
const TokenPill = defineComponent({
  name: "TokenPill",
  props: {
    promptId: {
      type: String,
      required: true
    }
  },
  setup(props) {
    return () => h(
      "span",
      {
        class: "inline-flex items-center px-2 py-0.5 rounded-full bg-blue-600 text-white text-sm font-medium cursor-default",
        style: "vertical-align: middle;"
      },
      `📝 Prompt #${props.promptId}`
    );
  }
});

// Token renderer for {{id}} pattern
const promptTokenRenderer: TokenRenderer = {
  id: "prompt-definition",
  pattern: /\{\{(\d+)\}\}/g,
  toHtml: (match: string, groups: string[]) => match,
  component: TokenPill,
  getProps: (groups: string[]) => ({ promptId: groups[0] }),
  toMarkdown: (el: HTMLElement) => {
    const groups = el.getAttribute("data-token-groups");
    if (groups) {
      const parsed = JSON.parse(groups);
      return `{{${parsed[0]}}}`;
    }
    return "";
  }
};

const tokenRenderers = [promptTokenRenderer];
</script>

<template>
  <main class="p-8 min-h-screen bg-gray-900">
    <h1 class="text-2xl font-bold text-white mb-6">MarkdownEditor Playground</h1>

    <div class="grid grid-cols-2 gap-8">
      <!-- Raw Markdown Textarea -->
      <section>
        <h2 class="text-lg font-semibold text-gray-300 mb-2">Raw Markdown</h2>
        <textarea
          v-model="markdown"
          class="w-full h-[600px] p-4 font-mono text-sm bg-gray-800 text-gray-100 border border-gray-700 rounded-lg resize-none focus:outline-none focus:border-blue-500"
          placeholder="Enter markdown here..."
        />
      </section>

      <!-- MarkdownEditor Preview -->
      <section>
        <h2 class="text-lg font-semibold text-gray-300 mb-2">MarkdownEditor</h2>
        <div class="border border-gray-700 rounded-lg overflow-hidden">
          <MarkdownEditor
            v-model="markdown"
            min-height="600px"
            max-height="600px"
            theme="dark"
            :token-renderers="tokenRenderers"
          >
            <template #badge>
              <span class="px-2 py-1 text-xs bg-green-600 text-white rounded">
                Demo Badge
              </span>
            </template>
          </MarkdownEditor>
        </div>
      </section>
    </div>

    <!-- Token Renderer Info -->
    <section class="mt-8">
      <h2 class="text-lg font-semibold text-gray-300 mb-2">Token Renderer Demo</h2>
      <div class="p-4 bg-gray-800 rounded-lg text-gray-300">
        <p class="mb-2">
          The MarkdownEditor above has a custom token renderer configured for the pattern <code class="px-1 bg-gray-700 rounded">{"{{id}}"}</code>.
        </p>
        <p class="mb-2">
          Tokens like <code class="px-1 bg-gray-700 rounded">{"{{123}}"}</code> are rendered as interactive pills:
          <span class="inline-flex items-center px-2 py-0.5 ml-2 rounded-full bg-blue-600 text-white text-sm font-medium">
            📝 Prompt #123
          </span>
        </p>
        <p>
          Try typing new tokens in the editor (e.g., <code class="px-1 bg-gray-700 rounded">{"{{789}}"}</code>) and watch them render as pills.
        </p>
      </div>
    </section>
  </main>
</template>
