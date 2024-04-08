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
        <RenderVnode
            v-if="column.vnode"
            :vnode="column.vnode(row)"
        />
        <slot v-else v-bind="{name: column.name, row, value}">
          {{ value }}
        </slot>
      </a>
      <div v-else class="flex-grow">
        <RenderVnode
            v-if="column.vnode"
            :vnode="column.vnode(row)"
        />
        <slot v-else v-bind="{name: column.name, row, value}">
          {{ value }}
        </slot>
      </div>
      <div v-if="column.actions" class="flex flex-shrink-0 pl-2">
        <ActionMenu
            :actions="column.actions"
            :target="row"
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

const columnStyle = computed(() => {
  const width = props.settings?.width || column.value.width;
  return width ? { width: `${width}px` } : null;
});

const columnClass = computed(() => ({
  'justify-end': column.value.align === 'right',
  'justify-center': column.value.align === 'center',
  'justify-start': column.value.align === 'left'
}));
</script>
