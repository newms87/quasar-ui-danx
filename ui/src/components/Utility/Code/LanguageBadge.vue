<template>
  <div
    class="dx-language-badge-container"
    :class="{ 'is-toggleable': toggleable && availableFormats.length > 1 }"
    @mouseenter="showOptions = true"
    @mouseleave="onMouseLeave"
  >
    <!-- Search icon (when allowAnyLanguage is true) - placed first/leftmost -->
    <transition name="slide-left">
      <div
        v-if="showOptions && allowAnyLanguage"
        class="dx-language-option dx-language-search-trigger"
        @click.stop="openSearchPanel"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clip-rule="evenodd" />
        </svg>
      </div>
    </transition>

    <!-- Other format options (slide out to the left) -->
    <transition name="slide-left">
      <div
        v-if="showOptions && toggleable && otherFormats.length > 0"
        class="dx-language-options"
      >
        <div
          v-for="fmt in otherFormats"
          :key="fmt"
          class="dx-language-option"
          @click.stop="$emit('change', fmt)"
        >
          {{ fmt.toUpperCase() }}
        </div>
      </div>
    </transition>

    <!-- Current format badge (stays in place) -->
    <div class="dx-language-badge" :class="{ 'is-active': showOptions && (otherFormats.length > 0 || allowAnyLanguage) }">
      {{ format.toUpperCase() }}
    </div>

    <!-- Search dropdown panel -->
    <transition name="fade">
      <div
        v-if="showSearchPanel"
        class="dx-language-search-panel"
        @click.stop
      >
        <input
          ref="searchInputRef"
          v-model="searchQuery"
          type="text"
          class="dx-language-search-input"
          placeholder="Search languages..."
          @keydown.escape="closeSearchPanel"
        />
        <div class="dx-language-search-list">
          <div
            v-for="lang in filteredLanguages"
            :key="lang"
            class="dx-language-search-item"
            @click="selectLanguage(lang)"
          >
            {{ lang.toUpperCase() }}
          </div>
          <div v-if="filteredLanguages.length === 0" class="dx-language-search-empty">
            No languages found
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue";

// All supported languages (sorted alphabetically)
const ALL_LANGUAGES = [
  "bash",
  "c",
  "cpp",
  "css",
  "dockerfile",
  "go",
  "graphql",
  "html",
  "java",
  "javascript",
  "json",
  "kotlin",
  "markdown",
  "php",
  "python",
  "ruby",
  "rust",
  "scss",
  "sql",
  "swift",
  "text",
  "typescript",
  "xml",
  "yaml"
];

export interface LanguageBadgeProps {
  format: string;
  availableFormats?: string[];
  toggleable?: boolean;
  allowAnyLanguage?: boolean;
}

const props = withDefaults(defineProps<LanguageBadgeProps>(), {
  availableFormats: () => [],
  toggleable: true,
  allowAnyLanguage: false
});

const emit = defineEmits<{
  change: [format: string];
}>();

const showOptions = ref(false);
const showSearchPanel = ref(false);
const searchQuery = ref("");
const searchInputRef = ref<HTMLInputElement | null>(null);

// Get formats other than the current one
const otherFormats = computed(() => {
  return props.availableFormats.filter(f => f !== props.format);
});

// Filter languages based on search query
const filteredLanguages = computed(() => {
  if (!searchQuery.value) {
    return ALL_LANGUAGES;
  }
  const query = searchQuery.value.toLowerCase();
  return ALL_LANGUAGES.filter(lang => lang.toLowerCase().includes(query));
});

function openSearchPanel() {
  showSearchPanel.value = true;
  searchQuery.value = "";
  nextTick(() => {
    searchInputRef.value?.focus();
  });
}

function closeSearchPanel() {
  showSearchPanel.value = false;
  searchQuery.value = "";
}

function selectLanguage(lang: string) {
  emit("change", lang);
  closeSearchPanel();
}

function onMouseLeave() {
  showOptions.value = false;
  // Don't close search panel on mouse leave - let click outside handle it
}

function handleClickOutside(event: MouseEvent) {
  if (showSearchPanel.value) {
    const target = event.target as HTMLElement;
    const panel = document.querySelector(".dx-language-search-panel");
    if (panel && !panel.contains(target)) {
      closeSearchPanel();
    }
  }
}

onMounted(() => {
  document.addEventListener("mousedown", handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener("mousedown", handleClickOutside);
});

// Expose openSearchPanel for external callers (e.g., keyboard shortcut from CodeViewer)
defineExpose({
  openSearchPanel
});
</script>

<style lang="scss">
.dx-language-badge-container {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  align-items: center;
  z-index: 10;

  &.is-toggleable {
    cursor: pointer;
  }
}

.dx-language-options {
  display: flex;
  align-items: center;
}

.dx-language-option {
  padding: 2px 8px;
  font-size: 0.7em;
  background: rgba(0, 0, 0, 0.5);
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.2s;
  border-right: 1px solid rgba(255, 255, 255, 0.1);

  &:hover {
    background: rgba(0, 0, 0, 0.7);
    color: rgba(255, 255, 255, 0.95);
  }

  &:first-child {
    border-radius: 6px 0 0 6px;
  }
}

// Search trigger inherits from .dx-language-option, only adds flex centering for the icon
.dx-language-search-trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px 6px;

  svg {
    width: 12px;
    height: 12px;
  }
}

.dx-language-badge {
  padding: 2px 8px;
  font-size: 0.7em;
  border-radius: 0 6px 0 6px;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  transition: all 0.2s;

  &.is-active {
    border-radius: 0 6px 0 0;
  }
}

.dx-language-search-panel {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 4px;
  background: rgba(0, 0, 0, 0.9);
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  min-width: 160px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.dx-language-search-input {
  width: 100%;
  padding: 8px 12px;
  font-size: 0.8em;
  background: rgba(255, 255, 255, 0.05);
  border: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.9);
  outline: none;

  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }

  &:focus {
    background: rgba(255, 255, 255, 0.08);
  }
}

.dx-language-search-list {
  max-height: 200px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.2);
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;

    &:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  }
}

.dx-language-search-item {
  padding: 6px 12px;
  font-size: 0.75em;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.95);
  }
}

.dx-language-search-empty {
  padding: 12px;
  font-size: 0.75em;
  color: rgba(255, 255, 255, 0.4);
  text-align: center;
}

// Slide animation for options
.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.2s ease;
}

.slide-left-enter-from,
.slide-left-leave-to {
  opacity: 0;
  transform: translateX(10px);
}

// Fade animation for search panel
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
