<template>
  <div
    class="flex items-center transition-all"
    :class="{'w-72': showFilters, 'w-[6.5rem]': !showFilters}"
  >
    <div class="flex-grow">
      <QBtn
        class="btn-blue-highlight border-blue-700"
        :class="{'highlighted': showFilters}"
        @click="$emit('update:show-filters', !showFilters)"
      >
        <FilterIcon class="w-5 mr-2" />
        <QBadge
          :label="'' + activeCount"
          rounded

          :color="activeCount > 0 ? 'blue-600' : 'gray-400'"
        />
      </QBtn>
    </div>
    <a
      v-if="activeCount > 0 && showFilters"
      class="text-blue-600 hover:text-blue-500 text-sm ml-4"
      @click="$emit('update:filter', {})"
    >Clear All</a>
  </div>
</template>
<script setup>
import { computed } from "vue";
import { FilterIcon } from "../../../svg";

defineEmits(["update:show-filters", "update:filter"]);
const props = defineProps({
  filter: {
    type: Object,
    required: true
  },
  showFilters: Boolean
});

const activeCount = computed(() => Object.keys(props.filter).filter(key => props.filter[key] !== undefined).length);
</script>
<style lang="scss" scoped>
.btn-blue-highlight {
  @apply rounded-lg border border-solid p-3 whitespace-nowrap;

  &.highlighted {
    box-shadow: 0 0 0 3px #B8E1FF;
  }

  :deep(.q-btn__content) {
    @apply flex items-center flex-nowrap;
  }
}
</style>
