import React, { useState, useEffect, useContext } from 'react'
import { 
  PieChart, 
  TrendingUp, 
  ShoppingBag, 
  ShoppingCart, 
  Download, 
  Printer, 
  Calendar,
  Filter,
  ArrowRight
} from 'lucide-react'
import { reportService } from '../services/api'
import { LanguageContext } from '../App'
import { formatCurrency, formatDate } from '../utils/helpers'
import toast from 'react-hot-toast'

const ReportCard = ({ title, value, icon: Icon, color, trend }) => (
  <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-slate-200 dark:border-gray-800 shadow-sm">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-2.5 rounded-lg ${color} bg-opacity-10`}>
        <Icon size={24} className={color.replace('bg-', 'text-')} />
      </div>
      {trend && (
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Growth Tracking</span>
      )}
    </div>
    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
    <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{value}</h3>
  </div>
)

export default function Reports() {
  const { t } = useContext(LanguageContext)
  const [reportData, setReportData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    start_date: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0]
  })
  const [printType, setPrintType] = useState('all') // 'all', 'sales', 'purchases'

  useEffect(() => {
    fetchReport()
  }, [])

  const fetchReport = async () => {
    setLoading(true)
    try {
      const res = await reportService.getCustomReport(dateRange)
      setReportData(res.data)
    } catch {
      toast.error(t.failed_report)
    } finally {
      setLoading(false)
    }
  }

  const exportCSV = (type) => {
    if (!reportData) return
    const data = type === 'sales' ? reportData.item_sales : type === 'purchases' ? reportData.item_purchases : [...reportData.item_sales, ...reportData.item_purchases]
    
    let csvContent = "data:text/csv;charset=utf-8,"
    csvContent += `${t.table_date},${t.table_type},${t.table_item},${t.table_qty},${t.table_price},${t.table_total}\n`
    
    data.forEach(row => {
      const rowType = row.sale_number ? t.type_sale : t.type_purchase
      const rowDate = row.sale_date || row.purchase_date
      const rowName = row.item_name || `Item #${row.item_id}`
      csvContent += `${rowDate},${rowType},${rowName},${row.quantity},${row.unit_price},${row.subtotal}\n`
    })

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `report_${type}_${dateRange.start_date}_to_${dateRange.end_date}.csv`)
    document.body.appendChild(link)
    link.click()
  }

  const printPDF = (type) => {
    setPrintType(type)
    setTimeout(() => {
      window.print()
    }, 200)
  }

  const combinedItems = reportData ? [
    ...reportData.item_sales.map(s => ({ ...s, type: 'sale' })),
    ...reportData.item_purchases.map(p => ({ ...p, type: 'purchase' }))
  ].sort((a, b) => new Date(b.sale_date || b.purchase_date) - new Date(a.sale_date || a.purchase_date)) : []

  return (
    <div className="p-6 space-y-8 animate-fade-in max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 no-print">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <PieChart size={28} className="text-sky-600" />
            {t.reports_title}
          </h1>
          <p className="text-sm text-slate-500 mt-1">{t.reports_desc}</p>
        </div>

        <div className="flex flex-wrap gap-3 p-1 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl shadow-sm">
          <div className="flex items-center gap-2 px-3 py-2">
            <Calendar size={16} className="text-slate-400" />
            <input 
              type="date" 
              value={dateRange.start_date} 
              onChange={e => setDateRange({...dateRange, start_date: e.target.value})}
              className="bg-transparent border-none text-xs font-bold focus:ring-0 outline-none text-slate-600 dark:text-gray-300"
            />
          </div>
          <div className="flex items-center border-l border-slate-100 dark:border-gray-800 px-3 py-2">
            <ArrowRight size={14} className="text-slate-300 mr-2" />
            <input 
              type="date" 
              value={dateRange.end_date} 
              onChange={e => setDateRange({...dateRange, end_date: e.target.value})}
              className="bg-transparent border-none text-xs font-bold focus:ring-0 outline-none text-slate-600 dark:text-gray-300"
            />
          </div>
          <button 
            onClick={fetchReport}
            className="btn-primary flex items-center gap-2 text-xs !py-2 px-6"
          >
            <Filter size={14} /> {t.generate_report}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 no-print">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-600 mx-auto mb-4"></div>
          <p className="text-sm font-medium text-slate-400">{t.generating}</p>
        </div>
      ) : reportData && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 no-print">
            <ReportCard 
              title={t.total_sales_revenue}
              value={formatCurrency(reportData.summary.total_sales)}
              icon={ShoppingBag}
              color="bg-emerald-500"
            />
            <ReportCard 
              title={t.total_purchases_cost}
              value={formatCurrency(reportData.summary.total_purchases)}
              icon={ShoppingCart}
              color="bg-sky-500"
            />
            <ReportCard 
              title={t.net_profit}
              value={formatCurrency(reportData.summary.net_profit)}
              icon={TrendingUp}
              color="bg-indigo-500"
              trend={true}
            />
            <ReportCard 
              title={t.profit_margin}
              value={`${reportData.summary.profit_margin}%`}
              icon={PieChart}
              color="bg-amber-500"
            />
          </div>

          {/* Export Actions */}
          <div className="flex flex-wrap gap-4 no-print border-b border-slate-100 dark:border-gray-800 pb-8">
            <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 p-6 rounded-xl flex-1 min-w-[300px] flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{t.sales_title}</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">{formatCurrency(reportData.summary.total_sales)}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => exportCSV('sales')} className="p-2.5 bg-slate-50 dark:bg-gray-800 text-slate-600 dark:text-gray-300 rounded-lg hover:bg-emerald-50 hover:text-emerald-600 transition-colors border border-slate-100 dark:border-gray-700">
                  <Download size={18} />
                </button>
                <button onClick={() => printPDF('sales')} className="p-2.5 bg-slate-50 dark:bg-gray-800 text-slate-600 dark:text-gray-300 rounded-lg hover:bg-sky-50 hover:text-sky-600 transition-colors border border-slate-100 dark:border-gray-700">
                  <Printer size={18} />
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 p-6 rounded-xl flex-1 min-w-[300px] flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{t.purchases_title}</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">{formatCurrency(reportData.summary.total_purchases)}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => exportCSV('purchases')} className="p-2.5 bg-slate-50 dark:bg-gray-800 text-slate-600 dark:text-gray-300 rounded-lg hover:bg-emerald-50 hover:text-emerald-600 transition-colors border border-slate-100 dark:border-gray-700">
                  <Download size={18} />
                </button>
                <button onClick={() => printPDF('purchases')} className="p-2.5 bg-slate-50 dark:bg-gray-800 text-slate-600 dark:text-gray-300 rounded-lg hover:bg-sky-50 hover:text-sky-600 transition-colors border border-slate-100 dark:border-gray-700">
                  <Printer size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-slate-200 dark:border-gray-800 overflow-hidden shadow-sm no-print">
            <div className="px-6 py-4 bg-slate-50 dark:bg-gray-800 border-b border-slate-100 dark:border-gray-800 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t.detailed_data}</h3>
              <span className="text-[10px] font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full">{combinedItems.length} Records</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-white dark:bg-gray-900 text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b border-slate-50 dark:border-gray-800">
                  <tr>
                    <th className="px-6 py-3">{t.table_date}</th>
                    <th className="px-6 py-3">{t.table_type}</th>
                    <th className="px-6 py-3">{t.table_item}</th>
                    <th className="px-6 py-3 text-center">{t.table_qty}</th>
                    <th className="px-6 py-3 text-right">{t.table_price}</th>
                    <th className="px-6 py-3 text-right">{t.table_total}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-gray-800">
                  {combinedItems.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4 text-xs font-medium text-slate-500">{formatDate(row.sale_date || row.purchase_date)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase ${row.type === 'sale' ? 'bg-emerald-50 text-emerald-700' : 'bg-sky-50 text-sky-700'}`}>
                          {row.type === 'sale' ? t.type_sale : t.type_purchase}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-700 dark:text-white">{row.item_name || `Item #${row.item_id}`}</td>
                      <td className="px-6 py-4 text-sm text-center font-medium">{row.quantity}</td>
                      <td className="px-6 py-4 text-xs text-right text-slate-500">{formatCurrency(row.unit_price)}</td>
                      <td className="px-6 py-4 text-sm font-bold text-right text-slate-900 dark:text-white">{formatCurrency(row.total_amount || row.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Hidden Print Section */}
          <div id="report-print-area" className="hidden print:block p-16 bg-white text-slate-900 font-sans">
            {/* Header Section */}
            <div className="flex justify-between items-start mb-12">
              <div>
                <h1 className="text-4xl font-black uppercase tracking-tighter text-slate-900">{t.reports_title}</h1>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.3em] mt-2">{t.inventory_title}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-black text-slate-900 tracking-tight">
                  {dateRange.start_date} <span className="mx-2 text-slate-300">→</span> {dateRange.end_date}
                </p>
                <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-widest">
                  {t.generated_on}: {new Date().toLocaleString()}
                </p>
              </div>
            </div>

            <div className="h-px bg-slate-100 mb-12"></div>

            {/* Snapshot Summary Section */}
            <div className="grid grid-cols-3 gap-8 mb-12">
              <div className="p-8 bg-slate-50 rounded-2xl border border-slate-100">
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{t.total_sales_revenue}</p>
                 <p className="text-2xl font-black text-emerald-600">{formatCurrency(reportData.summary.total_sales)}</p>
              </div>
              <div className="p-8 bg-slate-50 rounded-2xl border border-slate-100">
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{t.total_purchases_cost}</p>
                 <p className="text-2xl font-black text-sky-600">{formatCurrency(reportData.summary.total_purchases)}</p>
              </div>
              <div className="p-8 bg-slate-900 text-white rounded-2xl shadow-xl">
                 <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-2">{t.net_profit}</p>
                 <p className="text-2xl font-black">{formatCurrency(reportData.summary.net_profit)}</p>
              </div>
            </div>

            {/* Transactions Section */}
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 px-2">{t.detailed_data}</h4>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500">
                  <th className="px-6 py-4 text-[10px] uppercase font-bold tracking-widest">{t.table_date}</th>
                  <th className="px-6 py-4 text-[10px] uppercase font-bold tracking-widest">{t.table_type}</th>
                  <th className="px-6 py-4 text-[10px] uppercase font-bold tracking-widest">{t.table_item}</th>
                  <th className="px-6 py-4 text-[10px] uppercase font-bold tracking-widest text-center">{t.table_qty}</th>
                  <th className="px-6 py-4 text-[10px] uppercase font-bold tracking-widest text-right">{t.table_price}</th>
                  <th className="px-6 py-4 text-[10px] uppercase font-bold tracking-widest text-right">{t.table_total}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 border border-slate-100">
                {(printType === 'sales' ? reportData.item_sales : printType === 'purchases' ? reportData.item_purchases : combinedItems).map((row, idx) => (
                  <tr key={idx} className="bg-white">
                    <td className="px-6 py-5 text-xs text-slate-500 font-medium">{formatDate(row.sale_date || row.purchase_date)}</td>
                    <td className="px-6 py-5 text-[10px] font-bold uppercase tracking-tight">
                      <span className={row.sale_number ? 'text-emerald-600' : 'text-sky-600'}>
                        {row.sale_number ? t.type_sale : t.type_purchase}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-xs font-bold text-slate-900">{row.item_name || `Item #${row.item_id}`}</td>
                    <td className="px-6 py-5 text-xs font-medium text-center">{row.quantity}</td>
                    <td className="px-6 py-5 text-xs text-slate-500 text-right">{formatCurrency(row.unit_price)}</td>
                    <td className="px-6 py-5 text-sm font-black text-right text-slate-900">{formatCurrency(row.total_amount || row.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50">
                  <td colSpan="5" className="px-6 py-8 text-xs font-bold text-right uppercase tracking-[0.2em] text-slate-400">Total Recap Sum</td>
                  <td className="px-6 py-8 text-2xl font-black text-right text-slate-900">
                    {formatCurrency(
                      printType === 'sales' ? reportData.summary.total_sales : 
                      printType === 'purchases' ? reportData.summary.total_purchases : 
                      reportData.summary.total_sales + reportData.summary.total_purchases
                    )}
                  </td>
                </tr>
              </tfoot>
            </table>

            {/* Report Footer */}
            <div className="mt-20 pt-12 border-t border-slate-50 text-center">
              <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.5em]">{t.system_footer}</p>
              <p className="text-[8px] mt-3 font-bold text-slate-200 uppercase tracking-widest italic">{t.inventory_title} PRO SYSTEM • v2.0</p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
