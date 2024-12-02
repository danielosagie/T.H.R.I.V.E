import * as React from 'react'
import './styles/index.css'

import type { Content, Editor } from '@tiptap/react'
import type { UseMinimalTiptapEditorProps } from './hooks/use-minimal-tiptap'
import { EditorContent } from '@tiptap/react'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { SectionOne } from './components/section/one'
import { SectionTwo } from './components/section/two'
import { SectionThree } from './components/section/three'
import { SectionFour } from './components/section/four'
import { SectionFive } from './components/section/five'
import { LinkBubbleMenu } from './components/bubble-menu/link-bubble-menu'
import { useMinimalTiptapEditor } from './hooks/use-minimal-tiptap'
import { MeasuredContainer } from './components/measured-container'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import { FormControl } from '@/components/ui/form'

export interface MinimalTiptapProps extends Omit<UseMinimalTiptapEditorProps, 'onUpdate'> {
  value?: Content
  onChange?: (value: Content) => void
  className?: string
  editorContentClassName?: string
}

const Toolbar = ({ editor }: { editor: Editor }) => (
  <div className="shrink-0 overflow-x-auto border-t border-border p-2">
    <div className="flex w-max items-center justify-center gap-2">
      <SectionTwo
        editor={editor}
        activeActions={['bold', 'italic', 'underline']}
        mainActionCount={3}
      />
      <Separator orientation="vertical" className="mx-2 h-7" />
      <SectionFour
        editor={editor}
        activeActions={['bulletList', 'orderedList']}
        mainActionCount={2}
      />
    </div>
  </div>
)

export interface EditorRef {
  editor: Editor;
  container?: HTMLDivElement;
}

export const MinimalTiptapEditor = React.forwardRef<EditorRef, MinimalTiptapProps>(
  ({ value, onChange, className, editorContentClassName, ...props }, ref) => {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const editor = useMinimalTiptapEditor({
      value,
      onUpdate: onChange,
      editorProps: {
        attributes: {
          class: cn('prose max-w-none', className),
        },
      },
      extensions: [
        StarterKit.configure({
          paragraph: {
            HTMLAttributes: {
              class: 'mb-1',
            },
          },
        }),
        Underline,
      ],
      immediatelyRender: false
    })

    // Update useImperativeHandle to include container ref
    React.useImperativeHandle(ref, () => ({
      editor: editor,
      container: containerRef.current || undefined
    }));

    if (!editor) {
      return null
    }

    return (
      <div
        ref={containerRef}
        className={cn(
          'flex h-auto min-h-72 w-full flex-col rounded-md border border-input shadow-sm focus-within:border-primary',
          className
        )}
      >
        <Toolbar editor={editor} />
        <EditorContent 
          editor={editor} 
          className={cn('minimal-tiptap-editor', editorContentClassName)} 
        />
        <LinkBubbleMenu editor={editor} />
      </div>
    )
  }
)

MinimalTiptapEditor.displayName = 'MinimalTiptapEditor'

export default MinimalTiptapEditor
