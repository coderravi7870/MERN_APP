import React, { useEffect, useState } from 'react';
import { Plus, Trash2, X, Users, ChevronDown } from 'lucide-react';
import api from '../../utils/api.js';

const ROLE_STYLES = {
  staff:    'bg-purple-100 text-purple-700 border-purple-200',
  customer: 'bg-blue-100 text-blue-700 border-blue-200',
};

export default function AdminStaff() {
  const [users,   setUsers]   = useState([]);
  const [filter,  setFilter]  = useState('all');    // 'all' | 'staff' | 'customer'
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(false);
  const [form,    setForm]    = useState({ name: '', email: '', password: '', phone: '' });
  const [saving,  setSaving]  = useState(false);
  const [roleLoading, setRoleLoading] = useState({});  // { [userId]: true/false }

  const load = () => {
    setLoading(true);
    const query = filter !== 'all' ? `?role=${filter}` : '';
    api.get(`/users${query}`)
      .then(r => setUsers(r.data.data))
      .finally(() => setLoading(false));
  };

  useEffect(load, [filter]);

  // ── Change role inline ────────────────────────────────────────────────────
  const handleRoleChange = async (userId, newRole) => {
    setRoleLoading(r => ({ ...r, [userId]: true }));
    try {
      await api.patch(`/users/${userId}/role`, { role: newRole });
      // Update local state instantly — no full reload needed
      setUsers(prev =>
        prev.map(u => u.id === userId ? { ...u, role: newRole } : u)
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update role');
    } finally {
      setRoleLoading(r => ({ ...r, [userId]: false }));
    }
  };

  // ── Create staff ──────────────────────────────────────────────────────────
  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/users/staff', form);
      setModal(false);
      setForm({ name: '', email: '', password: '', phone: '' });
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create staff');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove this user?')) return;
    try { await api.delete(`/users/${id}`); load(); }
    catch (err) { alert(err.response?.data?.message || 'Failed'); }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">User Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage staff and customer roles from here</p>
        </div>
        <button onClick={() => setModal(true)} className="btn-primary flex items-center gap-2 self-start sm:self-auto">
          <Plus className="w-4 h-4" /> Add Staff
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {[
          { label: 'All Users', value: 'all' },
          { label: 'Staff',     value: 'staff' },
          { label: 'Customers', value: 'customer' },
        ].map(tab => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              filter === tab.value
                ? 'bg-gray-500 text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-brand-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      

      {/* User cards */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map(u => (
            <div key={u.id} className="card flex items-start gap-4 relative">
              {/* Avatar */}
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-lg flex-shrink-0 ${
                u.role === 'staff' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
              }`}>
                {u.name[0].toUpperCase()}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 leading-tight">{u.name}</p>
                <p className="text-sm text-gray-500 truncate">{u.email}</p>
                {u.phone && <p className="text-xs text-gray-400 mt-0.5">{u.phone}</p>}
                <p className="text-xs text-gray-400 mt-1">
                  Joined {new Date(u.created_at).toLocaleDateString()}
                </p>

                {/* ── Role selector ── */}
                <div className="mt-3 flex items-center gap-2">
                  <label className="text-xs text-gray-500 font-medium">Role:</label>
                  <div className="relative">
                    <select
                      value={u.role}
                      onChange={e => handleRoleChange(u.id, e.target.value)}
                      disabled={roleLoading[u.id]}
                      className={`appearance-none text-xs font-semibold pl-2.5 pr-6 py-1 rounded-full border cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-400 transition-all disabled:opacity-50 disabled:cursor-wait ${ROLE_STYLES[u.role]}`}
                    >
                      <option value="admin">Admin</option>
                      <option value="staff">Staff</option>
                      <option value="customer">Customer</option>
                    </select>
                    <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none opacity-60" />
                  </div>
                  {roleLoading[u.id] && (
                    <div className="w-3.5 h-3.5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                  )}
                </div>
              </div>

              {/* Delete */}
              <button
                onClick={() => handleDelete(u.id)}
                className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all flex-shrink-0 absolute top-4 right-4"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          {!users.length && (
            <div className="col-span-3 card text-center py-12 text-gray-400">
              <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No users found</p>
            </div>
          )}
        </div>
      )}

      {/* Create staff modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="font-semibold text-gray-900">Add Staff Member</h2>
              <button onClick={() => setModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              {[
                { label: 'Full Name', key: 'name',     type: 'text',     required: true },
                { label: 'Email',     key: 'email',    type: 'email',    required: true },
                { label: 'Password',  key: 'password', type: 'password', required: true },
                { label: 'Phone',     key: 'phone',    type: 'tel' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                  <input
                    type={f.type}
                    className="input-field"
                    value={form[f.key]}
                    onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    required={f.required}
                  />
                </div>
              ))}
              <p className="text-xs text-gray-400">New staff accounts start with the <strong>Staff</strong> role. You can change it after creation.</p>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1">
                  {saving ? 'Creating…' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
