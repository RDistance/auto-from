<script setup lang="ts">
import { ref } from 'vue'
import { Form as VeeForm } from 'vee-validate'
import { useRouter } from 'vue-router'
import { readSavedFormModel } from '@/stores/formBuilder'
import RuntimeFieldRenderer from '@/components/form-runtime/RuntimeFieldRenderer.vue'

const router = useRouter()
const model = readSavedFormModel()
const submitted = ref(false)

const initialValues = model?.fields.reduce<Record<string, string | boolean>>((result, field) => {
  if (field.type !== 'divider') result[field.name] = field.type === 'checkbox' ? false : ''
  return result
}, {}) ?? {}

function submitForm(values: Record<string, unknown>) {
  if (!model) return

  const submission = {
    modelId: model.id,
    values: { ...values },
    submittedAt: new Date().toISOString(),
  }

  console.log('表单提交数据：', submission)
  window.localStorage.setItem('form-studio-last-submission', JSON.stringify(submission))
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
          <div class="model-info"><span></span>此页面根据已保存的模型动态生成</div>
        </section>

        <section class="generated-card">
          <div v-if="submitted" class="submit-success" role="status">
            <div><svg viewBox="0 0 24 24"><path d="m5 12 4 4L19 6"/></svg></div>
            <span><strong>提交成功</strong>表单数据已保存在浏览器本地。</span>
            <button @click="submitted = false">×</button>
          </div>

          <VeeForm v-slot="{ meta }" :initial-values="initialValues" @submit="submitForm">
            <RuntimeFieldRenderer v-for="field in model.fields" :key="field.id" :field="field" />

            <div class="runtime-actions">
              <span>{{ meta.valid ? '表单内容校验通过后即可提交' : '请检查表单中的错误信息' }}</span>
              <button type="submit">
                提交表单
                <svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
              </button>
            </div>
          </VeeForm>
        </section>
      </div>
    </main>
  </div>
</template>
