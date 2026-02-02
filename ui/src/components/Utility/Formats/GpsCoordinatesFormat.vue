<template>
  <div class="flex flex-nowrap items-center">
    <LocationIcon
      class="mr-1 -ml-[0.2em]"
      :class="iconClass"
    />
    <div
      v-if="location?.latitude"
      class="whitespace-nowrap"
    >
      {{ location.latitude.toFixed(decimals) }},
      {{ location.longitude.toFixed(decimals) }}
    </div>
    <template v-else>
      Unknown
    </template>
  </div>
</template>
<script setup>
import { LocationMarkerIcon as LocationIcon } from "@heroicons/vue/solid";

defineProps({
  location: {
    type: Object,
    default: null
  },
  decimals: {
    type: Number,
    default: 6
  },
  iconClass: {
    type: String,
    default: "w-7"
  }
});
</script>
