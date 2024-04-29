<template>
  <div class="flex flex-grow flex-col flex-nowrap overflow-hidden h-full">
    <slot name="top" />
    <slot name="toolbar">
      <ActionToolbar
        :refresh-button="refreshButton"
        :actions="actions?.filter(a => a.batch)"
        :action-target="controller.selectedRows.value"
        :exporter="controller.exportList"
        @refresh="controller.refreshAll"
      />
    </slot>
    <div class="flex flex-nowrap flex-grow overflow-hidden w-full">
      <slot name="filter-fields">
        <CollapsableFiltersSidebar
          v-if="activeFilter"
          :name="controller.name"
          :show-filters="showFilters"
          :filters="filters"
          :active-filter="activeFilter"
          @update:active-filter="controller.setActiveFilter"
        />
      </slot>
      <slot>
        <ActionTable
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
import { ActionOptions } from "../../../helpers";
import { PanelsDrawer } from "../../PanelsDrawer";
import { PreviousNextControls } from "../../Utility";
import ActionTable from "../ActionTable";
import { CollapsableFiltersSidebar } from "../Filters";
import { ActionController, ActionPanel, FilterField } from "../listControls";
import { TableColumn } from "../tableColumns";
import { ActionToolbar } from "../Toolbars";

const props = defineProps<{
	refreshButton: boolean,
	showFilters: boolean,
	controller: ActionController,
	columns: TableColumn[],
	filters?: FilterField[],
	panels?: ActionPanel[],
	actions?: ActionOptions[],
	exporter?: () => Promise<void>,
	titleField?: string,
	tableClass?: string
}>();

const activeFilter = computed(() => props.controller.activeFilter.value);
const activeItem = computed(() => props.controller.activeItem.value);
const activePanel = computed(() => props.controller.activePanel.value || "");
const panelTitle = computed(() => {
	if (activeItem.value) {
		return activeItem.value[props.titleField || "title"] || activeItem.value.label || activeItem.value.name;
	}
	return null;
});
</script>
