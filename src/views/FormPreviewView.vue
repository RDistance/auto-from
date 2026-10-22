<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { readSavedFormModel } from '@/stores/formBuilder'
import RichTextInput from '@/components/RichTextInput.vue'

const router = useRouter()
const model = readSavedFormModel()
const submitted = ref(false)
const values = reactive<Record<string, string | number | boolean>>({})
const fieldErrors = reactive<Record<string, string>>({})

if (model) {
  for (const field of model.fields) {
    values[field.name] = field.type === 'checkbox' ? false : ''
  }
}

function isRichTextEmpty(value: string) {
  return value.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim().length === 0
}

function updateRichText(name: string, value: string) {
  values[name] = value
  delete fieldErrors[name]
}

function submitForm() {
  if (!model) return

  for (const key of Object.keys(fieldErrors)) delete fieldErrors[key]
  for (const field of model.fields) {
    if (field.type === 'richtext' && field.required && isRichTextEmpty(String(values[field.name] ?? ''))) {
      fieldErrors[field.name] = `请填写${field.label}`
    }
  }
  if (Object.keys(fieldErrors).length > 0) return
  window.localStorage.setItem(
    'form-studio-last-submission',
    JSON.stringify({ modelId: model.id, values: { ...values }, submittedAt: new Date().toISOString() }),
  )
  submitted.value = true
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <div class="generated-page">
    <header class="generated-header">
      <button class="back-editor" @click="router.push('/')">
        <svg viewBox="0 0 24 24"><path d="M19 12H5M11 18l-6-6 6-6"/></svg>
        返回编辑器
      </button>
      <div class="generated-brand">
        <span class="generated-brand-mark"><i></i><i></i><i></i></span>
        <strong>Form Studio</strong>
      </div>
      <span class="preview-pill">已创建的表单</span>
    </header>

    <main class="generated-main">
      <div v-if="!model" class="missing-model">
        <div>!</div>
        <h1>还没有保存表单模型</h1>
        <p>请返回编辑器完成编排，然后点击“创建表单”。</p>
        <button @click="router.push('/')">返回编辑器</button>
      </div>

      <div v-else class="generated-layout">
        <section class="generated-intro">
          <span class="generated-kicker">FORM / {{ model.fields.length }} FIELDS</span>
          <h1>{{ model.title }}</h1>
          <p>{{ model.description }}</p>
          <div class="model-info">
            <span></span>
            此页面根据已保存的模型动态生成
          </div>
        </section>

        <section class="generated-card">
          <div v-if="submitted" class="submit-success" role="status">
            <div>
              <svg viewBox="0 0 24 24"><path d="m5 12 4 4L19 6"/></svg>
            </div>
            <span><strong>提交成功</strong>表单数据已保存在浏览器本地。</span>
            <button @click="submitted = false">×</button>
          </div>

          <form @submit.prevent="submitForm">
            <template v-for="field in model.fields" :key="field.id">
              <div v-if="field.type === 'divider'" class="runtime-divider">
                <span></span><strong>{{ field.label }}</strong><span></span>
              </div>

              <div v-else class="runtime-field">
                <label class="runtime-label" :for="field.id">
                  {{ field.label }}<em v-if="field.required">*</em>
                </label>

                <textarea
                  v-if="field.type === 'textarea'"
                  :id="field.id"
                  v-model="values[field.name] as string"
                  :placeholder="field.placeholder"
                  :required="field.required"
                  :disabled="field.disabled"
                  rows="4"
                ></textarea>

                <RichTextInput
                  v-else-if="field.type === 'richtext'"
                  :model-value="String(values[field.name] ?? '')"
                  :placeholder="field.placeholder"
                  :disabled="field.disabled"
                  @update:model-value="updateRichText(field.name, $event)"
                />

                <input
                  v-else-if="field.type === 'text' || field.type === 'number' || field.type === 'date'"
                  :id="field.id"
                  v-model="values[field.name]"
                  :type="field.type"
                  :placeholder="field.placeholder"
                  :required="field.required"
                  :disabled="field.disabled"
                />

                <select
                  v-else-if="field.type === 'select'"
                  :id="field.id"
                  v-model="values[field.name] as string"
                  :required="field.required"
                  :disabled="field.disabled"
                >
                  <option value="" disabled>{{ field.placeholder || '请选择' }}</option>
                  <option v-for="option in field.options" :key="option" :value="option">{{ option }}</option>
                </select>

                <label v-else-if="field.type === 'checkbox'" class="runtime-check">
                  <input
                    :id="field.id"
                    v-model="values[field.name] as boolean"
                    type="checkbox"
                    :required="field.required"
                    :disabled="field.disabled"
                  />
                  <span>{{ field.placeholder || field.label }}</span>
                </label>

                <div v-else-if="field.type === 'radio'" class="runtime-radio-list">
                  <label v-for="option in field.options" :key="option">
                    <input
                      v-model="values[field.name] as string"
                      type="radio"
                      :name="field.name"
                      :value="option"
                      :required="field.required"
                      :disabled="field.disabled"
                    />
                    <span>{{ option }}</span>
                  </label>
                </div>

                <small v-if="fieldErrors[field.name]" class="runtime-error">{{ fieldErrors[field.name] }}</small>
                <small v-else-if="field.helpText">{{ field.helpText }}</small>
              </div>
            </template>

            <div class="runtime-actions">
              <span>提交即表示您确认以上信息真实有效</span>
              <button type="submit">
                提交表单
                <svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  </div>
</template>
