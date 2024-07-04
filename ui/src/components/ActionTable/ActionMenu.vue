<template>
  <PopoverMenu
    class="px-2 flex dx-action-button"
    :items="activeActions"
    :disabled="!hasTarget"
    :tooltip="!hasTarget ? tooltip : ''"
    :loading="isSaving || !!loading"
    :loading-component="loadingComponent"
    @action-item="onAction"
  />
</template>
<script setup lang="ts">
import { computed, ref } from "vue";
import { ActionTarget, ResourceAction } from "../../types";
import { PopoverMenu } from "../Utility";

const emit = defineEmits(["success"]);
const props = withDefaults(defineProps<{
	actions: ResourceAction[],
	target?: ActionTarget,
	tooltip?: string,
	loading?: boolean,
	loadingComponent?: any
}>(), {
	target: () => [],
	tooltip: "First select records to perform a batch action",
	loadingComponent: undefined
});

const hasTarget = computed(() => Array.isArray(props.target) ? props.target.length > 0 : !!props.target);

const activeActions = computed(() => props.actions.filter(action => {
	if (Array.isArray(props.target)) {
		return action.batchEnabled ? action.batchEnabled(props.target) : true;
	}

	return action.enabled ? action.enabled(props.target) : true;
}));

const isSaving = ref(false);
async function onAction(action) {
	if (!action.trigger) {
		throw new Error("Action must have a trigger function! Make sure you are using useActions() or implement your own trigger function.");
	}
	isSaving.value = true;
	await action.trigger(props.target);
	isSaving.value = false;
	emit("success", action);
}
</script>
