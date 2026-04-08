import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center shadow-md">
      <div className="flex gap-6 items-center">
        <span className="text-xl font-bold text-white">FinTask</span>
        <Link to="/dashboard" className="hover:text-gray-300 text-sm">Dashboard</Link>
        <Link to="/tasks" className="hover:text-gray-300 text-sm">Tasks</Link>
        <Link to="/finance" className="hover:text-gray-300 text-sm">Finance</Link>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-400">Hi, {user?.name}</span>
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1 rounded"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;