import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Search, X, AlertTriangle } from 'lucide-react';
import api from '../../utils/api.js';

const EMPTY = { category_id: '', name: '', description: '', price: '', stock: '', unit: 'piece', low_stock_threshold: 10 };

export default function AdminInventory() {
  const [products,   setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [search,     setSearch]     = useState('');
  const [modal,      setModal]      = useState(false);
  const [editing,    setEditing]    = useState(null);
  const [form,       setForm]       = useState(EMPTY);
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);

  const load = async () => {
    const [p, c] = await Promise.all([
      api.get(`/products?search=${search}`),
      api.get('/products/categories'),
    ]);
    setProducts(p.data.data);
    setCategories(c.data.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, [search]);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setModal(true); };
  const openEdit   = p  => { setEditing(p); setForm({ ...p }); setModal(true); };
  const closeModal = () => { setModal(false); setEditing(null); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/products/${editing.id}`, form);
      } else {
        console.log("form", form);
        await api.post('/products', form);
      }
      await load();
      closeModal();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try { await api.delete(`/products/${id}`); await load(); }
    catch (err) { alert(err.response?.data?.message || 'Delete failed'); }
  };

  if (loading) return <div className="flex justify-center h-64 items-center"><div className="animate-spin w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-display font-bold text-gray-900">Inventory</h1>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          className="input-field pl-9"
          placeholder="Search products…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr className="text-left text-gray-500">
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Unit</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {products.map(p => (
              <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-800">{p.name}</p>
                  {p.description && <p className="text-xs text-gray-400 truncate max-w-xs">{p.description}</p>}
                </td>
                <td className="px-4 py-3 text-gray-600">{p.category_name || '—'}</td>
                <td className="px-4 py-3 font-semibold">₹{Number(p.price).toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className={`font-semibold ${p.stock <= p.low_stock_threshold ? 'text-red-600 flex items-center gap-1' : 'text-gray-700'}`}>
                    {p.stock <= p.low_stock_threshold && <AlertTriangle className="w-3 h-3" />}
                    {p.stock}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">{p.unit}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEdit(p)} className="p-1.5 text-gray-400 hover:text-brand-500 hover:bg-gray-50 rounded-lg transition-all">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!products.length && <tr><td colSpan={6} className="py-10 text-center text-gray-400">No products found</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="font-semibold text-gray-900">{editing ? 'Edit Product' : 'Add Product'}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {[
                { label: 'Product Name', key: 'name', type: 'text', required: true },
                { label: 'Description',  key: 'description', type: 'text' },
                { label: 'Price (₹)',    key: 'price', type: 'number', required: true, min: 0, step: '0.01' },
                { label: 'Stock',        key: 'stock', type: 'number', min: 0 },
                { label: 'Unit',         key: 'unit',  type: 'text' },
                { label: 'Low Stock Threshold', key: 'low_stock_threshold', type: 'number', min: 0 },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                  <input
                    type={f.type}
                    className="input-field"
                    value={form[f.key] || ''}
                    onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    required={f.required}
                    min={f.min}
                    step={f.step}
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select className="input-field" value={form.category_id || ''} onChange={e => setForm({ ...form, category_id: e.target.value })}>
                  <option value="">None</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Saving…' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}