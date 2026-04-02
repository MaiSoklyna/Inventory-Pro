import React, { useState, useEffect, useContext } from 'react'
import { 
  Settings as SettingsIcon, 
  User, 
  Shield, 
  Database, 
  Save, 
  RefreshCcw, 
  AlertTriangle,
  Globe,
  Bell,
  CheckCircle2
} from 'lucide-react'
import { settingsService } from '../services/api'
import { LanguageContext } from '../App'
import toast from 'react-hot-toast'

export default function Settings() {
  const { language, setLanguage, t } = useContext(LanguageContext)
  const [activeTab, setActiveTab] = useState('general')
  const [loading, setLoading] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  
  const [settings, setSettings] = useState({
    business_name: 'Sale Prom Inventory',
    currency: 'USD',
    tax_rate: 10,
    email_notifications: true,
    low_stock_threshold: 5,
    language: language,
    theme: 'light'
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await settingsService.getSettings()
      if (response.data) {
        setSettings(prev => ({ ...prev, ...response.data }))
      }
    } catch (error) {
      toast.error(t.failed_load)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      await settingsService.updateSettings(settings)
      toast.success(t.settings_success)
    } catch (error) {
      toast.error(t.failed_update)
    } finally {
      setLoading(false)
    }
  }

  const handleResetData = async () => {
    if (confirmText !== 'RESET') {
      toast.error(t.type_confirm)
      return
    }

    try {
      setLoading(true)
      await settingsService.resetData()
      toast.success(t.reset_success)
      setShowResetConfirm(false)
      setConfirmText('')
      window.location.reload()
    } catch (error) {
      toast.error(t.failed_reset)
    } finally {
      setLoading(false)
    }
  }

  const handleLanguageChange = (e) => {
    const newLang = e.target.value
    setLanguage(newLang)
    localStorage.setItem('language', newLang)
    setSettings(prev => ({ ...prev, language: newLang }))
  }

  const tabs = [
    { id: 'general', label: t.tab_general, icon: SettingsIcon },
    { id: 'account', label: t.tab_account, icon: User },
    { id: 'security', label: t.tab_security, icon: Shield },
    { id: 'system', label: t.tab_system, icon: Database },
  ]

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  return (
    <div className="p-6 max-w-6xl mx-auto animate-fade-in">
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <SettingsIcon size={28} className="text-sky-600" />
          {t.settings_title}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {t.settings_desc}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        <aside className="w-full lg:w-64 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium text-sm
                ${activeTab === tab.id 
                  ? 'bg-sky-50 dark:bg-sky-900/40 text-sky-600 border border-sky-100 dark:border-sky-900/50 shadow-sm' 
                  : 'text-slate-500 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-gray-800 border border-transparent'
                }`}
            >
              <tab.icon size={18} />
              <span>{tab.label}</span>
            </button>
          ))}
        </aside>

        <div className="flex-1">
          <form onSubmit={handleSave} className="space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-slate-200 dark:border-gray-800 p-8 shadow-sm min-h-[450px]">
              {activeTab === 'general' && (
                <div className="space-y-8 animate-fade-in">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-3 border-b border-slate-50 dark:border-gray-800 pb-4">
                    <Globe size={20} className="text-sky-500" />
                    {t.general_settings}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">{t.business_name}</label>
                      <input type="text" name="business_name" value={settings.business_name} onChange={handleChange} className="input-field" />
                    </div>
                    
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">{t.currency_symbol}</label>
                      <select name="currency" value={settings.currency} onChange={handleChange} className="input-field" >
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="KHR">KHR (៛)</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">{t.tax_rate}</label>
                      <input type="number" name="tax_rate" value={settings.tax_rate} onChange={handleChange} className="input-field" />
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">{t.language}</label>
                      <select name="language" value={language} onChange={handleLanguageChange} className="input-field font-semibold text-sky-600" >
                        <option value="en">English (EN)</option>
                        <option value="kh">ភាសាខ្មែរ (KH)</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">{t.system_theme}</label>
                      <select name="theme" value={settings.theme} onChange={handleChange} className="input-field" >
                        <option value="light">{t.theme_light}</option>
                        <option value="dark">{t.theme_dark}</option>
                        <option value="system">{t.theme_system}</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-50 dark:border-gray-800">
                    <label className="flex items-center gap-3 cursor-pointer p-4 bg-slate-50 dark:bg-gray-800/50 rounded-lg border border-slate-100 dark:border-gray-800 transition-all hover:bg-white">
                      <input type="checkbox" name="email_notifications" checked={settings.email_notifications} onChange={handleChange} className="w-5 h-5 rounded text-sky-600 border-slate-200 outline-none transition-all cursor-pointer" />
                      <span className="text-slate-700 dark:text-gray-300 font-semibold text-xs uppercase tracking-widest">{t.email_notifications}</span>
                    </label>
                  </div>
                </div>
              )}

              {activeTab === 'account' && (
                <div className="space-y-8 animate-fade-in">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-3 border-b border-slate-50 dark:border-gray-800 pb-4">
                    <User size={20} className="text-sky-500" />
                    {t.account_profile}
                  </h3>
                  
                  <div className="flex items-center gap-4 p-6 bg-slate-50 dark:bg-gray-800/50 rounded-xl border border-slate-100 dark:border-gray-800">
                    <div className="w-12 h-12 rounded-lg bg-sky-600 flex items-center justify-center text-white text-xl font-bold">A</div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">Administrator</h4>
                      <p className="text-xs text-slate-400 font-medium tracking-wider">PRIMARY ACCOUNT</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">{t.full_name}</label>
                      <input type="text" className="input-field" defaultValue="Administrator" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">{t.email}</label>
                      <input type="email" className="input-field" defaultValue="admin@example.com" />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-8 animate-fade-in">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-3 border-b border-slate-50 dark:border-gray-800 pb-4">
                    <Shield size={20} className="text-indigo-500" />
                    {t.security_settings}
                  </h3>
                  
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">{t.current_password}</label>
                      <input type="password" placeholder="••••••••" className="input-field" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">{t.new_password}</label>
                      <input type="password" placeholder="••••••••" className="input-field" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">{t.confirm_new_password}</label>
                      <input type="password" placeholder="••••••••" className="input-field" />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'system' && (
                <div className="space-y-8 animate-fade-in">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-3 border-b border-slate-50 dark:border-gray-800 pb-4">
                    <Database size={20} className="text-rose-500" />
                    {t.system_maintenance}
                  </h3>
                  
                  <div className="bg-rose-50 dark:bg-red-900/10 border border-rose-100 dark:border-red-900/50 p-6 rounded-xl space-y-6">
                    <div className="flex items-center gap-3 text-rose-600">
                      <AlertTriangle size={24} />
                      <h4 className="font-bold text-lg">{t.danger_zone}</h4>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-red-200 leading-relaxed">
                      {t.reset_desc}
                    </p>
                    
                    <button type="button" onClick={() => setShowResetConfirm(true)} className="btn-primary flex items-center gap-2 !bg-rose-600 hover:!bg-rose-700 shadow-rose-100 uppercase text-xs tracking-widest" >
                      <RefreshCcw size={16} /> {t.reset_button}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="p-6 bg-slate-50 dark:bg-gray-800 rounded-xl border border-slate-100 dark:border-gray-700">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-4">{t.export_backup}</h4>
                      <div className="flex gap-2">
                        <button type="button" className="flex-1 btn-secondary text-[10px] !py-3 uppercase tracking-wider">JSON</button>
                        <button type="button" className="flex-1 btn-secondary text-[10px] !py-3 uppercase tracking-wider">CSV</button>
                      </div>
                    </div>

                    <div className="p-6 bg-slate-50 dark:bg-gray-800 rounded-xl border border-slate-100 dark:border-gray-700">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-4">{t.version_info}</h4>
                      <div className="space-y-1">
                         <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400">{t.software_version}</span>
                          <span className="font-bold text-sky-600 uppercase tracking-tighter">v2.0-stable</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400">{t.environment}</span>
                          <span className="font-bold text-emerald-600 uppercase tracking-tighter">Production</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {activeTab !== 'system' && activeTab !== 'security' && (
              <div className="flex justify-end pt-4">
                <button type="submit" disabled={loading} className="btn-primary min-w-[200px] !py-4 flex items-center justify-center gap-3 text-lg" >
                  {loading ? <RefreshCcw className="animate-spin" size={20} /> : <Save size={20} />}
                  <span>{t.save_changes}</span>
                </button>
              </div>
            )}
          </form>
        </div>
      </div>

      {showResetConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-white dark:bg-gray-950 rounded-xl p-8 max-w-md w-full border border-slate-200 dark:border-gray-800 animate-fade-in">
             <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-lg flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={24} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white text-center mb-2">{t.are_you_sure}</h2>
            <p className="text-sm text-slate-500 text-center mb-8 leading-relaxed">
              {t.wipe_everything} {t.type_reset}
            </p>
            <input type="text" value={confirmText} onChange={(e) => setConfirmText(e.target.value)} className="input-field text-center text-lg mb-6 tracking-[0.3em] font-black uppercase" placeholder="RESET" autoFocus />
            <div className="flex gap-3">
              <button onClick={() => setShowResetConfirm(false)} className="flex-1 btn-secondary !py-4 uppercase tracking-widest text-xs" >
                {t.cancel}
              </button>
              <button onClick={handleResetData} disabled={loading || confirmText !== 'RESET'} className="flex-1 btn-primary !bg-rose-600 hover:!bg-rose-700 disabled:opacity-50 !py-4 uppercase tracking-widest text-xs" >
                {loading ? t.processing : t.confirm_reset}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
