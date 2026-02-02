<template>
  <QDialog
    :model-value="show"
    maximized
    :position="position"
    :seamless="seamless"
    :class="{'hide-backdrop': !overlay}"
    @hide="$emit('update:show', false)"
  >
    <div>
      <div
        v-if="title"
        :class="cls['dialog-title']"
        @click.stop.prevent
      >
        {{ title }}
      </div>
      <div :class="{[cls['dialog-content']]: true, [contentClass]: true}">
        <slot />
      </div>
    </div>
  </QDialog>
</template>

<script setup lang="ts">
import { QDialogProps } from "quasar";

export interface ContentDrawerProps {
	show?: boolean,
	overlay?: boolean,
	position?: QDialogProps["position"],
	seamless?: boolean,
	contentClass?: string,
	title?: string
}

defineEmits(["update:show"]);
withDefaults(defineProps<ContentDrawerProps>(), {
	show: false,
	position: "bottom",
	contentClass: "py-8 px-12",
	title: "Edit"
});
</script>

<style lang="scss" module="cls">
.dialog-title {
	font-weight: 500; text-transform: uppercase; font-size: 0.75rem; line-height: 1rem; padding: 0.75rem 1.5rem; border-bottom: 1px solid rgb(229, 231, 235); border-top-left-radius: 0.375rem; border-top-right-radius: 0.375rem; background-color: rgb(241, 245, 249); color: rgb(107, 114, 128);
	font-family: "Roboto", sans-serif;
	letter-spacing: 0.05em;
	box-shadow: 0px -4px 12px rgba(0, 0, 0, 0.25);
}

.dialog-content {
	background-color: rgb(255, 255, 255);
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
}
</style>
