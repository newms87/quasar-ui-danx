<template>
  <q-page padding class="w-full">
    <h1 v-if="$slots.header || title" class="text-xl mb-3">
      <slot name="header">{{ title }}</slot>
    </h1>

    <q-separator class="my-2" />

    <q-page-container>
      <slot />
    </q-page-container>
  </q-page>
</template>
<script setup>
defineProps({
  title: {
    type: String,
    default: null
  }
});
</script>
