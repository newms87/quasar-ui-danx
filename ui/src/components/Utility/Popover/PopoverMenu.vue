<template>
  <a
    class="p-3 actionable"
    :class="{'opacity-50 cursor-not-allowed': disabled}"
  >
    <Transition
      mode="out-in"
      :duration="150"
    >
      <QSpinner
        v-if="loading"
        class="w-4 h-4 text-black"
      />
      <MenuIcon
        v-else
        class="w-4 text-black"
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
            :key="item.action"
            clickable
            :class="item.class"
            @click="$emit('action', item.action)"
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

defineEmits(["action"]);
defineProps({
  items: {
    type: Array,
    required: true,
    validator(items) {
      return items.every((item) => item.label && (item.url || item.action));
    },
  },
  disabled: Boolean,
  loading: Boolean
});
</script>
