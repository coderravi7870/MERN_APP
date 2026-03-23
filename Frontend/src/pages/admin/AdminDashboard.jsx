import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, ShoppingCart, Users, AlertTriangle, Package, ArrowRight } from 'lucide-react';
import api from '../../utils/api.js';
import StatusBadge from '../../components/StatusBadge.jsx';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="card flex items-center gap-4">
    <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center flex-shrink-0`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div>
      <p className="text-2xl font-display font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  </div>
);

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [lowStock,  setLowStock]  = useState([]);
  const [orders,    setOrders]    = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/orders/analytics'),
      api.get('/products/low-stock'),
      api.get('/orders'),
    ]).then(([a, l, o]) => {
      setAnalytics(a.data.data);
      setLowStock(l.data.data);
      setOrders(o.data.data.slice(0, 5));
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm">Welcome back! Here's what's happening.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={TrendingUp} label="Total Revenue" value={`₹${Number(analytics?.total_revenue || 0).toLocaleString()}`} color="bg-green-500" />
        <StatCard icon={ShoppingCart} label="Total Orders" value={analytics?.total_orders || 0} color="bg-brand-500" />
        <StatCard icon={AlertTriangle} label="Pending Orders" value={analytics?.pending_orders || 0} color="bg-yellow-500" />
        <StatCard icon={Users} label="Customers" value={analytics?.total_customers || 0} color="bg-blue-500" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent orders */}
        <div className="xl:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Recent Orders</h2>
            <Link to="/admin/orders" className="text-brand-500 text-sm flex items-center gap-1 hover:underline">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-gray-500">
                  <th className="pb-2 font-medium">Order</th>
                  <th className="pb-2 font-medium">Customer</th>
                  <th className="pb-2 font-medium">Amount</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map(o => (
                  <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 font-mono text-gray-600">#{o.id}</td>
                    <td className="py-3 text-gray-800">{o.customer_name}</td>
                    <td className="py-3 font-semibold">₹{Number(o.total_amount).toLocaleString()}</td>
                    <td className="py-3"><StatusBadge status={o.status} /></td>
                  </tr>
                ))}
                {!orders.length && <tr><td colSpan={4} className="py-6 text-center text-gray-400">No orders yet</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low stock */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Low Stock Alert</h2>
            <span className="text-xs bg-red-100 text-red-600 font-semibold px-2 py-0.5 rounded-full">{lowStock.length} items</span>
          </div>
          <div className="space-y-3">
            {lowStock.map(p => (
              <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-800 leading-tight">{p.name}</p>
                  <p className="text-xs text-gray-400">{p.unit}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${p.stock === 0 ? 'text-red-600' : 'text-orange-500'}`}>{p.stock}</p>
                  <p className="text-xs text-gray-400">/ {p.low_stock_threshold} min</p>
                </div>
              </div>
            ))}
            {!lowStock.length && (
              <div className="flex flex-col items-center justify-center py-6 text-gray-400">
                <Package className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-sm">All stock levels OK</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}