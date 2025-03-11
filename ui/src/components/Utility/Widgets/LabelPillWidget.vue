<template>
  <div :class="{[colorClass]: true, [sizeClass]: true, 'rounded-full': true}">
    <slot>{{ label }}</slot>
  </div>
</template>
<script setup lang="ts">
import { computed } from "vue";
import { LabelPillWidgetProps } from "../../../types";

const props = withDefaults(defineProps<LabelPillWidgetProps>(), {
	label: "",
	color: "none",
	size: "md"
});

const colorClasses = {
	sky: "bg-sky-950 text-sky-400",
	green: "bg-green-950 text-green-400",
	red: "bg-red-950 text-red-400",
	amber: "bg-amber-950 text-amber-400",
	yellow: "bg-yellow-950 text-yellow-400",
	blue: "bg-blue-950 text-blue-400",
	slate: "bg-slate-950 text-slate-400",
	"slate-mid": "bg-slate-800 text-slate-400",
	gray: "bg-slate-700 text-gray-300",
	none: ""
};

const sizeClasses = {
	xxs: "text-xs px-1 py-.5",
	xs: "text-xs px-2 py-1",
	sm: "text-sm px-3 py-1.5",
	md: "text-base px-3 py-2",
	lg: "text-lg px-4 py-2"
};

const colorClass = computed(() => {
	return colorClasses[props.color];
});
const sizeClass = computed(() => sizeClasses[props.size]);
</script>
