import type { Component } from "vue";

export { default as BadgeTab } from "./BadgeTab.vue";
export { default as IndicatorTab } from "./IndicatorTab.vue";
export { default as TabButtonGroup } from "./TabButtonGroup.vue";

export interface TabButton {
	value: string;
	icon: Component;
	label: string;
	count?: number;
	activeColor: string;
}
