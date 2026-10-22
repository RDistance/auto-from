<script setup lang="ts">
import type { FormField } from '@/stores/formBuilder'
defineProps<{ field: FormField; modelValue: unknown }>()
defineEmits<{ 'update:modelValue': [value: string]; blur: [] }>()
</script>

<template>
  <input
    :id="field.id"
    :value="modelValue ?? ''"
    :type="field.type"
    :placeholder="field.placeholder"
    :disabled="field.disabled"
    :aria-required="field.required"
    @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    @blur="$emit('blur')"
  />
</template>
