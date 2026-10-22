import type { FormField } from '@/stores/formBuilder'

function richTextToPlainText(value: string) {
  return value.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()
}

function isEmpty(value: unknown, field: FormField) {
  if (field.type === 'checkbox') return value !== true
  if (field.type === 'richtext') return richTextToPlainText(String(value ?? '')).length === 0
  return value === undefined || value === null || String(value).trim() === ''
}

export function createFieldValidator(field: FormField) {
  return (value: unknown): true | string => {
    if (field.disabled || field.type === 'divider') return true

    const empty = isEmpty(value, field)
    if (field.required && empty) {
      return field.validation.requiredMessage || `请填写${field.label}`
    }
    if (empty) return true

    const text = field.type === 'richtext'
      ? richTextToPlainText(String(value))
      : String(value).trim()
    const rule = field.validation

    if (rule.format === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) {
      return '请输入有效的邮箱地址'
    }
    if (rule.format === 'phone' && !/^1[3-9]\d{9}$/.test(text)) {
      return '请输入有效的手机号码'
    }
    if (rule.minLength !== null && text.length < rule.minLength) {
      return `${field.label}不能少于 ${rule.minLength} 个字符`
    }
    if (rule.maxLength !== null && text.length > rule.maxLength) {
      return `${field.label}不能超过 ${rule.maxLength} 个字符`
    }

    if (field.type === 'number') {
      const numberValue = Number(value)
      if (!Number.isFinite(numberValue)) return `${field.label}必须是有效数字`
      if (rule.min !== null && numberValue < rule.min) return `${field.label}不能小于 ${rule.min}`
      if (rule.max !== null && numberValue > rule.max) return `${field.label}不能大于 ${rule.max}`
    }

    if (rule.pattern) {
      try {
        if (!new RegExp(rule.pattern).test(text)) {
          return rule.patternMessage || `${field.label}格式不正确`
        }
      } catch {
        return '当前字段的正则校验规则配置有误'
      }
    }

    return true
  }
}
