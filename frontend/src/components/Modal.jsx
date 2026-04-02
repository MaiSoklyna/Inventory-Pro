import React from 'react'
import { X } from 'lucide-react'

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-sm rounded-xl',
    md: 'max-w-md rounded-xl',
    lg: 'max-w-2xl rounded-2xl',
    xl: 'max-w-5xl rounded-3xl',
    full: 'fixed inset-0 w-full h-full rounded-none'
  }

  const containerClasses = size === 'full' 
    ? 'fixed inset-0 z-50 overflow-hidden flex flex-col bg-slate-50 dark:bg-gray-950'
    : `bg-white dark:bg-gray-900 shadow-xl w-full ${sizeClasses[size]} max-h-[95vh] overflow-y-auto border border-slate-200 dark:border-gray-800 animate-fade-in`

  return (
    <div className={`fixed inset-0 z-50 flex ${size !== 'full' ? 'items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-sm' : ''}`}>
      <div className={containerClasses}>
        <div className={`flex items-center justify-between p-5 sm:p-6 ${size === 'full' ? 'bg-white dark:bg-gray-900 border-b border-slate-200 dark:border-gray-800 px-8 sm:px-12' : 'border-b border-slate-100 dark:border-gray-800'}`}>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white uppercase">
              {title}
            </h2>
            {size === 'full' && <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">Administrative Editor</p>}
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${size === 'full' ? 'hover:bg-slate-100 dark:hover:bg-gray-800 text-slate-400' : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'}`}
          >
            <X size={20} />
          </button>
        </div>
        <div className={`flex-1 ${size === 'full' ? 'overflow-y-auto custom-scrollbar p-8 sm:p-12' : 'p-6 sm:p-8'}`}>
          {children}
        </div>
      </div>
    </div>
  )
}
