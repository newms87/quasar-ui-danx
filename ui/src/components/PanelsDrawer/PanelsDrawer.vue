<template>
  <ContentDrawer
    position="right"
    :show="true"
    overlay
    content-class="h-full"
    class="dx-panels-drawer"
    title=""
    @update:show="$emit('close')"
  >
    <div class="flex flex-col flex-nowrap h-full">
      <div class="dx-panels-drawer-header flex items-center px-6 py-4">
        <div class="flex-grow">
          <slot name="header">
            <h2>{{ title }}</h2>
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
        <div class="flex items-stretch flex-nowrap h-full">
          <PanelsDrawerTabs
            v-model="activePanel"
            :class="tabsClass"
            :panels="panels"
            @update:model-value="$emit('update:model-value', $event)"
          />
          <PanelsDrawerPanels
            :panels="panels"
            :active-panel="activePanel"
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
import { computed, ref, watch } from "vue";
import { XIcon as CloseIcon } from "../../svg";
import { ActionPanel } from "../../types";
import { ContentDrawer } from "../Utility";
import PanelsDrawerPanels from "./PanelsDrawerPanels";
import PanelsDrawerTabs from "./PanelsDrawerTabs";

export interface Props {
	title?: string,
	modelValue?: string | number,
	tabsClass?: string | object,
	panelsClass?: string | object,
	panels: ActionPanel[]
}

defineEmits(["update:model-value", "close"]);
const props = withDefaults(defineProps<Props>(), {
	title: "",
	modelValue: null,
	tabsClass: "w-[13.5rem]",
	panelsClass: "w-[35.5rem]"
});

const activePanel = ref(props.modelValue);
const activePanelOptions = computed(() => props.panels.find((panel) => panel.name === activePanel.value));
watch(() => props.modelValue, (value) => activePanel.value = value);
</script>
