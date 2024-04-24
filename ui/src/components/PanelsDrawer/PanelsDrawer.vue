<template>
  <ContentDrawer
    position="right"
    :show="true"
    overlay
    content-class="h-full"
    title=""
    @update:show="$emit('close')"
  >
    <div class="flex flex-col flex-nowrap h-full">
      <div class="flex items-center px-6 py-4 border-b">
        <div class="flex-grow">
          <slot name="header" />
        </div>

        <div>
          <QBtn @click="$emit('close')">
            <CloseIcon class="w-4" />
          </QBtn>
        </div>
      </div>
      <div class="flex-grow overflow-hidden h-full">
        <div class="flex items-stretch flex-nowrap h-full">
          <div class="border-r w-[13.5rem] overflow-y-auto">
            <PanelsDrawerTabs
              v-model="activePanel"
              :panels="panels"
              @update:model-value="$emit('update:model-value', $event)"
            />
          </div>
          <PanelsDrawerPanels
            :panels="panels"
            :active-panel="activePanel"
            :class="panelsClass"
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
<script setup>
import { ref, watch } from "vue";
import { XIcon as CloseIcon } from "../../svg";
import { ContentDrawer } from "../Utility";
import PanelsDrawerPanels from "./PanelsDrawerPanels";
import PanelsDrawerTabs from "./PanelsDrawerTabs";

defineEmits(["update:model-value", "close"]);
const props = defineProps({
  modelValue: {
    type: String,
    default: null
  },
  panelsClass: {
    type: [Object, String],
    default: "w-[35.5rem]"
  },
  panels: {
    type: Array,
    required: true
  }
});

const activePanel = ref(props.modelValue);
watch(() => props.modelValue, (value) => activePanel.value = value);
</script>
