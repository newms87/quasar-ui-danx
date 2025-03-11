<template>
  <div class="group flex items-center flex-nowrap gap-x-1 relative">
    <QInnerLoading
      v-if="loading"
      showing
      class="bg-sky-900 opacity-50 z-10 rounded"
      color="teal"
    />
    <ShowHideButton
      v-if="selectable"
      v-model="isSelecting"
      :disable="disable"
      :label="selectText"
      :class="selectClass"
      :show-icon="selectIcon || DefaultSelectIcon"
      class="mr-2"
    >
      <QMenu
        :model-value="isSelecting"
        @before-hide="isSelecting = false"
        @hide="isSelecting = false"
      >
        <div>
          <div
            v-for="option in options"
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
              @click.stop.prevent="$emit('delete', option)"
            />
          </div>
          <template v-if="creatable">
            <QSeparator class="bg-slate-400 my-2" />
            <div class="px-4 mb-2">
              <QBtn
                :class="createClass"
                :loading="loading"
                @click="$emit('create')"
              >
                <CreateIcon
                  class="w-3"
                  :class="createText ? 'mr-2' : ''"
                />
                {{ createText }}
              </QBtn>
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
      class="opacity-0 group-hover:opacity-100 transition-all"
      :show-icon="EditIcon"
      :hide-icon="DoneEditingIcon"
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
	FaSolidPencil as EditIcon,
	FaSolidPlus as CreateIcon
} from "danx-icon";
import { ref } from "vue";
import { ActionTargetItem } from "../../../../types";
import { ShowHideButton } from "../../../Utility/Buttons";
import ActionButton from "../../../Utility/Buttons/ActionButton";
import EditableDiv from "./EditableDiv";

defineEmits(["create", "update", "delete"]);
const selected = defineModel<ActionTargetItem | null>("selected");
const editing = defineModel<boolean>("editing");
withDefaults(defineProps<{
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
	disable?: boolean;
}>(), {
	selectText: "",
	createText: "",
	editText: "",
	clearText: "",
	placeholder: "(No selection)",
	selectClass: "bg-sky-800",
	createClass: "bg-green-900",
	editClass: "",
	clearClass: "rounded-full",
	labelClass: "text-slate-600",
	selectIcon: null
});

const isSelecting = ref(false);
</script>
