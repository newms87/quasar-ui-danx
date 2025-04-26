<template>
  <DialogLayout
    class="dx-info-dialog"
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
      <div
        v-if="!hideDone"
        class="flex-grow"
      >
        <QBtn
          :label="doneText"
          class="dx-dialog-button dx-dialog-button-done"
          :class="doneClass"
          :disable="disabled"
          @click="onClose"
        >
          <slot name="done-text" />
        </QBtn>
      </div>
      <slot name="actions" />
    </template>
  </DialogLayout>
</template>

<script setup lang="ts">
import DialogLayout from "./DialogLayout";

const emit = defineEmits(["update:model-value", "close"]);
withDefaults(defineProps<{
	disabled?: boolean;
	hideDone?: boolean;
	doneClass?: string | object;
	doneText?: string;
}>(), {
	doneClass: "",
	doneText: "Done"
});

function onClose() {
	emit("update:model-value", false);
	emit("close");
}
</script>
