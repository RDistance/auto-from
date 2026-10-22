<script setup lang="ts">
import type { FormField } from '@/stores/formBuilder'
defineProps<{ field: FormField; modelValue: unknown }>()
defineEmits<{ 'update:modelValue': [value: boolean]; blur: [] }>()
</script>

<template>
  <label class="runtime-check">
    <input
      :id="field.id"
      type="checkbox"
      :checked="modelValue === true"
      :disabled="field.disabled"
      :aria-required="field.required"
      @change="$emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
      @blur="$emit('blur')"
    />
    <span>{{ field.placeholder || field.label }}</span>
  </label>
</template>
