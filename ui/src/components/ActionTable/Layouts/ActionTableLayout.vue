<template>
  <div class="flex flex-grow flex-col flex-nowrap overflow-hidden h-full">
    <slot name="top" />
    <slot name="toolbar">
      <ActionToolbar
        :refresh-button="refreshButton"
        :actions="batchActions"
        :action-target="selectedRows"
        :exporter="exporter"
        @refresh="$emit('refresh')"
      />
    </slot>
    <div class="flex flex-nowrap flex-grow overflow-hidden w-full">
      <slot name="filter-fields">
        <CollapsableFiltersSidebar
          v-if="filter"
          :name="name"
          :show-filters="showFilters"
          :filter-fields="filterFields"
          :filter="filter"
          @update:filter="$emit('update:filter', $event)"
        />
      </slot>
      <slot>
        <ActionTable
          :pagination="pagination"
          :selected-rows="selectedRows"
          :label="label"
          :name="name"
          :class="tableClass"
          :summary="summary"
          :loading-list="loadingList"
          :loading-summary="loadingSummary"
          :paged-items="pagedItems"
          :columns="columns"
          @update:selected-rows="$emit('update:selected-rows', $event)"
          @update:pagination="$emit('update:pagination', $event)"
        />
      </slot>
      <slot name="panels">
        <PanelsDrawer
          v-if="activeItem && panels"
          :model-value="activePanel"
          :panels="panels"
          @update:model-value="$emit('update:active-panel', $event)"
          @close="$emit('update:active-item', null)"
        />
      </slot>
    </div>
  </div>
</template>
<script setup>
import { PanelsDrawer } from "../../PanelsDrawer";
import ActionTable from "../ActionTable";
import { CollapsableFiltersSidebar } from "../Filters";
import { ActionToolbar } from "../Toolbars";

defineEmits(["refresh", "update:filter", "update:active-item", "update:active-panel", "update:selected-rows", "update:pagination"]);
defineProps({
  refreshButton: Boolean,
  showFilters: Boolean,
  loadingList: Boolean,
  loadingSummary: Boolean,
  name: {
    type: String,
    required: true
  },
  label: {
    type: String,
    required: true
  },
  columns: {
    type: Array,
    required: true
  },
  summary: {
    type: Object,
    default: null
  },
  pagedItems: {
    type: Object,
    default: null
  },
  activeItem: {
    type: Object,
    default: null
  },
  activePanel: {
    type: String,
    default: null
  },
  filter: {
    type: Object,
    default: null
  },
  filterFields: {
    type: Array,
    default: null
  },
  panels: {
    type: Array,
    default: null
  },
  batchActions: {
    type: Array,
    default: null
  },
  selectedRows: {
    type: Array,
    default: null
  },
  pagination: {
    type: Object,
    default: null
  },
  exporter: {
    type: Function,
    default: null
  },
  tableClass: {
    type: String,
    default: null
  }
});
</script>
