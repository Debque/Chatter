import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'

interface AutosaveOptions {
  postId: string | null
  title: string
  content: string
  authorId: string
  interval?: number
}

export function useAutosave({
  postId,
  title,
  content,
  authorId,
  interval = 30000,
}: AutosaveOptions) {
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const postIdRef = useRef<string | null>(postId)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const generateSlug = (t: string) => {
    return (
      t.toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .slice(0, 80) +
      '-' +
      Date.now()
    )
  }

  const calculateReadingTime = (html: string) => {
    const text = html.replace(/<[^>]+>/g, '')
    const words = text.trim().split(/\s+/).length
    return Math.ceil(words / 200)
  }

  const save = useCallback(async (): Promise<string | null> => {
    if (!title.trim() && !content.trim()) return postIdRef.current
    if (!authorId) return postIdRef.current

    setSaving(true)

    try {
      if (postIdRef.current) {
        const { error } = await supabase
          .from('posts')
          .update({
            title,
            body: content,
            reading_time: calculateReadingTime(content),
            updated_at: new Date().toISOString(),
          })
          .eq('id', postIdRef.current)

        if (error) throw error
      } else {
        const { data, error } = await supabase
          .from('posts')
          .insert({
            author_id: authorId,
            title: title || 'Untitled',
            slug: generateSlug(title || 'untitled'),
            body: content,
            status: 'draft',
            reading_time: calculateReadingTime(content),
          })
          .select('id')
          .single()

        if (error) throw error
        postIdRef.current = data.id
      }

      setLastSaved(new Date())
      return postIdRef.current
    } catch (err) {
      console.error('Autosave failed:', err)
      return postIdRef.current
    } finally {
      setSaving(false)
    }
  }, [title, content, authorId])

  useEffect(() => {
    timerRef.current = setInterval(save, interval)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [save, interval])

  return { saving, lastSaved, saveNow: save }
}