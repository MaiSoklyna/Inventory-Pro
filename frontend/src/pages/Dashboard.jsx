import React, { useState, useEffect, useContext } from 'react'
import { TrendingUp, ShoppingBag, ShoppingCart, DollarSign, Package, ArrowRight, AlertCircle } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { dashboardService } from '../services/api'
import { LanguageContext } from '../App'
import { Link } from 'react-router-dom'
import { formatCurrency } from '../utils/helpers'

const StatCard = ({ title, value, icon: Icon, color, trend, footerLink, footerText }) => (
  <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-slate-200 dark:border-gray-800 transition-all hover:shadow-md group">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-2.5 rounded-lg ${color} bg-opacity-10 dark:bg-opacity-20`}>
        <Icon size={24} className={color.replace('bg-', 'text-')} />
      </div>
      {trend && (
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${trend > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
          {trend > 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
    <div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{value}</h3>
    </div>
    {footerLink && (
      <Link to={footerLink} className="mt-4 pt-4 border-t border-slate-50 dark:border-gray-800 flex items-center gap-2 text-xs font-semibold text-sky-600 hover:text-sky-700 transition-colors">
        {footerText} <ArrowRight size={14} />
      </Link>
    )}
  </div>
)

export default function Dashboard() {
  const { t } = useContext(LanguageContext)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await dashboardService.getStats()
      setStats(response.data)
    } catch (error) {
      console.error('Failed to fetch dashboard stats', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <div className="h-full flex flex-col items-center justify-center p-20 animate-fade-in text-slate-400">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-600 mb-4"></div>
      <p className="text-sm font-medium">{t.loading_dashboard}</p>
    </div>
  )

  return (
    <div className="p-6 space-y-8 animate-fade-in max-w-[1600px] mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t.dashboard}</h1>
        <p className="text-sm text-slate-500 mt-1">{t.dashboard_welcome}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title={t.today_sales}
          value={formatCurrency(stats?.today?.sales || 0)}
          icon={ShoppingBag}
          color="bg-emerald-500"
          footerLink="/sales"
          footerText={t.view_details}
        />
        <StatCard 
          title={t.today_purchases}
          value={formatCurrency(stats?.today?.purchases || 0)}
          icon={ShoppingCart}
          color="bg-sky-500"
          footerLink="/purchases"
          footerText={t.view_details}
        />
        <StatCard 
          title={t.stock_value}
          value={formatCurrency(stats?.today?.stock_value || 0)}
          icon={DollarSign}
          color="bg-amber-500"
          footerLink="/items"
          footerText={t.manage_items}
        />
        <StatCard 
          title={t.gross_profit}
          value={formatCurrency(stats?.today?.profit || 0)}
          icon={TrendingUp}
          color="bg-indigo-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-xl border border-slate-200 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest">{t.sales_trend}</h3>
            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full uppercase">Realtime Data</span>
          </div>
          <div className="h-[250px] w-full">
            {stats?.sales_chart && stats.sales_chart.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.sales_chart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12 }} 
                    dy={10}
                    tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    tickFormatter={(val) => `$${val}`}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '0.75rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                    formatter={(value) => [formatCurrency(value), "Sales"]}
                    labelFormatter={(label) => new Date(label).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                    cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '3 3' }}
                  />
                  <Area type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-100 dark:border-gray-800 rounded-xl text-slate-400">
                <TrendingUp size={32} className="mb-3 text-slate-300 dark:text-slate-600" />
                <p className="font-medium text-sm">{t.no_data || 'No sales data available for the selected period'}</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-slate-200 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest">{t.low_stock_alerts}</h3>
            <AlertCircle size={18} className="text-amber-500" />
          </div>
          <div className="space-y-3">
            {stats?.low_stock_items?.length > 0 ? (
              stats.low_stock_items.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-gray-800/50 group hover:bg-amber-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-white dark:bg-gray-700 rounded-md border border-slate-100 dark:border-gray-600">
                      <Package size={14} className="text-slate-400 group-hover:text-amber-600" />
                    </div>
                    <span className="text-xs font-semibold text-slate-700 dark:text-gray-300">{item.name}</span>
                  </div>
                  <span className="text-[10px] font-black text-rose-600 uppercase tracking-tighter">
                    {t.stock_level}: {item.stock_on_hand}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-10">
                <p className="text-xs font-semibold text-slate-400">{t.no_data}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
