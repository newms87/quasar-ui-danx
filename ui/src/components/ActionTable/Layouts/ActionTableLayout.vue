<template>
  <div class="flex flex-grow flex-col flex-nowrap overflow-hidden h-full">
    <slot name="top" />
    <slot name="toolbar">
      <ActionToolbar
        :title="title"
        :refresh-button="refreshButton"
        :actions="actions?.filter(a => a.batch)"
        :action-target="controller.selectedRows.value"
        :exporter="controller.exportList"
        :loading="controller.isLoadingList.value || controller.isLoadingSummary.value"
        @refresh="controller.refreshAll"
      >
        <template #default>
          <slot name="action-toolbar" />
        </template>
      </ActionToolbar>
    </slot>
    <div class="flex flex-nowrap flex-grow overflow-hidden w-full">
      <slot name="filters">
        <CollapsableFiltersSidebar
          v-if="activeFilter"
          :name="controller.name"
          :show-filters="showFilters"
          :filters="filters"
          :active-filter="activeFilter"
          class="dx-action-table-filters"
          @update:active-filter="controller.setActiveFilter"
        />
      </slot>
      <slot>
        <ActionTable
          class="flex-grow"
          :pagination="controller.pagination.value"
          :selected-rows="controller.selectedRows.value"
          :label="controller.label"
          :name="controller.name"
          :class="tableClass"
          :summary="controller.summary.value"
          :loading-list="controller.isLoadingList.value"
          :loading-summary="controller.isLoadingSummary.value"
          :paged-items="controller.pagedItems.value"
          :columns="columns"
          @update:selected-rows="controller.setSelectedRows"
          @update:pagination="controller.setPagination"
        />
      </slot>
      <slot name="panels">
        <PanelsDrawer
          v-if="activeItem && panels"
          :title="panelTitle"
          :model-value="activePanel"
          :active-item="activeItem"
          :panels="panels"
          @update:model-value="panel => controller.activatePanel(activeItem, panel)"
          @close="controller.setActiveItem(null)"
        >
          <template #controls>
            <PreviousNextControls
              :is-loading="controller.isLoadingList.value"
              @next="controller.getNextItem"
            />
          </template>
        </PanelsDrawer>
      </slot>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from "vue";
import { ActionController, ActionOptions, ActionPanel, FilterGroup, TableColumn } from "../../../types";
import { PanelsDrawer } from "../../PanelsDrawer";
import { PreviousNextControls } from "../../Utility";
import ActionTable from "../ActionTable";
import { CollapsableFiltersSidebar } from "../Filters";
import { ActionToolbar } from "../Toolbars";

const props = defineProps<{
	title?: string;
	refreshButton: boolean;
	showFilters: boolean;
	controller: ActionController;
	columns: TableColumn[];
	filters?: FilterGroup[];
	panels?: ActionPanel[];
	actions?: ActionOptions[];
	exporter?: () => Promise<void>;
	panelTitleField?: string;
	tableClass?: string;
}>();

const activeFilter = computed(() => props.controller.activeFilter.value);
const activeItem = computed(() => props.controller.activeItem.value);
const activePanel = computed(() => props.controller.activePanel.value || "");
const panelTitle = computed(() => {
	if (activeItem.value) {
		return activeItem.value[props.panelTitleField || "title"] || activeItem.value.label || activeItem.value.name || (props.title + " " + activeItem.value.id);
	}
	return null;
});
</script>
