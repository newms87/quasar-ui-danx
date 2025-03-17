<template>
  <div class="flex items-stretch flex-nowrap gap-x-4">
    <QBtn
      :class="createClass"
      :loading="loading"
      @click="$emit('create')"
    >
      <CreateIcon
        class="w-4"
        :class="createText ? 'mr-2' : ''"
      />
      {{ createText }}
    </QBtn>
    <ShowHideButton
      v-if="showEdit"
      v-model="editing"
      :disabled="!canEdit"
      :label="editText"
      :class="editClass"
      :show-icon="EditIcon"
    />
    <SelectField
      v-model="selected"
      class="flex-grow"
      :options="options"
      :clearable="clearable"
      :select-by-object="selectByObject"
      :option-label="optionLabel"
    />
  </div>
</template>
<script setup lang="ts">
import { FaSolidPencil as EditIcon, FaSolidPlus as CreateIcon } from "danx-icon";
import { QSelectOption } from "quasar";
import { ActionTargetItem } from "../../../../types";
import { ShowHideButton } from "../../../Utility/Buttons";
import SelectField from "./SelectField";

defineEmits(["create"]);
const selected = defineModel<string | number | object | null>("selected");
const editing = defineModel<boolean>("editing");
withDefaults(defineProps<{
	options: QSelectOption[] | ActionTargetItem[];
	showEdit?: boolean;
	canEdit?: boolean;
	loading?: boolean;
	selectByObject?: boolean;
	optionLabel?: string;
	createText?: string;
	editText?: string;
	createClass?: string;
	editClass?: string;
	clearable?: boolean;
}>(), {
	optionLabel: "label",
	createText: "",
	editText: "",
	createClass: "bg-green-900 px-4",
	editClass: "bg-sky-800 px-4"
});
</script>
