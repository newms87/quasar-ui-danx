<template>
  <div
    v-if="maxLength"
    class="danx-input-chars mt-1"
    :class="{'danx-input-chars--error': length > maxLength}"
  >
    {{ fNumber(length) }} / {{ fNumber(maxLength) }} characters
  </div>
</template>
<script setup lang="ts">
import { fNumber } from "../../../../helpers";

defineProps<{
	length: number;
	maxLength?: number;
}>();
</script>
