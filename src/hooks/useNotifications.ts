import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export interface Notification {
  id: string
  user_id: string
  type: string
  payload: Record<string, string>
  read_at: string | null
  created_at: string
}

export function useNotifications() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const unreadCount = notifications.filter(n => !n.read_at).length

  useEffect(() => {
    if (!user) return

    let cancelled = false

    const fetchNotifications = async () => {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20)

        if (cancelled) return
        if (error) throw error
        setNotifications(data ?? [])
      } catch (err) {
        console.error('Failed to load notifications:', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchNotifications()
    return () => { cancelled = true }
  }, [user])

  const markAllRead = async () => {
    if (!user) return

    const now = new Date().toISOString()

    setNotifications(prev =>
      prev.map(n => ({ ...n, read_at: n.read_at ?? now }))
    )

    await supabase
      .from('notifications')
      .update({ read_at: now })
      .eq('user_id', user.id)
      .is('read_at', null)
  }

  const markRead = async (id: string) => {
    const now = new Date().toISOString()

    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read_at: now } : n)
    )

    await supabase
      .from('notifications')
      .update({ read_at: now })
      .eq('id', id)
  }

  return { notifications, loading, unreadCount, markAllRead, markRead }
}