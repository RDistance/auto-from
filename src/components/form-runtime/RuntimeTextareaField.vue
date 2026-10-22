<script setup lang="ts">
import type { FormField } from '@/stores/formBuilder'
defineProps<{ field: FormField; modelValue: unknown }>()
defineEmits<{ 'update:modelValue': [value: string]; blur: [] }>()
</script>

<template>
  <textarea
    :id="field.id"
    :value="String(modelValue ?? '')"
    :placeholder="field.placeholder"
    :disabled="field.disabled"
    :aria-required="field.required"
    rows="4"
    @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    @blur="$emit('blur')"
  ></textarea>
</template>
