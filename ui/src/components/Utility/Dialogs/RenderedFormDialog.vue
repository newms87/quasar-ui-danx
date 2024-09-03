<template>
  <ConfirmDialog
    :title="title"
    :confirm-text="confirmText || title"
    :content-class="contentClass"
    @confirm="$emit('confirm', input)"
    @close="$emit('close')"
  >
    <RenderedForm
      v-bind="renderedFormProps"
      v-model:values="input"
      empty-value=""
    >
      <slot />
    </RenderedForm>
  </ConfirmDialog>
</template>
<script setup lang="ts">
import { ref } from "vue";
import { Form } from "../../../types";
import { RenderedForm } from "../../ActionTable/Form";
import ConfirmDialog from "./ConfirmDialog";

defineEmits(["confirm", "close"]);
const props = defineProps<{
	title: string;
	confirmText?: string;
	form: Form;
	noLabel?: boolean;
	showName?: boolean;
	disable?: boolean;
	readonly?: boolean;
	clearable?: boolean;
	fieldClass?: string;
	savingClass?: string;
	hideSavedAt?: boolean;
	contentClass?: string;
}>();
const input = ref({});

const renderedFormProps = {
	form: props.form,
	noLabel: props.noLabel,
	showName: props.showName,
	disable: props.disable,
	readonly: props.readonly,
	clearable: props.clearable,
	fieldClass: props.fieldClass,
	savingClass: props.savingClass
};
</script>
