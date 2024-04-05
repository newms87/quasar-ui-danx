<template>
  <div class="flex flex-grow flex-col flex-nowrap overflow-hidden h-full bg-white">
    <slot name="top" />
    <slot name="toolbar" />
    <div class="flex flex-nowrap flex-grow overflow-hidden w-full">
      <slot name="filters" />
      <slot />
    </div>
    <ActionPerformerTool
        v-if="activeAction"
        :targets="actionTargets"
        :action="activeAction"
        @done="clearAction"
    />
  </div>
</template>
<script setup>
import { actionTargets, activeAction, clearAction } from '../../../helpers';
import { ActionPerformerTool } from '../../Utility';
</script>
