<template>
  <QTr
      class="sticky-column-1 transition-all sticky-row"
      :class="{'!bg-neutral-plus-7': !selectedCount, '!bg-blue-base text-white selected': selectedCount, 'opacity-50': loading}"
  >
    <QTd
        :colspan="stickyColspan"
        class="font-bold transition-all"
        :class="{'!bg-neutral-plus-7 !pl-5': !selectedCount, '!bg-blue-base text-white !pl-4': selectedCount}"
    >
      <div class="flex flex-nowrap items-center">
        <div
            v-if="selectedCount"
            class="flex items-center"
        >
          <ClearIcon
              class="w-6 mr-3"
              @click="$emit('clear')"
          />
          {{ fNumber(selectedCount) }} {{ selectedLabel }}
        </div>
        <div v-else-if="itemCount">
          {{ fNumber(itemCount) }} {{ label }}
        </div>
        <QSpinner
            v-if="loading"
            class="ml-3"
            size="18"
        />
      </div>
    </QTd>
    <QTd
        v-for="column in summaryColumns"
        :key="column.name"
        :align="column.align || 'left'"
    >
      <template v-if="summary">
        {{ formatValue(column) }}
      </template>
    </QTd>
  </QTr>
</template>
<script setup>
import { XCircleIcon as ClearIcon } from '@heroicons/vue/solid';
import { QSpinner, QTd, QTr } from 'quasar';
import { computed } from 'vue';
import { fNumber } from '../../helpers';

defineEmits(['clear']);
const props = defineProps({
  loading: Boolean,
  label: {
    type: String,
    default: 'Rows'
  },
  selectedLabel: {
    type: String,
    default: 'Selected'
  },
  selectedCount: {
    type: Number,
    default: 0
  },
  itemCount: {
    type: Number,
    default: 0
  },
  summary: {
    type: Object,
    default: null
  },
  columns: {
    type: Array,
    required: true
  },
  stickyColspan: {
    type: Number,
    default: 2
  }
});

const summaryColumns = computed(() => {
  // The sticky columns are where we display the selection count and should not be included in the summary columns
  return props.columns.slice(props.stickyColspan - 1);
});

function formatValue(column) {
  const value = props.summary[column.name];
  if (value === undefined) return '';

  if (column.format) {
    return column.format(value);
  }
  return value;
}
</script>
