<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Container, Draggable, type DropResult } from 'vue3-smooth-dnd'
import { fieldCatalog, useFormBuilderStore, type CatalogField } from '@/stores/formBuilder'
import FormPreviewView from '@/views/FormPreviewView.vue'

const store = useFormBuilderStore()
const route = useRoute()
const router = useRouter()
const activeTab = ref<'fields' | 'properties'>('fields')
const saved = ref(false)
const selectedField = computed(() => store.selectedField)

const iconPaths: Record<string, string> = {
  text: '<path d="M5 5h14M12 5v14M8 19h8"/>',
  textarea: '<path d="M5 5h14M12 5v11M8 16h8"/><path d="m16 20 4-4"/>',
  richtext: '<path d="M4 5h16M8 5v14M5 19h6"/><path d="M14 11h6M14 15h5M14 19h4"/>',
  number: '<path d="M10 3 8 21M16 3l-2 18M4 9h16M3 15h16"/>',
  checkbox: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="m8 12 3 3 5-6"/>',
  select: '<path d="M5 7h14M5 12h9M5 17h6"/><path d="m17 15 3 3 3-3"/>',
  date: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
  radio: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/>',
  divider: '<path d="M3 12h18"/>',
}

function iconFor(type: string) {
  return iconPaths[type] ?? iconPaths.text
}

function selectField(id: string) {
  store.select(id)
  activeTab.value = 'properties'
}

function onCanvasDrop(result: DropResult) {
  store.handleDrop(result)
}

function catalogPayload(index: number): { kind: 'catalog'; definition: CatalogField } {
  return { kind: 'catalog', definition: fieldCatalog[index]! }
}

function canvasPayload(index: number) {
  return { kind: 'field', field: store.fields[index] }
}

function updateOptions(event: Event) {
  const target = event.target as HTMLTextAreaElement
  if (!selectedField.value) return
  selectedField.value.options = target.value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean)
}

function saveModel() {
  store.saveModel()
  saved.value = true
  window.setTimeout(() => (saved.value = false), 1800)
}

function createFormPage() {
  store.saveModel()
  router.push({ name: 'form-preview' })
}
</script>

<template>
  <FormPreviewView v-if="route.name === 'form-preview'" />
  <div v-else class="app-shell">
    <header class="topbar">
      <div class="brand">
        <div class="brand-mark" aria-hidden="true">
          <span></span><span></span><span></span>
        </div>
        <div>
          <strong>Form Studio</strong>
          <span>可视化表单编排</span>
        </div>
      </div>

      <div class="model-meta">
        <span class="status-dot"></span>
        <div>
          <span>当前模型</span>
          <strong>用户信息采集表</strong>
        </div>
      </div>

      <div class="topbar-actions">
        <button class="icon-button" aria-label="预览" title="预览" @click="createFormPage">
          <svg viewBox="0 0 24 24"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.5"/></svg>
        </button>
        <button class="secondary-button" @click="store.resetModel">重置</button>
        <button class="primary-button" @click="saveModel">
          <svg viewBox="0 0 24 24"><path d="M5 3h12l2 2v16H5z"/><path d="M8 3v6h8V3M8 21v-8h8v8"/></svg>
          {{ saved ? '已保存' : '保存模型' }}
        </button>
        <button class="create-form-button" @click="createFormPage">
          创建表单
          <svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
        </button>
      </div>
    </header>

    <main class="workspace">
      <section class="canvas-column">
        <div class="canvas-heading">
          <div>
            <div class="eyebrow">FORM CANVAS</div>
            <h1>表单编排画布</h1>
            <p>从右侧拖入字段，或拖动字段左侧把手调整顺序。</p>
          </div>
          <div class="field-counter"><strong>{{ store.fields.length }}</strong><span>个字段</span></div>
        </div>

        <div class="canvas-frame" @click.self="store.clearSelection">
          <div class="form-title-block">
            <span class="form-badge">FORM</span>
            <div>
              <h2>用户信息采集表</h2>
              <p>请填写以下信息，带 * 的项目为必填项</p>
            </div>
          </div>

          <Container
            class="form-dropzone"
            group-name="form-fields"
            drag-handle-selector=".drag-handle"
            non-drag-area-selector="input, textarea, select, .field-action"
            :get-child-payload="canvasPayload"
            :drop-placeholder="{ className: 'drop-placeholder', animationDuration: 180, showOnTop: true }"
            @drop="onCanvasDrop"
          >
            <Draggable v-for="(field, index) in store.fields" :key="field.id">
              <article
                class="canvas-field"
                :class="{ selected: field.id === store.selectedId }"
                @click="selectField(field.id)"
              >
                <button class="drag-handle" aria-label="拖动排序" title="拖动排序">
                  <span></span><span></span><span></span><span></span><span></span><span></span>
                </button>

                <div class="field-body">
                  <div class="field-label-row">
                    <label>{{ field.label }} <em v-if="field.required">*</em></label>
                    <span class="type-chip">{{ field.typeLabel }}</span>
                  </div>

                  <textarea
                    v-if="field.type === 'textarea'"
                    :placeholder="field.placeholder"
                    rows="3"
                    readonly
                  ></textarea>
                  <div v-else-if="field.type === 'richtext'" class="richtext-canvas-preview">
                    <div class="richtext-preview-toolbar">
                      <strong>B</strong><em>I</em><span>H</span><span>• List</span><span>“</span>
                    </div>
                    <p>{{ field.placeholder || '请输入富文本内容' }}</p>
                  </div>
                  <input
                    v-else-if="field.type === 'text' || field.type === 'number' || field.type === 'date'"
                    :type="field.type === 'text' ? 'text' : field.type"
                    :placeholder="field.placeholder"
                    readonly
                  />
                  <select v-else-if="field.type === 'select'" tabindex="-1">
                    <option>{{ field.placeholder || '请选择' }}</option>
                    <option v-for="option in field.options" :key="option">{{ option }}</option>
                  </select>
                  <label v-else-if="field.type === 'checkbox'" class="choice-control">
                    <input type="checkbox" tabindex="-1" />
                    <span>{{ field.placeholder || '勾选此项' }}</span>
                  </label>
                  <div v-else-if="field.type === 'radio'" class="radio-list">
                    <label v-for="option in field.options" :key="option">
                      <input type="radio" :name="field.id" tabindex="-1" /> {{ option }}
                    </label>
                  </div>
                  <div v-else class="divider-preview"><span></span></div>

                  <small v-if="field.helpText">{{ field.helpText }}</small>
                </div>

                <div class="field-actions">
                  <button class="field-action" title="复制" @click.stop="store.duplicate(field.id)">
                    <svg viewBox="0 0 24 24"><rect x="8" y="8" width="11" height="11" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/></svg>
                  </button>
                  <button class="field-action danger" title="删除" @click.stop="store.remove(field.id)">
                    <svg viewBox="0 0 24 24"><path d="M4 7h16M9 7V4h6v3M7 7l1 14h8l1-14M10 11v6M14 11v6"/></svg>
                  </button>
                </div>
              </article>
            </Draggable>

            <div v-if="store.fields.length === 0" class="empty-state">
              <div class="empty-icon">
                <svg viewBox="0 0 24 24"><path d="M12 3v13M7 11l5 5 5-5"/><path d="M5 20h14"/></svg>
              </div>
              <strong>拖入第一个字段</strong>
              <span>从右侧字段库选择表单类型并拖到这里</span>
            </div>
          </Container>

          <div v-if="store.fields.length" class="drop-hint">
            <svg viewBox="0 0 24 24"><path d="M12 5v12M7 12l5 5 5-5"/></svg>
            将新字段拖放到这里
          </div>
        </div>
      </section>

      <aside class="inspector">
        <nav class="inspector-tabs" aria-label="编辑器面板">
          <button :class="{ active: activeTab === 'fields' }" @click="activeTab = 'fields'">
            <svg viewBox="0 0 24 24"><rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/></svg>
            字段类型
          </button>
          <button :class="{ active: activeTab === 'properties' }" @click="activeTab = 'properties'">
            <svg viewBox="0 0 24 24"><path d="M4 6h10M18 6h2M4 12h3M11 12h9M4 18h7M15 18h5"/><circle cx="16" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="13" cy="18" r="2"/></svg>
            属性
            <span v-if="selectedField" class="tab-indicator"></span>
          </button>
        </nav>

        <div v-if="activeTab === 'fields'" class="panel-content field-library">
          <div class="panel-intro">
            <h3>添加字段</h3>
            <p>拖动字段卡片到左侧画布</p>
          </div>

          <Container
            class="catalog-list"
            group-name="form-fields"
            behaviour="copy"
            :get-child-payload="catalogPayload"
            :should-accept-drop="() => false"
          >
            <Draggable v-for="item in fieldCatalog" :key="item.type">
              <div class="catalog-card">
                <div class="catalog-icon">
                  <svg viewBox="0 0 24 24" v-html="iconFor(item.type)"></svg>
                </div>
                <div><strong>{{ item.label }}</strong><span>{{ item.description }}</span></div>
                <svg class="grip-icon" viewBox="0 0 20 20"><circle cx="7" cy="5" r="1"/><circle cx="13" cy="5" r="1"/><circle cx="7" cy="10" r="1"/><circle cx="13" cy="10" r="1"/><circle cx="7" cy="15" r="1"/><circle cx="13" cy="15" r="1"/></svg>
              </div>
            </Draggable>
          </Container>
          <div class="library-tip"><strong>小提示</strong><span>字段添加后仍可在画布内拖动排序</span></div>
        </div>

        <div v-else class="panel-content properties-panel">
          <template v-if="selectedField">
            <div class="selected-summary">
              <div class="catalog-icon selected-icon">
                <svg viewBox="0 0 24 24" v-html="iconFor(selectedField.type)"></svg>
              </div>
              <div><span>正在编辑</span><strong>{{ selectedField.typeLabel }}</strong></div>
              <button title="关闭属性" @click="store.clearSelection">×</button>
            </div>

            <div class="property-section">
              <h3>基础设置</h3>
              <label class="property-control">
                <span>字段标题</span>
                <input v-model="selectedField.label" type="text" />
              </label>
              <label class="property-control">
                <span>字段标识 <i>用于数据提交</i></span>
                <input v-model="selectedField.name" type="text" />
              </label>
              <label v-if="selectedField.type !== 'divider'" class="property-control">
                <span>占位提示</span>
                <input v-model="selectedField.placeholder" type="text" />
              </label>
              <label class="property-control">
                <span>帮助文字</span>
                <input v-model="selectedField.helpText" type="text" placeholder="显示在字段下方" />
              </label>
            </div>

            <div v-if="selectedField.type === 'select' || selectedField.type === 'radio'" class="property-section">
              <h3>选项设置</h3>
              <label class="property-control">
                <span>每行一个选项</span>
                <textarea :value="selectedField.options.join('\n')" rows="5" @input="updateOptions"></textarea>
              </label>
            </div>

            <div v-if="selectedField.type !== 'divider'" class="property-section switch-list">
              <h3>校验与状态</h3>
              <label class="switch-row">
                <div><strong>必填字段</strong><span>用户必须填写此项目</span></div>
                <input v-model="selectedField.required" type="checkbox" /><i></i>
              </label>
              <label class="switch-row">
                <div><strong>禁用字段</strong><span>仅展示，不允许用户修改</span></div>
                <input v-model="selectedField.disabled" type="checkbox" /><i></i>
              </label>
            </div>

            <button class="delete-field-button" @click="store.remove(selectedField.id)">
              <svg viewBox="0 0 24 24"><path d="M4 7h16M9 7V4h6v3M7 7l1 14h8l1-14"/></svg>
              删除此字段
            </button>
          </template>

          <div v-else class="no-selection">
            <div class="no-selection-visual">
              <svg viewBox="0 0 24 24"><path d="m5 3 14 9-6 2-3 6Z"/><path d="m14 15 4 4"/></svg>
            </div>
            <h3>请选择一个字段</h3>
            <p>点击左侧画布中的输入框、复选框或其他字段，即可在这里配置它的属性。</p>
            <button @click="activeTab = 'fields'">返回字段类型</button>
          </div>
        </div>
      </aside>
    </main>
  </div>
</template>
