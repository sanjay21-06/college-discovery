'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    setUser(null)
    router.push('/')
  }

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-blue-600 text-white font-bold px-3 py-1 rounded-lg text-lg">CD</div>
          <span className="font-bold text-xl text-gray-800">CollegeDiscover</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-gray-600 hover:text-blue-600 font-medium transition">
            Colleges
          </Link>
          <Link href="/compare" className="text-gray-600 hover:text-blue-600 font-medium transition">
            Compare
          </Link>
          {user && (
            <Link href="/saved" className="text-gray-600 hover:text-blue-600 font-medium transition">
              Saved
            </Link>
          )}

          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2">
                <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {user.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-blue-800 text-sm font-medium max-w-32 truncate">
                  {user.email?.split('@')[0]}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-red-500 text-sm font-medium transition border border-gray-200 px-3 py-2 rounded-lg hover:border-red-200 hover:bg-red-50"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Login
            </Link>
          )}
        </div>

        <button className="md:hidden text-gray-600" onClick={() => setMenuOpen(!menuOpen)}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white border-t px-4 py-3 flex flex-col gap-3">
          <Link href="/" className="text-gray-600 font-medium">Colleges</Link>
          <Link href="/compare" className="text-gray-600 font-medium">Compare</Link>
          {user && <Link href="/saved" className="text-gray-600 font-medium">Saved</Link>}
          {user ? (
            <button onClick={handleLogout} className="text-red-500 font-medium text-left">Sign Out</button>
          ) : (
            <Link href="/auth/login" className="text-blue-600 font-medium">Login</Link>
          )}
        </div>
      )}
    </nav>
  )
}