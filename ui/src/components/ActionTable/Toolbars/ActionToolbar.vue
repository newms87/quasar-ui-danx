<template>
  <div class="dx-action-toolbar flex items-center">
    <div class="flex-grow px-6">
      <slot name="title">
        <h4 v-if="title">
          {{ title }}
        </h4>
      </slot>
    </div>
    <div class="py-3 flex items-center flex-nowrap">
      <slot />
      <QBtn
        v-if="createButton"
        class="bg-green-900 mr-4 px-4"
        @click="$emit('create')"
      >
        Create
      </QBtn>
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
import { ActionTargetItem, AnyObject, ResourceAction } from "../../../types";
import { ExportButton, RefreshButton } from "../../Utility";
import ActionMenu from "../ActionMenu";

defineEmits(["refresh", "create"]);
defineProps<{
	title?: string;
	actions?: ResourceAction[];
	actionTarget?: ActionTargetItem[];
	createButton?: boolean;
	refreshButton?: boolean;
	loading?: boolean;
	exporter?: (filter?: AnyObject) => void | Promise<void>;
}>();
</script>
