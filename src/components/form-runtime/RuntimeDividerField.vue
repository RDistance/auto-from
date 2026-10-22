<script setup lang="ts">
import type { FormField } from '@/stores/formBuilder'
defineOptions({ inheritAttrs: false })
defineProps<{ field: FormField }>()
</script>

<template>
  <div class="runtime-divider"><span></span><strong>{{ field.label }}</strong><span></span></div>
</template>
