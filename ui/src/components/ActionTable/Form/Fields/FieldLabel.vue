<template>
  <div class="dx-field-label">
    <slot>
      <div class="dx-field-label-text">
        <div class="dx-field-label-label">
          {{ label }}
        </div>
        <div
          v-if="name"
          class="dx-field-label-name"
        >
          ({{ name }})
        </div>
      </div>
    </slot>
    <span
      v-if="required"
      class="dx-field-required"
    >{{ requiredLabel || "*" }}</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
	label?: string | null;
	name?: string;
	required?: boolean;
	requiredLabel?: string;
}>();
</script>
