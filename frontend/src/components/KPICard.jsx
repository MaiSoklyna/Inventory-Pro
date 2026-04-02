import React from 'react'

export default function KPICard({ icon: Icon, title, value, trend, bgColor = 'bg-sky-100 dark:bg-sky-900' }) {
  return (
    <div className="card bg-white dark:bg-gray-800">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
          {trend && (
            <p className={`text-sm mt-2 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend > 0 ? '+' : ''}{trend}% vs last month
            </p>
          )}
        </div>
        <div className={`${bgColor} p-4 rounded-lg`}>
          <Icon size={28} className="text-sky-600 dark:text-sky-300" />
        </div>
      </div>
    </div>
  )
}
