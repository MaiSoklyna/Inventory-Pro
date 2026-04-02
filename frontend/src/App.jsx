import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Sidebar from './components/Sidebar'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Contacts from './pages/Contacts'
import Items from './pages/Items'
import Purchases from './pages/Purchases'
import Sales from './pages/Sales'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import { AuthContext } from './context/AuthContext'
import { ThemeContext } from './context/ThemeContext'
import { translations } from './utils/i18n'

export const LanguageContext = React.createContext()

function App() {
  const [user, setUser] = useState(null)
  const [isDark, setIsDark] = useState(false)
  const [loading, setLoading] = useState(true)
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'en')

  const t = translations[language] || translations.en

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('auth_token')
    const theme = localStorage.getItem('theme') || 'light'
    
    if (token) {
      setUser({ token })
    }
    
    setIsDark(theme === 'dark')
    setLoading(false)
  }, [])

  useEffect(() => {
    const htmlElement = document.documentElement
    if (isDark) {
      htmlElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      htmlElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [isDark])

  const toggleTheme = () => {
    setIsDark(!isDark)
  }

  const logout = () => {
    localStorage.removeItem('auth_token')
    setUser(null)
  }

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      <ThemeContext.Provider value={{ isDark, toggleTheme }}>
        <AuthContext.Provider value={{ user, setUser, logout }}>
          <Toaster position="top-right" />
          
          <Routes>
            {/* Public Route: Login */}
            <Route 
              path="/login" 
              element={!user ? <Login setUser={setUser} /> : <Navigate to="/" replace />} 
            />

            {/* Protected Routes */}
            <Route
              path="/*"
              element={
                user ? (
                  <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
                    <Sidebar />
                    <div className="flex-1 flex flex-col overflow-hidden">
                      <Navbar toggleTheme={toggleTheme} isDark={isDark} />
                      <main className="flex-1 overflow-auto">
                        <Routes>
                          <Route path="/" element={<Dashboard />} />
                          <Route path="/contacts" element={<Contacts />} />
                          <Route path="/items" element={<Items />} />
                          <Route path="/purchases" element={<Purchases />} />
                          <Route path="/sales" element={<Sales />} />
                          <Route path="/reports" element={<Reports />} />
                          <Route path="/settings" element={<Settings />} />
                          {/* Fallback for the main area */}
                          <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                      </main>
                    </div>
                  </div>
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
          </Routes>
        </AuthContext.Provider>
      </ThemeContext.Provider>
    </LanguageContext.Provider>
  )
}

export default App
