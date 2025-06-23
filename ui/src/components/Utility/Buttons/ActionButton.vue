<template>
  <QBtn
    :loading="isSaving"
    class="shadow-none py-0"
    :class="buttonClass"
    :disable="disabled"
    @click="()=> onAction()"
  >
    <div class="flex items-center flex-nowrap">
      <component
        :is="icon || typeOptions.icon"
        class="transition-all"
        :class="resolvedIconClass"
      />
      <div
        v-if="label || label === 0"
        class="ml-2"
        :class="labelClass"
      >
        {{ label }}
      </div>
      <slot />
    </div>
    <QTooltip
      v-if="tooltip"
      class="whitespace-nowrap"
      :class="tooltipClass"
    >
      <slot name="tooltip">
        {{ tooltip }}
      </slot>
    </QTooltip>
    <QMenu
      v-if="isConfirming"
      :model-value="true"
    >
      <div class="p-4 bg-slate-600">
        <div>{{ confirmText }}</div>
        <div class="flex items-center flex-nowrap mt-2">
          <div class="flex-grow">
            <ActionButton
              type="cancel"
              color="gray"
              @click="isConfirming = false"
            />
          </div>
          <ActionButton
            type="confirm"
            color="green"
            @click="()=> onAction(true)"
          />
        </div>
      </div>
    </QMenu>
  </QBtn>
</template>
<script setup lang="ts">
import {
	FaSolidArrowRotateRight as RestartIcon,
	FaSolidArrowsRotate as RefreshIcon,
	FaSolidCircleCheck as ConfirmIcon,
	FaSolidCircleXmark as CancelIcon,
	FaSolidCodeMerge as MergeIcon,
	FaSolidCopy as CopyIcon,
	FaSolidFileExport as ExportIcon,
	FaSolidFileImport as ImportIcon,
	FaSolidFolder as FolderIcon,
	FaSolidMinus as MinusIcon,
	FaSolidPause as PauseIcon,
	FaSolidPencil as EditIcon,
	FaSolidPlay as PlayIcon,
	FaSolidPlus as CreateIcon,
	FaSolidStop as StopIcon,
	FaSolidTrash as TrashIcon
} from "danx-icon";
import { computed, ref } from "vue";
import { ActionTarget, ResourceAction } from "../../../types";

export interface ActionButtonProps {
	type?: "trash" | "create" | "edit" | "copy" | "folder" | "play" | "stop" | "pause" | "refresh" | "restart" | "confirm" | "cancel" | "export" | "import" | "minus" | "merge";
	color?: "red" | "blue" | "blue-invert" | "sky" | "sky-invert" | "green" | "green-invert" | "lime" | "white" | "gray" | "yellow" | "orange";
	size?: "xxs" | "xs" | "sm" | "md" | "lg";
	icon?: object | string;
	iconClass?: string;
	label?: string | number;
	labelClass?: string;
	tooltip?: string;
	saving?: boolean;
	action?: ResourceAction;
	target?: ActionTarget;
	input?: object;
	disabled?: boolean;
	disabledClass?: string;
	confirm?: boolean;
	confirmText?: string;
	tooltipClass?: string;
}

const emit = defineEmits(["success", "error", "always"]);
const props = withDefaults(defineProps<ActionButtonProps>(), {
	type: null,
	color: null,
	icon: null,
	iconClass: "",
	size: "md",
	label: "",
	labelClass: "",
	tooltip: "",
	action: null,
	target: null,
	input: null,
	confirmText: "Are you sure?",
	disabledClass: "text-slate-800 bg-slate-500 opacity-50",
	tooltipClass: ""
});

const mappedSizeClass = {
	xxs: {
		icon: "w-2",
		button: "px-.5 h-5"
	},
	xs: {
		icon: "w-3",
		button: "px-1.5 h-6"
	},
	sm: {
		icon: "w-4",
		button: "px-2 h-8"
	},
	md: {
		icon: "w-5",
		button: "px-2.5 h-10"
	},
	lg: {
		icon: "w-6",
		button: "px-3 h-12"
	}
};

const buttonClass = computed(() => {
	return {
		[props.disabled ? props.disabledClass : colorClass.value]: true,
		[mappedSizeClass[props.size].button]: true
	};
});

const colorClass = computed(() => {
	switch (props.color) {
		case "red":
			return "text-red-900 bg-red-300 hover:bg-red-400";
		case "lime":
			return "text-lime-900 bg-lime-300 hover:bg-lime-400";
		case "green":
			return "text-green-900 bg-green-300 hover:bg-green-400";
		case "green-invert":
			return "text-green-300 bg-green-900 hover:bg-green-800";
		case "blue":
			return "text-blue-900 bg-blue-300 hover:bg-blue-400";
		case "blue-invert":
			return "text-blue-300 bg-blue-900 hover:bg-blue-800";
		case "sky":
			return "text-sky-900 bg-sky-300 hover:bg-sky-400";
		case "sky-invert":
			return "text-sky-400 bg-sky-800 hover:bg-sky-900";
		case "white":
			return "text-white bg-gray-800 hover:bg-gray-200";
		case "yellow":
			return "text-yellow-300 bg-yellow-800 hover:bg-yellow-700";
		case "orange":
			return "text-orange-400 bg-orange-900 hover:bg-orange-800";
		case "gray":
			return "text-slate-200 bg-slate-800 hover:bg-slate-900";
		default:
			return "";
	}
});

const resolvedIconClass = computed(() => props.iconClass + " " + mappedSizeClass[props.size].icon);

const typeOptions = computed(() => {
	switch (props.type) {
		case "trash":
			return { icon: TrashIcon };
		case "export":
			return { icon: ExportIcon };
		case "import":
			return { icon: ImportIcon };
		case "create":
			return { icon: CreateIcon };
		case "confirm":
			return { icon: ConfirmIcon };
		case "cancel":
			return { icon: CancelIcon };
		case "edit":
			return { icon: EditIcon };
		case "copy":
			return { icon: CopyIcon };
		case "folder":
			return { icon: FolderIcon };
		case "play":
			return { icon: PlayIcon };
		case "stop":
			return { icon: StopIcon };
		case "pause":
			return { icon: PauseIcon };
		case "restart":
			return { icon: RestartIcon };
		case "refresh":
			return { icon: RefreshIcon };
		case "minus":
			return { icon: MinusIcon };
		case "merge":
			return { icon: MergeIcon };
		default:
			return { icon: EditIcon };
	}
});

const isSaving = computed(() => {
	if (props.saving) return true;
	if (props.action) {
		return props.action.isApplying;
	}
	if (props.target) {
		if (Array.isArray(props.target)) {
			return props.target.some((t) => t.isSaving);
		}
		return props.target.isSaving;
	}
	return false;
});

const isConfirming = ref(false);
function onAction(isConfirmed = false) {
	if (props.disabled) return;

	// Make sure this action is confirmed if the confirm prop is set
	if (props.confirm && !isConfirmed) {
		isConfirming.value = true;
		return false;
	}
	isConfirming.value = false;
	if (props.action) {
		props.action.trigger(props.target, props.input).then(async (response) => {
			emit("success", typeof response.json === "function" ? await response.json() : response);
		}).catch((e) => {
			console.error(`Action emitted an error: ${props.action.name}`, e, props.target);
			emit("error", e);
		}).finally(() => {
			emit("always");
		});
	} else {
		emit("always");
	}
}
</script>
