<template>
  <div class="flex items-center">
    <div class="flex-grow px-6">
      <slot name="title">
        <h2 v-if="title">
          {{ title }}
        </h2>
      </slot>
    </div>
    <div class="py-3 px-6 flex items-center flex-nowrap">
      <slot />
      <RefreshButton
        v-if="refreshButton"
        :loading="loading"
        @click="$emit('refresh')"
      />
      <ExportButton
        v-if="exporter"
        :exporter="exporter"
        class="ml-4"
      />
      <ActionMenu
        v-if="actions.length > 0"
        class="ml-4 dx-batch-actions"
        :target="actionTarget"
        :actions="actions"
      />
      <slot name="after" />
    </div>
  </div>
</template>
<script setup>
import { ExportButton, RefreshButton } from "../../Utility";
import ActionMenu from "../ActionMenu";

defineEmits(["refresh"]);
defineProps({
  title: {
    type: String,
    default: null
  },
  actions: {
    type: Array,
    default: () => []
  },
  actionTarget: {
    type: Object,
    default: null
  },
  refreshButton: Boolean,
  loading: Boolean,
  exporter: {
    type: Function,
    default: null
  }
});
</script>
