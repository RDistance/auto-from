<script setup lang="ts">
import { computed, type Component } from 'vue'
import { Field as VeeField } from 'vee-validate'
import type { FieldType, FormField } from '@/stores/formBuilder'
import { createFieldValidator } from '@/validation/formValidation'
import RuntimeInputField from './RuntimeInputField.vue'
import RuntimeTextareaField from './RuntimeTextareaField.vue'
import RuntimeSelectField from './RuntimeSelectField.vue'
import RuntimeCheckboxField from './RuntimeCheckboxField.vue'
import RuntimeRadioField from './RuntimeRadioField.vue'
import RuntimeRichTextField from './RuntimeRichTextField.vue'
import RuntimeDividerField from './RuntimeDividerField.vue'

const props = defineProps<{ field: FormField }>()

const fieldRegistry: Record<FieldType, Component> = {
  text: RuntimeInputField,
  number: RuntimeInputField,
  date: RuntimeInputField,
  textarea: RuntimeTextareaField,
  richtext: RuntimeRichTextField,
  select: RuntimeSelectField,
  checkbox: RuntimeCheckboxField,
  radio: RuntimeRadioField,
  divider: RuntimeDividerField,
}

const runtimeComponent = computed(() => fieldRegistry[props.field.type])
const validator = computed(() => createFieldValidator(props.field))
</script>

<template>
  <component :is="runtimeComponent" v-if="field.type === 'divider'" :field="field" />

  <VeeField
    v-else
    v-slot="{ value, errorMessage, handleChange, handleBlur }"
    :name="field.name"
    :rules="validator"
    :validate-on-input="field.type === 'richtext'"
  >
    <div class="runtime-field" :class="{ 'has-error': errorMessage }">
      <label class="runtime-label" :for="field.id">
        {{ field.label }}<em v-if="field.required">*</em>
      </label>

      <component
        :is="runtimeComponent"
        :field="field"
        :model-value="value"
        @update:model-value="handleChange"
        @blur="handleBlur"
      />

      <small v-if="errorMessage" class="runtime-error">{{ errorMessage }}</small>
      <small v-else-if="field.helpText">{{ field.helpText }}</small>
    </div>
  </VeeField>
</template>
