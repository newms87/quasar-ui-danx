<template>
  <ul>
    <li v-for="item in items" :key="item[column]">
      {{ item[column] }}
    </li>
  </ul>
</template>
<script setup>
defineProps({
  items: {
    type: Array,
    required: true
  },
  column: {
    type: String,
    required: true
  }
});
</script>
