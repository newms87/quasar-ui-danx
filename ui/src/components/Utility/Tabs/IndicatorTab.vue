<template>
  <QTab
      :name="name"
      class="w-full"
      content-class="w-full"
  >
    <div class="flex items-center w-full">
      <div class="flex-grow text-sm">{{ label }}</div>
      <div>
        <OverdueIcon
            v-if="overdue"
            class="w-5 ml-2"
            :class="isActive ? 'text-white' : 'text-red-danger'"
        />
        <WarningIcon
            v-else-if="warning"
            class="text-yellow-warning w-5"
        />
      </div>
    </div>
  </QTab>
</template>
<script setup>
import { ExclamationCircleIcon as OverdueIcon } from "@heroicons/vue/solid";
import { WarningIcon } from "../../../svg";

defineProps({
  name: {
    type: String,
    required: true
  },
  label: {
    type: String,
    required: true
  },
  overdue: Boolean,
  warning: Boolean,
  isActive: Boolean
});
</script>
