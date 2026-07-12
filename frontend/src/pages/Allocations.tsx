import { useEffect, useState } from 'react';
import { Plus, X, AlertCircle } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Allocations = () => {
  const { user } = useAuth();
  const [allocations, setAllocations] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');
  const [conflict, setConflict] = useState<any>(null);

  const [form, setForm] = useState({
    assetId: '',
    allocatedTo: '',
    expectedReturnDate: '',
  });

  const canManage = user?.role === 'Admin' || user?.role === 'AssetManager';

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [allocRes, assetRes] = await Promise.all([
        api.get('/allocations'),
        api.get('/assets'),
      ]);
      setAllocations(allocRes.data);
      setAssets(assetRes.data);
      if (canManage) {
        const userRes = await api.get('/users');
        setUsers(userRes.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setConflict(null);
    setFormLoading(true);
    try {
      await api.post('/allocations', form);
      setShowForm(false);
      setForm({ assetId: '', allocatedTo: '', expectedReturnDate: '' });
      fetchAll();
    } catch (err: any) {
      if (err.response?.status === 409) {
        setConflict(err.response.data);
      } else {
        setError(err.response?.data?.message || 'Failed to allocate asset');
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleReturn = async (id: string) => {
    try {
      await api.put(`/allocations/${id}/return`, { conditionNoteOnReturn: 'Returned in good condition' });
      fetchAll();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Allocations</h1>
          <p className="text-sm text-gray-500">Assign assets to employees or departments</p>
        </div>
        {canManage && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition"
          >
            <Plus size={18} />
            Allocate Asset
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <p className="p-6 text-sm text-gray-500">Loading...</p>
        ) : allocations.length === 0 ? (
          <p className="p-6 text-sm text-gray-500">No allocations yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Asset</th>
                <th className="px-4 py-3 font-medium">Allocated To</th>
                <th className="px-4 py-3 font-medium">Expected Return</th>
                <th className="px-4 py-3 font-medium">Status</th>
                {canManage && <th className="px-4 py-3 font-medium">Action</th>}
              </tr>
            </thead>
            <tbody>
              {allocations.map((a) => (
                <tr key={a._id} className="border-t border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-900 font-medium">{a.asset?.name} ({a.asset?.assetTag})</td>
                  <td className="px-4 py-3 text-gray-600">{a.allocatedTo?.name}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {a.expectedReturnDate ? new Date(a.expectedReturnDate).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      a.isOverdue ? 'bg-red-50 text-red-700' :
                      a.status === 'Active' ? 'bg-blue-50 text-blue-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {a.isOverdue ? 'Overdue' : a.status}
                    </span>
                  </td>
                  {canManage && (
                    <td className="px-4 py-3">
                      {a.status === 'Active' && (
                        <button
                          onClick={() => handleReturn(a._id)}
                          className="text-indigo-600 text-xs font-medium hover:underline"
                        >
                          Mark Returned
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Allocate Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Allocate Asset</h2>
              <button onClick={() => { setShowForm(false); setConflict(null); }} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            {error && <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-md mb-4">{error}</div>}

            {conflict && (
              <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4 flex gap-2">
                <AlertCircle className="text-amber-600 flex-shrink-0" size={18} />
                <div>
                  <p className="text-sm text-amber-800 font-medium">{conflict.message}</p>
                  <p className="text-xs text-amber-600 mt-1">{conflict.suggestion}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-3">
              <select
                required
                value={form.assetId}
                onChange={(e) => { setForm({ ...form, assetId: e.target.value }); setConflict(null); }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Asset</option>
                {assets.map((a) => (
                  <option key={a._id} value={a._id}>{a.name} ({a.assetTag}) - {a.status}</option>
                ))}
              </select>

              <select
                required
                value={form.allocatedTo}
                onChange={(e) => setForm({ ...form, allocatedTo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Employee</option>
                {users.map((u) => (
                  <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                ))}
              </select>

              <input
                type="date"
                value={form.expectedReturnDate}
                onChange={(e) => setForm({ ...form, expectedReturnDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />

              <button
                type="submit"
                disabled={formLoading}
                className="w-full bg-indigo-600 text-white py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {formLoading ? 'Allocating...' : 'Allocate'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Allocations;