<template>
  <QTab
    :name="name"
    class="w-full"
    content-class="w-full"
  >
    <div class="flex items-center w-full">
      <div class="flex-grow text-sm">
        {{ label }}
      </div>
      <QBadge
        class="bg-gray-400"
        :label="count"
        rounded
      />
    </div>
  </QTab>
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
    default: ""
  }
});
</script>
