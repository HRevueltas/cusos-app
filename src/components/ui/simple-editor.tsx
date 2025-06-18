"use client"

import React, { useCallback, useEffect } from 'react'
import { $getRoot } from 'lexical'
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin'
import { 
  HEADING, 
  QUOTE, 
  UNORDERED_LIST, 
  ORDERED_LIST,
  BOLD_STAR,
  ITALIC_STAR,
  INLINE_CODE 
} from '@lexical/markdown'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { HeadingNode, QuoteNode, $createHeadingNode, $createQuoteNode } from '@lexical/rich-text'
import { ListItemNode, ListNode, INSERT_UNORDERED_LIST_COMMAND, INSERT_ORDERED_LIST_COMMAND } from '@lexical/list'
import { CodeHighlightNode, CodeNode } from '@lexical/code'
import { AutoLinkNode, LinkNode } from '@lexical/link'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { 
  $getSelection, 
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
  type TextFormatType
} from 'lexical'
import { 
  $setBlocksType 
} from '@lexical/selection'
import { Bold, Italic, Underline, List, ListOrdered, Quote, Code, Heading1, Heading2, Undo, Redo } from 'lucide-react'
import { Button } from './button'

const theme = {
  ltr: 'ltr',
  rtl: 'rtl',
  placeholder: 'editor-placeholder',
  paragraph: 'editor-paragraph',
  quote: 'editor-quote',
  heading: {
    h1: 'editor-heading-h1',
    h2: 'editor-heading-h2',
    h3: 'editor-heading-h3',
  },
  list: {
    nested: {
      listitem: 'editor-nested-listitem',
    },
    ol: 'editor-list-ol',
    ul: 'editor-list-ul',
    listitem: 'editor-listitem',
  },
  text: {
    bold: 'editor-text-bold',
    italic: 'editor-text-italic',
    underline: 'editor-text-underline',
    code: 'editor-text-code',
  },
  code: 'editor-code',
}

function onError(error: Error) {
  console.error(error)
}

// Toolbar component
function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext()

  const formatText = useCallback((formatType: TextFormatType) => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, formatType)
  }, [editor])

  const formatHeading = useCallback((headingSize: 'h1' | 'h2' | 'h3') => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createHeadingNode(headingSize))
      }
    })
  }, [editor])

  const formatQuote = useCallback(() => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createQuoteNode())
      }
    })
  }, [editor])

  const handleUndo = useCallback(() => {
    editor.dispatchCommand(UNDO_COMMAND, undefined)
  }, [editor])

  const handleRedo = useCallback(() => {
    editor.dispatchCommand(REDO_COMMAND, undefined)
  }, [editor])

  const insertUnorderedList = useCallback(() => {
    editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
  }, [editor])

  const insertOrderedList = useCallback(() => {
    editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
  }, [editor])

  return (
    <div className="flex items-center gap-1 p-2 border-b border-gray-200 bg-gray-50 rounded-t-md flex-wrap">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => formatText('bold')}
        className="h-8 w-8 p-0"
        title="Negrita"
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => formatText('italic')}
        className="h-8 w-8 p-0"
        title="Cursiva"
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => formatText('underline')}
        className="h-8 w-8 p-0"
        title="Subrayado"
      >
        <Underline className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => formatText('code')}
        className="h-8 w-8 p-0"
        title="Código"
      >
        <Code className="h-4 w-4" />
      </Button>
      
      <div className="h-6 w-px bg-gray-300 mx-1" />
      
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => formatHeading('h1')}
        className="h-8 w-8 p-0"
        title="Título 1"
      >
        <Heading1 className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => formatHeading('h2')}
        className="h-8 w-8 p-0"
        title="Título 2"
      >
        <Heading2 className="h-4 w-4" />
      </Button>
      
      <div className="h-6 w-px bg-gray-300 mx-1" />
      
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={insertUnorderedList}
        className="h-8 w-8 p-0"
        title="Lista"
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={insertOrderedList}
        className="h-8 w-8 p-0"
        title="Lista numerada"
      >
        <ListOrdered className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={formatQuote}
        className="h-8 w-8 p-0"
        title="Cita"
      >
        <Quote className="h-4 w-4" />
      </Button>
      
      <div className="h-6 w-px bg-gray-300 mx-1" />
      
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={handleUndo}
        className="h-8 w-8 p-0"
        title="Deshacer"
      >
        <Undo className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={handleRedo}
        className="h-8 w-8 p-0"
        title="Rehacer"
      >
        <Redo className="h-4 w-4" />
      </Button>
    </div>
  )
}

// Update plugin to sync with external state
function OnChangePlugin({ 
  onChange 
}: { 
  onChange: (html: string) => void 
}) {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    const unregister = editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const htmlString = $generateHtmlFromNodes(editor, null)
        onChange(htmlString)
      })
    })
    
    return unregister
  }, [editor, onChange])

  return null
}

// Set initial content plugin
function InitialContentPlugin({ content }: { content: string }) {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    if (content && content.trim() !== '<p class="editor-paragraph"><br></p>') {
      editor.update(() => {
        const parser = new DOMParser()
        const dom = parser.parseFromString(content, 'text/html')
        const nodes = $generateNodesFromDOM(editor, dom)
        const root = $getRoot()
        root.clear()
        root.append(...nodes)
      })
    }
  }, [editor]) // Solo ejecutar una vez al montar

  return null
}

interface SimpleEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function SimpleEditor({ 
  value, 
  onChange, 
  placeholder = "Escribe tu contenido aquí...",
  className = ""
}: SimpleEditorProps) {
  const initialConfig = {
    namespace: 'SimpleEditor',
    theme,
    onError,
    nodes: [
      HeadingNode,
      ListNode,
      ListItemNode,
      QuoteNode,
      CodeNode,
      CodeHighlightNode,
      AutoLinkNode,
      LinkNode,
    ],
  }

  // Transformadores personalizados para evitar conflictos
  const customTransformers = [
    HEADING,
    QUOTE,
    UNORDERED_LIST,
    ORDERED_LIST,
    BOLD_STAR,
    ITALIC_STAR,
    INLINE_CODE
  ]

  return (
    <div className={`border border-gray-300 rounded-md ${className}`}>
      <LexicalComposer initialConfig={initialConfig}>
        <ToolbarPlugin />
        <div className="relative min-h-[200px]">          <RichTextPlugin
            contentEditable={
              <ContentEditable 
                className="outline-none p-4 min-h-[200px] prose prose-sm max-w-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                style={{
                  lineHeight: '1.6',
                }}
              />
            }
            placeholder={
              <div className="absolute top-4 left-4 text-gray-400 pointer-events-none select-none">
                {placeholder}
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <OnChangePlugin onChange={onChange} />
          <InitialContentPlugin content={value} />
          <HistoryPlugin />
          <LinkPlugin />
          <ListPlugin />
          <MarkdownShortcutPlugin transformers={customTransformers} />
        </div>
      </LexicalComposer>
    </div>
  )
}
