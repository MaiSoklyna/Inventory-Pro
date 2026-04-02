import React, { useState, useEffect, useContext } from 'react'
import { Plus, Eye, Trash2, Search, X, ShoppingCart, Printer } from 'lucide-react'
import { purchaseService, contactService, itemService } from '../services/api'
import Modal from '../components/Modal'
import { LanguageContext } from '../App'
import toast from 'react-hot-toast'
import { formatCurrency, formatDate } from '../utils/helpers'

export default function Purchases() {
  const { t } = useContext(LanguageContext)
  const [purchases, setPurchases] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [items, setItems] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const [showModal, setShowModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedPurchase, setSelectedPurchase] = useState(null)

  const initialFormData = {
    contact_id: '',
    purchase_date: new Date().toISOString().split('T')[0],
    due_date: new Date().toISOString().split('T')[0],
    note: '',
    items: [{ item_id: '', quantity: 1, unit_price: 0 }]
  }
  const [formData, setFormData] = useState(initialFormData)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [purchasesRes, contactsRes, itemsRes] = await Promise.all([
        purchaseService.getAll(),
        contactService.getAll('supplier'),
        itemService.getAll()
      ])

      setPurchases(purchasesRes.data.data ? purchasesRes.data.data : purchasesRes.data)
      setSuppliers(contactsRes.data.data ? contactsRes.data.data : contactsRes.data)
      setItems(itemsRes.data.data ? itemsRes.data.data : itemsRes.data)
    } catch (error) {
      toast.error(t.failed_load)
    } finally {
      setLoading(false)
    }
  }

  const handleAddItemRow = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { item_id: '', quantity: 1, unit_price: 0 }]
    })
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
      const selectedItem = items.find(i => i.id.toString() === value.toString())
      if (selectedItem) {
        newItems[index]['unit_price'] = selectedItem.cost_price || 0
      }
    }

    setFormData({ ...formData, items: newItems })
  }

  const calculateTotal = () => {
    return formData.items.reduce((total, item) => {
      return total + (Number(item.quantity) * Number(item.unit_price))
    }, 0)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.contact_id) return toast.error(t.select_contact)
    if (formData.items.length === 0) return toast.error(t.no_data)
    const hasEmptyItems = formData.items.some(i => !i.item_id || i.quantity < 1 || i.unit_price < 0)
    if (hasEmptyItems) return toast.error(t.failed_op)

    try {
      await purchaseService.create(formData)
      toast.success(t.success_create)
      setShowModal(false)
      setFormData(initialFormData)
      fetchData()
    } catch (error) {
      toast.error(error.response?.data?.message || t.failed_op)
    }
  }

  const handleStatusChange = async (id, newStatus) => {
    try {
      await purchaseService.update(id, { status: newStatus })
      toast.success(t.success_update)
      fetchData()
    } catch (error) {
      toast.error(t.failed_op)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm(t.confirm_delete)) {
      try {
        await purchaseService.delete(id)
        toast.success(t.success_delete)
        fetchData()
      } catch (error) {
        toast.error(t.failed_op)
      }
    }
  }

  const viewPurchase = (purchase) => {
    setSelectedPurchase(purchase)
    setShowViewModal(true)
  }

  const filteredPurchases = purchases.filter(p =>
    p.purchase_number.toLowerCase().includes(search.toLowerCase()) ||
    p.contact?.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 space-y-6 animate-fade-in max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <ShoppingCart size={28} className="text-sky-600" />
            {t.purchases_title}
          </h1>
          <p className="text-sm text-slate-500 mt-1">Manage and track your business replenishment orders.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>{t.add_purchase}</span>
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          placeholder={t.search_purchases}
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
      ) : filteredPurchases.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-xl border border-dashed border-slate-200 dark:border-gray-800">
          <ShoppingCart size={40} className="mx-auto text-slate-200 mb-4" />
          <p className="text-lg font-bold text-slate-400">{t.no_data}</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-slate-200 dark:border-gray-800 overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-gray-800 border-b border-slate-100 dark:border-gray-800">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">{t.table_date}</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">{t.purchase_number}</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">{t.supplier}</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">{t.total_amount}</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">{t.status}</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-gray-800">
              {filteredPurchases.map((purchase) => (
                <tr key={purchase.id} className="hover:bg-slate-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-gray-400">
                    {formatDate(purchase.purchase_date)}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-sky-600">
                    {purchase.purchase_number}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-700 dark:text-white">
                    {purchase.contact?.name}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white">
                    {formatCurrency(purchase.total_amount)}
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={purchase.status}
                      onChange={(e) => handleStatusChange(purchase.id, e.target.value)}
                      className={`text-[10px] font-bold uppercase tracking-tight px-3 py-1 rounded-full border-0 cursor-pointer appearance-none text-center
                        ${purchase.status === 'completed' ? 'bg-emerald-50 text-emerald-700' : purchase.status === 'pending' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'}`}
                    >
                      <option value="pending">{t.status_pending}</option>
                      <option value="completed">{t.status_completed}</option>
                      <option value="cancelled">{t.status_cancelled}</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end space-x-1">
                      <button
                        onClick={() => viewPurchase(purchase)}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-gray-700 text-slate-400 rounded-lg transition-colors"
                        title={t.view_details}
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(purchase.id)}
                        className="p-2 hover:bg-rose-50 dark:hover:bg-gray-700 text-rose-400 rounded-lg transition-colors"
                        title={t.delete}
                      >
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

      {/* Create Purchase Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={t.add_purchase}
        size="full"
      >
         <form onSubmit={handleSubmit} className="space-y-12 transition-all">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-4">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">{t.supplier}</label>
              <select
                value={formData.contact_id}
                onChange={(e) => setFormData({ ...formData, contact_id: e.target.value })}
                className="input-field !py-4 text-lg font-semibold"
                required
              >
                <option value="">{t.select_contact}</option>
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-4">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">{t.table_date}</label>
              <input
                type="date"
                value={formData.purchase_date}
                onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                className="input-field !py-4 text-lg font-semibold"
                required
              />
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
                        <option key={i.id} value={i.id}>{i.name} ({i.stock_on_hand} in stock)</option>
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

      {/* View Purchase Modal */}
      {selectedPurchase && (
        <Modal
          isOpen={showViewModal}
          onClose={() => setShowViewModal(false)}
          title={`${t.purchases_title}: ${selectedPurchase.purchase_number}`}
          size="full"
        >
          <div id="purchase-print-area" className="p-12 max-w-[850px] mx-auto bg-white text-slate-900 font-sans">
            {/* Header Section */}
            <div className="flex justify-between items-start mb-10">
              <div>
                <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter mb-1">{t.purchases_title}</h1>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t.inventory_title}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-black text-slate-900 tracking-tight">{selectedPurchase.purchase_number}</p>
                <p className="text-sm font-medium text-slate-400 mt-1">{t.table_date}: {formatDate(selectedPurchase.purchase_date)}</p>
              </div>
            </div>

            <div className="h-px bg-slate-100 mb-12"></div>

            {/* Supplier Section */}
            <div className="mb-12">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3">{t.supplier}</p>
              <h2 className="text-2xl font-black text-slate-900 mb-2">{selectedPurchase.contact?.name}</h2>
              <div className="text-sm text-slate-500 space-y-1 font-medium">
                {selectedPurchase.contact?.phone && <p>{selectedPurchase.contact.phone}</p>}
                {selectedPurchase.contact?.email && <p>{selectedPurchase.contact.email}</p>}
                {selectedPurchase.contact?.address && <p>{selectedPurchase.contact.address}</p>}
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
                {(selectedPurchase.items || selectedPurchase.purchase_items || selectedPurchase.items_list)?.map((itm, idx) => {
                  const itmDetails = items.find(i => i.id?.toString() === itm.item_id?.toString())
                  const name = itm.item_name || itm.item?.name || itmDetails?.name || `Item #${itm.item_id}`
                  const qty = (itm.quantity ?? itm.qty ?? itm.pivot?.quantity ?? itm.pivot?.qty) ?? 0
                  const price = (itm.unit_price ?? itm.price ?? itm.pivot?.unit_price ?? itm.pivot?.price ?? itm.cost_price) ?? 0
                  const subtotal = (itm.subtotal ?? itm.total ?? itm.pivot?.subtotal ?? itm.pivot?.total) ?? (Number(qty) * Number(price))

                  return (
                    <tr key={idx}>
                      <td className="px-6 py-6 text-sm font-bold text-slate-900">{name}</td>
                      <td className="px-6 py-6 text-sm font-medium text-slate-500 text-center">{qty}</td>
                      <td className="px-6 py-6 text-sm font-medium text-slate-500 text-right">{formatCurrency(price)}</td>
                      <td className="px-6 py-6 text-sm font-black text-right text-slate-900">{formatCurrency(subtotal)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {/* Summary Section */}
            <div className="flex justify-end mb-16">
              <div className="w-full max-w-md bg-slate-50 rounded-2xl p-10 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">{t.total_amount}</span>
                <span className="text-4xl font-black text-slate-900 tracking-tighter">{formatCurrency(selectedPurchase.total_amount)}</span>
              </div>
            </div>

            {selectedPurchase.note && (
              <div className="mb-16 p-6 bg-amber-50 rounded-xl border-l-4 border-amber-400 no-print">
                <p className="text-[10px] font-bold text-amber-600 uppercase mb-2">{t.note}</p>
                <p className="text-sm text-slate-700 font-medium leading-relaxed">{selectedPurchase.note}</p>
              </div>
            )}

            {/* Footer */}
            <div className="text-center pt-12 border-t border-slate-50">
              <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em]">{t.system_footer}</p>
            </div>
          </div>

          <div className="p-6 bg-slate-50 border-t border-slate-200 flex gap-4 no-print">
            <button 
              onClick={() => {
                const title = `${t.purchases_title}: ${selectedPurchase.purchase_number}`
                const printContent = document.getElementById('purchase-print-area')
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
                        #purchase-print-area { width: 100% !important; max-width: 100% !important; margin: 0 !important; border: none !important; box-shadow: none !important; }
                        .no-print { display: none !important; }
                        @media print {
                          body { padding: 0; }
                        }
                      </style>
                    </head>
                    <body>
                      ${printContent.innerHTML}
                    </body>
                  </html>
                `)
                win.document.close()
                win.focus()
                
                // Delay to ensure Tailwind/fonts are rendered
                setTimeout(() => { 
                  win.print()
                  win.close() 
                }, 1000)
              }}
              className="flex-1 btn-primary py-4 flex items-center justify-center gap-3"
            >
              <Printer size={20} /> {t.print_pdf}
            </button>
            <button onClick={() => setShowViewModal(false)} className="flex-1 btn-secondary py-4">
              {t.cancel}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
