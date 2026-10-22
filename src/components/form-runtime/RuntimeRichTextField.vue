<script setup lang="ts">
import type { FormField } from '@/stores/formBuilder'
import RichTextInput from '@/components/RichTextInput.vue'
defineProps<{ field: FormField; modelValue: unknown }>()
defineEmits<{ 'update:modelValue': [value: string]; blur: [] }>()
</script>

<template>
  <RichTextInput
    :model-value="String(modelValue ?? '')"
    :placeholder="field.placeholder"
    :disabled="field.disabled"
    @update:model-value="$emit('update:modelValue', $event)"
  />
</template>
