<template>
  <div class="flex items-center" :class="{'w-72': showFilters}">
    <div class="flex-grow">
      <q-btn
          class="btn-blue-highlight"
          :class="{'highlighted': showFilters}"
          @click="$emit('update:show-filters', !showFilters)"
      >
        <FilterIcon class="w-5 mr-2" />
        <q-badge
            :label="'' + activeCount"
            rounded
            :color="activeCount > 0 ? 'blue-base' : 'gray-base'"
        />
      </q-btn>
    </div>
    <a
        v-if="activeCount > 0"
        class="text-blue-base hover:text-blue-plus-1 text-sm ml-4"
        @click="$emit('update:filter', {})"
    >Clear All</a>
  </div>
</template>
<script setup>
import { computed } from 'vue';
import { FilterIcon } from '../../../svg';

defineEmits(['update:show-filters', 'update:filter']);
const props = defineProps({
  filter: {
    type: Object,
    required: true
  },
  filterGroups: {
    type: Array,
    required: true
  },
  showFilters: Boolean
});

const filterNameDictionary = computed(() => {
  return props.filterGroups.reduce((acc, fg) => {
    fg.fields.forEach(f => {
      acc[f.name] = true;
    });
    return acc;
  }, {});
});
const activeCount = computed(() => Object.keys(props.filter).filter(key => props.filter[key] !== undefined && filterNameDictionary.value[key]).length);
</script>
