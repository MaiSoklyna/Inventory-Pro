// Reusable, Excel-safe CSV export.
// - Quotes every field so commas/quotes/newlines never break columns
// - Prepends a UTF-8 BOM so Excel renders accented / Khmer characters correctly
// - Uses a Blob download (reliable for any size, unlike data: URIs)

const csvCell = (value) => {
  const s = value === null || value === undefined ? '' : String(value)
  return `"${s.replace(/"/g, '""')}"`
}

export function exportToCSV(filename, headers, rows) {
  const body = [headers, ...rows]
    .map((r) => r.map(csvCell).join(','))
    .join('\r\n')

  const blob = new Blob(['﻿' + body], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
