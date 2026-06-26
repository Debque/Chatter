import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import type { Comment } from '../types'

export function useComments(postId: string) {
  const { user } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let cancelled = false

    const fetchComments = async () => {
      try {
        const { data, error } = await supabase
          .from('comments')
          .select('*')
          .eq('post_id', postId)
          .order('created_at', { ascending: true })

        if (cancelled) return
        if (error) throw error
        setComments(data ?? [])
      } catch (err) {
        console.error('Failed to load comments:', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchComments()
    return () => { cancelled = true }
  }, [postId])

  const addComment = async (body: string, parentId: string | null = null) => {
    if (!user || !body.trim()) return

    setSubmitting(true)

    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          author_id: user.id,
          parent_id: parentId,
          body: body.trim(),
        })
        .select('*')
        .single()

      if (error) throw error

      // Add new comment to local state instantly
      setComments(prev => [...prev, data])
    } catch (err) {
      console.error('Failed to add comment:', err)
    } finally {
      setSubmitting(false)
    }
  }

  // Split into top-level and replies
  const topLevel = comments.filter(c => c.parent_id === null)
  const replies = (parentId: string) =>
    comments.filter(c => c.parent_id === parentId)

  return { comments, topLevel, replies, loading, submitting, addComment }
}