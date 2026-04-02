export const formatCurrency = (amount, currency = 'USD') => {
  try {
    const val = Number(amount) || 0
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(val)
  } catch (e) {
    return currency === 'USD' ? `$${amount}` : `${amount}`
  }
}

export const formatDate = (date) => {
  if (!date) return 'N/A'
  try {
    const d = new Date(date)
    if (isNaN(d.getTime())) return 'N/A'
    
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(d)
  } catch (e) {
    return 'N/A'
  }
}

export const calculateProfit = (revenue, cost) => {
  return (Number(revenue) || 0) - (Number(cost) || 0)
}

export const calculateProfitMargin = (revenue, cost) => {
  const rev = Number(revenue) || 0
  const cst = Number(cost) || 0
  return rev > 0 ? ((rev - cst) / rev) * 100 : 0
}

export const getStatusColor = (status) => {
  const colors = {
    completed: 'badge-success',
    pending: 'badge-warning',
    cancelled: 'badge-danger',
    stock_low: 'badge-warning',
  }
  return colors[status] || 'badge-info'
}
