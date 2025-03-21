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
    <div
      class="flex flex-col flex-nowrap h-full dx-panels-drawer-content"
      :class="drawerClass"
    >
      <div class="dx-panels-drawer-header flex items-center px-6 py-4">
        <div class="flex-grow">
          <slot name="header">
            <h2 v-if="title">
              {{ title }}
            </h2>
            <div v-if="!target">
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
          v-if="target.__timestamp > 0"
          class="flex items-stretch flex-nowrap h-full"
        >
          <PanelsDrawerTabs
            v-if="!hideTabs"
            :key="'pd-tabs:' + target.id"
            v-model="activePanel"
            :target="target"
            :class="tabsClass"
            :panels="panels"
            @update:model-value="$emit('update:model-value', $event)"
          />

          <QTabPanels
            :key="'pd-panels:' + target.id"
            :model-value="activePanel"
            :class="activePanelOptions?.class || panelsClass"
            class="dx-panels-drawer-panels overflow-y-auto h-full transition-all"
          >
            <slot
              name="panels"
              :active-panel="activePanel"
            >
              <QTabPanel
                v-for="panel in panels"
                :key="panel.name"
                :name="panel.name"
              >
                <RenderVnode
                  v-if="panel.vnode"
                  :vnode="panel.vnode"
                  :props="target"
                />
              </QTabPanel>
            </slot>
          </QTabPanels>

          <div
            v-if="$slots['right-sidebar']"
            class="border-l overflow-y-auto"
          >
            <slot name="right-sidebar" />
          </div>
        </div>
        <div
          v-else
          class="p-8"
        >
          <QSkeleton class="h-96" />
        </div>
      </div>
    </div>
  </ContentDrawer>
</template>
<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { XIcon as CloseIcon } from "../../svg";
import { ActionPanel, ActionTargetItem } from "../../types";
import { ContentDrawer, RenderVnode } from "../Utility";
import PanelsDrawerTabs from "./PanelsDrawerTabs";

export interface PanelsDrawerProps {
	title?: string,
	modelValue?: string | number,
	target: ActionTargetItem;
	tabsClass?: string | object,
	panelsClass?: string | object,
	drawerClass?: string | object,
	position?: "standard" | "right" | "left";
	panels: ActionPanel[];
	hideTabs?: boolean;
}

defineEmits(["update:model-value", "close"]);
const props = withDefaults(defineProps<PanelsDrawerProps>(), {
	title: "",
	modelValue: null,
	tabsClass: "w-[13.5rem] flex-shrink-0",
	panelsClass: "w-full",
	drawerClass: "",
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
