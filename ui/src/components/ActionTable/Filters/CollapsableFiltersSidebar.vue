<template>
  <CollapsableSidebar
    :collapse="!showFilters"
    disabled
    :min-width="minWidth"
    :max-width="maxWidth"
    :name="name"
    @update:collapse="$emit('update:show-filters', !$event)"
  >
    <FilterFieldList
      :filter="filter"
      :filter-fields="filterFields"
      @update:filter="$emit('update:filter', $event)"
    />
  </CollapsableSidebar>
</template>
<script setup>
import { FilterFieldList } from ".";
import { CollapsableSidebar } from "../../Utility";

defineEmits(["update:filter", "update:show-filters"]);
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
  minWidth: {
    type: String,
    default: "5rem"
  },
  maxWidth: {
    type: String,
    default: "18rem"
  },
  filterFields: {
    type: Array,
    default: () => []
  }
});
</script>
