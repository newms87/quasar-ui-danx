<template>
  <div class="dx-action-toolbar flex items-center">
    <div class="flex-grow px-6">
      <slot name="title">
        <h2 v-if="title">
          {{ title }}
        </h2>
      </slot>
    </div>
    <div class="py-3 px-6 flex items-center flex-nowrap">
      <slot />
      <RefreshButton
        v-if="refreshButton"
        :loading="loading"
        @click="$emit('refresh')"
      />
      <ExportButton
        v-if="exporter"
        :exporter="exporter"
        class="ml-4"
      />
      <ActionMenu
        v-if="actions && actions.length > 0"
        class="ml-4 dx-batch-actions"
        :target="actionTarget"
        :actions="actions"
      />
      <slot name="after" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { ActionOptions, ActionTargetItem, AnyObject } from "../../../types";
import { ExportButton, RefreshButton } from "../../Utility";
import ActionMenu from "../ActionMenu";

defineEmits(["refresh"]);
defineProps<{
	title?: string,
	actions?: ActionOptions[],
	actionTarget?: ActionTargetItem[],
	refreshButton?: boolean,
	loading?: boolean,
	exporter?: (filter?: AnyObject) => void | Promise<void>
}>();
</script>
