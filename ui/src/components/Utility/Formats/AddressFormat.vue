<template>
  <div class="address-format">
    <div v-if="address.attn" class="address-attn">Attn: {{ address.attn }}</div>
    <div v-else-if="address.name" class="address-name">{{ address.name }}</div>
    <template v-if="address.line1">
      <div class="address-line-1">
        {{ address.line1 }}
      </div>
      <div v-if="address.line2" class="address-line-2">
        {{ address.line2 }}
      </div>
      <div v-if="address.line3" class="address-line-3">
        {{ address.line3 }}
      </div>
      <div class="address-city-state-zip">
        <template v-if="address.city">{{ address.city }},</template>
        {{ address.state }} {{ address.zip_code }}
      </div>
    </template>
  </div>
</template>
<script setup>
defineProps({
  address: {
    type: Object,
    required: true
  }
});
</script>
