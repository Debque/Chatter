import { Bell, Heart, MessageCircle, UserPlus, Bookmark } from 'lucide-react'
import { useNotifications } from '../hooks/useNotifications'
import type { Notification } from '../hooks/useNotifications'

function notificationIcon(type: string) {
  switch (type) {
    case 'like':     return <Heart size={16} className="text-red-500" />
    case 'comment':  return <MessageCircle size={16} className="text-indigo-500" />
    case 'follow':   return <UserPlus size={16} className="text-green-500" />
    case 'bookmark': return <Bookmark size={16} className="text-yellow-500" />
    default:         return <Bell size={16} className="text-gray-400" />
  }
}

function notificationText(n: Notification) {
  switch (n.type) {
    case 'like':
      return <span><strong>{n.payload.actor_name ?? 'Someone'}</strong> liked your post <strong>"{n.payload.post_title}"</strong></span>
    case 'comment':
      return <span><strong>{n.payload.actor_name ?? 'Someone'}</strong> commented on <strong>"{n.payload.post_title}"</strong></span>
    case 'follow':
      return <span><strong>{n.payload.actor_name ?? 'Someone'}</strong> started following you</span>
    case 'bookmark':
      return <span><strong>{n.payload.actor_name ?? 'Someone'}</strong> bookmarked your post <strong>"{n.payload.post_title}"</strong></span>
    default:
      return <span>You have a new notification</span>
  }
}

export default function NotificationsPage() {
  const { notifications, loading, unreadCount, markAllRead, markRead } = useNotifications()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto py-12 px-4">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            {unreadCount > 0 && (
              <span className="bg-indigo-600 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-sm text-indigo-600 hover:underline"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-20">
            <Bell size={32} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No notifications yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {notifications.map(n => (
              <div
                key={n.id}
                onClick={() => markRead(n.id)}
                className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-colors ${
                  n.read_at
                    ? 'bg-white border-gray-100 text-gray-500'
                    : 'bg-indigo-50 border-indigo-100 text-gray-900'
                }`}
              >
                <div className="mt-0.5 flex-shrink-0">
                  {notificationIcon(n.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-relaxed">
                    {notificationText(n)}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(n.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                {!n.read_at && (
                  <div className="w-2 h-2 rounded-full bg-indigo-600 flex-shrink-0 mt-1.5" />
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}