<template>
  <ActionButton
    :icon="isShowing ? (hideIcon || DefaultHideIcon) : (showIcon || DefaultShowIcon)"
    :label="(isShowing ? hideLabel : showLabel) || label"
    :label-class="labelClass"
    @click="onToggle"
  >
    <slot />
    <template #tooltip>
      <slot name="tooltip" />
    </template>
  </ActionButton>
</template>
<script lang="ts" setup>
import { FaSolidEye as DefaultShowIcon, FaSolidEyeSlash as DefaultHideIcon } from "danx-icon";
import { nextTick } from "vue";
import { getItem, setItem } from "../../../helpers";
import ActionButton from "./ActionButton";

export interface Props {
	name?: string;
	showLabel?: string;
	hideLabel?: string;
	showIcon?: object | string;
	hideIcon?: object | string;
	labelClass?: string;
	label?: string | number;
}

const emit = defineEmits<{ show: void, hide: void }>();
const isShowing = defineModel<boolean>();
const props = withDefaults(defineProps<Props>(), {
	name: "",
	showLabel: "",
	hideLabel: "",
	showIcon: null,
	hideIcon: null,
	labelClass: "ml-2",
	label: ""
});

const SETTINGS_KEY = "show-hide-button";
const settings = getItem(SETTINGS_KEY, {});

if (props.name) {
	if (settings[props.name] !== undefined) {
		isShowing.value = settings[props.name];
	}
}

function onToggle() {
	isShowing.value = !isShowing.value;

	// NOTE: use nextTick to ensure the value is updated before saving (if the parent does not pass a value for modelValue, this can cause a desync)
	nextTick(() => {
		if (isShowing.value) {
			emit("show");
		} else {
			emit("hide");
		}

		if (props.name) {
			settings[props.name] = isShowing.value;
			setItem(SETTINGS_KEY, { ...getItem(SETTINGS_KEY, {}), [props.name]: isShowing.value });
		}
	});
}

</script>
