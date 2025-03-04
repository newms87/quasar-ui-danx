<template>
  <div
    class="dx-collapsable-sidebar overflow-hidden scroll-smooth flex-shrink-0 flex-nowrap transition-all relative"
    :class="{
      'is-collapsed': isCollapsed,
      'is-right-side': rightSide,
      [displayClass]: true,
    }"
    :style="style"
  >
    <div class="flex-grow max-w-full overflow-y-auto overflow-x-hidden">
      <slot :is-collapsed="isCollapsed" />
    </div>
    <template v-if="!disabled && (!hideToggleOnCollapse || !isCollapsed)">
      <div
        v-if="!toggleAtTop"
        class="flex w-full p-4 flex-shrink-0"
        :class="{'justify-start': rightSide, 'justify-end': !rightSide, ...resolveToggleClass}"
      >
        <slot name="toggle">
          <QBtn
            class="btn-secondary"
            @click="toggleCollapse"
          >
            <ToggleIcon :class="{ 'rotate-180': rightSide ? !isCollapsed : isCollapsed, ...resolvedToggleIconClass }" />
          </QBtn>
        </slot>
      </div>
      <div
        v-else
        class="absolute top-0 right-0 cursor-pointer p-2"
        :class="resolveToggleClass"
        @click="toggleCollapse"
      >
        <ToggleIcon :class="{ 'rotate-180': rightSide ? !isCollapsed : isCollapsed, ...resolvedToggleIconClass }" />
      </div>
    </template>
  </div>
</template>
<script setup lang="ts">
import { ChevronLeftIcon as ToggleIcon } from "@heroicons/vue/outline";
import { computed, onMounted, ref, watch } from "vue";
import { getItem, setItem } from "../../../helpers";
import { AnyObject } from "../../../types";

const emit = defineEmits(["collapse", "update:collapse"]);
const props = withDefaults(defineProps<{
	displayClass?: string;
	toggleClass?: string | AnyObject;
	toggleIconClass?: string | AnyObject;
	rightSide?: boolean;
	maxWidth?: string;
	minWidth?: string;
	disabled?: boolean;
	collapse?: boolean;
	name?: string;
	toggleAtTop?: boolean;
	hideToggleOnCollapse?: boolean;
}>(), {
	displayClass: "flex flex-col",
	maxWidth: "13.5rem",
	minWidth: "5.5rem",
	name: "sidebar",
	toggleClass: "",
	toggleIconClass: "w-5 transition-all"
});

const isCollapsed = ref(getItem(props.name + "-is-collapsed", props.collapse));

function setCollapse(state) {
	isCollapsed.value = state;
	setItem(props.name + "-is-collapsed", !!isCollapsed.value);
}

function toggleCollapse() {
	setCollapse(!isCollapsed.value);
	emit("collapse", isCollapsed.value);
	emit("update:collapse", isCollapsed.value);
}

onMounted(() => {
	emit("collapse", isCollapsed.value);
	emit("update:collapse", isCollapsed.value);
});
const style = computed(() => {
	return {
		width: isCollapsed.value ? props.minWidth : props.maxWidth
	};
});

const resolveToggleClass = computed(() => typeof props.toggleClass === "string" ? { [props.toggleClass]: true } : props.toggleClass);
const resolvedToggleIconClass = computed(() => typeof props.toggleIconClass === "string" ? { [props.toggleIconClass]: true } : props.toggleIconClass);
watch(() => props.collapse, () => {
	setCollapse(props.collapse);
});
</script>
