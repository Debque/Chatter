import { useState, useEffect, useRef } from 'react'
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
  const [currentPostId, setCurrentPostId] = useState<string | null>(postId)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Generate a slug from the title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 80)
      + '-' + Date.now()
  }

  // Calculate reading time from HTML content
  const calculateReadingTime = (html: string) => {
    const text = html.replace(/<[^>]+>/g, '')
    const words = text.trim().split(/\s+/).length
    return Math.ceil(words / 200)
  }

  const save = async () => {
    if (!title.trim() && !content.trim()) return
    if (!authorId) return

    setSaving(true)

    try {
      if (currentPostId) {
        // Update existing draft
        const { error } = await supabase
          .from('posts')
          .update({
            title,
            body: content,
            reading_time: calculateReadingTime(content),
            updated_at: new Date().toISOString(),
          })
          .eq('id', currentPostId)

        if (error) throw error
      } else {
        // Create new draft
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
        setCurrentPostId(data.id)
      }

      setLastSaved(new Date())
    } catch (err) {
      console.error('Autosave failed:', err)
    } finally {
      setSaving(false)
    }
  }

  // Run autosave on interval
  useEffect(() => {
    timerRef.current = setInterval(save, interval)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [title, content, currentPostId, authorId])

  return { saving, lastSaved, currentPostId, saveNow: save }
}