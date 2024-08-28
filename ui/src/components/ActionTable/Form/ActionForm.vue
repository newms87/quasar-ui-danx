<template>
  <div>
    <RenderedForm
      v-bind="renderedFormProps"
      v-model:values="input"
      empty-value=""
      :saved-at="hideSavedAt ? undefined : target.updated_at"
      :saving="action.isApplying"
      @update:values="onUpdate"
    >
      <slot />
    </RenderedForm>
  </div>
</template>
<script setup lang="ts">
import { Ref, ref, watch } from "vue";
import { ActionTargetItem, AnyObject, Form, ResourceAction } from "../../../types";
import RenderedForm from "./RenderedForm.vue";

interface ActionFormProps {
	action: ResourceAction;
	target: ActionTargetItem;
	form: Form;
	noLabel?: boolean;
	showName?: boolean;
	disable?: boolean;
	readonly?: boolean;
	clearable?: boolean;
	fieldClass?: string;
	savingClass?: string;
	hideSavedAt?: boolean;
}

const emit = defineEmits(["saved"]);
const props = withDefaults(defineProps<ActionFormProps>(), {
	fieldClass: "",
	savingClass: undefined
});
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

const input: Ref<AnyObject> = ref({ ...props.target });
const fieldStatus: AnyObject = {};

// Only update field values from target changes when the field is not already being saved
watch(() => props.target, (target: ActionTargetItem) => {
	if (!target) return;

	for (let field of props.form.fields) {
		if (!fieldStatus[field.name]?.isSaving) {
			input.value[field.name] = target[field.name];
		}
	}
});

async function onUpdate() {
	await props.action.trigger(props.target, input.value);
	emit("saved");
}
</script>
