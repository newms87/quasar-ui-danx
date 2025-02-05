<template>
  <DialogLayout
    class="dx-info-dialog"
    v-bind="$props"
    @close="onClose"
  >
    <slot />
    <template
      v-if="$slots.title"
      #title
    >
      <slot name="title" />
    </template>
    <template
      v-if="$slots.subtitle"
      #subtitle
    >
      <slot name="subtitle" />
    </template>
    <template #actions>
      <div class="flex-grow">
        <QBtn
          :label="doneText"
          class="dx-dialog-button dx-dialog-button-done"
          :class="doneClass"
          @click="onClose"
        >
          <slot name="done-text" />
        </QBtn>
      </div>
      <slot name="actions" />
    </template>
  </DialogLayout>
</template>

<script setup>
import DialogLayout from "./DialogLayout";

const emit = defineEmits(["update:model-value", "close"]);
defineProps({
	...DialogLayout.props,
	doneClass: {
		type: [String, Object],
		default: ""
	},
	doneText: {
		type: String,
		default: "Done"
	}
});

function onClose() {
	emit("update:model-value", false);
	emit("close");
}
</script>
