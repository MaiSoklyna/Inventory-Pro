import React, { useState, useEffect, useContext } from 'react'
import { Plus, Eye, Trash2, Search, X, Printer, ShoppingBag, Download } from 'lucide-react'
import { saleService, contactService, itemService } from '../services/api'
import Modal from '../components/Modal'
import { LanguageContext } from '../App'
import toast from 'react-hot-toast'
import { formatCurrency, formatDate } from '../utils/helpers'
import { exportToCSV } from '../utils/exportCSV'

// ─── Invoice Component ────────────────────────────────────────────────────────
function InvoiceView({ sale, items, t }) {
  const itemDetails = (item) => {
    // Try to get name directly from the item object if it exists (robust API response)
    if (item.item_name) return item.item_name;
    if (item.item && item.item.name) return item.item.name;
    
    // Fallback: search in the global items list
    const found = items.find(i => i.id?.toString() === item.item_id?.toString())
    return found ? found.name : (item.name || `Item #${item.item_id}`)
  }

  // Highly robust helpers to find the correct data even with varied API structures
  const getQty = (i) => {
    const qty = (i.quantity ?? i.qty ?? i.pivot?.quantity ?? i.pivot?.qty);
    if (qty !== undefined && qty !== null) return qty;
    const calc = Number(i.subtotal || i.total) / Number(i.unit_price || i.price);
    return isNaN(calc) ? 0 : calc;
  }
  
  const getPrice = (i) => {
    const price = (i.unit_price ?? i.price ?? i.pivot?.unit_price ?? i.pivot?.price ?? i.selling_price ?? i.sale_price);
    if (price !== undefined && price !== null) return price;
    const calc = Number(i.subtotal || i.total) / Number(i.quantity || i.qty);
    return isNaN(calc) ? 0 : calc;
  }
  
  const getSubtotal = (i) => {
    const sub = (i.subtotal ?? i.total ?? i.pivot?.subtotal ?? i.pivot?.total);
    if (sub !== undefined && sub !== null) return sub;
    return (Number(getQty(i)) * Number(getPrice(i))) || 0;
  }

  return (
    <div id="invoice-print-area" className="p-12 max-w-[850px] mx-auto bg-white text-slate-900 font-sans">
      {/* Header Section */}
      <div className="flex justify-between items-start mb-10">
        <div>
          <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter mb-1">{t.invoice_title}</h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t.sales_title}</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-black text-slate-900 tracking-tight">{sale.sale_number || sale.invoice_number || 'INV-000'}</p>
          <p className="text-sm font-medium text-slate-400 mt-1">{t.table_date}: {formatDate(sale.sale_date || sale.created_at)}</p>
        </div>
      </div>

      <div className="h-px bg-slate-100 mb-12"></div>

      {/* Bill To Section */}
      <div className="mb-12">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3">{t.bill_to}</p>
        <h2 className="text-2xl font-black text-slate-900 mb-2">{sale.contact?.name || sale.customer?.name}</h2>
        <div className="text-sm text-slate-500 space-y-1 font-medium">
          {(sale.contact?.phone || sale.customer?.phone) && <p>{sale.contact?.phone || sale.customer?.phone}</p>}
          {(sale.contact?.email || sale.customer?.email) && <p>{sale.contact?.email || sale.customer?.email}</p>}
          {(sale.contact?.address || sale.customer?.address) && <p>{sale.contact?.address || sale.customer?.address}</p>}
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full text-left mb-12">
        <thead>
          <tr className="bg-slate-50 text-slate-500">
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest">{t.table_item}</th>
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-center">{t.table_qty}</th>
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-right">{t.table_price}</th>
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-right">{t.table_total}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {(sale.items || sale.sale_items)?.map((item, index) => (
            <tr key={index}>
              <td className="px-6 py-6 text-sm font-bold text-slate-900">{itemDetails(item)}</td>
              <td className="px-6 py-6 text-sm font-medium text-slate-500 text-center">{getQty(item)}</td>
              <td className="px-6 py-6 text-sm font-medium text-slate-500 text-right">{formatCurrency(getPrice(item))}</td>
              <td className="px-6 py-6 text-sm font-black text-right text-slate-900">{formatCurrency(getSubtotal(item))}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Summary Section */}
      <div className="flex justify-end mb-16">
        <div className="w-full max-w-md bg-slate-50 rounded-2xl p-10 flex justify-between items-center">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">{t.table_total}</span>
          <span className="text-4xl font-black text-slate-900 tracking-tighter">{formatCurrency(sale.total_amount)}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center pt-12 border-t border-slate-50">
        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em]">{t.system_footer}</p>
      </div>
    </div>
  )
}

function printInvoice(title) {
  const printContent = document.getElementById('invoice-print-area')
  if (!printContent) return
  const win = window.open('', '_blank', 'width=900,height=1000')
  
  // Clone all styles from the current document to ensure 100% visual parity
  const headStyles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
    .map(style => style.outerHTML)
    .join('\n')

  win.document.write(`
    <html>
      <head>
        <title>${title}</title>
        ${headStyles}
        <style>
          body { margin: 0; padding: 10mm; background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          #invoice-print-area { width: 100% !important; max-width: 100% !important; margin: 0 !important; border: none !important; box-shadow: none !important; }
          .no-print { display: none !important; }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="print-root">
          ${printContent.innerHTML}
        </div>
      </body>
    </html>
  `)
  win.document.close()
  win.focus()
  
  // Longer timeout to ensure Tailwind and system fonts are fully applied before capture
  setTimeout(() => { 
    win.print()
    win.close() 
  }, 1000)
}

// ─── Main Sales Page ──────────────────────────────────────────────────────────
export default function Sales() {
  const { t } = useContext(LanguageContext)
  const [sales, setSales] = useState([])
  const [customers, setCustomers] = useState([])
  const [items, setItems] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const [showModal, setShowModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [selectedSale, setSelectedSale] = useState(null)
  const [newSale, setNewSale] = useState(null)

  const initialFormData = {
    contact_id: '',
    sale_date: new Date().toISOString().split('T')[0],
    due_date: new Date().toISOString().split('T')[0],
    note: '',
    items: [{ item_id: '', quantity: 1, unit_price: 0 }]
  }
  const [formData, setFormData] = useState(initialFormData)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [salesRes, contactsRes, itemsRes] = await Promise.all([
        saleService.getAll(),
        contactService.getAll('customer'),
        itemService.getAll()
      ])
      setSales(salesRes.data.data ? salesRes.data.data : salesRes.data)
      setCustomers(contactsRes.data.data ? contactsRes.data.data : contactsRes.data)
      setItems(itemsRes.data.data ? itemsRes.data.data : itemsRes.data)
    } catch {
      toast.error(t.failed_load_data)
    } finally {
      setLoading(false)
    }
  }

  const handleAddItemRow = () => {
    setFormData({ ...formData, items: [...formData.items, { item_id: '', quantity: 1, unit_price: 0 }] })
  }

  const handleRemoveItemRow = (index) => {
    const newItems = [...formData.items]
    newItems.splice(index, 1)
    setFormData({ ...formData, items: newItems })
  }

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items]
    newItems[index][field] = value
    if (field === 'item_id') {
      const selected = items.find(i => i.id.toString() === value.toString())
      if (selected) newItems[index]['unit_price'] = selected.sell_price || 0
    }
    setFormData({ ...formData, items: newItems })
  }

  const calculateTotal = () =>
    formData.items.reduce((tot, i) => tot + Number(i.quantity) * Number(i.unit_price), 0)

  const validateStock = () => {
    const qty = {}
    for (const itm of formData.items) {
      if (itm.item_id) qty[itm.item_id] = (qty[itm.item_id] || 0) + Number(itm.quantity)
    }
    for (const [id, q] of Object.entries(qty)) {
      const db = items.find(i => i.id.toString() === id)
      if (db && q > db.stock_on_hand) {
        toast.error(`${t.failed_op}: ${db.name}. ${t.stock_level}: ${db.stock_on_hand}`)
        return false
      }
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.contact_id) return toast.error(t.select_contact)
    if (formData.items.length === 0) return toast.error(t.no_data)
    if (formData.items.some(i => !i.item_id || i.quantity < 1 || i.unit_price < 0))
      return toast.error(t.failed_op)
    if (!validateStock()) return

    try {
      const res = await saleService.create(formData)
      toast.success(t.success_create)
      setShowModal(false)

      const customer = customers.find(c => c.id.toString() === formData.contact_id.toString())
      const saleData = {
        ...res.data,
        contact: customer,
        items: res.data.items || formData.items.map(fi => ({
          item_id: fi.item_id,
          quantity: fi.quantity,
          unit_price: fi.unit_price,
          subtotal: Number(fi.quantity) * Number(fi.unit_price)
        }))
      }
      setNewSale(saleData)
      setShowInvoiceModal(true)
      setFormData(initialFormData)
      fetchData()
    } catch (error) {
      toast.error(error.response?.data?.message || t.failed_op)
    }
  }

  const handleStatusChange = async (id, newStatus) => {
    try {
      await saleService.update(id, { status: newStatus })
      toast.success(t.success_update)
      fetchData()
    } catch { toast.error(t.failed_op) }
  }

  const handlePaymentStatusChange = async (id, newStatus) => {
    try {
      await saleService.update(id, { payment_status: newStatus })
      toast.success(t.success_update)
      fetchData()
    } catch { toast.error(t.failed_op) }
  }

  const handleDelete = async (id) => {
    if (window.confirm(t.confirm_delete)) {
      try {
        await saleService.delete(id)
        toast.success(t.success_delete)
        fetchData()
      } catch { toast.error(t.failed_op) }
    }
  }

  const viewSale = (sale) => { setSelectedSale(sale); setShowViewModal(true) }

  const filteredSales = sales.filter(s =>
    s.sale_number.toLowerCase().includes(search.toLowerCase()) ||
    s.contact?.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleExport = () => {
    if (!filteredSales.length) {
      toast.error(t.no_results || 'No data to export')
      return
    }
    const headers = [
      t.table_date,
      t.sale_number,
      t.customer,
      t.total_amount,
      t.paid_amount || 'Paid Amount',
      t.payment_status,
      t.status,
    ]
    const rows = filteredSales.map((s) => [
      s.sale_date,
      s.sale_number,
      s.contact?.name || '',
      s.total_amount,
      s.paid_amount ?? '',
      s.payment_status,
      s.status,
    ])
    exportToCSV(`sales_${new Date().toISOString().split('T')[0]}.csv`, headers, rows)
    toast.success(t.export_success || 'Export ready')
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <ShoppingBag size={28} className="text-sky-600" />
            {t.sales_title}
          </h1>
          <p className="text-sm text-slate-500 mt-1">Manage and track your business sales records.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="btn-secondary flex items-center space-x-2"
            title={t.export_csv || 'Export CSV'}
          >
            <Download size={20} />
            <span>{t.export_csv || 'Export CSV'}</span>
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>{t.add_sale}</span>
          </button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          placeholder={t.search_sales}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-12"
        />
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-600 mx-auto"></div>
          <p className="mt-4 text-sm font-medium text-slate-400">{t.loading}</p>
        </div>
      ) : filteredSales.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-xl border border-dashed border-slate-200 dark:border-gray-800">
          <ShoppingBag size={40} className="mx-auto text-slate-200 mb-4" />
          <p className="text-lg font-bold text-slate-400">{t.no_results}</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-slate-200 dark:border-gray-800 overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-gray-800 border-b border-slate-100 dark:border-gray-800">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">{t.table_date}</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">{t.sale_number}</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">{t.customer}</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">{t.total_amount}</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">{t.payment_status}</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">{t.status}</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-gray-800">
              {filteredSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-slate-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-gray-400">
                    {formatDate(sale.sale_date)}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-sky-600">
                    {sale.sale_number}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-700 dark:text-white">
                    {sale.contact?.name}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white">
                    {formatCurrency(sale.total_amount)}
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={sale.payment_status}
                      onChange={(e) => handlePaymentStatusChange(sale.id, e.target.value)}
                      className="bg-transparent text-[10px] font-bold uppercase tracking-tight outline-none cursor-pointer"
                    >
                      <option value="pending" className="text-red-600">⚠ {t.status_pending}</option>
                      <option value="partial" className="text-amber-600">◐ {t.status_partial}</option>
                      <option value="paid" className="text-emerald-600">✓ {t.status_paid}</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={sale.status}
                      onChange={(e) => handleStatusChange(sale.id, e.target.value)}
                      className={`text-[10px] font-bold uppercase tracking-tight px-3 py-1 rounded-full border-0 cursor-pointer appearance-none text-center
                        ${sale.status === 'completed' ? 'bg-emerald-50 text-emerald-700' : sale.status === 'pending' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'}`}
                    >
                      <option value="pending">{t.status_pending}</option>
                      <option value="completed">{t.status_completed}</option>
                      <option value="cancelled">{t.status_cancelled}</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end space-x-1">
                       <button onClick={() => viewSale(sale)} className="p-2 hover:bg-slate-100 dark:hover:bg-gray-700 text-slate-400 rounded-lg transition-colors" title={t.view_details}>
                        <Eye size={18} />
                      </button>
                      <button onClick={() => handleDelete(sale.id)} className="p-2 hover:bg-rose-50 dark:hover:bg-gray-700 text-rose-400 rounded-lg transition-colors" title={t.delete}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Create Sale Modal ── */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={t.add_sale} size="full">
        <form onSubmit={handleSubmit} className="space-y-12 transition-all">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-4">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">{t.customer}</label>
              <select value={formData.contact_id} onChange={(e) => setFormData({ ...formData, contact_id: e.target.value })} className="input-field !py-4 text-lg font-semibold" required>
                <option value="">{t.select_contact}</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="space-y-4">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">{t.table_date}</label>
              <input type="date" value={formData.sale_date} onChange={(e) => setFormData({ ...formData, sale_date: e.target.value })} className="input-field !py-4 text-lg font-semibold" required />
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-gray-800 pb-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t.detailed_data}</h4>
              <button type="button" onClick={handleAddItemRow} className="text-xs font-bold text-sky-600 flex items-center gap-2 hover:bg-sky-50 px-3 py-1.5 rounded-lg transition-colors">
                <Plus size={16} /> {t.add_row}
              </button>
            </div>

            <div className="space-y-4">
              {formData.items.map((it, index) => (
                <div key={index} className="flex flex-wrap lg:flex-nowrap gap-6 items-end p-6 border border-slate-100 dark:border-gray-800 rounded-xl relative group hover:border-slate-200 transition-colors">
                  <div className="flex-1 min-w-[300px]">
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">{t.item}</label>
                    <select value={it.item_id} onChange={(e) => handleItemChange(index, 'item_id', e.target.value)} className="input-field bg-transparent" required>
                      <option value="">{t.select_item}</option>
                      {items.map(i => (
                        <option key={i.id} value={i.id} disabled={i.stock_on_hand <= 0}>
                          {i.name} ({i.stock_on_hand} in stock)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-24">
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block text-center">{t.qty}</label>
                    <input type="number" min="1" value={it.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} className="input-field text-center font-bold" required />
                  </div>
                  <div className="w-32">
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block text-right">{t.price}</label>
                    <input type="number" min="0" step="0.01" value={it.unit_price} onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)} className="input-field text-right font-bold" required />
                  </div>
                  <div className="w-32 text-right">
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">{t.table_total}</label>
                    <div className="text-lg font-bold text-slate-900 dark:text-white px-2">
                      {(Number(it.quantity) * Number(it.unit_price)).toFixed(2)}
                    </div>
                  </div>
                  {formData.items.length > 1 && (
                    <button type="button" onClick={() => handleRemoveItemRow(index)} className="p-2 text-rose-400 hover:bg-rose-50 rounded-lg transition-colors">
                      <X size={20} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-8">
              <div className="w-full max-w-sm flex justify-between items-center bg-slate-100 dark:bg-gray-800 p-8 rounded-xl">
                 <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t.total_amount}</span>
                 <span className="text-3xl font-bold text-slate-900 dark:text-white">{formatCurrency(calculateTotal())}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">{t.note}</label>
            <textarea value={formData.note} onChange={(e) => setFormData({ ...formData, note: e.target.value })} className="input-field !bg-transparent" rows="3" />
          </div>

          <div className="flex justify-end pt-10 border-t border-slate-100 dark:border-gray-800">
            <button type="submit" className="btn-primary min-w-[300px] !py-4 text-xl">
              {t.create}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Invoice Modal ── */}
      {newSale && (
        <Modal isOpen={showInvoiceModal} onClose={() => setShowInvoiceModal(false)} title={t.sale_complete} size="full">
          <div className="pt-4">
            <InvoiceView sale={newSale} items={items} t={t} />
            <div className="mt-12 flex justify-center gap-4 no-print max-w-[800px] mx-auto">
              <button 
                onClick={() => printInvoice(t.invoice_title)}
                className="flex-1 btn-primary py-4 flex items-center justify-center gap-3"
              >
                <Printer size={20} /> {t.print_pdf}
              </button>
              <button 
                onClick={() => setShowInvoiceModal(false)} 
                className="flex-1 btn-secondary py-4"
              >
                {t.cancel}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── View Sale Modal ── */}
      {selectedSale && (
        <Modal isOpen={showViewModal} onClose={() => setShowViewModal(false)} title={`${t.sales_title}: ${selectedSale.sale_number}`} size="full">
          <div className="pt-4">
            <InvoiceView sale={selectedSale} items={items} t={t} />
            <div className="mt-12 flex justify-center gap-4 no-print max-w-[800px] mx-auto">
              <button 
                onClick={() => printInvoice(t.invoice_title)}
                className="flex-1 btn-primary py-4 flex items-center justify-center gap-3"
              >
                <Printer size={20} /> {t.print_pdf}
              </button>
              <button 
                onClick={() => setShowViewModal(false)} 
                className="flex-1 btn-secondary py-4"
              >
                {t.cancel}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
