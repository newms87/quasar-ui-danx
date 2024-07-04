<template>
  <a
    class="p-3 dx-popover-menu"
    :class="{'opacity-50 cursor-not-allowed': disabled}"
  >
    <QTooltip v-if="$slots.tooltip || tooltip">
      <slot name="tooltip">{{ tooltip }}</slot>
    </QTooltip>
    <Transition
      mode="out-in"
      :duration="150"
    >
      <RenderComponent
        v-if="loading"
        :component="loadingComponent"
      />
      <MenuIcon
        v-else
        class="w-4 dx-menu-icon"
      />
    </Transition>
    <QMenu
      v-if="!disabled"
      auto-close
    >
      <QList>
        <template
          v-for="item in items"
          :key="item.name"
        >
          <a
            v-if="item.url"
            class="q-item"
            target="_blank"
            :href="item.url"
            :class="item.class"
          >
            <Component
              :is="item.icon"
              v-if="item.icon"
              :class="item.iconClass"
              class="mr-3 w-4"
            /> {{ item.label }}
          </a>
          <QItem
            v-else
            clickable
            :class="item.class"
            @click="onAction(item)"
          >
            <Component
              :is="item.icon"
              v-if="item.icon"
              :class="item.iconClass"
              class="mr-3 w-4"
            /> {{ item.label }}
          </QItem>
        </template>
      </QList>
    </QMenu>
  </a>
</template>
<script setup lang="ts">
import { DotsVerticalIcon as MenuIcon } from "@heroicons/vue/outline";
import { QSpinner } from "quasar";
import { ResourceAction } from "../../../types";
import { RenderComponent } from "../Tools";

export interface PopoverMenuProps {
	items: ResourceAction;
	tooltip?: string;
	disabled?: boolean;
	loading?: boolean;
	loadingComponent?: any;
}

const emit = defineEmits(["action", "action-item"]);
withDefaults(defineProps<PopoverMenuProps>(), {
	tooltip: null,
	loadingComponent: () => ({
		is: QSpinner,
		props: { class: "w-4 h-4" }
	})
});

function onAction(item) {
	emit("action", item.name || item.action);
	emit("action-item", item);
}
</script>
