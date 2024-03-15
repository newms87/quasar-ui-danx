<template>
  <PageLayout title="Action Table Demo">
    <ActionTable
      :columns="columns"
      label="Demo"
      v-model:quasar-pagination="quasarPagination"
      v-model:selected-rows="selectedRows"
      :paged-items="pagedItems"
    />
  </PageLayout>
</template>
<script setup>
import { ActionTable } from 'ui';
import { columns, pagedItems, quasarPagination, selectedRows } from '../components/DemoActionTable/demoTableActions';
import PageLayout from '../layouts/PageLayout';
</script>
