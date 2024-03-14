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
        <CollapsableSidebar />
        <router-view />
      </div>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { CollapsableSidebar, version } from 'ui';
</script>
