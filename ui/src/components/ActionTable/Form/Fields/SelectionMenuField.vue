<template>
  <div class="group flex items-center flex-nowrap gap-x-1 relative">
    <ShowHideButton
      v-if="selectable"
      v-model="isSelecting"
      :disabled="disabled"
      :label="selectText"
      :saving="loading"
      :class="selectClass"
      :show-icon="selectIcon || DefaultSelectIcon"
      class="mr-2"
      :size="size"
    >
      <QMenu
        :model-value="isSelecting"
        @before-hide="isSelecting = false"
        @hide="isSelecting = false"
      >
        <div>
          <div
            v-for="option in optionsPlusSelected"
            :key="option.id"
            v-ripple
            class="cursor-pointer flex items-center relative"
            :class="{'bg-sky-900 hover:bg-sky-800': selected?.id === option.id, 'hover:bg-slate-600': selected?.id !== option.id}"
            @click="selected = option"
          >
            <div class="flex-grow px-4 py-2">
              {{ option.name }}
            </div>
            <ActionButton
              v-if="deletable"
              type="trash"
              class="ml-4 mr-2"
              :size="size"
              @click.stop.prevent="$emit('delete', option)"
            />
          </div>
          <template v-if="creatable">
            <QSeparator class="bg-slate-400 my-2" />
            <div class="px-4 mb-2">
              <ActionButton
                type="create"
                color="green"
                :class="createClass"
                :label="createText"
                :saving="loading"
                :size="size"
                @click="$emit('create')"
              />
            </div>
          </template>
        </div>
      </QMenu>
    </ShowHideButton>

    <div :class="labelClass">
      <template v-if="selected">
        <EditableDiv
          v-if="nameEditable"
          :model-value="selected.name"
          color="slate-600"
          @update:model-value="name => $emit('update', {name})"
        />
        <template v-else>
          {{ selected.name }}
        </template>
      </template>
      <template v-else>
        <slot name="no-selection">
          {{ placeholder }}
        </slot>
      </template>
    </div>

    <ShowHideButton
      v-if="editable && selected"
      v-model="editing"
      :label="editText"
      :class="editClass"
      :size="size"
      :disabled="editDisabled"
      class="opacity-0 group-hover:opacity-100 transition-all"
      :show-icon="EditIcon"
      :hide-icon="DoneEditingIcon"
      :tooltip="editDisabled ? 'You are not allowed to edit' : ''"
    />

    <QBtn
      v-if="clearable && selected"
      :label="clearText"
      :class="clearClass"
      class="opacity-0 group-hover:opacity-100 transition-all"
      @click="selected = null"
    >
      <ClearIcon class="w-4" />
    </QBtn>
  </div>
</template>
<script setup lang="ts">
import {
	FaSolidCheck as DoneEditingIcon,
	FaSolidCircleXmark as ClearIcon,
	FaSolidListCheck as DefaultSelectIcon,
	FaSolidPencil as EditIcon
} from "danx-icon";
import { computed, ref } from "vue";
import { ActionTargetItem } from "../../../../types";
import { ShowHideButton } from "../../../Utility/Buttons";
import { ActionButtonProps, default as ActionButton } from "../../../Utility/Buttons/ActionButton";
import EditableDiv from "./EditableDiv";

defineEmits(["create", "update", "delete"]);
const selected = defineModel<ActionTargetItem | null>("selected");
const editing = defineModel<boolean>("editing");
const props = withDefaults(defineProps<{
	options: ActionTargetItem[];
	showEdit?: boolean;
	loading?: boolean;
	selectText?: string;
	createText?: string;
	editText?: string;
	clearText?: string;
	placeholder?: string;
	selectClass?: string;
	createClass?: string;
	editClass?: string;
	clearClass?: string;
	labelClass?: string;
	selectIcon?: object | string;
	selectable?: boolean;
	creatable?: boolean;
	editable?: boolean;
	deletable?: boolean;
	nameEditable?: boolean;
	clearable?: boolean;
	disabled?: boolean;
	editDisabled?: boolean;
	size?: ActionButtonProps["size"];
}>(), {
	selectText: "",
	createText: "",
	editText: "",
	clearText: "",
	placeholder: "(No selection)",
	selectClass: "bg-sky-800",
	createClass: "",
	editClass: "",
	clearClass: "rounded-full",
	labelClass: "text-slate-600",
	selectIcon: null,
	size: "md"
});

const isSelecting = ref(false);

// If the selected option is not in the options list, it should be added in
const optionsPlusSelected = computed(() => {
	if (!selected.value || props.options.find((o) => o.id === selected.value?.id)) return props.options;
	return [selected.value, ...props.options];
});
</script>
