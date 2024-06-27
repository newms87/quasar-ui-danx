<template>
  <div
    class="danx-edit-on-click-text-field flex flex-nowrap items-center rounded overflow-ellipsis"
    :class="{[props.class]: true, 'is-readonly': readonly, 'cursor-pointer': !isEditing && !readonly}"
    @click="onEdit"
  >
    <div
      ref="editableBox"
      :contenteditable="!readonly && isEditing"
      class="flex-grow p-2 rounded outline-none border-none"
      :class="{[editingClass]: isEditing, [inputClass]: true}"
      @input="text = $event.target.innerText"
    >
      {{ text }}
    </div>
    <div v-if="!readonly">
      <QBtn
        v-if="isEditing"
        @click.stop="isEditing = false"
      >
        <DoneIcon class="w-4" />
      </QBtn>
      <QBtn
        v-else
        class="edit-icon"
      >
        <EditIcon class="w-4" />
      </QBtn>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { FaSolidCheck as DoneIcon, FaSolidPencil as EditIcon } from "danx-icon";
import { nextTick, ref } from "vue";

export interface EditOnClickTextFieldProps {
	class?: string;
	editingClass?: string;
	inputClass?: string;
	readonly?: boolean;
}

const editableBox = ref<HTMLElement | null>(null);
const text = defineModel({ type: String });
const props = withDefaults(defineProps<EditOnClickTextFieldProps>(), {
	class: "hover:bg-slate-300",
	editingClass: "bg-slate-500",
	inputClass: "whitespace-normal"
});
const isEditing = ref(false);
function onEdit() {
	if (props.readonly) return;
	isEditing.value = true;
	nextTick(() => {
		editableBox.value?.focus();
	});
}

</script>

<style lang="scss" scoped>
.danx-edit-on-click-text-field {
	@apply transition-all;

	.edit-icon {
		@apply opacity-0 transition-all;

	}

	&:hover {
		.edit-icon {
			@apply opacity-100;
		}
	}
}
</style>
