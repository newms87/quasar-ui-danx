<template>
  <div
    :class="savingClass"
    class="dx-saving-indicator flex items-center flex-nowrap"
  >
    <slot
      v-if="saving"
      name="saving"
    >
      Saving...
      <QSpinnerPie class="ml-2" />
    </slot>
    <slot
      v-else
      name="saved"
    >
      <template v-if="savedAt">
        Saved at {{ fDateTime(savedAt, { format: "M/d/yy h:mm:ssa" }) }}
      </template>
      <template v-else>
        Not saved
      </template>
    </slot>
  </div>
</template>
<script setup lang="ts">
import { fDateTime } from "../../../../helpers";

withDefaults(defineProps<{
	saving?: boolean;
	savedAt?: string;
	savingClass?: string;
}>(), {
	savingClass: "text-sm text-slate-500",
	savedAt: ""
});
</script>
