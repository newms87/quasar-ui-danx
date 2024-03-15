<template>
  <q-expansion-item>
    <template #header>
      <div class="flex items-center flex-nowrap flex-grow">
        <div class="whitespace-nowrap flex-grow text-left text-sm font-bold">{{ name }}</div>
        <q-badge
            :label="count"
            rounded
            class="ml-2 transition-all"
            :class="{'bg-gray-base': !count, 'bg-blue-base': count}"
        />
      </div>
    </template>
    <slot />
  </q-expansion-item>
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
