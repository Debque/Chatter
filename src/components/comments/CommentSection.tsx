import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useComments } from '../../hooks/useComments'
import type { Comment } from '../../types'

function CommentForm({
  onSubmit,
  submitting,
  placeholder = 'Write a comment...',
}: {
  onSubmit: (body: string) => void
  submitting: boolean
  placeholder?: string
}) {
  const [body, setBody] = useState('')

  const handleSubmit = () => {
    if (!body.trim()) return
    onSubmit(body)
    setBody('')
  }

  return (
    <div className="flex flex-col gap-2">
      <textarea
        value={body}
        onChange={e => setBody(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
      />
      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={submitting || !body.trim()}
          className="bg-indigo-600 text-white text-sm font-medium px-4 py-1.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {submitting ? 'Posting...' : 'Post'}
        </button>
      </div>
    </div>
  )
}

function CommentItem({
  comment,
  replies,
  onReply,
  submitting,
}: {
  comment: Comment
  replies: Comment[]
  onReply: (body: string, parentId: string) => void
  submitting: boolean
}) {
  const [showReplyForm, setShowReplyForm] = useState(false)

  return (
    <div className="flex flex-col gap-3">
      {/* Comment */}
      <div className="flex gap-3">
        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-medium flex-shrink-0">
          ?
        </div>
        <div className="flex-1">
          <div className="bg-gray-50 rounded-xl px-4 py-3">
            <p className="text-xs text-gray-400 mb-1">
              {new Date(comment.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
            <p className="text-sm text-gray-700 leading-relaxed">{comment.body}</p>
          </div>
          <button
            onClick={() => setShowReplyForm(prev => !prev)}
            className="text-xs text-gray-400 hover:text-indigo-600 mt-1 ml-2 transition-colors"
          >
            Reply
          </button>
        </div>
      </div>

      {/* Replies */}
      {replies.length > 0 && (
        <div className="ml-11 flex flex-col gap-3">
          {replies.map(reply => (
            <div key={reply.id} className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-medium flex-shrink-0">
                ?
              </div>
              <div className="flex-1 bg-gray-50 rounded-xl px-4 py-3">
                <p className="text-xs text-gray-400 mb-1">
                  {new Date(reply.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
                <p className="text-sm text-gray-700 leading-relaxed">{reply.body}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reply form */}
      {showReplyForm && (
        <div className="ml-11">
          <CommentForm
            onSubmit={body => {
              onReply(body, comment.id)
              setShowReplyForm(false)
            }}
            submitting={submitting}
            placeholder="Write a reply..."
          />
        </div>
      )}
    </div>
  )
}

export default function CommentSection({ postId }: { postId: string }) {
  const { user } = useAuth()
  const { topLevel, replies, loading, submitting, addComment } = useComments(postId)

  return (
    <div className="mt-12 border-t border-gray-100 pt-8">
      <h3 className="text-base font-semibold text-gray-900 mb-6">
        Comments ({topLevel.length})
      </h3>

      {/* New comment form */}
      {user ? (
        <div className="mb-8">
          <CommentForm
            onSubmit={body => addComment(body, null)}
            submitting={submitting}
          />
        </div>
      ) : (
        <p className="text-sm text-gray-400 mb-8">
          Sign in to leave a comment.
        </p>
      )}

      {/* Comments list */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : topLevel.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">
          No comments yet. Be the first to comment.
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          {topLevel.map(comment => (
            <CommentItem
              key={comment.id}
              comment={comment}
              replies={replies(comment.id)}
              onReply={addComment}
              submitting={submitting}
            />
          ))}
        </div>
      )}
    </div>
  )
}