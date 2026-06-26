import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useAutosave } from '../hooks/useAutosave'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Editor from '../components/editor/Editor'

export default function WritePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [publishing, setPublishing] = useState(false)
  const [publishError, setPublishError] = useState<string | null>(null)

  const { saving, lastSaved, saveNow } = useAutosave({
    postId: null,
    title,
    content,
    authorId: user?.id ?? '',
  })

  const handlePublish = async () => {
    if (!title.trim()) {
      setPublishError('Please add a title before publishing.')
      return
    }
    if (!content.trim()) {
      setPublishError('Please add some content before publishing.')
      return
    }

    setPublishing(true)
    setPublishError(null)

   const savedId = await saveNow()

if (!savedId) {
  setPublishError('Could not save post. Please try again.')
  setPublishing(false)
  return
}

    try {
      const slug = title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .slice(0, 80)

      const { error } = await supabase
        .from('posts')
        .update({
          status: 'published',
          slug,
          published_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
       .eq('id', savedId)

      if (error) throw error

      navigate(`/post/${slug}`)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      setPublishError(message)
      setPublishing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto py-12 px-4">

        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <span className="text-xs text-gray-400">
            {saving
              ? 'Saving...'
              : lastSaved
              ? `Last saved at ${lastSaved.toLocaleTimeString()}`
              : 'Not saved yet'}
          </span>

          <button
            onClick={handlePublish}
            disabled={publishing}
            className="bg-indigo-600 text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {publishing ? 'Publishing...' : 'Publish'}
          </button>
        </div>

        {/* Error */}
        {publishError && (
          <p className="text-sm text-red-500 mb-4">{publishError}</p>
        )}

        {/* Title */}
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