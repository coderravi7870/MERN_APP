import React, { useState } from 'react';
import { User, Save, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import api from '../../utils/api.js';

export default function CustomerProfile() {
  const { user, setUser } = useAuth();
  const [form, setForm]   = useState({ name: user?.name || '', phone: user?.phone || '', address: user?.address || '' });
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/auth/profile', form);
      setUser(u => ({ ...u, ...form }));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-2xl font-display font-bold text-gray-900">My Profile</h1>

      <div className="card">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center text-brand-600 text-2xl font-bold">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-900">{user?.name}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <span className="text-xs bg-blue-100 text-blue-700 font-medium px-2 py-0.5 rounded-full">Customer</span>
          </div>
        </div>

        {saved && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-3 py-2 mb-4 text-sm">
            <CheckCircle className="w-4 h-4" /> Profile updated successfully!
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          {[
            { label: 'Full Name', key: 'name',    type: 'text',  required: true },
            { label: 'Phone',     key: 'phone',   type: 'tel' },
            { label: 'Address',   key: 'address', type: 'text' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
              {f.key === 'address' ? (
                <textarea
                  className="input-field resize-none h-20"
                  value={form[f.key] || ''}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                />
              ) : (
                <input type={f.type} className="input-field" value={form[f.key] || ''} onChange={e => setForm({ ...form, [f.key]: e.target.value })} required={f.required} />
              )}
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" className="input-field bg-gray-50 cursor-not-allowed" value={user?.email || ''} disabled />
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
          </div>
          <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
            <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}