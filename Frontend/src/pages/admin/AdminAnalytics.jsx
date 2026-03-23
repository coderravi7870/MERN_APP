import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../utils/api.js';

export default function AdminAnalytics() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders/analytics')
      .then(r => setData(r.data.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full" />
    </div>
  );

  const chartData = data?.daily?.map(d => ({
    date:    new Date(d.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    revenue: Number(d.revenue),
    orders:  d.count,
  })) || [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold text-gray-900">Sales Analytics</h1>

      {/* Revenue chart */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Revenue - Last 7 Days</h2>
        {chartData.length ? (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `₹${v}`} />
              <Tooltip formatter={v => [`₹${v}`, 'Revenue']} />
              <Bar dataKey="revenue" fill="#f5720b" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-gray-400 py-12">No completed orders in the last 7 days</p>
        )}
      </div>

      {/* Top products */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Top Selling Products</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-gray-500">
                <th className="pb-2 font-medium">#</th>
                <th className="pb-2 font-medium">Product</th>
                <th className="pb-2 font-medium">Units Sold</th>
                <th className="pb-2 font-medium">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data?.topProducts?.map((p, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="py-3 text-gray-500">{i + 1}</td>
                  <td className="py-3 font-medium text-gray-800">{p.name}</td>
                  <td className="py-3 text-gray-600">{p.total_sold}</td>
                  <td className="py-3 font-semibold text-green-600">₹{Number(p.revenue).toLocaleString()}</td>
                </tr>
              ))}
              {!data?.topProducts?.length && (
                <tr><td colSpan={4} className="py-8 text-center text-gray-400">No sales data yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}