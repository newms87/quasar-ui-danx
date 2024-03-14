<template>
  <div class="flex items-center justify-center text-sm py-14 w-full">
    <div v-if="loading">
      <slot name="loading">{{ loadingText }}
        <QSpinnerBall class="w-4 ml-2" />
      </slot>
    </div>
    <div v-if="saving">
      <slot name="saving">{{ savingText }}
        <QSpinnerBall class="w-4 ml-2" />
      </slot>
    </div>
    <slot>{{ text }}</slot>
  </div>
</template>
<script setup>
defineProps({
  loading: Boolean,
  saving: Boolean,
  text: {
    type: String,
    default: "No records found"
  },
  loadingText: {
    type: String,
    default: "Loading..."
  },
  savingText: {
    type: String,
    default: "Saving..."
  }
});
</script>
