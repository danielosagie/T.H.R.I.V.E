"use client"

import { useEditor, EditorContent, Content, Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { lowlight } from 'lowlight'
import { common, createLowlight } from 'lowlight'
import Color from '@tiptap/extension-color'
import Heading from '@tiptap/extension-heading'
import HorizontalRule from '@tiptap/extension-horizontal-rule'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import TextStyle from '@tiptap/extension-text-style'
import Typography from '@tiptap/extension-typography'
import Underline from '@tiptap/extension-underline'
import { Toolbar } from './toolbar'

// Initialize lowlight with common languages
const low = createLowlight(common)

interface MinimalTiptapEditorProps {
  value: Content
  onChange: (value: Content) => void
  className?: string
  editorClassName?: string
  editorContentClassName?: string
  placeholder?: string
  output?: 'html' | 'json' | 'text'
  autofocus?: boolean
  editable?: boolean
  throttleDelay?: number
}

export function MinimalTiptapEditor({
  value,
  onChange,
  className = '',
  editorClassName = '',
  editorContentClassName = '',
  placeholder = 'Start typing...',
  output = 'html',
  autofocus = false,
  editable = true,
  throttleDelay = 0,
}: MinimalTiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // Disable the default code block
      }),
      CodeBlockLowlight.configure({
        lowlight: low,
      }),
      Color,
      Heading,
      HorizontalRule,
      Image,
      Link,
      Placeholder.configure({
        placeholder,
      }),
      TextStyle,
      Typography,
      Underline,
    ],
    content: value,
    editable,
    autofocus,
    onUpdate: ({ editor }) => {
      let content: Content
      switch (output) {
        case 'html':
          content = editor.getHTML()
          break
        case 'json':
          content = editor.getJSON()
          break
        case 'text':
          content = editor.getText()
          break
        default:
          content = editor.getHTML()
      }
      onChange(content)
    },
  })

  return (
    <div className={className}>
      <Toolbar editor={editor} />
      <EditorContent 
        editor={editor} 
        className={editorContentClassName}
      />
    </div>
  )
} 