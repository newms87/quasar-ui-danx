<template>
  <div class="flex items-stretch flex-nowrap gap-x-4">
    <QBtn
      class="bg-green-900 px-4"
      :loading="loading"
      @click="$emit('create')"
    >
      <CreateIcon class="w-4 mr-2" />
      {{ createText }}
    </QBtn>
    <SelectField
      v-model="selected"
      class="flex-grow"
      :options="options"
      :clearable="clearable"
      :select-by-object="selectByObject"
      :option-label="optionLabel"
    />
    <ShowHideButton
      v-if="showEdit"
      v-model="editing"
      :disable="!canEdit"
      :label="editText"
      class="bg-sky-800 w-1/5"
    />
  </div>
</template>
<script setup lang="ts">
import { FaSolidPlus as CreateIcon } from "danx-icon";
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
	clearable?: boolean;
}>(), {
	optionLabel: "label",
	createText: "Create",
	editText: "Edit"
});
</script>
