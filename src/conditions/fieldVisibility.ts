import type { FormField } from '@/stores/formBuilder'

export type FormValues = Record<string, unknown>

function matchesCondition(field: FormField, sourceValue: unknown) {
  const { operator, value } = field.visibility
  const actual = String(sourceValue ?? '')

  switch (operator) {
    case 'equals':
      return actual === value
    case 'not_equals':
      return actual !== value
    case 'contains':
      return actual.includes(value)
    case 'empty':
      return sourceValue === undefined || sourceValue === null || actual.trim() === ''
    case 'not_empty':
      return sourceValue !== undefined && sourceValue !== null && actual.trim() !== ''
    case 'checked':
      return sourceValue === true
    case 'unchecked':
      return sourceValue !== true
  }
}

export function isFieldVisible(
  field: FormField,
  fields: FormField[],
  values: FormValues,
  evaluating = new Set<string>(),
): boolean {
  const condition = field.visibility
  if (!condition.enabled || !condition.sourceFieldId) return true

  // 循环依赖属于无效配置，保持字段可见，避免整个条件链消失。
  if (evaluating.has(field.id)) return true

  const sourceField = fields.find((item) => item.id === condition.sourceFieldId)
  if (!sourceField || sourceField.id === field.id) return true

  const nextEvaluating = new Set(evaluating).add(field.id)
  if (!isFieldVisible(sourceField, fields, values, nextEvaluating)) return false

  return matchesCondition(field, values[sourceField.name])
}
