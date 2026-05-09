'use client'
import Link from 'next/link'
import { College } from '@/types'

type Props = {
  college: College
  onCompare?: (college: College) => void
  isInCompare?: boolean
}

export default function CollegeCard({ college, onCompare, isInCompare }: Props) {
  const formatFees = (amount: number) => {
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`
    return `₹${(amount / 1000).toFixed(0)}K`
  }

  const formatPackage = (amount: number | null) => {
    if (!amount) return 'N/A'
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`
    return `₹${(amount / 1000).toFixed(0)}K`
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 overflow-hidden">
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-blue-700 font-bold text-lg">
                {college.name.charAt(0)}
              </span>
            </div>
            <div>
              <Link href={`/college/${college.id}`}>
                <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition line-clamp-1 text-base">
                  {college.name}
                </h3>
              </Link>
              <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {college.location}, {college.state}
              </p>
            </div>
          </div>

          {/* Rating */}
          <div className="flex-shrink-0 bg-green-50 border border-green-200 rounded-lg px-2.5 py-1.5 text-center">
            <div className="text-green-700 font-bold text-base leading-none">{college.rating}</div>
            <div className="text-green-600 text-xs mt-0.5">⭐ Rating</div>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
            college.type === 'Government'
              ? 'bg-blue-50 text-blue-700'
              : 'bg-purple-50 text-purple-700'
          }`}>
            {college.type}
          </span>
          {college.approved_by && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
              {college.approved_by.split(',')[0]}
            </span>
          )}
          {college.established && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-amber-50 text-amber-700">
              Est. {college.established}
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4 bg-gray-50 rounded-lg p-3">
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">Fees/yr</p>
            <p className="font-semibold text-gray-800 text-sm">
              {formatFees(college.fees_min)}
            </p>
          </div>
          <div className="text-center border-x border-gray-200">
            <p className="text-xs text-gray-500 mb-1">Avg Package</p>
            <p className="font-semibold text-gray-800 text-sm">
              {formatPackage(college.avg_package)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">Placement</p>
            <p className="font-semibold text-gray-800 text-sm">
              {college.placement_percent ? `${college.placement_percent}%` : 'N/A'}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Link
            href={`/college/${college.id}`}
            className="flex-1 text-center bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
          >
            View Details
          </Link>
          <button
            onClick={() => onCompare && onCompare(college)}
            className={`px-3 py-2 rounded-lg text-sm font-medium border transition ${
              isInCompare
                ? 'bg-orange-50 border-orange-300 text-orange-700 hover:bg-orange-100'
                : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {isInCompare ? '✓ Added' : '+ Compare'}
          </button>
        </div>
      </div>
    </div>
  )
}