'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { College } from '@/types'
import CollegeCard from '@/components/CollegeCard'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const ITEMS_PER_PAGE = 9

export default function Home() {
  const router = useRouter()
  const [colleges, setColleges] = useState<College[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [stateFilter, setStateFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [feesFilter, setFeesFilter] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [compareList, setCompareList] = useState<College[]>([])

  const states = ['Delhi', 'Maharashtra', 'Tamil Nadu', 'Karnataka', 'Telangana',
    'West Bengal', 'Uttar Pradesh', 'Rajasthan', 'Punjab', 'Odisha']

  useEffect(() => {
    fetchColleges()
  }, [search, stateFilter, typeFilter, feesFilter, page])

  async function fetchColleges() {
    setLoading(true)
    let query = supabase
      .from('colleges')
      .select('*', { count: 'exact' })
      .order('rating', { ascending: false })

    if (search) query = query.ilike('name', `%${search}%`)
    if (stateFilter) query = query.eq('state', stateFilter)
    if (typeFilter) query = query.eq('type', typeFilter)
    if (feesFilter === 'low') query = query.lte('fees_min', 150000)
    if (feesFilter === 'mid') query = query.gte('fees_min', 150001).lte('fees_min', 350000)
    if (feesFilter === 'high') query = query.gte('fees_min', 350001)

    const from = (page - 1) * ITEMS_PER_PAGE
    query = query.range(from, from + ITEMS_PER_PAGE - 1)

    const { data, count } = await query
    setColleges(data || [])
    setTotal(count || 0)
    setLoading(false)
  }

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE)

  function handleSearch(value: string) {
    setSearch(value)
    setPage(1)
  }

  function handleCompare(college: College) {
    setCompareList(prev => {
      const exists = prev.find(c => c.id === college.id)
      if (exists) return prev.filter(c => c.id !== college.id)
      if (prev.length >= 3) {
        alert('You can compare up to 3 colleges at a time.')
        return prev
      }
      return [...prev, college]
    })
  }

  function resetFilters() {
    setSearch('')
    setStateFilter('')
    setTypeFilter('')
    setFeesFilter('')
    setPage(1)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-700 to-blue-900 text-white py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Find Your Perfect College
          </h1>
          <p className="text-blue-200 mb-8 text-lg">
            Discover, compare, and choose from top colleges across India
          </p>

          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search colleges by name..."
              value={search}
              onChange={e => handleSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-800 text-base shadow-lg focus:outline-none focus:ring-4 focus:ring-white/50 bg-white border-2 border-white"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Sidebar Filters */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sticky top-20">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-800">Filters</h2>
                <button onClick={resetFilters} className="text-blue-600 text-sm hover:underline">
                  Reset
                </button>
              </div>

              {/* State Filter */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                <select
                  value={stateFilter}
                  onChange={e => { setStateFilter(e.target.value); setPage(1) }}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                  <option value="">All States</option>
                  {states.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Type Filter */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">College Type</label>
                <div className="flex flex-col gap-2">
                  {['', 'Government', 'Private'].map(type => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="type"
                        value={type}
                        checked={typeFilter === type}
                        onChange={() => { setTypeFilter(type); setPage(1) }}
                        className="text-blue-600"
                      />
                      <span className="text-sm text-gray-700">{type || 'All Types'}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Fees Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Annual Fees</label>
                <div className="flex flex-col gap-2">
                  {[
                    { value: '', label: 'Any Fees' },
                    { value: 'low', label: 'Below ₹1.5L' },
                    { value: 'mid', label: '₹1.5L – ₹3.5L' },
                    { value: 'high', label: 'Above ₹3.5L' },
                  ].map(opt => (
                    <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="fees"
                        value={opt.value}
                        checked={feesFilter === opt.value}
                        onChange={() => { setFeesFilter(opt.value); setPage(1) }}
                        className="text-blue-600"
                      />
                      <span className="text-sm text-gray-700">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Results count */}
            <div className="flex items-center justify-between mb-5">
              <p className="text-gray-600 text-sm">
                Showing <span className="font-semibold text-gray-800">{total}</span> colleges
              </p>
            </div>

            {/* College Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl h-64 animate-pulse border border-gray-100" />
                ))}
              </div>
            ) : colleges.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-400 text-6xl mb-4">🎓</p>
                <p className="text-gray-500 text-lg">No colleges found</p>
                <button onClick={resetFilters} className="mt-3 text-blue-600 hover:underline text-sm">
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {colleges.map(college => (
                  <CollegeCard
                    key={college.id}
                    college={college}
                    onCompare={handleCompare}
                    isInCompare={compareList.some(c => c.id === college.id)}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition ${
                      page === i + 1
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Compare Floating Bar */}
      {compareList.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-xl px-4 py-3 z-40">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">
                Compare ({compareList.length}/3):
              </span>
              <div className="flex gap-2 flex-wrap">
                {compareList.map(c => (
                  <span key={c.id} className="bg-blue-50 text-blue-700 text-sm px-3 py-1 rounded-full flex items-center gap-1">
                    {c.name.split(' ').slice(0, 2).join(' ')}
                    <button onClick={() => handleCompare(c)} className="ml-1 hover:text-red-500">×</button>
                  </span>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCompareList([])}
                className="px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Clear
              </button>
              <Link
                href={`/compare?ids=${compareList.map(c => c.id).join(',')}`}
                className="px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition"
              >
                Compare Now →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}