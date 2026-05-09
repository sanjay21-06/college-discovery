
'use client'
import { Suspense } from 'react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { College } from '@/types'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

function ComparePageInner() {
  const searchParams = useSearchParams()
  const [colleges, setColleges] = useState<College[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<College[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const ids = searchParams.get('ids')
    if (ids) {
      const idList = ids.split(',').filter(Boolean)
      fetchColleges(idList)
    }
  }, [searchParams])

  useEffect(() => {
    if (searchTerm.length < 2) { setSearchResults([]); return }
    const timer = setTimeout(() => searchColleges(), 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  async function fetchColleges(ids: string[]) {
    setLoading(true)
    const { data } = await supabase
      .from('colleges')
      .select('*')
      .in('id', ids)
    setColleges(data || [])
    setLoading(false)
  }

  async function searchColleges() {
    const { data } = await supabase
      .from('colleges')
      .select('*')
      .ilike('name', `%${searchTerm}%`)
      .limit(6)
    const filtered = (data || []).filter(c => !colleges.find(x => x.id === c.id))
    setSearchResults(filtered)
  }

  function addCollege(college: College) {
    if (colleges.length >= 3) { alert('Max 3 colleges'); return }
    if (colleges.find(c => c.id === college.id)) return
    setColleges(prev => [...prev, college])
    setSearchTerm('')
    setSearchResults([])
  }

  function removeCollege(id: string) {
    setColleges(prev => prev.filter(c => c.id !== id))
  }

  const formatAmount = (amount: number | null) => {
    if (!amount) return 'N/A'
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)} Cr`
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`
    return `₹${(amount / 1000).toFixed(0)}K`
  }

  const getBetter = (values: (number | null)[], higher = true) => {
    const nums = values.map(v => v ?? 0)
    const best = higher ? Math.max(...nums) : Math.min(...nums)
    return nums.map(n => n === best && n !== 0)
  }

  const rows = [
    {
      label: 'Location',
      values: colleges.map(c => `${c.location}, ${c.state}`),
      highlight: false,
    },
    {
      label: 'Type',
      values: colleges.map(c => c.type),
      highlight: false,
    },
    {
      label: 'Established',
      values: colleges.map(c => c.established?.toString() ?? 'N/A'),
      highlight: false,
    },
    {
      label: 'Annual Fees',
      values: colleges.map(c => formatAmount(c.fees_min)),
      rawValues: colleges.map(c => c.fees_min),
      highlight: true,
      higherIsBetter: false,
    },
    {
      label: 'Rating',
      values: colleges.map(c => `${c.rating} / 5`),
      rawValues: colleges.map(c => c.rating),
      highlight: true,
      higherIsBetter: true,
    },
    {
      label: 'Placement Rate',
      values: colleges.map(c => c.placement_percent ? `${c.placement_percent}%` : 'N/A'),
      rawValues: colleges.map(c => c.placement_percent),
      highlight: true,
      higherIsBetter: true,
    },
    {
      label: 'Avg Package',
      values: colleges.map(c => formatAmount(c.avg_package)),
      rawValues: colleges.map(c => c.avg_package),
      highlight: true,
      higherIsBetter: true,
    },
    {
      label: 'Highest Package',
      values: colleges.map(c => formatAmount(c.highest_package)),
      rawValues: colleges.map(c => c.highest_package),
      highlight: true,
      higherIsBetter: true,
    },
    {
      label: 'Approved By',
      values: colleges.map(c => c.approved_by ?? 'N/A'),
      highlight: false,
    },
  ]

  const colColors = ['blue', 'purple', 'orange']
  const colStyles = [
    'bg-blue-50 border-blue-200 text-blue-800',
    'bg-purple-50 border-purple-200 text-purple-800',
    'bg-orange-50 border-orange-200 text-orange-800',
  ]
  const headerStyles = [
    'bg-blue-600',
    'bg-purple-600',
    'bg-orange-500',
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-br from-blue-800 to-blue-950 text-white py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 text-blue-300 text-sm mb-4">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <span>/</span>
            <span className="text-white">Compare Colleges</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Compare Colleges</h1>
          <p className="text-blue-200">Select up to 3 colleges and compare them side by side</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Add College Search */}
        {colleges.length < 3 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
            <h2 className="font-semibold text-gray-800 mb-3">
              Add a college to compare ({colleges.length}/3)
            </h2>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Type college name to search..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
              />

              {/* Search Dropdown */}
              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg mt-1 z-20 overflow-hidden">
                  {searchResults.map(college => (
                    <button
                      key={college.id}
                      onClick={() => addCollege(college)}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-blue-50 transition text-left border-b border-gray-100 last:border-0"
                    >
                      <div>
                        <p className="font-medium text-gray-800 text-sm">{college.name}</p>
                        <p className="text-xs text-gray-500">{college.location}, {college.state}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-green-600 font-medium">⭐ {college.rating}</span>
                        <span className="text-xs text-blue-600">+ Add</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Empty State */}
        {colleges.length === 0 && !loading && (
          <div className="text-center py-20">
            <p className="text-gray-300 text-7xl mb-4">⚖️</p>
            <p className="text-gray-500 text-lg font-medium">No colleges selected</p>
            <p className="text-gray-400 text-sm mt-2 mb-6">
              Search above or go back to the listing page and click "+ Compare"
            </p>
            <Link
              href="/"
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition"
            >
              Browse Colleges
            </Link>
          </div>
        )}

        {loading && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[1,2,3].map(i => <div key={i} className="bg-white rounded-xl h-32 animate-pulse" />)}
          </div>
        )}

        {/* Comparison Table */}
        {colleges.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

            {/* College Headers */}
            <div className="grid border-b border-gray-100"
              style={{ gridTemplateColumns: `200px repeat(${colleges.length}, 1fr)` }}>
              <div className="p-4 bg-gray-50 border-r border-gray-100" />
              {colleges.map((college, i) => (
                <div key={college.id} className={`p-5 ${headerStyles[i]} text-white relative`}>
                  <button
                    onClick={() => removeCollege(college.id)}
                    className="absolute top-3 right-3 w-6 h-6 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-white text-sm transition"
                  >
                    ×
                  </button>
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mb-2">
                    <span className="font-bold text-lg">{college.name.charAt(0)}</span>
                  </div>
                  <h3 className="font-bold text-base leading-tight">{college.name}</h3>
                  <p className="text-white/70 text-xs mt-1">{college.location}, {college.state}</p>
                </div>
              ))}
            </div>

            {/* Comparison Rows */}
            {rows.map((row, rowIndex) => {
              const betterFlags = row.highlight && row.rawValues
                ? getBetter(row.rawValues, row.higherIsBetter)
                : colleges.map(() => false)

              return (
                <div
                  key={row.label}
                  className={`grid border-b border-gray-100 last:border-0 ${rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                  style={{ gridTemplateColumns: `200px repeat(${colleges.length}, 1fr)` }}
                >
                  {/* Row Label */}
                  <div className="p-4 border-r border-gray-100 flex items-center">
                    <span className="text-sm font-semibold text-gray-600">{row.label}</span>
                  </div>

                  {/* Row Values */}
                  {colleges.map((college, i) => (
                    <div key={college.id} className="p-4 flex items-center justify-center">
                      <span className={`text-sm font-medium text-center px-3 py-1.5 rounded-lg ${
                        betterFlags[i]
                          ? colStyles[i]
                          : 'text-gray-700'
                      }`}>
                        {row.values[i]}
                        {betterFlags[i] && (
                          <span className="ml-1 text-xs">✓</span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              )
            })}

            {/* View Details Row */}
            <div
              className="grid bg-gray-50 p-4"
              style={{ gridTemplateColumns: `200px repeat(${colleges.length}, 1fr)` }}
            >
              <div />
              {colleges.map(college => (
                <div key={college.id} className="flex justify-center px-2">
                  <Link
                    href={`/college/${college.id}`}
                    className="w-full text-center bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                  >
                    View Full Profile
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Summary Card */}
        {colleges.length >= 2 && (
          <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-5">
            <h3 className="font-semibold text-blue-800 mb-3">📊 Quick Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  label: 'Best Rating',
                  college: colleges.reduce((a, b) => a.rating > b.rating ? a : b),
                  value: (c: College) => `${c.rating}/5`,
                },
                {
                  label: 'Best Avg Package',
                  college: colleges.reduce((a, b) =>
                    (a.avg_package ?? 0) > (b.avg_package ?? 0) ? a : b),
                  value: (c: College) => formatAmount(c.avg_package),
                },
                {
                  label: 'Best Placement Rate',
                  college: colleges.reduce((a, b) =>
                    (a.placement_percent ?? 0) > (b.placement_percent ?? 0) ? a : b),
                  value: (c: College) => `${c.placement_percent}%`,
                },
              ].map(item => (
                <div key={item.label} className="bg-white rounded-xl p-4 border border-blue-100">
                  <p className="text-xs text-blue-600 font-medium mb-1">{item.label}</p>
                  <p className="font-bold text-gray-800">{item.college.name}</p>
                  <p className="text-blue-700 font-semibold text-lg mt-1">
                    {item.value(item.college)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
export default function ComparePage() {
    return (
      <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-400">Loading...</p></div>}>
        <ComparePageInner />
      </Suspense>
    )
}