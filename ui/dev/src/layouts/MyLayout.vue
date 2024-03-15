<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          to="/"
          icon="home"
        />

        <q-toolbar-title>
          quasar-ui-danx v{{ version }}
        </q-toolbar-title>

        <div>Quasar v{{ $q.version }}</div>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <div class="flex">
        <CollapsableSidebar>
          <NavigationMenu :items="menu" />
        </CollapsableSidebar>
        <router-view />
      </div>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import NavigationMenu from '@/components/NavigationMenu';
import { PdfIcon } from '@ui/svg';
import { CollapsableSidebar, version } from 'ui';
import { shallowRef } from 'vue';

const menu = shallowRef([
  {
    label: 'List Item Draggable',
    icon: PdfIcon,
    path: 'demo-list-item-draggable'
  },
  {
    label: 'Action Table',
    icon: PdfIcon,
    path: 'demo-action-table'
  }
]);
</script>
