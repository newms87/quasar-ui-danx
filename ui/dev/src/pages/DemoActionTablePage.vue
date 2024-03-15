<template>
  <PageLayout title="Action Table Demo">
    <div class="flex items-start flex-nowrap">
      <div>
        <FilterGroupList :filter-groups="filterGroups" v-model:filter="filter" />
      </div>
      <ActionTable
        class="w-full"
        :columns="columns"
        label="Demo"
        v-model:quasar-pagination="quasarPagination"
        v-model:selected-rows="selectedRows"
        :paged-items="pagedItems"
      />
    </div>
  </PageLayout>
</template>
<script setup>
import { ActionTable, FilterGroupList } from 'ui';
import {
  columns,
  filter,
  filterGroups,
  pagedItems,
  quasarPagination,
  selectedRows
} from '../components/DemoActionTable/demoTableActions';
import PageLayout from '../layouts/PageLayout';
</script>
