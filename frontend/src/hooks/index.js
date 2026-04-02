import React from 'react'

// Custom hook for API calls with loading and error states
export const useFetch = (url) => {
  const [data, setData] = React.useState(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState(null)

  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const response = await fetch(url)
        const result = await response.json()
        setData(result)
      } catch (err) {
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [url])

  return { data, loading, error }
}

// Custom hook for form handling
export const useForm = (initialValues, onSubmit) => {
  const [values, setValues] = React.useState(initialValues)
  const [errors, setErrors] = React.useState({})
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setValues(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await onSubmit(values)
    } finally {
      setIsSubmitting(false)
    }
  }

  return { values, errors, isSubmitting, handleChange, handleSubmit, setValues }
}

// Custom hook for theme toggling
export const useTheme = () => {
  const [isDark, setIsDark] = React.useState(false)

  React.useEffect(() => {
    const theme = localStorage.getItem('theme') || 'light'
    setIsDark(theme === 'dark')
  }, [])

  const toggleTheme = () => {
    setIsDark(prev => !prev)
    localStorage.setItem('theme', !isDark ? 'dark' : 'light')
  }

  return { isDark, toggleTheme }
}

// Example usage
const url = "http://localhost/sale_prom/backend/public/api/contacts?type=customer"
const { data, loading, error } = useFetch(url)

console.log(data, loading, error)
