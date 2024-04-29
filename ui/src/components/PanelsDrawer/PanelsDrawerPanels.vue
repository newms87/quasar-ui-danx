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
      />
    </QTabPanel>
  </QTabPanels>
</template>

<script setup>
import { RenderVnode } from "../Utility";

defineProps({
  activePanel: {
    type: String,
    default: null
  },
  panels: {
    type: Array,
    required: true
  }
});
</script>
