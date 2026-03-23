import React, { useEffect, useState } from 'react';
import { Search, Plus, Minus, ShoppingCart, X, Trash2, CheckCircle } from 'lucide-react';
import api from '../../utils/api.js';
import { useCart } from '../../context/CartContext.jsx';

export default function CustomerShop() {
  const [products,   setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [search,     setSearch]     = useState('');
  const [catFilter,  setCatFilter]  = useState('');
  const [cartOpen,   setCartOpen]   = useState(false);
  const [placing,    setPlacing]    = useState(false);
  const [success,    setSuccess]    = useState(false);
  const [notes,      setNotes]      = useState('');
  const { cart, addToCart, updateQty, removeFromCart, clearCart, total } = useCart();

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

  const placeOrder = async () => {
    setPlacing(true);
    try {
      await api.post('/orders', {
        items: cart.map(i => ({ product_id: i.id, quantity: i.qty })),
        notes: notes || null,
      });
      clearCart();
      setCartOpen(false);
      setNotes('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Order failed');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-gray-900">Shop</h1>
        <button onClick={() => setCartOpen(true)} className="relative btn-primary flex items-center gap-2">
          <ShoppingCart className="w-4 h-4" />
          Cart
          {cart.length > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-white text-red-500 text-xs font-bold w-5 h-5 rounded-full border-2 border-brand-500 flex items-center justify-center">
              {cart.length}
            </span>
          )}
        </button>
      </div>

      {success && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-800 rounded-xl px-4 py-3">
          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
          <div>
            <p className="font-semibold">Order placed successfully!</p>
            <p className="text-sm">Our staff will process your order soon.</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 flex-col sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input className="input-field pl-9" placeholder="Search products…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input-field sm:w-48" value={catFilter} onChange={e => setCatFilter(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* Products grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map(p => {
          const inCart = cart.find(i => i.id === p.id);
          return (
            <div key={p.id} className="card hover:shadow-md transition-shadow border">
              <div className="h-2 rounded-full bg-gradient-to-r from-brand-400 to-amber-400 -mt-6 -mx-6 mb-4 rounded-t-2xl" />
              <p className="font-semibold text-gray-800 leading-tight">{p.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">{p.category_name}</p>
              {p.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{p.description}</p>}
              <div className="flex items-center justify-between mt-3">
                <div>
                  <span className="text-lg font-bold text-brand-600">₹{Number(p.price).toLocaleString()}</span>
                  <span className="text-xs text-gray-400 ml-1">/{p.unit}</span>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${p.stock === 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
                  {p.stock === 0 ? 'Out of stock' : `${p.stock} left`}
                </span>
              </div>
              {p.stock === 0 ? (
                <button disabled className="w-full mt-3 py-2 text-sm font-semibold bg-gray-100 text-gray-400 rounded-xl cursor-not-allowed">Unavailable</button>
              ) : inCart ? (
                <div className="flex items-center justify-between mt-3 bg-brand-50 rounded-xl px-3 py-1.5">
                  <button onClick={() => updateQty(p.id, inCart.qty - 1)} className="w-7 h-7 bg-white rounded-lg shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer">
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="font-bold text-gray-600">{inCart.qty}</span>
                  <button onClick={() => addToCart(p)} className="w-7 h-7 bg-white rounded-lg shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer">
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button onClick={() => addToCart(p)} className="w-full mt-3 py-2 text-sm font-semibold bg-gray-600 hover:bg-gray-700 text-white rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer">
                  <Plus className="w-4 h-4" /> Add to Cart
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Cart Drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/50" onClick={() => setCartOpen(false)} />
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2"><ShoppingCart className="w-5 h-5 text-brand-500" /> Your Cart</h2>
              <button onClick={() => setCartOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
              {cart.map(i => (
                <div key={i.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 text-sm">{i.name}</p>
                    <p className="text-xs text-gray-400">₹{i.price} × {i.qty} = <span className="font-semibold text-gray-600">₹{(i.price * i.qty).toFixed(2)}</span></p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => updateQty(i.id, i.qty - 1)} className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200"><Minus className="w-3 h-3" /></button>
                    <span className="w-6 text-center font-bold text-sm">{i.qty}</span>
                    <button onClick={() => updateQty(i.id, i.qty + 1)} className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200"><Plus className="w-3 h-3" /></button>
                    <button onClick={() => removeFromCart(i.id)} className="w-7 h-7 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 flex items-center justify-center"><Trash2 className="w-3 h-3" /></button>
                  </div>
                </div>
              ))}
              {!cart.length && (
                <div className="py-16 text-center text-gray-400">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>Your cart is empty</p>
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t border-gray-100 p-5 space-y-4">
                <textarea
                  className="input-field resize-none h-20"
                  placeholder="Special instructions (optional)…"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
                <div className="flex justify-between font-bold text-xl">
                  <span>Total</span>
                  <span className="text-gray-600">₹{total.toFixed(2)}</span>
                </div>
                <button onClick={placeOrder} disabled={placing} className="btn-primary w-full py-3 text-base">
                  {placing ? 'Placing Order…' : 'Place Order'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}