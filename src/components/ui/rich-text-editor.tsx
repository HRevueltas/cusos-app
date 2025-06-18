"use client"

import { useEffect, useRef } from "react"
import dynamic from "next/dynamic"

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill"), {
  ssr: false,
  loading: () => <div className="h-32 bg-gray-100 rounded animate-pulse"></div>
})

import "react-quill/dist/quill.snow.css"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  error?: string
  className?: string
  minHeight?: string
}

const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'script': 'sub'}, { 'script': 'super' }],
    [{ 'indent': '-1'}, { 'indent': '+1' }],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'align': [] }],
    ['link', 'image', 'video'],
    ['code-block'],
    ['clean']
  ],
}

const formats = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'list', 'bullet',
  'script',
  'indent',
  'color', 'background',
  'align',
  'link', 'image', 'video',
  'code-block'
]

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Escribe tu contenido aquí...",
  error,
  className = "",
  minHeight = "200px"
}: RichTextEditorProps) {
  const quillRef = useRef<any>(null)

  useEffect(() => {
    // Set custom styles for the editor
    if (quillRef.current) {
      const editor = quillRef.current.getEditor()
      const container = editor.container
      container.style.minHeight = minHeight
    }
  }, [minHeight])

  return (
    <div className={`rich-text-editor ${className}`}>
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        style={{
          backgroundColor: 'white',
          borderRadius: '6px'
        }}
        className={error ? "border-red-500" : ""}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
      
      <style jsx global>{`
        .rich-text-editor .ql-editor {
          min-height: ${minHeight};
          font-size: 14px;
          line-height: 1.6;
        }
        
        .rich-text-editor .ql-toolbar {
          border-top: 1px solid #e5e7eb;
          border-left: 1px solid #e5e7eb;
          border-right: 1px solid #e5e7eb;
          border-bottom: none;
          border-radius: 6px 6px 0 0;
        }
        
        .rich-text-editor .ql-container {
          border-bottom: 1px solid #e5e7eb;
          border-left: 1px solid #e5e7eb;
          border-right: 1px solid #e5e7eb;
          border-top: none;
          border-radius: 0 0 6px 6px;
        }
        
        .rich-text-editor.border-red-500 .ql-toolbar,
        .rich-text-editor.border-red-500 .ql-container {
          border-color: #ef4444;
        }
        
        .ql-editor.ql-blank::before {
          color: #9ca3af;
          font-style: normal;
        }
      `}</style>
    </div>
  )
}
