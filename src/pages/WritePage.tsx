import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useAutosave } from '../hooks/useAutosave'
import Editor from '../components/editor/Editor'

export default function WritePage() {
  const { user } = useAuth()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  const { saving, lastSaved } = useAutosave({
    postId: null,
    title,
    content,
    authorId: user?.id ?? '',
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto py-12 px-4">

        {/* Save status */}
        <div className="flex items-center justify-between mb-6">
          <span className="text-xs text-gray-400">
            {saving
              ? 'Saving...'
              : lastSaved
              ? `Last saved at ${lastSaved.toLocaleTimeString()}`
              : 'Not saved yet'}
          </span>
        </div>

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

      </div>
    </div>
  )
}