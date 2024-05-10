<template>
  <QList>
    <div class="px-4 py-2 max-w-full">
      <template
        v-for="(group, index) in filters"
        :key="'group-' + group.name"
      >
        <template v-if="group.flat">
          <FilterableField
            v-for="field in group.fields"
            :key="'field-' + field.name"
            :model-value="field.calcValue ? field.calcValue(activeFilter) : activeFilter[field.name]"
            :field="field"
            :loading="loading"
            class="mb-4"
            @update:model-value="updateFilter(field, $event)"
          />
        </template>

        <FilterItem
          v-else
          :name="group.name"
          :count="activeCountByGroup[group.name]"
        >
          <FilterableField
            v-for="field in group.fields"
            :key="'field-' + field.name"
            :model-value="field.calcValue ? field.calcValue(activeFilter) : activeFilter[field.name]"
            :field="field"
            :loading="loading"
            class="mb-4"
            @update:model-value="updateFilter(field, $event)"
          />
        </FilterItem>

        <QSeparator
          v-if="index < (filters.length - 1)"
          class="my-2"
        />
      </template>
    </div>
  </QList>
</template>
<script setup>
import { computed } from "vue";
import FilterableField from "./FilterableField";
import FilterItem from "./FilterItem";

const emit = defineEmits(["update:filter"]);
const props = defineProps({
	filters: {
		type: Array,
		required: true
	},
	activeFilter: {
		type: Object,
		required: true
	},
	loading: Boolean
});

const activeCountByGroup = computed(() => {
	const activeCountByGroup = {};
	for (const group of props.filters) {
		activeCountByGroup[group.name] = group.fields.filter(field => props.activeFilter[field.name] !== undefined).length;
	}
	return activeCountByGroup;
});
function updateFilter(field, value) {
	let activeFilter = { [field.name]: value };
	if (field.filterBy) {
		activeFilter = field.filterBy(value);
	}
	emit("update:filter", { ...props.activeFilter, ...activeFilter });
}
</script>
