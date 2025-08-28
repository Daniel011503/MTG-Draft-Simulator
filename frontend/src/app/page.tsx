'use client'
import { useState, useEffect } from 'react'

interface User {
  id: string
  email: string
  username: string
}

interface Draft {
  id: string
  name: string
  set_code: string
  status: string
  max_players: number
  current_players: number
  created_at: string
  position?: number
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [activeDrafts, setActiveDrafts] = useState<Draft[]>([])
  const [showCreateDraft, setShowCreateDraft] = useState(false)

  // Auth form state
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Draft creation state
  const [draftName, setDraftName] = useState('')
  const [setCode, setSetCode] = useState('LTR')

  useEffect(() => {
    // Check for existing token
    const savedToken = localStorage.getItem('token')
    if (savedToken) {
      setToken(savedToken)
      fetchUserInfo(savedToken)
    }
    fetchDrafts()
    if (savedToken) {
      fetchActiveDrafts(savedToken)
    }
  }, [])

  const fetchUserInfo = async (token: string) => {
    try {
      const response = await fetch('http://localhost:3001/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      }
    } catch (error) {
      console.error('Failed to fetch user info:', error)
    }
  }

  const fetchDrafts = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/drafts')
      if (response.ok) {
        const data = await response.json()
        setDrafts(data.drafts)
      }
    } catch (error) {
      console.error('Failed to fetch drafts:', error)
    }
  }

  const fetchActiveDrafts = async (token: string) => {
    try {
      const response = await fetch('http://localhost:3001/api/drafts/my-active', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setActiveDrafts(data.drafts)
      }
    } catch (error) {
      console.error('Failed to fetch active drafts:', error)
    }
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const endpoint = authMode === 'login' ? '/auth/login' : '/auth/register'
      const body = authMode === 'login' 
        ? { email, password }
        : { email, username, password }

      const response = await fetch(`http://localhost:3001${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })

      const data = await response.json()

      if (response.ok) {
        setToken(data.token)
        setUser(data.user)
        localStorage.setItem('token', data.token)
        setShowAuthModal(false)
        setEmail('')
        setUsername('')
        setPassword('')
        fetchActiveDrafts(data.token)
      } else {
        setError(data.error || 'Authentication failed')
      }
    } catch (error) {
      setError('Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateDraft = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return

    setLoading(true)
    try {
      const response = await fetch('http://localhost:3001/api/drafts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: draftName,
          setCode: setCode,
          maxPlayers: 8
        })
      })

      if (response.ok) {
        setShowCreateDraft(false)
        setDraftName('')
        fetchDrafts()
        alert('Draft created successfully!')
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to create draft')
      }
    } catch (error) {
      alert('Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  const joinDraft = async (draftId: string) => {
    if (!token) {
      setShowAuthModal(true)
      return
    }

    try {
      const response = await fetch(`http://localhost:3001/api/drafts/${draftId}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        alert('Joined draft successfully!')
        fetchDrafts()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to join draft')
      }
    } catch (error) {
      alert('Network error occurred')
    }
  }

  const startPractice = async () => {
    if (!token) {
      setShowAuthModal(true)
      return
    }

    setLoading(true)
    try {
      // Create a practice draft
      const createResponse = await fetch('http://localhost:3001/api/drafts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: `Practice Draft - ${new Date().toLocaleTimeString()}`,
          setCode: 'LTR',
          maxPlayers: 8
        })
      })

      if (!createResponse.ok) {
        const data = await createResponse.json()
        alert(data.error || 'Failed to create practice draft')
        return
      }

      const draftData = await createResponse.json()
      const draftId = draftData.draft.id

      // Start the draft immediately (this will fill with bots)
      const startResponse = await fetch(`http://localhost:3001/api/drafts/${draftId}/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: '{}'
      })

      if (startResponse.ok) {
        const startData = await startResponse.json()
        // Redirect to the draft page
        window.location.href = `/draft/${draftId}`
      } else {
        const data = await startResponse.json()
        alert(data.error || 'Failed to start practice draft')
      }
    } catch (error) {
      alert('Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-8">
          Welcome to MTG Draft Simulator
        </h1>
        <p className="text-xl text-gray-300 mb-8">
          Practice Magic: The Gathering drafts with real-time multiplayer experience
        </p>

        {/* User info / Auth buttons */}
        <div className="mb-8">
          {user ? (
            <div className="flex items-center justify-center gap-4">
              <span className="text-white">Welcome, {user.username}!</span>
              <button 
                onClick={logout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-4">
              <button 
                onClick={() => { setAuthMode('login'); setShowAuthModal(true) }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
              >
                Login
              </button>
              <button 
                onClick={() => { setAuthMode('register'); setShowAuthModal(true) }}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md"
              >
                Register
              </button>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          {/* Active Drafts */}
          {user && activeDrafts.length > 0 && (
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Your Active Drafts</h3>
              <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
                {activeDrafts.map(draft => (
                  <div key={draft.id} className="bg-gray-700 p-3 rounded text-left">
                    <div className="font-medium text-white">{draft.name}</div>
                    <div className="text-sm text-gray-300">
                      {draft.set_code} • Position {draft.position}
                    </div>
                    <button 
                      onClick={() => window.location.href = `/draft/${draft.id}`}
                      className="mt-2 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                    >
                      Continue Draft
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Available Drafts</h3>
            <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
              {drafts.length === 0 ? (
                <p className="text-gray-400 text-sm">No active drafts</p>
              ) : (
                drafts.map(draft => (
                  <div key={draft.id} className="bg-gray-700 p-3 rounded text-left">
                    <div className="font-medium text-white">{draft.name}</div>
                    <div className="text-sm text-gray-300">
                      {draft.set_code} • {draft.current_players}/{draft.max_players} players
                    </div>
                    <button 
                      onClick={() => joinDraft(draft.id)}
                      className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                    >
                      Join
                    </button>
                  </div>
                ))
              )}
            </div>
            <button 
              onClick={fetchDrafts}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            >
              Refresh
            </button>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Create Draft</h3>
            <p className="text-gray-300 mb-4">
              Start a new draft pod and invite friends
            </p>
            <button 
              onClick={() => user ? setShowCreateDraft(true) : setShowAuthModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
            >
              {user ? 'Create New' : 'Login to Create'}
            </button>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Practice Mode</h3>
            <p className="text-gray-300 mb-4">
              Draft against AI bots to practice
            </p>
            <button 
              onClick={() => user ? startPractice() : setShowAuthModal(true)}
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
            >
              {loading ? 'Starting...' : (user ? 'Start Practice' : 'Login to Practice')}
            </button>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-white mb-4">
              {authMode === 'login' ? 'Login' : 'Register'}
            </h2>
            {error && (
              <div className="bg-red-600 text-white p-3 rounded mb-4">
                {error}
              </div>
            )}
            <form onSubmit={handleAuth} className="space-y-4">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 bg-gray-700 text-white rounded border border-gray-600"
                required
              />
              {authMode === 'register' && (
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-3 bg-gray-700 text-white rounded border border-gray-600"
                  required
                />
              )}
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 bg-gray-700 text-white rounded border border-gray-600"
                required
              />
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded disabled:opacity-50"
                >
                  {loading ? 'Loading...' : (authMode === 'login' ? 'Login' : 'Register')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAuthModal(false)}
                  className="px-6 bg-gray-600 hover:bg-gray-700 text-white p-3 rounded"
                >
                  Cancel
                </button>
              </div>
            </form>
            <div className="mt-4 text-center">
              <button
                onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                className="text-blue-400 hover:text-blue-300"
              >
                {authMode === 'login' ? 'Need an account? Register' : 'Have an account? Login'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Draft Modal */}
      {showCreateDraft && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-white mb-4">Create New Draft</h2>
            <form onSubmit={handleCreateDraft} className="space-y-4">
              <input
                type="text"
                placeholder="Draft Name"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                className="w-full p-3 bg-gray-700 text-white rounded border border-gray-600"
                required
              />
              <select
                value={setCode}
                onChange={(e) => setSetCode(e.target.value)}
                className="w-full p-3 bg-gray-700 text-white rounded border border-gray-600"
                required
              >
                <option value="LTR">Lord of the Rings (LTR)</option>
                <option value="WOE">Wilds of Eldraine (WOE)</option>
                <option value="LCI">Lost Caverns of Ixalan (LCI)</option>
                <option value="MKM">Murders at Karlov Manor (MKM)</option>
              </select>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white p-3 rounded disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Draft'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateDraft(false)}
                  className="px-6 bg-gray-600 hover:bg-gray-700 text-white p-3 rounded"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
