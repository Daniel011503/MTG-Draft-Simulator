export default function Home() {
  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-8">
          Welcome to MTG Draft Simulator
        </h1>
        <p className="text-xl text-gray-300 mb-8">
          Practice Magic: The Gathering drafts with real-time multiplayer experience
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Join Draft</h3>
            <p className="text-gray-300 mb-4">
              Join an existing draft pod and start practicing
            </p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
              Browse Drafts
            </button>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Create Draft</h3>
            <p className="text-gray-300 mb-4">
              Start a new draft pod and invite friends
            </p>
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md">
              Create New
            </button>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Practice Mode</h3>
            <p className="text-gray-300 mb-4">
              Draft against AI bots to practice
            </p>
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md">
              Start Practice
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
