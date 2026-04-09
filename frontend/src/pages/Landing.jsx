import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const features = [
  {
    icon: '🧠',
    title: 'AI-Powered Insights',
    desc: 'Get smart task priority suggestions and spending insights powered by Groq AI.'
  },
  {
    icon: '✅',
    title: 'Task Management',
    desc: 'Organize tasks with priorities, due dates, Pomodoro timer and Kanban-style board.'
  },
  {
    icon: '💰',
    title: 'Finance Tracking',
    desc: 'Track income and expenses, set budget limits, and get monthly reports.'
  },
  {
    icon: '📊',
    title: 'Smart Dashboard',
    desc: 'Visualize your productivity and finances with beautiful interactive charts.'
  },
  {
    icon: '🍅',
    title: 'Pomodoro Timer',
    desc: 'Built-in focus timer on every task to maximize your productivity.'
  },
  {
    icon: '🎯',
    title: 'Budget Alerts',
    desc: 'Set category budgets and get warned before you overspend.'
  },
];

const stats = [
  { value: '3x', label: 'More Productive' },
  { value: 'AI', label: 'Powered Insights' },
  { value: '100%', label: 'Free to Use' },
  { value: '∞', label: 'Tasks & Entries' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: 'easeOut' }
  })
};

const Landing = () => {
  return (
    <div className="min-h-screen bg-white font-sans">

      {/* Navbar */}
      <motion.nav
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-900 text-white px-8 py-4 flex justify-between items-center sticky top-0 z-50 shadow-lg"
      >
        <span className="text-xl font-bold tracking-tight">⚡ FinTask</span>
        <div className="flex gap-4">
          <Link to="/login" className="text-sm text-gray-300 hover:text-white transition">Login</Link>
          <Link to="/register" className="text-sm bg-white text-gray-900 px-4 py-1.5 rounded-lg font-medium hover:bg-gray-100 transition">
            Get Started
          </Link>
        </div>
      </motion.nav>

      {/* Hero */}
      <section className="relative bg-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #6366f1 0%, transparent 50%), radial-gradient(circle at 80% 20%, #22c55e 0%, transparent 40%)' }} />

        <div className="relative max-w-5xl mx-auto px-8 py-28 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block bg-indigo-500 bg-opacity-20 text-indigo-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 border border-indigo-500 border-opacity-30">
              🚀 AI-Powered Productivity
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl md:text-6xl font-extrabold leading-tight mb-6"
          >
            Manage Tasks &{' '}
            <span className="bg-gradient-to-r from-indigo-400 to-green-400 bg-clip-text text-transparent">
              Finances
            </span>
            <br />in One Place
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-gray-400 text-lg max-w-2xl mx-auto mb-10"
          >
            FinTask combines smart task management with personal finance tracking,
            powered by AI to help you stay productive and financially aware every day.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex gap-4 justify-center flex-wrap"
          >
            <Link to="/register"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-semibold text-sm transition shadow-lg hover:shadow-indigo-500/25">
              Start for Free →
            </Link>
            <Link to="/login"
              className="border border-gray-600 hover:border-gray-400 text-gray-300 hover:text-white px-8 py-3 rounded-xl font-semibold text-sm transition">
              Sign In
            </Link>
          </motion.div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 60L1440 60L1440 30C1200 60 960 0 720 20C480 40 240 10 0 30L0 60Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="text-center"
              >
                <p className="text-4xl font-extrabold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-8">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Everything you need</h2>
            <p className="text-gray-500 text-base max-w-xl mx-auto">
              A complete productivity suite with AI at its core — built for focused, financially aware professionals.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition"
              >
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-bold text-gray-800 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-8">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">How it works</h2>
            <p className="text-gray-500">Get started in minutes</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Create Account', desc: 'Sign up for free in seconds. No credit card required.' },
              { step: '02', title: 'Add Tasks & Finances', desc: 'Log your tasks and financial entries. Let AI prioritize for you.' },
              { step: '03', title: 'Track & Improve', desc: 'Monitor your productivity streak and spending patterns on the dashboard.' },
            ].map((item, i) => (
              <motion.div
                key={i}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-12 h-12 bg-gray-900 text-white rounded-xl flex items-center justify-center text-sm font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-bold text-gray-800 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gray-900 text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, #6366f1 0%, transparent 50%), radial-gradient(circle at 70% 50%, #22c55e 0%, transparent 50%)' }} />
        <div className="relative max-w-2xl mx-auto px-8">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-extrabold mb-4">Ready to take control?</h2>
            <p className="text-gray-400 mb-8">Join FinTask and start managing your tasks and finances smarter today.</p>
            <Link to="/register"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-3 rounded-xl font-semibold text-sm transition shadow-lg">
              Get Started Free →
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-500 text-center py-6 text-sm border-t border-gray-800">
        © 2025 FinTask. Built with React, Node.js, and Groq AI.
      </footer>
    </div>
  );
};

export default Landing;