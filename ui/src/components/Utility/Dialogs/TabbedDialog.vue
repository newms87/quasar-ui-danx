<template>
	<InfoDialog
		v-if="isOpen"
		hide-done
		:content-class="contentClass"
		@close="close"
	>
		<template #title>
			<div class="flex items-center space-x-4">
				<slot name="title" />
				<TabButtonGroup
					v-model="activeTab"
					:tabs="tabs"
				/>
			</div>
		</template>

		<!-- Tab Content -->
		<div class="h-full overflow-hidden">
			<template v-for="tab in tabs" :key="tab.value">
				<div v-if="activeTab === tab.value" class="h-full">
					<slot :name="tab.value" />
				</div>
			</template>
		</div>
	</InfoDialog>
</template>

<script setup lang="ts">
/**
 * Reusable tabbed dialog built on InfoDialog with TabButtonGroup.
 * Each tab can have its own icon, colors, label, and count badge.
 */
import { ref, watch } from "vue";
import InfoDialog from "./InfoDialog.vue";
import TabButtonGroup from "../Tabs/TabButtonGroup.vue";
import type { TabButton } from "../Tabs/TabButtonGroup.vue";

const props = withDefaults(defineProps<{
	tabs: TabButton[];
	modelValue?: string;
	contentClass?: string;
}>(), {
	contentClass: "w-[90vw] h-[85vh]"
});

const emit = defineEmits<{
	"update:modelValue": [value: string];
}>();

const isOpen = ref(false);
const activeTab = ref<string>(props.modelValue || props.tabs[0]?.value || "");

// Sync activeTab with modelValue prop
watch(() => props.modelValue, (value) => {
	if (value && value !== activeTab.value) {
		activeTab.value = value;
	}
});

// Emit changes to modelValue
watch(activeTab, (value) => {
	emit("update:modelValue", value);
});

/**
 * Open the dialog, optionally to a specific tab
 */
function open(tab?: string) {
	if (tab) {
		activeTab.value = tab;
	}
	isOpen.value = true;
}

/**
 * Close the dialog
 */
function close() {
	isOpen.value = false;
}

defineExpose({
	open,
	close
});
</script>
