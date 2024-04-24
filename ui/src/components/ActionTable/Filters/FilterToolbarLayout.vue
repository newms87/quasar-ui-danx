<template>
  <div class="w-full flex justify-end items-center flex-nowrap border-b">
    <FilterListToggle
      :show-filters="showFilters"
      :filter="filter"
      class="border-r p-4 flex-shrink-0"
      @update:show-filters="onFilter"
      @update:filter="$emit('update:filter', $event)"
    />

    <div class="flex-grow">
      <slot />
    </div>

    <div
      v-if="$slots['right-side']"
      class="flex justify-end items-stretch flex-nowrap p-4"
    >
      <QSeparator
        v-if="$slots['default']"
        vertical
        class="mx-4 h-10 self-center"
      />
      <slot name="right-side" />
    </div>
  </div>
</template>
<script setup>
import { QSeparator } from "quasar";
import { FilterListToggle } from "../Filters";

const emit = defineEmits(["update:show-filters", "update:filter"]);
const props = defineProps({
  filter: {
    type: Object,
    default: null
  },
  showFilters: Boolean
});
function onFilter() {
  emit("update:show-filters", !props.showFilters);
}
</script>
