'use client'

import { useRef, useEffect, useCallback } from 'react'
import {
  Bold,
  Italic,
  Link as LinkIcon,
  Quote,
  Code,
  List,
  Heading2,
} from 'lucide-react'

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  minHeight?: string
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Write your article…',
  minHeight = '320px',
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = editorRef.current
    if (!el) return
    if (el.innerHTML !== value) {
      el.innerHTML = value || ''
    }
  }, [value])

  const sync = useCallback(() => {
    const html = editorRef.current?.innerHTML || ''
    onChange(html)
  }, [onChange])

  const exec = (command: string, value?: string) => {
    editorRef.current?.focus()
    document.execCommand(command, false, value)
    sync()
  }

  const toolbar = [
    {
      label: 'Bold',
      icon: Bold,
      action: () => exec('bold'),
    },
    {
      label: 'Italic',
      icon: Italic,
      action: () => exec('italic'),
    },
    {
      label: 'Link',
      icon: LinkIcon,
      action: () => {
        const url = window.prompt('Enter URL', 'https://')
        if (url) exec('createLink', url)
      },
    },
    {
      label: 'Quote',
      icon: Quote,
      action: () => exec('formatBlock', 'blockquote'),
    },
    {
      label: 'Code',
      icon: Code,
      action: () => {
        const sel = window.getSelection()
        if (!sel || sel.rangeCount === 0) return
        const range = sel.getRangeAt(0)
        const code = document.createElement('code')
        code.className = 'rounded bg-secondary px-1.5 py-0.5 font-mono text-sm'
        if (range.collapsed) {
          code.textContent = 'code'
          range.insertNode(code)
        } else {
          code.appendChild(range.extractContents())
          range.insertNode(code)
        }
        sync()
      },
    },
    {
      label: 'List',
      icon: List,
      action: () => exec('insertUnorderedList'),
    },
    {
      label: 'Heading',
      icon: Heading2,
      action: () => exec('formatBlock', 'h2'),
    },
  ]

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-background">
      <div className="flex flex-wrap gap-1 p-2 sm:p-3 bg-secondary/80 border-b border-border">
        {toolbar.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.label}
              type="button"
              title={item.label}
              onMouseDown={(e) => e.preventDefault()}
              onClick={item.action}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs sm:text-sm font-medium rounded-lg hover:bg-background text-foreground transition-colors"
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{item.label}</span>
            </button>
          )
        })}
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={sync}
        onBlur={sync}
        data-placeholder={placeholder}
        className="article-editor prose prose-sm sm:prose-base max-w-none px-4 py-4 sm:px-5 sm:py-5 focus:outline-none min-h-[280px] text-foreground empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground empty:before:pointer-events-none"
        style={{ minHeight }}
      />
    </div>
  )
}
