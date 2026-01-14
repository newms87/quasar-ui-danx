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
	// Dark theme colors (dark backgrounds with bright text)
	sky: "bg-sky-950 text-sky-400",
	green: "bg-green-950 text-green-400",
	red: "bg-red-950 text-red-400",
	amber: "bg-amber-950 text-amber-400",
	yellow: "bg-yellow-950 text-yellow-400",
	blue: "bg-blue-950 text-blue-400",
	purple: "bg-purple-950 text-purple-400",
	slate: "bg-slate-950 text-slate-400",
	"slate-mid": "bg-slate-800 text-slate-400",
	gray: "bg-slate-700 text-gray-300",
	emerald: "bg-emerald-950 text-emerald-400",
	orange: "bg-orange-950 text-orange-400",
	lime: "bg-lime-950 text-lime-400",
	teal: "bg-teal-950 text-teal-400",
	cyan: "bg-cyan-950 text-cyan-400",
	rose: "bg-rose-950 text-rose-400",
	indigo: "bg-indigo-950 text-indigo-400",
	violet: "bg-violet-950 text-violet-400",
	fuchsia: "bg-fuchsia-950 text-fuchsia-400",
	// Soft/light theme colors (light backgrounds with darker text)
	"sky-soft": "bg-sky-100 text-sky-700",
	"green-soft": "bg-green-100 text-green-700",
	"red-soft": "bg-red-100 text-red-700",
	"amber-soft": "bg-amber-100 text-amber-700",
	"yellow-soft": "bg-yellow-100 text-yellow-700",
	"blue-soft": "bg-blue-100 text-blue-700",
	"purple-soft": "bg-purple-100 text-purple-700",
	"slate-soft": "bg-slate-100 text-slate-600",
	"gray-soft": "bg-gray-100 text-gray-600",
	"emerald-soft": "bg-emerald-100 text-emerald-700",
	"orange-soft": "bg-orange-100 text-orange-700",
	"lime-soft": "bg-lime-100 text-lime-700",
	"teal-soft": "bg-teal-100 text-teal-700",
	"cyan-soft": "bg-cyan-100 text-cyan-700",
	"rose-soft": "bg-rose-100 text-rose-700",
	"indigo-soft": "bg-indigo-100 text-indigo-700",
	"violet-soft": "bg-violet-100 text-violet-700",
	"fuchsia-soft": "bg-fuchsia-100 text-fuchsia-700",
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
