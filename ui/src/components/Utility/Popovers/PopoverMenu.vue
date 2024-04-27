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
        <template v-for="item in items">
          <a
            v-if="item.url"
            :key="item.url"
            class="q-item"
            target="_blank"
            :href="item.url"
            :class="item.class"
          >
            {{ item.label }}
          </a>
          <QItem
            v-else
            :key="item.name || item.action"
            clickable
            :class="item.class"
            @click="onAction(item)"
          >
            {{ item.label }}
          </QItem>
        </template>
      </QList>
    </QMenu>
  </a>
</template>
<script setup>
import { DotsVerticalIcon as MenuIcon } from "@heroicons/vue/outline";
import { QSpinner } from "quasar";
import { RenderComponent } from "../Tools";

const emit = defineEmits(["action", "action-item"]);
defineProps({
  items: {
    type: Array,
    required: true,
    validator(items) {
      return items.every((item) => item.url || item.action || item.name);
    }
  },
  tooltip: {
    type: String,
    default: null
  },
  disabled: Boolean,
  loading: Boolean,
  loadingComponent: {
    type: [Function, Object],
    default: () => ({
      is: QSpinner,
      props: { class: "w-4 h-4" }
    })
  }
});

function onAction(item) {
  emit("action", item.name || item.action);
  emit("action-item", item);
}
</script>
