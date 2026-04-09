import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import API from '../api/axios';
import useAuthStore from '../store/authStore';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await API.post('/auth/register', form);
      setAuth(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <motion.div
        initial={{ x: -60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="hidden md:flex w-1/2 bg-gray-900 text-white flex-col justify-center items-center p-16 relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, #6366f1 0%, transparent 50%), radial-gradient(circle at 80% 20%, #22c55e 0%, transparent 40%)' }} />
        <div className="relative text-center">
          <div className="text-5xl mb-6">🚀</div>
          <h1 className="text-4xl font-extrabold mb-4">Get started free</h1>
          <p className="text-gray-400 text-base max-w-xs leading-relaxed">
            Join FinTask and take control of your productivity and finances today.
          </p>
          <div className="mt-12 grid grid-cols-2 gap-4">
            {[
              { icon: '🧠', label: 'AI Insights' },
              { icon: '📊', label: 'Smart Charts' },
              { icon: '🍅', label: 'Pomodoro' },
              { icon: '🎯', label: 'Budget Alerts' },
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="bg-white bg-opacity-5 border border-white border-opacity-10 rounded-xl p-3 text-center"
              >
                <div className="text-2xl mb-1">{f.icon}</div>
                <div className="text-xs text-gray-400">{f.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Right Panel */}
      <motion.div
        initial={{ x: 60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full md:w-1/2 flex flex-col justify-center items-center p-8 bg-white"
      >
        <div className="w-full max-w-sm">
          <Link to="/" className="text-sm text-gray-400 hover:text-gray-600 mb-8 inline-block">← Back to home</Link>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-1">Create account</h2>
          <p className="text-gray-500 text-sm mb-8">Start managing smarter today</p>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-4"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block uppercase tracking-wide">Full Name</label>
              <input type="text" placeholder="Aniket Udgirkar" required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-gray-50"
                value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block uppercase tracking-wide">Email</label>
              <input type="email" placeholder="you@example.com" required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-gray-50"
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block uppercase tracking-wide">Password</label>
              <input type="password" placeholder="••••••••" required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-gray-50"
                value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit" disabled={loading}
              className="w-full bg-gray-900 text-white py-3 rounded-xl text-sm font-semibold hover:bg-gray-700 transition mt-2"
            >
              {loading ? 'Creating account...' : 'Create Account →'}
            </motion.button>
          </form>

          <p className="text-sm text-center text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-gray-900 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;