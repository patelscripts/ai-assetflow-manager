import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Assets from './pages/Assets';
import Allocations from './pages/Allocations';
import Bookings from './pages/Bookings';

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <Navbar />
      <div className="flex-1 bg-gray-50 min-h-screen">{children}</div>
    </div>
  );
}

function App() {
  return (
   <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
      <Route path="/assets" element={<ProtectedRoute><Layout><Assets /></Layout></ProtectedRoute>} />
      <Route path="/allocations" element={<ProtectedRoute><Layout><Allocations /></Layout></ProtectedRoute>} />
      <Route path="/bookings" element={<ProtectedRoute><Layout><Bookings /></Layout></ProtectedRoute>} />
      <Route path="/" element={<Login />} />
    </Routes>
  );
}

export default App;