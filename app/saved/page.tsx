'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { College } from '@/types'
import Navbar from '@/components/Navbar'
import CollegeCard from '@/components/CollegeCard'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function SavedPage() {
  const router = useRouter()
  const [colleges, setColleges] = useState<College[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [compareList, setCompareList] = useState<College[]>([])

  useEffect(() => {
    checkUserAndFetch()
  }, [])

  async function checkUserAndFetch() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login')
      return
    }
    setUser(user)
    fetchSaved(user.id)
  }

  async function fetchSaved(userId: string) {
    setLoading(true)
    const { data, error } = await supabase
      .from('saved_colleges')
      .select(`
        college_id,
        colleges (
          id, name, location, state, type,
          fees_min, fees_max, rating, total_reviews,
          logo_url, description, placement_percent,
          avg_package, highest_package, established,
          affiliated_to, approved_by
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Fetch saved error:', error)
      setLoading(false)
      return
    }

    const savedColleges = (data || [])
      .map((row: any) => row.colleges)
      .filter(Boolean)

    setColleges(savedColleges)
    setLoading(false)
  }

  async function handleUnsave(collegeId: string) {
    if (!user) return
    await supabase
      .from('saved_colleges')
      .delete()
      .eq('user_id', user.id)
      .eq('college_id', collegeId)
    setColleges(prev => prev.filter(c => c.id !== collegeId))
  }

  function handleCompare(college: College) {
    setCompareList(prev => {
      const exists = prev.find(c => c.id === college.id)
      if (exists) return prev.filter(c => c.id !== college.id)
      if (prev.length >= 3) { alert('Max 3 colleges'); return prev }
      return [...prev, college]
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl h-64 animate-pulse border border-gray-100" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="bg-gradient-to-br from-blue-800 to-blue-950 text-white py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 text-blue-300 text-sm mb-4">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <span>/</span>
            <span className="text-white">Saved Colleges</span>
          </div>
          <h1 className="text-3xl font-bold mb-1">My Saved Colleges</h1>
          <p className="text-blue-200">
            {user?.email} · {colleges.length} college{colleges.length !== 1 ? 's' : ''} saved
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {colleges.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-6xl mb-4">🔖</p>
            <p className="text-gray-500 text-lg font-medium">No saved colleges yet</p>
            <p className="text-gray-400 text-sm mt-2 mb-6">
              Browse colleges and click ♡ Save to bookmark them here
            </p>
            <Link
              href="/"
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition"
            >
              Browse Colleges
            </Link>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <p className="text-gray-600 text-sm font-medium">
                {colleges.length} saved college{colleges.length !== 1 ? 's' : ''}
              </p>
              {compareList.length > 0 && (
                <Link
                  href={`/compare?ids=${compareList.map(c => c.id).join(',')}`}
                  className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition"
                >
                  Compare Selected ({compareList.length}) →
                </Link>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {colleges.map(college => (
                <div key={college.id} className="relative">
                  <CollegeCard
                    college={college}
                    onCompare={handleCompare}
                    isInCompare={compareList.some(c => c.id === college.id)}
                  />
                  <button
                    onClick={() => handleUnsave(college.id)}
                    title="Remove from saved"
                    className="absolute top-2 right-2 w-6 h-6 bg-white hover:bg-red-50 text-red-400 hover:text-red-600 rounded-full border border-gray-200 hover:border-red-300 flex items-center justify-center text-xs shadow-sm transition z-10 font-bold"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}