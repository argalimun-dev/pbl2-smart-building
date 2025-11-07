import './globals.css'
import type { ReactNode } from 'react'
import Navbar from '../components/Navbar'

export const metadata = {
  title: 'Memory Wall',
  description: 'Capture Every Moment'
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-800">
        <Navbar />
        <main className="max-w-5xl mx-auto p-6">
          {children}
        </main>
      </body>
    </html>
  )
}
