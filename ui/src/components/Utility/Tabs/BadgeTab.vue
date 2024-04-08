<template>
  <q-tab
      :name="name"
      class="w-full"
      content-class="w-full"
  >
    <div class="flex items-center w-full">
      <div class="flex-grow text-sm">{{ label }}</div>
      <q-badge
          color="gray-base"
          :label="count"
          rounded
      />
    </div>
  </q-tab>
</template>
<script setup>
defineProps({
  name: {
    type: String,
    required: true
  },
  label: {
    type: String,
    required: true
  },
  count: {
    type: [String, Number],
    default: ''
  }
});
</script>
