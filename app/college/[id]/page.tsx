'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { College, Course, Review } from '@/types'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

type Tab = 'overview' | 'courses' | 'placements' | 'reviews'

export default function CollegeDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [college, setCollege] = useState<College | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (id) fetchCollegeData()
  }, [id])

  async function fetchCollegeData() {
    setLoading(true)
    const [{ data: collegeData }, { data: coursesData }, { data: reviewsData }] =
      await Promise.all([
        supabase.from('colleges').select('*').eq('id', id).single(),
        supabase.from('courses').select('*').eq('college_id', id),
        supabase.from('reviews').select('*').eq('college_id', id),
      ])
    setCollege(collegeData)
    setCourses(coursesData || [])
    setReviews(reviewsData || [])
    setLoading(false)
  }

  async function handleSave() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }
    setSaving(true)
    if (saved) {
      await supabase.from('saved_colleges')
        .delete().eq('user_id', user.id).eq('college_id', id)
      setSaved(false)
    } else {
      await supabase.from('saved_colleges')
        .insert({ user_id: user.id, college_id: id })
      setSaved(true)
    }
    setSaving(false)
  }

  const formatAmount = (amount: number | null) => {
    if (!amount) return 'N/A'
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)} Cr`
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`
    return `₹${(amount / 1000).toFixed(0)}K`
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'courses', label: `Courses (${courses.length})` },
    { key: 'placements', label: 'Placements' },
    { key: 'reviews', label: `Reviews (${reviews.length})` },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 py-10">
          <div className="bg-white rounded-xl h-64 animate-pulse mb-4" />
          <div className="bg-white rounded-xl h-96 animate-pulse" />
        </div>
      </div>
    )
  }

  if (!college) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 text-5xl mb-4">🎓</p>
          <p className="text-gray-600 text-lg">College not found</p>
          <Link href="/" className="mt-3 text-blue-600 hover:underline block">
            Back to listing
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-blue-800 to-blue-950 text-white">
        <div className="max-w-5xl mx-auto px-4 py-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-blue-300 text-sm mb-6">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <span>/</span>
            <span className="text-white">{college.name}</span>
          </div>

          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Logo */}
            <div className="w-20 h-20 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
              <span className="text-blue-700 font-bold text-3xl">{college.name.charAt(0)}</span>
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap gap-2 mb-2">
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                  college.type === 'Government'
                    ? 'bg-blue-600 text-blue-100'
                    : 'bg-purple-600 text-purple-100'
                }`}>
                  {college.type}
                </span>
                {college.approved_by && (
                  <span className="text-xs px-3 py-1 rounded-full bg-white/20 text-white">
                    {college.approved_by}
                  </span>
                )}
              </div>

              <h1 className="text-2xl md:text-3xl font-bold mb-1">{college.name}</h1>

              <div className="flex flex-wrap gap-4 text-blue-200 text-sm mt-2">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  {college.location}, {college.state}
                </span>
                {college.established && (
                  <span>Est. {college.established}</span>
                )}
                {college.affiliated_to && (
                  <span>Affiliated: {college.affiliated_to}</span>
                )}
              </div>
            </div>

            {/* Rating + Save */}
            <div className="flex gap-3 items-start">
              <div className="bg-white/15 rounded-xl px-5 py-3 text-center">
                <div className="text-3xl font-bold">{college.rating}</div>
                <div className="text-blue-200 text-xs mt-0.5">⭐ Rating</div>
                <div className="text-blue-300 text-xs">{college.total_reviews} reviews</div>
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className={`px-4 py-3 rounded-xl text-sm font-medium transition border ${
                  saved
                    ? 'bg-red-500 border-red-400 text-white hover:bg-red-600'
                    : 'bg-white/15 border-white/30 text-white hover:bg-white/25'
                }`}
              >
                {saving ? '...' : saved ? '♥ Saved' : '♡ Save'}
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {[
              { label: 'Annual Fees', value: formatAmount(college.fees_min) },
              { label: 'Avg Package', value: formatAmount(college.avg_package) },
              { label: 'Highest Package', value: formatAmount(college.highest_package) },
              { label: 'Placement Rate', value: college.placement_percent ? `${college.placement_percent}%` : 'N/A' },
            ].map(stat => (
              <div key={stat.label} className="bg-white/10 rounded-xl px-4 py-3 text-center">
                <div className="text-white font-bold text-xl">{stat.value}</div>
                <div className="text-blue-300 text-xs mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-30">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-5 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition ${
                  activeTab === tab.key
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">About {college.name}</h2>
                <p className="text-gray-600 leading-relaxed">
                  {college.description || 'No description available.'}
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Key Information</h2>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Location', value: `${college.location}, ${college.state}` },
                    { label: 'Type', value: college.type },
                    { label: 'Established', value: college.established?.toString() || 'N/A' },
                    { label: 'Affiliated To', value: college.affiliated_to || 'N/A' },
                    { label: 'Approved By', value: college.approved_by || 'N/A' },
                    { label: 'Fees Range', value: `${formatAmount(college.fees_min)} – ${formatAmount(college.fees_max)}` },
                  ].map(item => (
                    <div key={item.label} className="border-b border-gray-100 pb-3">
                      <p className="text-xs text-gray-500 mb-1">{item.label}</p>
                      <p className="text-sm font-medium text-gray-800">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
                <h3 className="font-semibold text-blue-800 mb-3">Quick Actions</h3>
                <div className="flex flex-col gap-2">
                  <Link
                    href={`/compare?ids=${college.id}`}
                    className="block text-center bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                  >
                    + Add to Compare
                  </Link>
                  <button
                    onClick={handleSave}
                    className="block w-full text-center bg-white border border-blue-200 text-blue-700 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-50 transition"
                  >
                    {saved ? '♥ Saved' : '♡ Save College'}
                  </button>
                </div>
              </div>

              <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-3">Rating Breakdown</h3>
                {[
                  { label: 'Academics', value: Math.min(5, college.rating + 0.1) },
                  { label: 'Placements', value: Math.min(5, college.rating - 0.1) },
                  { label: 'Infrastructure', value: Math.min(5, college.rating - 0.2) },
                  { label: 'Faculty', value: Math.min(5, college.rating) },
                ].map(item => (
                  <div key={item.label} className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{item.label}</span>
                      <span className="font-medium text-gray-800">{item.value.toFixed(1)}</span>
                    </div>
                    <div className="bg-gray-100 rounded-full h-1.5">
                      <div
                        className="bg-blue-500 h-1.5 rounded-full"
                        style={{ width: `${(item.value / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* COURSES TAB */}
        {activeTab === 'courses' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800">Courses Offered</h2>
            </div>
            {courses.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p className="text-4xl mb-3">📚</p>
                <p>No courses data available</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {courses.map(course => (
                  <div key={course.id} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition">
                    <div>
                      <p className="font-medium text-gray-800">{course.name}</p>
                      <div className="flex gap-3 mt-1">
                        <span className="text-xs text-gray-500">{course.duration}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          course.degree_type === 'UG'
                            ? 'bg-green-50 text-green-700'
                            : 'bg-blue-50 text-blue-700'
                        }`}>
                          {course.degree_type}
                        </span>
                        {course.seats && (
                          <span className="text-xs text-gray-500">{course.seats} seats</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-800">{formatAmount(course.fees)}</p>
                      <p className="text-xs text-gray-400">per year</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PLACEMENTS TAB */}
        {activeTab === 'placements' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-5">Placement Statistics</h2>
              <div className="space-y-4">
                {[
                  { label: 'Placement Rate', value: `${college.placement_percent || 'N/A'}%`, color: 'text-green-600' },
                  { label: 'Average Package', value: formatAmount(college.avg_package), color: 'text-blue-600' },
                  { label: 'Highest Package', value: formatAmount(college.highest_package), color: 'text-purple-600' },
                ].map(stat => (
                  <div key={stat.label} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <span className="text-gray-600 font-medium">{stat.label}</span>
                    <span className={`text-xl font-bold ${stat.color}`}>{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-5">Top Recruiters</h2>
              <div className="flex flex-wrap gap-2">
                {['Google', 'Microsoft', 'Amazon', 'Flipkart', 'Infosys',
                  'TCS', 'Wipro', 'Deloitte', 'Goldman Sachs', 'JP Morgan',
                  'Intel', 'Samsung'].map(company => (
                  <span key={company}
                    className="bg-gray-100 text-gray-700 text-sm px-3 py-1.5 rounded-lg font-medium">
                    {company}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* REVIEWS TAB */}
        {activeTab === 'reviews' && (
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 text-center py-12 text-gray-400">
                <p className="text-4xl mb-3">💬</p>
                <p>No reviews yet</p>
              </div>
            ) : (
              reviews.map(review => (
                <div key={review.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-700 font-bold">
                          {review.user_name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{review.user_name}</p>
                        {review.batch_year && (
                          <p className="text-xs text-gray-400">Batch of {review.batch_year}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={i < review.rating ? 'text-amber-400' : 'text-gray-200'}>
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  {review.review_text && (
                    <p className="text-gray-600 text-sm leading-relaxed">{review.review_text}</p>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}