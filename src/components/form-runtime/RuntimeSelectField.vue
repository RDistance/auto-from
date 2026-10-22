<script setup lang="ts">
import type { FormField } from '@/stores/formBuilder'
defineProps<{ field: FormField; modelValue: unknown }>()
defineEmits<{ 'update:modelValue': [value: string]; blur: [] }>()
</script>

<template>
  <select
    :id="field.id"
    :value="String(modelValue ?? '')"
    :disabled="field.disabled"
    :aria-required="field.required"
    @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    @blur="$emit('blur')"
  >
    <option value="" disabled>{{ field.placeholder || '请选择' }}</option>
    <option v-for="option in field.options" :key="option" :value="option">{{ option }}</option>
  </select>
</template>
