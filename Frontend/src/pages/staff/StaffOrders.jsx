import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Bell, RefreshCw, ChevronDown, ChevronRight, CheckCircle, XCircle } from 'lucide-react';
import api from '../../utils/api.js';
import StatusBadge from '../../components/StatusBadge.jsx';

export default function StaffOrders() {
  const { notifs, reloadNotifs } = useOutletContext();
  const [orders,   setOrders]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [expanded, setExpanded] = useState(null);

  const loadOrders = () => {
    setLoading(true);
    api.get('/orders').then(r => setOrders(r.data.data)).finally(() => setLoading(false));
  };

  useEffect(()=> {loadOrders()}, []);

  const accept = async (id) => {
    try {
      await api.patch(`/orders/${id}/accept`);
      await reloadNotifs();
      loadOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to accept order');
    }
  };

  const cancel = async (id) => {
    if (!confirm('Cancel this order? Stock will be restored.')) return;
    try {
      await api.patch(`/orders/${id}/cancel`);
      await reloadNotifs();
      loadOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel order');
    }
  };

  const updateStatus = async (id, status) => {
    try { await api.patch(`/orders/${id}/status`, { status }); loadOrders(); }
    catch (err) { alert(err.response?.data?.message || 'Failed'); }
  };

  if (loading) return <div className="flex justify-center h-64 items-center"><div className="animate-spin w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full" /></div>;

  const pendingNotifs = notifs.filter(n => n.order_status === 'pending');
  const myOrders      = orders.filter(o => o.status !== 'pending');


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-gray-900">Orders</h1>
        <button onClick={() => { loadOrders(); reloadNotifs(); }} className="btn-secondary flex items-center gap-2 text-sm">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* New Order Notifications */}
      {pendingNotifs.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-brand-500 animate-pulse" />
            <h2 className="font-semibold text-gray-900">New Orders Waiting</h2>
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{pendingNotifs.length}</span>
          </div>

          {pendingNotifs.map(n => (
            <div key={n.order_id} className="border-2 border-brand-300 bg-gray-50 rounded-2xl p-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm text-gray-500">#{n.order_id}</span>
                    <StatusBadge status="pending" />
                  </div>
                  <p className="font-semibold text-gray-800">{n.customer_name}</p>
                  {n.customer_phone && <p className="text-sm text-gray-500">{n.customer_phone}</p>}
                  <p className="text-sm font-semibold text-brand-600 mt-1">₹{Number(n.total_amount).toLocaleString()}</p>
                  <p className="text-xs text-gray-400">{new Date(n.order_time).toLocaleString()}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => accept(n.order_id)}
                    className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold text-sm px-4 py-2 rounded-xl transition-all">
                    <CheckCircle className="w-4 h-4" /> Accept
                  </button>
                  <button onClick={() => cancel(n.order_id)}
                    className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold text-sm px-4 py-2 rounded-xl transition-all">
                    <XCircle className="w-4 h-4" /> Cancel
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* My accepted orders */}
      <div>
        <h2 className="font-semibold text-gray-900 mb-3">My Orders</h2>
        <div className="space-y-3">
          {myOrders.map(o => (
            <div key={o.id} className="card p-0 overflow-hidden">
              <div
                className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50"
                onClick={() => setExpanded(expanded === o.id ? null : o.id)}
              >
                {expanded === o.id ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                <span className="font-mono text-sm text-gray-500 w-12">#{o.id}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 text-sm">{o.customer_name}</p>
                  <p className="text-xs text-gray-400">{new Date(o.created_at).toLocaleString()}</p>
                </div>
                <p className="font-semibold text-sm mr-3 hidden sm:block">₹{Number(o.total_amount).toLocaleString()}</p>
                <StatusBadge status={o.status} />
              </div>

              {expanded === o.id && (
                <div className="border-t border-gray-100 px-4 py-4 bg-gray-50 space-y-3">
                  <div className="text-sm space-y-1">
                    <p><span className="text-gray-500">Customer:</span> {o.customer_name} {o.customer_phone && `· ${o.customer_phone}`}</p>
                    <p><span className="text-gray-500">Address:</span> {o.customer_address} </p>
                    {o.notes && <p><span className="text-gray-500">Notes:</span> {o.notes}</p>}
                  </div>
                  <div className="space-y-1">
                    {o.items?.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span>{item.product_name} × {item.quantity}</span>
                        <span className="font-medium">₹{Number(item.subtotal).toLocaleString()}</span>
                      </div>
                    ))}
                    <div className="flex justify-between font-bold text-sm pt-2 border-t border-gray-200">
                      <span>Total</span>
                      <span>₹{Number(o.total_amount).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {o.status === 'accepted' && (
                      <button onClick={() => updateStatus(o.id, 'processing')} className="btn-primary text-xs py-1.5 px-3">Mark Processing</button>
                    )}
                    {o.status === 'processing' && (
                      <button onClick={() => updateStatus(o.id, 'completed')} className="bg-green-500 hover:bg-green-600 text-white text-xs py-1.5 px-3 rounded-lg font-semibold">Mark Completed</button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
          {!myOrders.length && <div className="card text-center py-8 text-gray-400">No orders assigned to you yet</div>}
        </div>
      </div>
    </div>
  );
}