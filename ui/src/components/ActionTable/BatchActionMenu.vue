<template>
  <div>
    <PopoverMenu
        class="bg-neutral-plus-6 px-4 h-full flex"
        :items="items"
        :disabled="selectedRows.length === 0"
        @action="onAction"
    />
    <q-tooltip v-if="selectedRows.length === 0">
      Batch actions require a selection
    </q-tooltip>
    <slot>
      <Component
          :is="activeComponent.is"
          v-if="activeComponent"
          v-bind="activeComponent.props"
          :is-saving="isSaving"
          @close="activeAction = false"
          @confirm="onConfirmAction"
      />
    </slot>
  </div>
</template>
<script setup>
import { computed, ref } from 'vue';
import PopoverMenu from '../../components/Utility/Popover/PopoverMenu';

const emit = defineEmits(['action']);
const props = defineProps({
  items: {
    type: Array,
    required: true
  },
  selectedRows: {
    type: Array,
    required: true
  },
  applyBatchAction: {
    type: Function,
    required: true
  },
  isSaving: Boolean
});


const activeAction = ref(null);
const activeComponent = computed(() => (props.items.find(i => i.action === activeAction.value)?.component || (() => null))(props.selectedRows));

function onAction(action) {
  activeAction.value = action;
  emit('action', action);
}
async function onConfirmAction(input) {
  const result = await props.applyBatchAction(input || activeComponent.value.input());

  if (result?.success) {
    activeAction.value = null;
  }
}
</script>
