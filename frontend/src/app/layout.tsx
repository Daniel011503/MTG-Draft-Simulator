import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MTG Draft Simulator',
  description: 'Practice Magic: The Gathering drafts with real-time multiplayer',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-900 text-white">
        <nav className="bg-gray-800 border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-bold text-white">
                  MTG Draft Simulator
                </h1>
              </div>
              <div className="flex space-x-4">
                <a href="/" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                  Home
                </a>
                <a href="/drafts" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                  Drafts
                </a>
              </div>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </body>
    </html>
  )
}
