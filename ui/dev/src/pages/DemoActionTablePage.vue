<template>
  <PageLayout title="Action Table Demo">
    <div class="flex items-start flex-nowrap">
      <div>
        <FilterFieldList :filter-fields="filterFields" v-model:filter="filter" />
      </div>
      <ActionTable
        class="w-full"
        :columns="columns"
        label="Demo"
        v-model:quasar-pagination="quasarPagination"
        v-model:selected-rows="selectedRows"
        :paged-items="pagedItems"
        :summary="summary"
      />
    </div>
  </PageLayout>
</template>
<script setup>
import { columns } from '@/components/DemoActionTable/demoTableColumns';
import { filterFields } from '@/components/DemoActionTable/demoTableFilterFields';
import { ActionTable, FilterFieldList } from 'ui';
import {
  filter,
  pagedItems,
  quasarPagination,
  selectedRows,
  summary
} from '../components/DemoActionTable/demoTableActions';
import PageLayout from '../layouts/PageLayout';
</script>
