<template>
  <div
      class="flex items-center w-full"
      :class="{'cursor-not-allowed': locked}"
  >
    <a v-if="locked" class="text-zinc-800 cursor-not-allowed">
      <LockedIcon class="w-4" />
    </a>
    <div class="font-semibold text-sm ml-5 py-3 flex-grow">{{ column.label }}</div>
    <div v-if="!locked" class="flex items-center">
      <a class="py-2 px-1" @click="$emit('visible', !visible)">
        <VisibleIcon v-if="visible" class="w-4" />
        <HiddenIcon v-else class="w-4 text-zinc-800" />
      </a>
      <a class="py-2 px-1" @click="$emit('is-title', !isTitle)">
        <IsTitleIcon class="w-4" :class="isTitle ? '' : 'text-gray-400'" />
        <QTooltip>
          <template v-if="!isTitle">Add to priority list</template>
          <template v-else>Remove from priority list</template>
        </QTooltip>
      </a>
    </div>
  </div>
</template>
<script setup>
import { EyeIcon as VisibleIcon, EyeOffIcon as HiddenIcon, LockClosedIcon as LockedIcon } from "@heroicons/vue/outline";
import { StarIcon as IsTitleIcon } from "@heroicons/vue/solid";

defineEmits(["visible", "is-title"]);
defineProps({
  locked: Boolean,
  visible: Boolean,
  isTitle: Boolean,
  column: {
    type: Object,
    required: true
  }
});
</script>
