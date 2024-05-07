<template>
  <div
    v-if="maxLength"
    class="danx-input-chars mt-1"
    :class="{'danx-input-chars--error': length.length > maxLength}"
  >
    {{ fNumber(length.length) }} / {{ fNumber(maxLength) }} characters
  </div>
</template>
<script setup lang="ts">
import { fNumber } from "../../../../helpers";

defineProps<{
	length: string;
	maxLength?: number;
}>();
</script>
