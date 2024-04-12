<template>
  <div class="flex items-center flex-nowrap">
    <div
        v-for="category in categories"
        :key="category"
        class="category-toggle border-gray-200"
        :class="{'has-visible-columns text-white bg-blue-600': categoryHasVisibleColumns(category)}"
    >
      <QCheckbox
          toggle-indeterminate
          size="20px"
          :model-value="getCategoryCheckboxState(category)"
          class="mr-2 cb-white-border"
          @click="toggleColumns(columnsInCategory(category), !categoryHasVisibleColumns(category))"
      />
      <div>
        {{ category }}
      </div>
      <CaretDownIcon
          class="ml-2 w-5 transition-all"
          :class="{'rotate-180' : isShowingColumnToggle === category}"
      />
      <QMenu
          @update:model-value="isShowingColumnToggle = $event ? category : ''"
      >
        <QList>
          <div
              v-for="column in columnsInCategory(category)"
              :key="column"
              class="flex items-center flex-nowrap px-2 py-3 cursor-pointer"
              @click="toggleColumn(column.name)"
          >
            <QCheckbox
                :model-value="!hiddenColumnNames.includes(column.name)"
                class="mr-3 cb-white-border"
                size="20px"
                :color="column.required ? 'gray-base': 'blue-600'"
                :disable="column.required"
                @click="toggleColumn(column.name)"
            />
            <div class="text-xs">{{ column.label }}</div>
          </div>
        </QList>
      </QMenu>
    </div>
  </div>
</template>
<script setup>
import { computed, ref } from 'vue';
import { remove } from '../../../helpers';
import { CaretDownIcon } from '../../../svg';

const emit = defineEmits(['update:hidden-column-names']);
const props = defineProps({
  columns: {
    type: Array,
    required: true
  },
  hiddenColumnNames: {
    type: Array,
    required: true
  }
});

const isShowingColumnToggle = ref('');
const categories = computed(() => [...new Set(props.columns.map(c => c.category)).values()]);

/**
 * Return a list of column names that belong to the category
 * @param category
 * @returns {(string|*)[]}
 */
function columnsInCategory(category) {
  return props.columns.filter(c => c.category === category);
}

/**
 * Return true if any columns in the category are visible
 * @param category
 * @returns {boolean}
 */
function categoryHasVisibleColumns(category) {
  // If there are any columns in the category that are not hidden, then the category has visible columns
  return columnsInCategory(category).filter(c => !c.required).map(c => c.name).some(c => !props.hiddenColumnNames.includes(c));
}

/**
 * Determines the state of the checkbox as either true, false or null (for the indeterminate state)
 * @param category
 * @returns {boolean|null}
 */
function getCategoryCheckboxState(category) {
  let categoryColumns = columnsInCategory(category).filter(c => !c.required);
  const visibleColumns = categoryColumns.filter(c => !props.hiddenColumnNames.includes(c.name));
  if (visibleColumns.length === 0) {
    return false;
  } else if (visibleColumns.length === categoryColumns.length) {
    return true;
  }
  return null;
}
/**
 * Toggle all columns in a category
 * @param columns
 * @param showColumns
 */
function toggleColumns(columns, showColumns) {
  // Ignore required columns
  columns = columns.filter(c => !c.required);

  let hiddenColumnNames = [...props.hiddenColumnNames];
  if (showColumns) {
    hiddenColumnNames = hiddenColumnNames.filter(c => !columns.map(c => c.name).includes(c));
  } else {
    hiddenColumnNames = [...new Set([...hiddenColumnNames, ...columns.map(c => c.name)])];
  }
  emit('update:hidden-column-names', hiddenColumnNames);
}

/**
 * Toggle a single column
 * @param columnName
 * @param showColumn
 */
function toggleColumn(columnName, showColumn) {
  // Do not allow toggling required columns
  if (props.columns.find(c => c.name === columnName).required) return;

  // Determine weather to add (hide) or remove (show) the column
  showColumn = showColumn ?? props.hiddenColumnNames.includes(columnName);

  let hiddenColumnNames = [...props.hiddenColumnNames];

  // Add or remove the column from the hiddenColumnNames array
  if (showColumn) {
    hiddenColumnNames = remove(hiddenColumnNames, columnName);
  } else {
    hiddenColumnNames.push(columnName);
    hiddenColumnNames = [...new Set(hiddenColumnNames)];
  }

  emit('update:hidden-column-names', hiddenColumnNames);
}
</script>
<style
    lang="scss"
    scoped
>
.category-toggle {
  @apply text-xs font-bold rounded-lg border border-solid px-2 py-1 mx-1 cursor-pointer flex items-center;
}
</style>
