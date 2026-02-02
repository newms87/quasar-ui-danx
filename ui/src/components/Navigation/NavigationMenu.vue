<template>
  <div
    class="p-4"
    :class="{ 'is-collapsed': collapsed }"
  >
    <div
      v-for="item in allowedItems"
      :key="'nav-item-' + item.label"
      class="nav-menu-item-box"
    >
      <a
        class="nav-menu-item flex flex-nowrap"
        :href="resolveUrl(item)"
        :class="item.class || itemClass"
        :target="item.target || '_self'"
        @click="onClick($event, item)"
      >
        <div
          v-if="item.icon"
          class="flex-shrink-0"
        >
          <component
            :is="item.icon"
            class="nav-icon"
            :class="item.iconClass"
          />
        </div>
        <div
          v-if="!collapsed"
          class="label ml-2"
          :class="item.labelClass"
        >
          {{ item.label }}
        </div>
        <QTooltip
          v-if="collapsed"
          v-bind="item.tooltip"
        >
          {{ item.tooltip?.text || item.label }}
        </QTooltip>
      </a>
      <QSeparator
        v-if="item.separator"
        :key="'separator-' + item.label"
        class="my-2"
      />
    </div>
  </div>
</template>
<script setup>
import { computed } from "vue";
import { danxOptions } from "../../config";

const props = defineProps({
	collapsed: Boolean,
	itemClass: {
		type: String,
		default: "hover:bg-gray-200"
	},
	activeClass: {
		type: String,
		default: "bg-blue-200"
	},
	items: {
		type: Array,
		required: true
	}
});

const router = danxOptions.value.router;
const allowedItems = computed(() => props.items.filter((item) => !item.hidden));

function getItemRoute(item) {
	if (!router) {
		console.error("Router is not available. Configure in danx options.");
		return;
	}

	return typeof item.route === "function" ? item.route() : item.route;
}

function onClick(e, item) {
	if (!item.url && !e.ctrlKey) {
		e.preventDefault();
	}

	if (item.disabled || e.ctrlKey) {
		return;
	}

	if (item.onClick) {
		item.onClick();
	}

	if (item.route) {
		router.push(getItemRoute(item));
	}
}

function resolveUrl(item) {
	if (item.url) {
		return item.url;
	}

	if (item.route) {
		return router.resolve(getItemRoute(item))?.href || "#";
	}

	return "#";
}
</script>

<style lang="scss">
.nav-menu-item {
	padding: 1em;
	border-radius: 0.5em;
	font-weight: bold;
	font-size: 14px;
	transition: all 150ms, color 0ms;
	cursor: pointer;

	&.is-disabled {
		background: inherit;
	}

	.label {
		transition-property: all; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms;
	}

	.nav-icon {
		width: 1.25rem; height: 1.25rem; flex-shrink: 0;
	}
}

.is-collapsed {
	.nav-link {
		width: 3.8em;
	}

	.label {
		opacity: 0;
	}
}
</style>
