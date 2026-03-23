import React, { useEffect, useState } from 'react';
import { Search, Save, AlertTriangle } from 'lucide-react';
import api from '../../utils/api.js'; 

export default function StaffStock() {
  const [products, setProducts] = useState([]);
  const [search,   setSearch]   = useState('');
  const [editing,  setEditing]  = useState({});  // { [id]: newStock }
  const [saving,   setSaving]   = useState({});
  const [loading,  setLoading]  = useState(true);

  const load = () => api.get('/products').then(r => setProducts(r.data.data)).finally(() => setLoading(false));
  useEffect(()=>{load()}, []);

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const saveStock = async (id) => {
    const newStock = editing[id];
    if (newStock == null) return;
    setSaving(s => ({ ...s, [id]: true }));
    try {
      await api.patch(`/products/${id}/stock`, { stock: Number(newStock) });
      setEditing(e => { const next = { ...e }; delete next[id]; return next; });
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    } finally {
      setSaving(s => { const next = { ...s }; delete next[id]; return next; });
    }
  };

  if (loading) return <div className="flex justify-center h-64 items-center"><div className="animate-spin w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold text-gray-900">Update Stock</h1>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input className="input-field pl-9" placeholder="Search products…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr className="text-left text-gray-500">
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Current Stock</th>
              <th className="px-4 py-3 font-medium">New Stock</th>
              <th className="px-4 py-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map(p => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{p.name}</td>
                <td className="px-4 py-3 text-gray-500">{p.category_name || '—'}</td>
                <td className="px-4 py-3">
                  <span className={`font-semibold flex items-center gap-1 ${p.stock <= p.low_stock_threshold ? 'text-red-600' : 'text-gray-700'}`}>
                    {p.stock <= p.low_stock_threshold && <AlertTriangle className="w-3 h-3" />}
                    {p.stock} {p.unit}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    min="0"
                    className="input-field w-24"
                    placeholder={String(p.stock)}
                    value={editing[p.id] ?? ''}
                    onChange={e => setEditing(ed => ({ ...ed, [p.id]: e.target.value }))}
                  />
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => saveStock(p.id)}
                    disabled={editing[p.id] == null || editing[p.id] === '' || saving[p.id]}
                    className="flex items-center gap-1.5 bg-gray-500 hover:bg-gray-600 text-white text-xs font-semibold py-1.5 px-3 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <Save className="w-3 h-3" />
                    {saving[p.id] ? 'Saving…' : 'Save'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}