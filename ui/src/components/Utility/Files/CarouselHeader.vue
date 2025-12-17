<template>
  <div
    class="text-base text-center py-3 px-16 bg-slate-800 opacity-90 text-slate-300 hover:opacity-100 transition-all flex-shrink-0"
  >
    <div class="flex items-center justify-center gap-3">
      <!-- Back to Parent Button -->
      <QBtn
        v-if="showBackButton"
        flat
        dense
        class="bg-slate-700 text-slate-300 hover:bg-slate-600"
        @click="$emit('back')"
      >
        <div class="flex items-center flex-nowrap gap-1">
          <ArrowLeftIcon class="w-4" />
          <span class="text-sm">Back to Parent</span>
        </div>
      </QBtn>

      <!-- Filename -->
      <div class="flex-grow">
        {{ filename }}
      </div>

      <!-- Metadata Button -->
      <QBtn
        v-if="showMetadataButton"
        flat
        dense
        class="bg-purple-700 text-purple-200 hover:bg-purple-600"
        @click="$emit('metadata')"
      >
        <div class="flex items-center flex-nowrap gap-1">
          <MetaIcon class="w-4" />
          <QBadge
            class="bg-purple-900 text-purple-200"
            :label="metadataCount"
          />
          <span class="text-sm ml-1">Metadata</span>
        </div>
      </QBtn>

      <!-- Transcodes Button -->
      <QBtn
        v-if="showTranscodesButton"
        flat
        dense
        class="bg-purple-700 text-purple-200 hover:bg-purple-600"
        @click="$emit('transcodes')"
      >
        <div class="flex items-center flex-nowrap gap-1">
          <FilmIcon class="w-4" />
          <QBadge
            class="bg-purple-900 text-purple-200"
            :label="transcodesCount"
          />
          <span class="text-sm ml-1">Transcodes</span>
        </div>
      </QBtn>

      <!-- Close Button (optional) -->
      <QBtn
        v-if="showCloseButton"
        flat
        dense
        icon
        class="text-slate-300 hover:text-white"
        @click="$emit('close')"
      >
        <CloseIcon class="w-5" />
      </QBtn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeftIcon, FilmIcon } from "@heroicons/vue/outline";
import { FaSolidBarcode as MetaIcon } from "danx-icon";
import { XIcon as CloseIcon } from "../../../svg";

withDefaults(defineProps<{
	filename: string;
	showBackButton?: boolean;
	showMetadataButton?: boolean;
	metadataCount?: number;
	showTranscodesButton?: boolean;
	transcodesCount?: number;
	showCloseButton?: boolean;
}>(), {
	showBackButton: false,
	showMetadataButton: false,
	metadataCount: 0,
	showTranscodesButton: false,
	transcodesCount: 0,
	showCloseButton: false
});

defineEmits<{
	'back': [];
	'metadata': [];
	'transcodes': [];
	'close': [];
}>();
</script>
