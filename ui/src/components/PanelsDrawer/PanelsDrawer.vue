<template>
  <ContentDrawer
    :position="position"
    show
    overlay
    content-class="h-full"
    class="dx-panels-drawer"
    title=""
    no-route-dismiss
    @update:show="$emit('close')"
  >
    <div class="flex flex-col flex-nowrap h-full">
      <div class="dx-panels-drawer-header flex items-center px-6 py-4">
        <div class="flex-grow">
          <slot name="header">
            <h2 v-if="title">
              {{ title }}
            </h2>
            <div v-if="!activeItem">
              Loading
              <QSpinnerHourglass />
            </div>
          </slot>
        </div>
        <div
          v-if="$slots.controls"
          class="mr-4"
        >
          <slot name="controls" />
        </div>
        <div>
          <QBtn
            class="dx-close-button"
            @click="$emit('close')"
          >
            <CloseIcon class="w-4" />
          </QBtn>
        </div>
      </div>
      <div class="dx-panels-drawer-body flex-grow overflow-hidden h-full">
        <div
          v-if="activeItem.__timestamp > 0"
          class="flex items-stretch flex-nowrap h-full"
        >
          <PanelsDrawerTabs
            :key="'pd-tabs:' + activeItem.id"
            v-model="activePanel"
            :active-item="activeItem"
            :class="tabsClass"
            :panels="panels"
            @update:model-value="$emit('update:model-value', $event)"
          />
          <PanelsDrawerPanels
            :key="'pd-panels:' + activeItem.id"
            :panels="panels"
            :active-panel="activePanel"
            :active-item="activeItem"
            :class="activePanelOptions?.class || panelsClass"
          />
          <div
            v-if="$slots['right-sidebar']"
            class="border-l overflow-y-auto"
          >
            <slot name="right-sidebar" />
          </div>
        </div>
      </div>
    </div>
  </ContentDrawer>
</template>
<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { XIcon as CloseIcon } from "../../svg";
import { ActionPanel, ActionTargetItem } from "../../types";
import { ContentDrawer } from "../Utility";
import PanelsDrawerPanels from "./PanelsDrawerPanels";
import PanelsDrawerTabs from "./PanelsDrawerTabs";

export interface Props {
	title?: string,
	modelValue?: string | number,
	activeItem: ActionTargetItem;
	tabsClass?: string | object,
	panelsClass?: string | object,
	position?: "standard" | "right" | "left";
	panels: ActionPanel[]
}

defineEmits(["update:model-value", "close"]);
const props = withDefaults(defineProps<Props>(), {
	title: "",
	modelValue: null,
	tabsClass: "w-[13.5rem] flex-shrink-0",
	panelsClass: "w-[80rem]",
	position: "right"
});

const activePanel = ref(props.modelValue);
const activePanelOptions = computed(() => props.panels.find((panel) => panel.name === activePanel.value));
watch(() => props.modelValue, (value) => activePanel.value = value);

onMounted(() => {
	// Resolve the default panel if a panel has not been selected
	if (!activePanel.value && props.panels.length) {
		activePanel.value = props.panels[0].name;
	}
});
</script>
