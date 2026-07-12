import { useEffect, useState } from 'react';
import { Plus, X, AlertCircle } from 'lucide-react';
import api from '../api/axios';

const Bookings = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    resource: '',
    startTime: '',
    endTime: '',
  });

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [bookingRes, assetRes] = await Promise.all([
        api.get('/bookings'),
        api.get('/assets'),
      ]);
      setBookings(bookingRes.data);
      setResources(assetRes.data.filter((a: any) => a.isBookable));
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
      await api.post('/bookings', form);
      setShowForm(false);
      setForm({ resource: '', startTime: '', endTime: '' });
      fetchAll();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to book resource');
    } finally {
      setFormLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await api.put(`/bookings/${id}/cancel`);
      fetchAll();
    } catch (err) {
      console.error(err);
    }
  };

  const statusColors: Record<string, string> = {
    Upcoming: 'bg-blue-50 text-blue-700',
    Ongoing: 'bg-green-50 text-green-700',
    Completed: 'bg-gray-100 text-gray-600',
    Cancelled: 'bg-red-50 text-red-700',
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Resource Bookings</h1>
          <p className="text-sm text-gray-500">Book shared resources by time slot</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition"
        >
          <Plus size={18} />
          Book Resource
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <p className="p-6 text-sm text-gray-500">Loading...</p>
        ) : bookings.length === 0 ? (
          <p className="p-6 text-sm text-gray-500">No bookings yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Resource</th>
                <th className="px-4 py-3 font-medium">Booked By</th>
                <th className="px-4 py-3 font-medium">Start</th>
                <th className="px-4 py-3 font-medium">End</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b._id} className="border-t border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-900 font-medium">{b.resource?.name}</td>
                  <td className="px-4 py-3 text-gray-600">{b.bookedBy?.name}</td>
                  <td className="px-4 py-3 text-gray-600">{new Date(b.startTime).toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-600">{new Date(b.endTime).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[b.status]}`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {(b.status === 'Upcoming') && (
                      <button
                        onClick={() => handleCancel(b._id)}
                        className="text-red-600 text-xs font-medium hover:underline"
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Book Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Book Resource</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4 flex gap-2">
                <AlertCircle className="text-red-600 flex-shrink-0" size={18} />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-3">
              <select
                required
                value={form.resource}
                onChange={(e) => setForm({ ...form, resource: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Resource</option>
                {resources.map((r) => (
                  <option key={r._id} value={r._id}>{r.name} ({r.assetTag})</option>
                ))}
              </select>

              <div>
                <label className="text-xs text-gray-500 mb-1 block">Start Time</label>
                <input
                  type="datetime-local"
                  required
                  value={form.startTime}
                  onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1 block">End Time</label>
                <input
                  type="datetime-local"
                  required
                  value={form.endTime}
                  onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={formLoading}
                className="w-full bg-indigo-600 text-white py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {formLoading ? 'Booking...' : 'Book Resource'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bookings;