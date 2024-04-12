<template>
  <div>
    <div
        v-for="column in columns" :key="column.name"
        class="overflow-hidden overflow-ellipsis text-xs text-gray-base"
    >{{ format(row[column.name], column.format) }}
    </div>
  </div>
</template>
<script setup>
defineProps({
  row: {
    type: Object,
    required: true
  },
  columns: {
    type: Array,
    required: true
  }
});

function format(value, format) {
  if (typeof format === "function") {
    return format(value);
  }
  return value;
}
</script>
