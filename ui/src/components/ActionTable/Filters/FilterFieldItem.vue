<template>
  <QExpansionItem>
    <template #header>
      <div class="flex items-center flex-nowrap flex-grow">
        <div class="whitespace-nowrap flex-grow text-left text-sm font-bold">
          {{ name }}
        </div>
        <QBadge
          :label="count"
          rounded
          class="ml-2 transition-all"
          :class="{'bg-gray-400': !count, 'bg-blue-600': count}"
        />
      </div>
    </template>
    <slot />
  </QExpansionItem>
</template>
<script setup>
defineProps({
  name: {
    type: String,
    required: true
  },
  count: {
    type: Number,
    required: true
  }
});
</script>
