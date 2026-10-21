import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { DropResult } from 'vue3-smooth-dnd'

export type FieldType = 'text' | 'textarea' | 'number' | 'checkbox' | 'select' | 'date' | 'radio' | 'divider'

export interface CatalogField {
  type: FieldType
  label: string
  description: string
  placeholder: string
  options?: string[]
}

export interface FormField {
  id: string
  type: FieldType
  typeLabel: string
  label: string
  name: string
  placeholder: string
  helpText: string
  required: boolean
  disabled: boolean
  options: string[]
}

export interface SavedFormModel {
  version: 1
  id: string
  title: string
  description: string
  fields: FormField[]
  savedAt: string
}

export const FORM_MODEL_STORAGE_KEY = 'form-studio-model'

type CatalogPayload = { kind: 'catalog'; definition: CatalogField }
type FieldPayload = { kind: 'field'; field: FormField }

export const fieldCatalog: CatalogField[] = [
  { type: 'text', label: '单行文本', description: '姓名、标题、邮箱等短文本', placeholder: '请输入内容' },
  { type: 'textarea', label: '多行文本', description: '描述、备注等长文本内容', placeholder: '请输入详细内容' },
  { type: 'number', label: '数字', description: '数量、金额或其他数值', placeholder: '请输入数字' },
  { type: 'checkbox', label: '复选框', description: '用于确认或开关类选项', placeholder: '我已阅读并同意' },
  { type: 'select', label: '下拉选择', description: '从预设选项中选择一项', placeholder: '请选择一个选项', options: ['选项一', '选项二', '选项三'] },
  { type: 'date', label: '日期', description: '选择日期或时间信息', placeholder: '' },
  { type: 'radio', label: '单选组', description: '展示一组互斥的选项', placeholder: '', options: ['选项 A', '选项 B'] },
  { type: 'divider', label: '分隔线', description: '分隔不同的表单内容区域', placeholder: '' },
]

const initialFields: Omit<FormField, 'id'>[] = [
  {
    type: 'text', typeLabel: '单行文本', label: '姓名', name: 'fullName', placeholder: '请输入您的姓名',
    helpText: '', required: true, disabled: false, options: [],
  },
  {
    type: 'text', typeLabel: '单行文本', label: '电子邮箱', name: 'email', placeholder: 'name@example.com',
    helpText: '我们不会向第三方公开您的邮箱', required: true, disabled: false, options: [],
  },
  {
    type: 'select', typeLabel: '下拉选择', label: '所在地区', name: 'region', placeholder: '请选择所在地区',
    helpText: '', required: false, disabled: false, options: ['华东地区', '华南地区', '华北地区', '其他'],
  },
]

function makeId() {
  return `field_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`
}

function makeField(definition: CatalogField): FormField {
  return {
    id: makeId(),
    type: definition.type,
    typeLabel: definition.label,
    label: definition.type === 'divider' ? '内容分隔' : `未命名${definition.label}`,
    name: `${definition.type}_${Date.now().toString(36)}`,
    placeholder: definition.placeholder,
    helpText: '',
    required: false,
    disabled: false,
    options: [...(definition.options ?? [])],
  }
}

function freshInitialFields(): FormField[] {
  return initialFields.map((field) => ({ ...field, id: makeId(), options: [...field.options] }))
}

function cloneFields(fields: FormField[]) {
  return fields.map((field) => ({ ...field, options: [...field.options] }))
}

export function readSavedFormModel(): SavedFormModel | null {
  if (typeof window === 'undefined') return null

  try {
    const raw = window.localStorage.getItem(FORM_MODEL_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as SavedFormModel | FormField[]

    // 兼容早期只保存字段数组的数据格式。
    if (Array.isArray(parsed)) {
      return {
        version: 1,
        id: 'user-information-form',
        title: '用户信息采集表',
        description: '请填写以下信息，带 * 的项目为必填项',
        fields: cloneFields(parsed),
        savedAt: new Date().toISOString(),
      }
    }

    if (!parsed || !Array.isArray(parsed.fields)) return null
    return { ...parsed, fields: cloneFields(parsed.fields) }
  } catch {
    return null
  }
}

export const useFormBuilderStore = defineStore('formBuilder', () => {
  const storedModel = readSavedFormModel()
  const fields = ref<FormField[]>(storedModel ? cloneFields(storedModel.fields) : freshInitialFields())
  const selectedId = ref<string | null>(fields.value[0]?.id ?? null)
  const selectedField = computed(() => fields.value.find((field) => field.id === selectedId.value) ?? null)

  function select(id: string) {
    selectedId.value = id
  }

  function clearSelection() {
    selectedId.value = null
  }

  function handleDrop({ removedIndex, addedIndex, payload }: DropResult) {
    if (removedIndex === null && addedIndex === null) return

    let nextField: FormField | undefined
    if (removedIndex !== null) {
      nextField = fields.value.splice(removedIndex, 1)[0]
    } else if ((payload as CatalogPayload | undefined)?.kind === 'catalog') {
      nextField = makeField((payload as CatalogPayload).definition)
    } else if ((payload as FieldPayload | undefined)?.kind === 'field') {
      nextField = (payload as FieldPayload).field
    }

    if (nextField && addedIndex !== null) {
      fields.value.splice(addedIndex, 0, nextField)
      selectedId.value = nextField.id
    }
  }

  function duplicate(id: string) {
    const index = fields.value.findIndex((field) => field.id === id)
    if (index < 0) return
    const source = fields.value[index]!
    const copy = { ...source, id: makeId(), label: `${source.label} 副本`, name: `${source.name}_copy`, options: [...source.options] }
    fields.value.splice(index + 1, 0, copy)
    selectedId.value = copy.id
  }

  function remove(id: string) {
    const index = fields.value.findIndex((field) => field.id === id)
    if (index < 0) return
    fields.value.splice(index, 1)
    if (selectedId.value === id) selectedId.value = fields.value[index]?.id ?? fields.value[index - 1]?.id ?? null
  }

  function resetModel() {
    fields.value = freshInitialFields()
    selectedId.value = fields.value[0]?.id ?? null
  }

  function saveModel(): SavedFormModel {
    const model: SavedFormModel = {
      version: 1,
      id: 'user-information-form',
      title: '用户信息采集表',
      description: '请填写以下信息，带 * 的项目为必填项',
      fields: cloneFields(fields.value),
      savedAt: new Date().toISOString(),
    }

    window.localStorage.setItem(FORM_MODEL_STORAGE_KEY, JSON.stringify(model))
    return model
  }

  return { fields, selectedId, selectedField, select, clearSelection, handleDrop, duplicate, remove, resetModel, saveModel }
})
