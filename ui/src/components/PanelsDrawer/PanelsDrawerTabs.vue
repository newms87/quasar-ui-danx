<template>
  <QTabs
    class="dx-panels-drawer-tabs overflow-y-auto"
    :model-value="modelValue"
    vertical
    align="left"
    :class="cls['panel-tabs']"
    no-caps
    @update:model-value="$emit('update:model-value', $event)"
  >
    <template v-for="panel in panels">
      <template v-if="isEnabled(panel)">
        <RenderVnode
          v-if="panel.tabVnode"
          :key="panel.name"
          :vnode="panel.tabVnode(target, modelValue)"
          :is-active="modelValue === panel.name"
          :name="panel.name"
          :label="panel.label"
        />
        <QTab
          v-else
          :key="panel.name"
          :name="panel.name"
          :label="panel.label"
        />
      </template>
    </template>
  </QTabs>
</template>
<script setup lang="ts">
import { QTab } from "quasar";
import { ActionPanel, ActionTargetItem } from "../../types";
import { RenderVnode } from "../Utility";

defineEmits(["update:model-value"]);

interface Props {
	modelValue?: string | number;
	target: ActionTargetItem;
	panels: ActionPanel[];
}

const props = withDefaults(defineProps<Props>(), {
	modelValue: "general"
});

function isEnabled(panel) {
	if (panel.enabled === undefined) return true;

	if (!panel.enabled) return false;

	if (typeof panel.enabled === "function") {
		return panel.enabled(props.target);
	}

	return true;
}
</script>

<style lang="scss" module="cls">
.panel-tabs {
	padding: 1rem; height: auto;

	:global(.q-tab) {
		justify-content: start !important;

		:global(.q-focus-helper), :global(.q-tab__indicator) {
			display: none;
		}

		:global(.q-tab__content) {
			padding: 0;
		}
	}
}
</style>
