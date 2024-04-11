<template>
  <QTabs
      :model-value="modelValue"
      vertical
      align="left"
      class="panel-tabs p-4 h-auto"
      no-caps
      @update:model-value="$emit('update:model-value', $event)"
  >
    <template v-for="panel in panels">
      <template v-if="panel.enabled === undefined || !!panel.enabled">
        <RenderVnode
            v-if="panel.tabVnode"
            :key="panel.name"
            :vnode="panel.tabVnode"
            :is-active="modelValue === panel.name"
            :name="panel.name"
            :label="panel.label"
        />
        <QTab v-else :key="panel.name" :name="panel.name" :label="panel.label" />
      </template>
    </template>
  </QTabs>
</template>
<script setup>
import { QTab } from 'quasar';
import { RenderVnode } from '../Utility';

defineEmits(['update:model-value']);
defineProps({
  modelValue: {
    type: String,
    default: 'general'
  },
  panels: {
    type: Array,
    required: true
  }
});
</script>

<style
    lang="scss"
    scoped
>
.panel-tabs {
  :deep(.q-tab) {
    justify-content: start !important;
    padding: 0;
    @apply text-left py-2.5 px-2 rounded-lg hover:bg-slate-200;

    .q-focus-helper, .q-tab__indicator {
      display: none;
    }

    .q-tab__content {
      @apply p-0;
    }
  }

  :deep(.q-tab.q-tab--active) {
    @apply text-white bg-blue-600;
  }
}
</style>
