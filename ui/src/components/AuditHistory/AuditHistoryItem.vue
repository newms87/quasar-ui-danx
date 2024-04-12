<template>
  <div class="text-gray-shadow flex items-stretch flex-nowrap p-4">
    <div class="flex-grow text-sm w-3/5 overflow-auto">
      <h5>{{ change.label }} ({{ change.name }})</h5>
      <div class="flex flex-nowrap items-center mt-4">
        <div class="bg-red-light line-through p-2">
          <AuditHistoryItemValue
              :type="change.type"
              :value="change.oldValue"
          />
        </div>
        <div class="bg-green-plus-4 ml-2.5 p-2">
          <AuditHistoryItemValue
              :type="change.type"
              :value="change.newValue"
          />
        </div>
      </div>
    </div>
    <div class="ml-4 text-sm w-2/5">
      <template v-if="item.user">
        <div>{{ item.user.name }}</div>
        <div>{{ item.user.email }}</div>
      </template>
      <div>{{ item.account }}</div>
      <div>
        <a v-if="item.audit_request_id" :href="novaUrl" target="_blank">{{ fLocalizedDateTime(item.timestamp) }}</a>
        <template v-else>{{ fLocalizedDateTime(item.timestamp) }}</template>
      </div>
    </div>
  </div>
</template>
<script setup>
import { computed } from "vue";
import { fLocalizedDateTime } from "../../helpers";
import AuditHistoryItemValue from "./AuditHistoryItemValue";

const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  change: {
    type: Object,
    required: true
  },
  novaUrl: {
    type: String,
    default: "/nova"
  }
});

const novaUrl = computed(() => props.novaUrl + `/resources/audit-requests/${props.item.audit_request_id}`);
</script>
