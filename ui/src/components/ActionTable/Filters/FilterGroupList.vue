<template>
  <QList>
    <div class="px-4 py-2 max-w-full">
      <template
        v-for="(group, index) in filterGroups"
        :key="'group-' + group.name"
      >
        <template v-if="group.flat">
          <FilterableField
            v-for="field in group.fields"
            :key="'field-' + field.name"
            :model-value="field.calcValue ? field.calcValue(filter) : filter[field.name]"
            :field="field"
            :loading="loading"
            class="mb-4"
            @update:model-value="updateFilter(field, $event)"
          />
        </template>

        <FilterGroupItem
          v-else
          :name="group.name"
          :count="activeCountByGroup[group.name]"
        >
          <FilterableField
            v-for="field in group.fields"
            :key="'field-' + field.name"
            :model-value="field.calcValue ? field.calcValue(filter) : filter[field.name]"
            :field="field"
            :loading="loading"
            class="mb-4"
            @update:model-value="updateFilter(field, $event)"
          />
        </FilterGroupItem>

        <QSeparator
          v-if="index < (filterGroups.length - 1)"
          class="my-2"
        />
      </template>
    </div>
  </QList>
</template>
<script setup>
import FilterableField from "danx/src/components/ActionTable/Filters/FilterableField";
import FilterGroupItem from "danx/src/components/ActionTable/Filters/FilterGroupItem";
import { computed } from "vue";

const emit = defineEmits(["update:filter"]);
const props = defineProps({
  filterGroups: {
    type: Array,
    required: true
  },
  filter: {
    type: Object,
    required: true
  },
  loading: Boolean
});

const activeCountByGroup = computed(() => {
  const activeCountByGroup = {};
  for (const group of props.filterGroups) {
    activeCountByGroup[group.name] = group.fields.filter(field => props.filter[field.name] !== undefined).length;
  }
  return activeCountByGroup;
});
function updateFilter(field, value) {
  let fieldFilter = { [field.name]: value };
  if (field.filterBy) {
    fieldFilter = field.filterBy(value);
  }
  emit("update:filter", { ...props.filter, ...fieldFilter });
}
</script>
