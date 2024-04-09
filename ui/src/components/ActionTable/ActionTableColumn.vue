<template>
  <q-td :key="rowProps.key" :props="rowProps" :style="columnStyle">
    <div
        class="flex items-center flex-nowrap"
        :class="columnClass"
    >
      <a
          v-if="column.onClick"
          class="flex-grow"
          @click="column.onClick(row)"
      >
        <RenderVnode v-if="column.vnode" :vnode="column.vnode(row)" />
        <slot v-else>{{ value }}</slot>
      </a>
      <div v-else class="flex-grow">
        <RenderVnode v-if="column.vnode" :vnode="column.vnode(row)" />
        <slot v-else>{{ value }}</slot>
      </div>
      <div v-if="actionMenu" class="flex flex-shrink-0 pl-2">
        <ActionMenu
            :actions="actionMenu"
            :target="row"
            :loading="isSaving"
        />
      </div>
    </div>
  </q-td>
</template>
<script setup>
import { computed } from 'vue';
import { RenderVnode } from '../Utility';
import { ActionMenu } from './index';

const props = defineProps({
  rowProps: {
    type: Object,
    required: true
  },
  settings: {
    type: Object,
    default: null
  }
});

const row = computed(() => props.rowProps.row);
const column = computed(() => props.rowProps.col);
const value = computed(() => props.rowProps.value);
const actionMenu = computed(() => column.value.actionMenu);
const isSaving = computed(() => column.value.isSaving && column.value.isSaving(row));

const columnStyle = computed(() => {
  const width = props.settings?.width || column.value.width;
  return width ? { width: `${width}px` } : null;
});

const columnClass = computed(() => ({
  'is-saving': isSaving.value,
  'justify-end': column.value.align === 'right',
  'justify-center': column.value.align === 'center',
  'justify-start': column.value.align === 'left'
}));
</script>
