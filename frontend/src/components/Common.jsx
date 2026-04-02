import React from 'react'

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
    </div>
  )
}

export function EmptyState({ title, description, icon: Icon }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      {Icon && <Icon size={48} className="text-gray-400 mb-4" />}
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400 mt-1">{description}</p>
    </div>
  )
}

export function Alert({ type = 'info', title, message, onClose }) {
  const bgColor = {
    success: 'bg-green-50 dark:bg-green-900',
    error: 'bg-red-50 dark:bg-red-900',
    warning: 'bg-yellow-50 dark:bg-yellow-900',
    info: 'bg-blue-50 dark:bg-blue-900'
  }[type]

  const textColor = {
    success: 'text-green-800 dark:text-green-200',
    error: 'text-red-800 dark:text-red-200',
    warning: 'text-yellow-800 dark:text-yellow-200',
    info: 'text-blue-800 dark:text-blue-200'
  }[type]

  return (
    <div className={`${bgColor} ${textColor} p-4 rounded-lg mb-4`}>
      <div className="flex items-center justify-between">
        <div>
          {title && <h4 className="font-semibold">{title}</h4>}
          {message && <p className="text-sm mt-1">{message}</p>}
        </div>
        {onClose && (
          <button onClick={onClose} className="text-lg">&times;</button>
        )}
      </div>
    </div>
  )
}

export function Pagination({ currentPage, totalPages, onPageChange }) {
  return (
    <div className="flex items-center justify-center space-x-2 mt-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 border rounded disabled:opacity-50"
      >
        Previous
      </button>
      <span className="text-sm text-gray-600 dark:text-gray-400">
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 border rounded disabled:opacity-50"
      >
        Next
      </button>
    </div>
  )
}
