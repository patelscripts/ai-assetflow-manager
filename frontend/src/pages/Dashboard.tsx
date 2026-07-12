import { useEffect, useState } from 'react';
import { Package, CheckCircle, Wrench, Calendar, AlertTriangle, Clock, Users2 } from 'lucide-react';
import api from '../api/axios';

interface DashboardData {
  kpis: {
    assetsAvailable: number;
    assetsAllocated: number;
    assetsUnderMaintenance: number;
    activeAllocations: number;
    maintenanceToday: number;
    activeBookings: number;
    pendingTransfers: number;
  };
  overdueReturns: any[];
  upcomingReturns: any[];
}

const Dashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/dashboard');
        setData(res.data);
      } catch (err) {
        console.error('Failed to load dashboard', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return <div className="p-8 text-gray-500">Loading dashboard...</div>;
  }

  const kpis = data?.kpis;

  const cards = [
    { label: 'Assets Available', value: kpis?.assetsAvailable ?? 0, icon: CheckCircle, color: 'text-green-600 bg-green-50' },
    { label: 'Assets Allocated', value: kpis?.assetsAllocated ?? 0, icon: Package, color: 'text-blue-600 bg-blue-50' },
    { label: 'Under Maintenance', value: kpis?.assetsUnderMaintenance ?? 0, icon: Wrench, color: 'text-amber-600 bg-amber-50' },
    { label: 'Active Bookings', value: kpis?.activeBookings ?? 0, icon: Calendar, color: 'text-indigo-600 bg-indigo-50' },
    { label: 'Pending Transfers', value: kpis?.pendingTransfers ?? 0, icon: Clock, color: 'text-purple-600 bg-purple-50' },
    { label: 'Active Allocations', value: kpis?.activeAllocations ?? 0, icon: Users2, color: 'text-teal-600 bg-teal-50' },
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Dashboard</h1>
      <p className="text-sm text-gray-500 mb-6">Real-time operational snapshot</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
            <div className={`p-3 rounded-lg ${color}`}>
              <Icon size={22} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-sm text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overdue Returns */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="text-red-500" size={18} />
            <h2 className="font-semibold text-gray-900">Overdue Returns</h2>
          </div>
          {data?.overdueReturns.length === 0 ? (
            <p className="text-sm text-gray-400">No overdue returns </p>
          ) : (
            <ul className="space-y-2">
              {data?.overdueReturns.map((item) => (
                <li key={item._id} className="text-sm text-gray-700 border-b border-gray-50 pb-2">
                  <span className="font-medium">{item.asset?.name}</span> — held by {item.allocatedTo?.name}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Upcoming Returns */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="text-indigo-500" size={18} />
            <h2 className="font-semibold text-gray-900">Upcoming Returns</h2>
          </div>
          {data?.upcomingReturns.length === 0 ? (
            <p className="text-sm text-gray-400">No returns due soon</p>
          ) : (
            <ul className="space-y-2">
              {data?.upcomingReturns.map((item) => (
                <li key={item._id} className="text-sm text-gray-700 border-b border-gray-50 pb-2">
                  <span className="font-medium">{item.asset?.name}</span> — due {new Date(item.expectedReturnDate).toLocaleDateString()}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;