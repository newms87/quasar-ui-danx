<template>
  <CollapsableSidebar
      :collapse="!showFilters"
      disabled
      min-width="0"
      max-width="18rem"
      name="admin-ads"
      @update:collapse="$emit('update:show-filters', !$event)"
  >
    <FilterGroupList
        :filter="filter"
        :filter-fields="filterFields"
        @update:filter="$emit('update:filter', $event)"
    />
  </CollapsableSidebar>
</template>
<script setup>
import { FilterGroupList } from '.';
import { CollapsableSidebar } from '../../Utility';

defineEmits(['update:filter', 'update:show-filters']);
defineProps({
  name: {
    type: String,
    required: true
  },
  showFilters: Boolean,
  filter: {
    type: Object,
    default: null
  },
  filterFields: {
    type: Array,
    default: () => []
  }
});
</script>
