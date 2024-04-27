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
      :filter="activeFilter"
      :filter-fields="filters"
      @update:filter="$emit('update:active-filter', $event)"
    />
  </CollapsableSidebar>
</template>
<script setup lang="ts">
import { FilterField, ListControlsFilter } from "src/components/ActionTable/listControls";
import { FilterFieldList } from ".";
import { CollapsableSidebar } from "../../Utility";

defineEmits(["update:active-filter", "update:show-filters"]);

export interface Props {
  name: string,
  showFilters?: boolean,
  activeFilter: ListControlsFilter,
  minWidth?: string,
  maxWidth?: string,
  filters?: FilterField[]
}

withDefaults(defineProps<Props>(), {
  minWidth: "5rem",
  maxWidth: "18rem",
  filters: () => []
});
</script>
