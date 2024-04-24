<template>
  <QTabs
    :model-value="modelValue"
    vertical
    align="left"
    :class="cls['panel-tabs']"
    no-caps
    @update:model-value="$emit('update:model-value', $event)"
  >
    <template v-for="panel in panels">
      <template v-if="panel.enabled === undefined || !!panel.enabled">
        <RenderVnode
          v-if="panel.tabVnode"
          :key="panel.name"
          :vnode="panel.tabVnode(modelValue)"
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
<script setup>
import { QTab } from "quasar";
import { RenderVnode } from "../Utility";

defineEmits(["update:model-value"]);
defineProps({
  modelValue: {
    type: String,
    default: "general"
  },
  panels: {
    type: Array,
    required: true
  }
});
</script>

<style lang="scss" module="cls">
.panel-tabs {
  @apply p-4 h-auto;

  :global(.q-tab) {
    justify-content: start !important;
    padding: 0;
    @apply text-left py-2.5 px-2 rounded-lg hover:bg-slate-200;

    :global(.q-focus-helper), :global(.q-tab__indicator) {
      display: none;
    }

    :global(.q-tab__content) {
      @apply p-0;
    }
  }

  :global(.q-tab.q-tab--active) {
    @apply text-white bg-blue-600;
  }
}
</style>
