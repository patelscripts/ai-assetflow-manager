import { useEffect, useState } from 'react';
import { Plus, X, Wrench } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const priorityColors: Record<string, string> = {
  Low: 'bg-gray-100 text-gray-600',
  Medium: 'bg-amber-50 text-amber-700',
  High: 'bg-red-50 text-red-700',
};

const statusColors: Record<string, string> = {
  Pending: 'bg-yellow-50 text-yellow-700',
  Approved: 'bg-blue-50 text-blue-700',
  Rejected: 'bg-red-50 text-red-700',
  'In Progress': 'bg-indigo-50 text-indigo-700',
  Resolved: 'bg-green-50 text-green-700',
};

const Maintenance = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    asset: '',
    issue: '',
    priority: 'Medium',
  });

  const canManage = user?.role === 'Admin' || user?.role === 'AssetManager';

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [reqRes, assetRes] = await Promise.all([
        api.get('/maintenance'),
        api.get('/assets'),
      ]);
      setRequests(reqRes.data);
      setAssets(assetRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFormLoading(true);
    try {
      await api.post('/maintenance', form);
      setShowForm(false);
      setForm({ asset: '', issue: '', priority: 'Medium' });
      fetchAll();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to raise request');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDecision = async (id: string, decision: 'Approved' | 'Rejected') => {
    try {
      await api.put(`/maintenance/${id}/decision`, { decision });
      fetchAll();
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolve = async (id: string) => {
    try {
      await api.put(`/maintenance/${id}/resolve`, { resolutionNote: 'Issue fixed' });
      fetchAll();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Maintenance Requests</h1>
          <p className="text-sm text-gray-500">Raise and manage asset repair requests</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition"
        >
          <Plus size={18} />
          Raise Request
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <p className="p-6 text-sm text-gray-500">Loading...</p>
        ) : requests.length === 0 ? (
          <p className="p-6 text-sm text-gray-500">No maintenance requests yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Asset</th>
                <th className="px-4 py-3 font-medium">Issue</th>
                <th className="px-4 py-3 font-medium">Raised By</th>
                <th className="px-4 py-3 font-medium">Priority</th>
                <th className="px-4 py-3 font-medium">Status</th>
                {canManage && <th className="px-4 py-3 font-medium">Action</th>}
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r._id} className="border-t border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-900 font-medium">{r.asset?.name} ({r.asset?.assetTag})</td>
                  <td className="px-4 py-3 text-gray-600">{r.issue}</td>
                  <td className="px-4 py-3 text-gray-600">{r.raisedBy?.name}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[r.priority]}`}>
                      {r.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[r.status]}`}>
                      {r.status}
                    </span>
                  </td>
                  {canManage && (
                    <td className="px-4 py-3 space-x-2">
                      {r.status === 'Pending' && (
                        <>
                          <button onClick={() => handleDecision(r._id, 'Approved')} className="text-green-600 text-xs font-medium hover:underline">
                            Approve
                          </button>
                          <button onClick={() => handleDecision(r._id, 'Rejected')} className="text-red-600 text-xs font-medium hover:underline">
                            Reject
                          </button>
                        </>
                      )}
                      {r.status === 'Approved' && (
                        <button onClick={() => handleResolve(r._id)} className="text-indigo-600 text-xs font-medium hover:underline">
                          Mark Resolved
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

      {/* Raise Request Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Wrench size={18} className="text-indigo-600" />
                Raise Maintenance Request
              </h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            {error && <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-md mb-4">{error}</div>}

            <form onSubmit={handleCreate} className="space-y-3">
              <select
                required
                value={form.asset}
                onChange={(e) => setForm({ ...form, asset: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Asset</option>
                {assets.map((a) => (
                  <option key={a._id} value={a._id}>{a.name} ({a.assetTag})</option>
                ))}
              </select>

              <textarea
                required
                placeholder="Describe the issue..."
                value={form.issue}
                onChange={(e) => setForm({ ...form, issue: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />

              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>

              <button
                type="submit"
                disabled={formLoading}
                className="w-full bg-indigo-600 text-white py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {formLoading ? 'Submitting...' : 'Raise Request'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Maintenance;