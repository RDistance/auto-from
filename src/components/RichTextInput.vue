<script setup lang="ts">
import { onBeforeUnmount, watch } from 'vue'
import { EditorContent, useEditor } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'

const props = withDefaults(
  defineProps<{
    modelValue: string
    placeholder?: string
    disabled?: boolean
  }>(),
  {
    placeholder: '请输入内容',
    disabled: false,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const editor = useEditor({
  content: props.modelValue,
  editable: !props.disabled,
  extensions: [
    StarterKit,
    Placeholder.configure({ placeholder: props.placeholder }),
  ],
  editorProps: {
    attributes: {
      class: 'richtext-prosemirror',
      'aria-label': props.placeholder,
    },
  },
  onUpdate: ({ editor: currentEditor }) => {
    emit('update:modelValue', currentEditor.getHTML())
  },
})

watch(
  () => props.modelValue,
  (value) => {
    if (!editor.value || editor.value.getHTML() === value) return
    editor.value.commands.setContent(value || '', { emitUpdate: false })
  },
)

watch(
  () => props.disabled,
  (disabled) => editor.value?.setEditable(!disabled),
)

onBeforeUnmount(() => editor.value?.destroy())
</script>

<template>
  <div class="richtext-editor" :class="{ disabled }">
    <div v-if="editor" class="richtext-toolbar" aria-label="富文本工具栏">
      <button
        type="button"
        :class="{ active: editor.isActive('bold') }"
        :disabled="disabled"
        title="加粗"
        @click="editor.chain().focus().toggleBold().run()"
      ><strong>B</strong></button>
      <button
        type="button"
        :class="{ active: editor.isActive('italic') }"
        :disabled="disabled"
        title="斜体"
        @click="editor.chain().focus().toggleItalic().run()"
      ><em>I</em></button>
      <span></span>
      <button
        type="button"
        :class="{ active: editor.isActive('heading', { level: 2 }) }"
        :disabled="disabled"
        title="二级标题"
        @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
      >H2</button>
      <button
        type="button"
        :class="{ active: editor.isActive('bulletList') }"
        :disabled="disabled"
        title="无序列表"
        @click="editor.chain().focus().toggleBulletList().run()"
      >• 列表</button>
      <button
        type="button"
        :class="{ active: editor.isActive('orderedList') }"
        :disabled="disabled"
        title="有序列表"
        @click="editor.chain().focus().toggleOrderedList().run()"
      >1. 列表</button>
      <button
        type="button"
        :class="{ active: editor.isActive('blockquote') }"
        :disabled="disabled"
        title="引用"
        @click="editor.chain().focus().toggleBlockquote().run()"
      >“ 引用</button>
      <span class="toolbar-spacer"></span>
      <button type="button" :disabled="disabled || !editor.can().undo()" title="撤销" @click="editor.chain().focus().undo().run()">↶</button>
      <button type="button" :disabled="disabled || !editor.can().redo()" title="重做" @click="editor.chain().focus().redo().run()">↷</button>
    </div>
    <EditorContent :editor="editor" />
  </div>
</template>

<style scoped>
.richtext-editor { overflow: hidden; border: 1px solid #d7dce3; border-radius: 8px; background: #fff; transition: .15s; }
.richtext-editor:focus-within { border-color: #5b5bd6; box-shadow: 0 0 0 3px rgba(91, 91, 214, .1); }
.richtext-editor.disabled { background: #f2f4f7; }
.richtext-toolbar { min-height: 42px; display: flex; align-items: center; gap: 3px; padding: 5px 7px; border-bottom: 1px solid #e9ebef; background: #f9fafb; }
.richtext-toolbar > span:not(.toolbar-spacer) { width: 1px; height: 20px; margin: 0 4px; background: #e1e4e9; }
.toolbar-spacer { flex: 1; }
.richtext-toolbar button { min-width: 30px; height: 29px; padding: 0 7px; border: 0; border-radius: 5px; background: transparent; color: #667085; font-size: 11px; }
.richtext-toolbar button:hover:not(:disabled) { background: #ececfb; color: #4747bd; }
.richtext-toolbar button.active { background: #e3e3fa; color: #4747bd; }
.richtext-toolbar button:disabled { opacity: .35; cursor: not-allowed; }
.richtext-toolbar strong { font-weight: 700; }
:deep(.richtext-prosemirror) { min-height: 150px; padding: 14px 15px; color: #344054; font-size: 13px; line-height: 1.7; outline: none; }
:deep(.richtext-prosemirror p) { margin: 0 0 8px; }
:deep(.richtext-prosemirror p:last-child) { margin-bottom: 0; }
:deep(.richtext-prosemirror strong) { font-weight: 700; }
:deep(.richtext-prosemirror h2) { margin: 4px 0 10px; font-size: 19px; line-height: 1.35; }
:deep(.richtext-prosemirror ul), :deep(.richtext-prosemirror ol) { padding-left: 23px; }
:deep(.richtext-prosemirror blockquote) { margin: 10px 0; padding: 5px 12px; border-left: 3px solid #5b5bd6; background: #f7f7fd; color: #667085; }
:deep(.richtext-prosemirror p.is-editor-empty:first-child::before) { content: attr(data-placeholder); float: left; height: 0; color: #a5adba; pointer-events: none; }
</style>
