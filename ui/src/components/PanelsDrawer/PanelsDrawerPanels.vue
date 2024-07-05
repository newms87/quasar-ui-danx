<template>
  <QTabPanels
    :model-value="activePanel"
    class="dx-panels-drawer-panels overflow-y-auto h-full transition-all"
  >
    <QTabPanel
      v-for="panel in panels"
      :key="panel.name"
      :name="panel.name"
    >
      <RenderVnode
        v-if="panel.vnode"
        :vnode="panel.vnode"
        :props="activeItem"
      />
    </QTabPanel>
  </QTabPanels>
</template>

<script setup lang="ts">
import { ActionPanel, ActionTargetItem } from "../../types";
import { RenderVnode } from "../Utility";

defineProps<{
	activePanel?: string | number,
	activeItem: ActionTargetItem,
	panels: ActionPanel[]
}>();
</script>
