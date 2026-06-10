import React, { useContext } from 'react'
import { Sun, Moon, User } from 'lucide-react'
import { ThemeContext } from '../context/ThemeContext'
import { LanguageContext } from '../App'

export default function Navbar() {
  const { isDark, toggleTheme } = useContext(ThemeContext)
  const { t } = useContext(LanguageContext)

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between shadow-soft">
      <div className="text-lg font-semibold text-gray-900 dark:text-white">
        {t.inventory_title}
      </div>

      <div className="flex items-center space-x-4">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          {isDark ? (
            <Sun size={20} className="text-yellow-500" />
          ) : (
            <Moon size={20} className="text-gray-600" />
          )}
        </button>

        <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <User size={20} className="text-gray-600 dark:text-gray-300" />
        </button>
      </div>
    </nav>
  )
}
