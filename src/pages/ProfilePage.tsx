import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useProfile } from '../hooks/useProfile'

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth()
  const { profile, loading: profileLoading, updateProfile } = useProfile(user?.id)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const [form, setForm] = useState({
    full_name: '',
    username: '',
    bio: '',
    website: '',
    twitter_handle: '',
  })

  // Redirect if not logged in
  if (!authLoading && !user) return <Navigate to="/login" replace />

  // Loading state
  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const handleEditClick = () => {
    setForm({
      full_name: profile?.full_name ?? '',
      username: profile?.username ?? '',
      bio: profile?.bio ?? '',
      website: profile?.website ?? '',
      twitter_handle: profile?.twitter_handle ?? '',
    })
    setSaveError(null)
    setSaveSuccess(false)
    setEditing(true)
  }

  const handleCancel = () => {
    setEditing(false)
    setSaveError(null)
  }

  const handleSave = async () => {
    setSaving(true)
    setSaveError(null)
    setSaveSuccess(false)

    const result = await updateProfile({
      full_name: form.full_name,
      username: form.username,
      bio: form.bio,
      website: form.website,
      twitter_handle: form.twitter_handle,
    })

    setSaving(false)

    if (result.success) {
      setSaveSuccess(true)
      setEditing(false)
    } else {
      setSaveError(result.error ?? 'Something went wrong')
    }
  }

  // Avatar initials fallback
  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0].toUpperCase() ?? '?'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto py-12 px-4">

        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">

          {/* Header band */}
          <div className="h-24 bg-indigo-700" />

          {/* Avatar + name row */}
          <div className="px-8 pb-6">
            <div className="flex items-end justify-between -mt-10 mb-6">
              <div className="w-20 h-20 rounded-full bg-indigo-500 border-4 border-white flex items-center justify-center text-white text-xl font-medium shadow">
                {profile?.avatar_url
                  ? <img src={profile.avatar_url} alt="avatar" className="w-full h-full rounded-full object-cover" />
                  : initials
                }
              </div>
              {!editing && (
                <button
                  onClick={handleEditClick}
                  className="text-sm font-medium text-indigo-600 border border-indigo-200 rounded-lg px-4 py-2 hover:bg-indigo-50 transition-colors"
                >
                  Edit profile
                </button>
              )}
            </div>

            {/* View mode */}
            {!editing && (
              <div>
                <h1 className="text-xl font-medium text-gray-900">
                  {profile?.full_name ?? 'No name set'}
                </h1>
                {profile?.username && (
                  <p className="text-sm text-indigo-600 mt-0.5">@{profile.username}</p>
                )}
                {profile?.bio && (
                  <p className="text-sm text-gray-600 mt-3 leading-relaxed">{profile.bio}</p>
                )}
                <div className="mt-4 flex flex-col gap-1.5">
                  {profile?.website && (
                    
                    <a
                  href={profile.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-indigo-500 hover:underline"
                    >
                      {profile.website}
                    </a>
                  )}
                  {profile?.twitter_handle && (
                    
                     <a
                      href={`https://twitter.com/${profile.twitter_handle}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-indigo-500 hover:underline"
                    >
                      @{profile.twitter_handle} on X
                    </a>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-4">
                  Member since {new Date(profile?.created_at ?? '').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
                {saveSuccess && (
                  <p className="text-sm text-green-600 mt-3">Profile updated successfully.</p>
                )}
              </div>
            )}

            {/* Edit mode */}
            {editing && (
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Full name</label>
                  <input
                    type="text"
                    value={form.full_name}
                    onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Username</label>
                  <input
                    type="text"
                    value={form.username}
                    onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="yourhandle"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Bio</label>
                  <textarea
                    value={form.bio}
                    onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                    rows={3}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    placeholder="Tell readers a little about yourself"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Website</label>
                  <input
                    type="url"
                    value={form.website}
                    onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="https://yoursite.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">X (Twitter) handle</label>
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500">
                    <span className="px-3 py-2 text-sm text-gray-400 bg-gray-50 border-r border-gray-200">@</span>
                    <input
                      type="text"
                      value={form.twitter_handle}
                      onChange={e => setForm(f => ({ ...f, twitter_handle: e.target.value }))}
                      className="flex-1 px-3 py-2 text-sm text-gray-900 focus:outline-none"
                      placeholder="yourhandle"
                    />
                  </div>
                </div>

                {saveError && (
                  <p className="text-sm text-red-500">{saveError}</p>
                )}

                <div className="flex gap-3 pt-1">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-indigo-600 text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                  >
                    {saving ? 'Saving...' : 'Save changes'}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="text-sm text-gray-500 px-5 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
