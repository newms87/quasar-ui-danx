<template>
  <div
    ref="containerRef"
    class="dx-tab-button-group relative flex items-center border border-slate-600 rounded-lg overflow-hidden bg-slate-800"
  >
    <!-- Sliding active indicator -->
    <div
      class="absolute inset-y-0 transition-all duration-300 ease-out"
      :style="indicatorStyle"
    />

    <!-- Tab buttons -->
    <button
      v-for="(tab, index) in tabs"
      :key="tab.value"
      ref="buttonRefs"
      class="relative z-10 flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors duration-300"
      :class="[
        modelValue === tab.value ? 'text-white' : 'text-slate-500 hover:text-slate-300',
        index > 0 ? 'border-l border-slate-700' : ''
      ]"
      @click="$emit('update:modelValue', tab.value)"
    >
      <Component
        :is="tab.icon"
        class="w-3.5 h-3.5"
      />
      <span>{{ tab.label }}</span>
      <span
        v-if="tab.count !== undefined"
        class="opacity-70"
      >({{ tab.count }})</span>
    </button>
  </div>
</template>

<script setup lang="ts">
/**
 * A group of connected tab buttons with a sliding animated indicator.
 * Each tab can have its own icon, active color, label, and count badge.
 * The active indicator smoothly slides and transitions colors between tabs.
 */
import type { Component } from "vue";
import { computed, nextTick, onMounted, ref, watch } from "vue";

export interface TabButton {
	value: string;
	icon: Component;
	label: string;
	count?: number;
	activeColor: string; // CSS color value (hex, rgb, etc.)
}

const props = defineProps<{
	tabs: TabButton[];
	modelValue: string;
}>();

defineEmits<{
	"update:modelValue": [value: string];
}>();

const containerRef = ref<HTMLElement | null>(null);
const buttonRefs = ref<HTMLElement[]>([]);
const indicatorLeft = ref(0);
const indicatorWidth = ref(0);

/**
 * Get the active tab's index
 */
const activeIndex = computed(() =>
	props.tabs.findIndex(tab => tab.value === props.modelValue)
);

/**
 * Get the active tab's color
 */
const activeColor = computed(() => {
	const tab = props.tabs.find(t => t.value === props.modelValue);
	return tab?.activeColor || "#475569"; // slate-600 default
});

/**
 * Style for the sliding indicator including position and color
 */
const indicatorStyle = computed(() => ({
	left: `${indicatorLeft.value}px`,
	width: `${indicatorWidth.value}px`,
	backgroundColor: activeColor.value
}));

/**
 * Update indicator position based on active button
 */
function updateIndicatorPosition() {
	const index = activeIndex.value;
	if (index >= 0 && buttonRefs.value[index]) {
		const button = buttonRefs.value[index];
		indicatorLeft.value = button.offsetLeft;
		indicatorWidth.value = button.offsetWidth;
	}
}

// Update position when model changes
watch(() => props.modelValue, () => {
	nextTick(updateIndicatorPosition);
});

// Update position when tabs change (e.g., counts update)
watch(() => props.tabs, () => {
	nextTick(updateIndicatorPosition);
}, { deep: true });

// Initial position
onMounted(() => {
	nextTick(updateIndicatorPosition);
});
</script>
