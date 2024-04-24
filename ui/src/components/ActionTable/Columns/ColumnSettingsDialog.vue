<template>
  <InfoDialog
    title="Column Settings"
    @close="$emit('close')"
  >
    <div class="mb-4 text-sm">
      Customize columns by visibility, order, or priority (maximum 3 additional).
    </div>
    <ColumnListItem
      v-for="column in lockedColumns"
      :key="column.name"
      locked
      visible
      :column="column"
      class="px-2.5 border border-gray-200 bg-white rounded-t-lg"
    />
    <ListTransition
      name="fade-down-list"
      data-drop-zone="column-list"
    >
      <ListItemDraggable
        v-for="(column, index) in sortableColumns"
        :key="column.name"
        :list-items="sortableColumns"
        drop-zone="column-list"
        class="px-2 border border-gray-200 bg-white"
        :class="{'rounded-b-lg': index === sortableColumns.length - 1}"
        show-handle
        @update:list-items="$emit('update:sortable-columns', $event)"
      >
        <ColumnListItem
          :column="column"
          :visible="isVisible(column)"
          :is-title="isTitleColumn(column)"
          @visible="onVisibilityChange(column, $event)"
          @is-title="onTitleColumnChange(column, $event)"
        />
      </ListItemDraggable>
    </ListTransition>
  </InfoDialog>
</template>
<script setup>
import { computed } from "vue";
import { FlashMessages, remove } from "../../../helpers";
import { ListItemDraggable } from "../../DragAndDrop";
import { InfoDialog, ListTransition } from "../../Utility";
import ColumnListItem from "./ColumnListItem";

const emit = defineEmits(["close", "update:hidden-column-names", "update:title-column-names", "update:sortable-columns"]);
const props = defineProps({
  hiddenColumnNames: {
    type: Array,
    required: true
  },
  titleColumnNames: {
    type: Array,
    required: true
  },
  lockedColumns: {
    type: Array,
    required: true
  },
  sortableColumns: {
    type: Array,
    required: true
  },
  titleColumnLimit: {
    type: Number,
    default: 3
  }
});

const allowMoreTitleColumns = computed(() => {
  return props.titleColumnNames.length < props.titleColumnLimit;
});
function isVisible(column) {
  return !props.hiddenColumnNames.includes(column.name);
}
function onVisibilityChange(column, visible) {
  let hiddenColumnNames = [...props.hiddenColumnNames];

  if (visible && hiddenColumnNames.includes(column.name)) {
    hiddenColumnNames = remove(hiddenColumnNames, column.name);
  } else {
    hiddenColumnNames.push(column.name);
  }
  emit("update:hidden-column-names", [...new Set(hiddenColumnNames)]);
}

function isTitleColumn(column) {
  return props.titleColumnNames.includes(column.name);
}
function onTitleColumnChange(column, isTitle) {
  let titleColumnNames = [...props.titleColumnNames];
  if (isTitle && !titleColumnNames.includes(column.name)) {
    if (!allowMoreTitleColumns.value) {
      FlashMessages.warning(`You can only have ${props.titleColumnLimit} priority columns.`);
      return;
    }
    titleColumnNames.push(column.name);
  } else {
    titleColumnNames = remove(titleColumnNames, column.name);
  }
  emit("update:title-column-names", [...new Set(titleColumnNames)]);
}
</script>
