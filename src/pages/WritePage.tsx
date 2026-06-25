import { useState } from 'react'
import Editor from '../components/editor/Editor'

export default function WritePage() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto py-12 px-4">

        {/* Title input */}
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Post title..."
          className="w-full text-3xl font-medium text-gray-900 bg-transparent border-none outline-none placeholder-gray-300 mb-6"
        />

        {/* Editor */}
        <Editor content={content} onChange={setContent} />

        {/* Debug — remove later */}
        <div className="mt-6 p-4 bg-white border border-gray-200 rounded-xl">
          <p className="text-xs text-gray-400 mb-2">HTML output preview:</p>
          <p className="text-sm text-gray-600 break-all">{content}</p>
        </div>

      </div>
    </div>
  )
}