<template>
  <div
    :class="{
      [cls['collapsable-sidebar']]: true,
      'is-collapsed': isCollapsed,
      'is-right-side': rightSide,
      [displayClass]: true,
    }"
    :style="style"
  >
    <div class="flex-grow max-w-full">
      <slot :is-collapsed="isCollapsed" />
    </div>
    <template v-if="!disabled && (!hideToggleOnCollapse || !isCollapsed)">
      <div
        v-if="!toggleAtTop"
        class="flex w-full p-4"
        :class="rightSide ? 'justify-start' : 'justify-end'"
      >
        <slot name="toggle">
          <QBtn
            class="btn-secondary"
            @click="toggleCollapse"
          >
            <ToggleIcon
              class="w-5 transition-all"
              :class="{ 'rotate-180': rightSide ? !isCollapsed : isCollapsed }"
            />
          </QBtn>
        </slot>
      </div>
      <div
        v-else
        class="absolute top-0 right-0 cursor-pointer p-2"
        :class="toggleClass"
        @click="toggleCollapse"
      >
        <ToggleIcon
          class="w-5 transition-all"
          :class="{ 'rotate-180': rightSide ? !isCollapsed : isCollapsed }"
        />
      </div>
    </template>
  </div>
</template>
<script setup>
import { ChevronLeftIcon as ToggleIcon } from "@heroicons/vue/outline";
import { computed, onMounted, ref, watch } from "vue";
import { getItem, setItem } from "../../../helpers";

const emit = defineEmits(["collapse", "update:collapse"]);
const props = defineProps({
  rightSide: Boolean,
  displayClass: {
    type: String,
    default: "flex flex-col"
  },
  maxWidth: {
    type: String,
    default: "13.5rem"
  },
  minWidth: {
    type: String,
    default: "5.5rem"
  },
  disabled: Boolean,
  collapse: Boolean,
  name: {
    type: String,
    default: "sidebar"
  },
  toggleAtTop: Boolean,
  toggleClass: {
    type: String,
    default: ""
  },
  hideToggleOnCollapse: Boolean
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

watch(() => props.collapse, () => {
  setCollapse(props.collapse);
});
</script>

<style module="cls" lang="scss">
.collapsable-sidebar {
  @apply overflow-y-auto overflow-x-hidden scroll-smooth flex-shrink-0 border-r border-gray-200 transition-all relative;
}
</style>
