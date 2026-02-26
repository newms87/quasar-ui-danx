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
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
            clip-rule="evenodd"
          />
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
    <div
      class="dx-language-badge"
      :class="{
        'is-active':
          showOptions && (otherFormats.length > 0 || allowAnyLanguage),
      }"
    >
      {{ format.toUpperCase() }}
    </div>

    <!-- Search dropdown panel -->
    <transition name="fade">
      <div v-if="showSearchPanel" class="dx-language-search-panel" @click.stop>
        <input
          ref="searchInputRef"
          v-model="searchQuery"
          type="text"
          class="dx-language-search-input"
          placeholder="Search languages..."
          @input="onSearchQueryChange"
          @keydown.down.prevent="navigateDown"
          @keydown.up.prevent="navigateUp"
          @keydown.enter.prevent="selectCurrentItem"
          @keydown.escape="closeSearchPanel"
        />
        <div class="dx-language-search-list">
          <div
            v-for="(lang, index) in filteredLanguages"
            :key="lang"
            class="dx-language-search-item"
            :class="{ 'is-selected': index === selectedIndex }"
            @click="selectLanguage(lang)"
            @mouseenter="selectedIndex = index"
          >
            {{ lang.toUpperCase() }}
          </div>
          <div
            v-if="filteredLanguages.length === 0"
            class="dx-language-search-empty"
          >
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
  "yaml",
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
  allowAnyLanguage: false,
});

const emit = defineEmits<{
  change: [format: string];
}>();

const showOptions = ref(false);
const showSearchPanel = ref(false);
const searchQuery = ref("");
const searchInputRef = ref<HTMLInputElement | null>(null);
const selectedIndex = ref(0);

// Get formats other than the current one
const otherFormats = computed(() => {
  return props.availableFormats.filter((f) => f !== props.format);
});

// Filter languages based on search query
const filteredLanguages = computed(() => {
  if (!searchQuery.value) {
    return ALL_LANGUAGES;
  }
  const query = searchQuery.value.toLowerCase();
  return ALL_LANGUAGES.filter((lang) => lang.toLowerCase().includes(query));
});

// Reset selectedIndex when search query changes
function onSearchQueryChange() {
  selectedIndex.value = 0;
}

// Keyboard navigation functions
function navigateDown() {
  if (filteredLanguages.value.length === 0) return;
  selectedIndex.value =
    (selectedIndex.value + 1) % filteredLanguages.value.length;
  scrollSelectedIntoView();
}

function navigateUp() {
  if (filteredLanguages.value.length === 0) return;
  selectedIndex.value =
    selectedIndex.value === 0
      ? filteredLanguages.value.length - 1
      : selectedIndex.value - 1;
  scrollSelectedIntoView();
}

function selectCurrentItem() {
  if (filteredLanguages.value.length > 0) {
    selectLanguage(filteredLanguages.value[selectedIndex.value]);
  }
}

function scrollSelectedIntoView() {
  nextTick(() => {
    const list = document.querySelector(".dx-language-search-list");
    const selected = list?.querySelector(".is-selected");
    selected?.scrollIntoView({ block: "nearest" });
  });
}

function openSearchPanel() {
  showSearchPanel.value = true;
  searchQuery.value = "";
  selectedIndex.value = 0;
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
  openSearchPanel,
});
</script>
