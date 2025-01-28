<template>
  <div class="no-input-field pb-4">
    <div class="font-bold mb-2">
      {{ field.label }}
    </div>
    <!-- eslint-disable vue/no-v-html -->
    <div
      class="html-content"
      v-html="content || field.description"
    />
    <!--eslint-enable-->
  </div>
</template>

<script setup lang="ts">
defineProps({
	field: {
		type: Object,
		required: true
	},
	content: {
		type: String,
		default: null
	}
});
</script>
<style scoped lang="scss">
:deep(.text-editor-renderer) {
	font-size: 16px;

	ul {
		list-style: disc;

		ul {
			padding-left: 1em;
		}

		& > li > ul {
			list-style: circle;

			& > li > ul {
				list-style: square;
			}
		}
	}

	ol {
		ol {
			padding-left: 1em;
		}

		& > li > ol {
			list-style: upper-roman;

			& > li > ol {
				list-style: lower-roman;
			}
		}
	}

	li {
		list-style-position: inside;
	}
}
</style>
