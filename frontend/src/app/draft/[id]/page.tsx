'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

interface Card {
  id: string
  name: string
  mana_cost: string
  type_line: string
  rarity: string
  image_uris: {
    normal: string
  }
}

interface Pack {
  id: string
  cards: Card[]
  pack_number: number
}

interface Pick {
  id: string
  card_id: string
  pick_number: number
  pack_number: number
  card: Card
}

export default function DraftPage() {
  const params = useParams()
  const router = useRouter()
  const draftId = params.id as string
  
  const [token, setToken] = useState<string | null>(null)
  const [pack, setPack] = useState<Pack | null>(null)
  const [picks, setPicks] = useState<Pick[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [draftStatus, setDraftStatus] = useState('')
  const [currentPack, setCurrentPack] = useState(1)
  const [currentPick, setCurrentPick] = useState(1)

  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    if (!savedToken) {
      router.push('/')
      return
    }
    setToken(savedToken)
    fetchCurrentPack(savedToken)
    fetchPicks(savedToken)
    
    // Set up polling for new packs
    const interval = setInterval(() => {
      fetchCurrentPack(savedToken)
      fetchPicks(savedToken)
    }, 3000) // Check every 3 seconds
    
    return () => clearInterval(interval)
  }, [draftId, router])

  const fetchCurrentPack = async (authToken: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/drafts/${draftId}/pack`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setPack(data.pack)
        setDraftStatus(data.draft_status)
        setCurrentPack(data.current_pack)
        setCurrentPick(data.current_pick)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to fetch pack')
      }
    } catch (error) {
      setError('Network error occurred')
    }
  }

  const fetchPicks = async (authToken: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/drafts/${draftId}/picks`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setPicks(data.picks)
      }
    } catch (error) {
      console.error('Failed to fetch picks:', error)
    }
  }

  const pickCard = async (cardId: string) => {
    if (!token) return

    setLoading(true)
    setError('') // Clear any previous errors
    
    try {
      const response = await fetch(`http://localhost:3001/api/drafts/${draftId}/pick`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ cardId })
      })

      if (response.ok) {
        // Give a moment for bot picks to process
        setTimeout(() => {
          fetchCurrentPack(token)
          fetchPicks(token)
        }, 2000)
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to pick card')
      }
    } catch (error) {
      setError('Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'mythic': return 'border-orange-500'
      case 'rare': return 'border-yellow-500'
      case 'uncommon': return 'border-gray-400'
      default: return 'border-gray-600'
    }
  }

  if (!token) {
    return <div className="text-white">Redirecting...</div>
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Draft in Progress</h1>
            <p className="text-gray-300">
              Pack {currentPack} • Pick {currentPick} • Status: {draftStatus}
            </p>
          </div>
          <button
            onClick={() => router.push('/')}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md"
          >
            Back to Lobby
          </button>
        </div>

        {error && (
          <div className="bg-red-600 text-white p-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Pack */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-white mb-4">Current Pack</h2>
            {pack && pack.cards.length > 0 ? (
              <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                {pack.cards.map((card) => (
                  <div
                    key={card.id}
                    className={`bg-gray-800 rounded-lg border-2 ${getRarityColor(card.rarity)} cursor-pointer hover:bg-gray-700 transition-colors ${loading ? 'opacity-50' : ''}`}
                    onClick={() => !loading && pickCard(card.id)}
                  >
                    <div className="aspect-[3/4] bg-gray-700 rounded-t-lg flex items-center justify-center">
                      <img 
                        src={card.image_uris?.normal || '/placeholder-card.svg'} 
                        alt={card.name}
                        className="w-full h-full object-cover rounded-t-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = '/placeholder-card.svg'
                        }}
                      />
                    </div>
                    <div className="p-2">
                      <h3 className="text-white text-sm font-semibold truncate">{card.name}</h3>
                      <p className="text-gray-400 text-xs">{card.mana_cost}</p>
                      <p className="text-gray-400 text-xs capitalize">{card.rarity}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-800 rounded-lg p-8 text-center">
                <p className="text-gray-400 text-lg">
                  {pack === null ? 'No pack available' : 'Waiting for next pack...'}
                </p>
                <button
                  onClick={() => token && fetchCurrentPack(token)}
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                >
                  Refresh
                </button>
              </div>
            )}
          </div>

          {/* Drafted Cards */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Your Picks ({picks.length})</h2>
            <div className="max-h-96 overflow-y-auto">
              {picks.length > 0 ? (
                <div className="space-y-2">
                  {picks.map((pick) => (
                    <div key={pick.id} className="bg-gray-800 rounded-lg p-3">
                      <h3 className="text-white text-sm font-semibold">{pick.card.name}</h3>
                      <p className="text-gray-400 text-xs">
                        Pack {pick.pack_number} • Pick {pick.pick_number}
                      </p>
                      <p className="text-gray-400 text-xs capitalize">{pick.card.rarity || 'common'}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-800 rounded-lg p-4 text-center">
                  <p className="text-gray-400">No cards picked yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
