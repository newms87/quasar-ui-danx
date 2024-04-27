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
<script setup lang="ts">
import { FilterField, ListControlsFilter } from "src/components/ActionTable/listControls";
import { FilterFieldList } from ".";
import { CollapsableSidebar } from "../../Utility";

defineEmits(["update:filter", "update:show-filters"]);

export interface Props {
  name: string,
  showFilters?: boolean,
  filter: ListControlsFilter,
  minWidth?: string,
  maxWidth?: string,
  filterFields?: FilterField[]
}

withDefaults(defineProps<Props>(), {
  minWidth: "5rem",
  maxWidth: "18rem",
  filterFields: () => []
});
</script>
