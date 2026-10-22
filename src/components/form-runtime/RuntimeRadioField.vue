<script setup lang="ts">
import type { FormField } from '@/stores/formBuilder'
defineProps<{ field: FormField; modelValue: unknown }>()
defineEmits<{ 'update:modelValue': [value: string]; blur: [] }>()
</script>

<template>
  <div class="runtime-radio-list">
    <label v-for="option in field.options" :key="option">
      <input
        type="radio"
        :name="field.name"
        :value="option"
        :checked="modelValue === option"
        :disabled="field.disabled"
        :aria-required="field.required"
        @change="$emit('update:modelValue', option)"
        @blur="$emit('blur')"
      />
      <span>{{ option }}</span>
    </label>
  </div>
</template>
