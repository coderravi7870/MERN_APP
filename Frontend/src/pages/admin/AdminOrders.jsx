import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronRight, RefreshCw } from 'lucide-react';
import api from '../../utils/api.js';
import StatusBadge from '../../components/StatusBadge.jsx';

export default function AdminOrders() {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  const load = () => {
    setLoading(true);
    api.get('/orders').then(r => setOrders(r.data.data)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const updateStatus = async (id, status) => {
    try { await api.patch(`/orders/${id}/status`, { status }); load(); }
    catch (err) { alert(err.response?.data?.message || 'Failed'); }
  };

  const cancelOrder = async (id) => {
    if (!confirm('Cancel this order?')) return;
    try { await api.patch(`/orders/${id}/cancel`); load(); }
    catch (err) { alert(err.response?.data?.message || 'Failed'); }
  };

  if (loading) return <div className="flex justify-center h-64 items-center"><div className="animate-spin w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-gray-900">Orders</h1>
        <button onClick={load} className="btn-secondary flex items-center gap-2 text-sm">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="space-y-3">
        {orders.map(o => (
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
              <div className="hidden sm:block text-right mr-4">
                <p className="font-semibold text-sm">₹{Number(o.total_amount).toLocaleString()}</p>
                {o.staff_name && <p className="text-xs text-gray-400">Staff: {o.staff_name}</p>}
              </div>
              <StatusBadge status={o.status} />
            </div>

            {expanded === o.id && (
              <div className="border-t border-gray-100 px-4 py-4 bg-gray-50 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 text-xs font-medium mb-1">CUSTOMER</p>
                    <p className="font-medium">{o.customer_name}</p>
                    <p className="text-gray-500">{o.customer_email}</p>
                    {o.customer_phone && <p className="text-gray-500">{o.customer_phone}</p>}
                  </div>
                  {o.staff_name && (
                    <div>
                      <p className="text-gray-500 text-xs font-medium mb-1">ASSIGNED STAFF</p>
                      <p className="font-medium">{o.staff_name}</p>
                    </div>
                  )}
                  {o.notes && (
                    <div className="sm:col-span-2">
                      <p className="text-gray-500 text-xs font-medium mb-1">NOTES</p>
                      <p>{o.notes}</p>
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-gray-500 text-xs font-medium mb-2">ITEMS</p>
                  <div className="space-y-1">
                    {o.items?.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span>{item.product_name} × {item.quantity} {item.unit}</span>
                        <span className="font-medium">₹{Number(item.subtotal).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between font-bold mt-2 pt-2 border-t border-gray-200 text-sm">
                    <span>Total</span>
                    <span>₹{Number(o.total_amount).toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  {o.status === 'accepted' && (
                    <button onClick={() => updateStatus(o.id, 'processing')} className="btn-primary text-xs py-1.5 px-3">Mark Processing</button>
                  )}
                  {o.status === 'processing' && (
                    <button onClick={() => updateStatus(o.id, 'completed')} className="bg-green-500 hover:bg-green-600 text-white text-xs py-1.5 px-3 rounded-lg font-semibold">Mark Completed</button>
                  )}
                  {!['completed','cancelled'].includes(o.status) && (
                    <button onClick={() => cancelOrder(o.id)} className="btn-danger text-xs py-1.5 px-3">Cancel Order</button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
        {!orders.length && <div className="card text-center py-12 text-gray-400">No orders yet</div>}
      </div>
    </div>
  );
}