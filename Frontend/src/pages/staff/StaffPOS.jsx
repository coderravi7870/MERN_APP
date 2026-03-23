import React, { useEffect, useState } from 'react';
import { Search, Plus, Minus, Trash2, ShoppingCart, CheckCircle } from 'lucide-react';
import api from '../../utils/api.js';

export default function StaffPOS() {
  const [products,   setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [search,     setSearch]     = useState('');
  const [catFilter,  setCatFilter]  = useState('');
  const [cart,       setCart]       = useState([]);
  const [placing,    setPlacing]    = useState(false);
  const [success,    setSuccess]    = useState(false);

  useEffect(() => {
    Promise.all([api.get('/products/categories'), api.get('/products')]).then(([c, p]) => {
      setCategories(c.data.data);
      setProducts(p.data.data);
    });
  }, []);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) &&
    (!catFilter || p.category_id == catFilter)
  );

  const addToCart = (prod) => {
    setCart(prev => {
      const exists = prev.find(i => i.id === prod.id);
      if (exists) return prev.map(i => i.id === prod.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...prod, qty: 1 }];
    });
  };

  const updateQty = (id, qty) => {
    if (qty <= 0) setCart(prev => prev.filter(i => i.id !== id));
    else setCart(prev => prev.map(i => i.id === id ? { ...i, qty } : i));
  };

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  const placeOrder = async () => {
    setPlacing(true);
    try {
      await api.post('/orders', {
        items: cart.map(i => ({ product_id: i.id, quantity: i.qty })),
        notes: 'Walk-in customer (POS)',
      });
      setCart([]);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Order failed');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="h-full flex flex-col lg:flex-row gap-6">
      {/* Product panel */}
      <div className="flex-1 space-y-4 min-w-0">
        <h1 className="text-2xl font-display font-bold text-gray-900">Point of Sale</h1>

        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input className="input-field pl-9" placeholder="Search products…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="input-field w-44" value={catFilter} onChange={e => setCatFilter(e.target.value)}>
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 240px)' }}>
          {filtered.map(p => (
            <button key={p.id} onClick={() => addToCart(p)} disabled={p.stock === 0}
              className={`card text-left p-3 hover:border-brand-300 hover:shadow-md transition-all border ${p.stock === 0 ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer active:scale-95'}`}>
              <p className="font-medium text-gray-800 text-sm leading-tight">{p.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">{p.category_name}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="font-bold text-brand-600">₹{p.price}</span>
                <span className={`text-xs ${p.stock <= p.low_stock_threshold ? 'text-red-500' : 'text-gray-400'}`}>
                  {p.stock} {p.unit}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Cart */}
      <div className="lg:w-80 xl:w-96 flex flex-col card p-0 overflow-hidden flex-shrink-0">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-brand-500" />
          <h2 className="font-semibold text-gray-900">Cart</h2>
          <span className="ml-auto text-sm text-gray-400">{cart.length} items</span>
        </div>

        {success && (
          <div className="mx-4 mt-3 flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-3 py-2 text-sm">
            <CheckCircle className="w-4 h-4" /> Order placed successfully!
          </div>
        )}

        <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
          {cart.map(i => (
            <div key={i.id} className="flex items-center gap-3 px-4 py-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{i.name}</p>
                <p className="text-xs text-gray-400">₹{i.price} × {i.qty}</p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button onClick={() => updateQty(i.id, i.qty - 1)} className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-7 text-center text-sm font-semibold">{i.qty}</span>
                <button onClick={() => updateQty(i.id, i.qty + 1)} className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                  <Plus className="w-3 h-3" />
                </button>
                <button onClick={() => updateQty(i.id, 0)} className="w-7 h-7 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 flex items-center justify-center transition-colors">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
          {!cart.length && (
            <div className="py-12 text-center text-gray-400">
              <ShoppingCart className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Cart is empty</p>
            </div>
          )}
        </div>

        <div className="border-t border-gray-100 p-4 space-y-3">
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span className="text-brand-600">₹{total.toFixed(2)}</span>
          </div>
          <button onClick={placeOrder} disabled={!cart.length || placing} className="btn-primary w-full py-3 text-base">
            {placing ? 'Placing Order…' : 'Place Order'}
          </button>
        </div>
      </div>
    </div>
  );
}