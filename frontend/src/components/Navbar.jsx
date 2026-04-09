import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import useAuthStore from '../store/authStore';

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/tasks', label: 'Tasks' },
    { to: '/finance', label: 'Finance' },
  ];

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center shadow-lg sticky top-0 z-50"
    >
      <div className="flex gap-8 items-center">
        <Link to="/dashboard" className="text-lg font-bold tracking-tight">⚡ FinTask</Link>
        <div className="flex gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-sm px-3 py-1.5 rounded-lg transition font-medium ${
                location.pathname === link.to
                  ? 'bg-white bg-opacity-10 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white hover:bg-opacity-5'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-indigo-500 rounded-full flex items-center justify-center text-xs font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm text-gray-300 hidden md:block">{user?.name}</span>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleLogout}
          className="bg-white bg-opacity-10 hover:bg-opacity-20 text-white text-sm px-3 py-1.5 rounded-lg transition"
        >
          Logout
        </motion.button>
      </div>
    </motion.nav>
  );
};

export default Navbar;