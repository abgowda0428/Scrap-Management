import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Package, AlertCircle } from 'lucide-react';

export function Login() {
  const { login } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (login(username, password)) {
      // Login successful - context will handle user state
    } else {
      setError('Invalid username or password');
    }
  };

  const quickLogin = (user: string) => {
    setUsername(user);
    setPassword('demo');
    login(user, 'demo');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <Package className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-blue-900 mb-2">Scrap Management System</h1>
          <p className="text-gray-600">Enterprise-grade scrap tracking and analytics</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="mb-6">Sign In</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your username"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Sign In
            </button>
          </form>

          {/* Quick Login Demo */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-3">Demo Quick Login:</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => quickLogin('operator1')}
                className="px-3 py-2 bg-green-50 text-green-700 rounded text-sm hover:bg-green-100 transition-colors border border-green-200"
              >
                Operator
              </button>
              <button
                onClick={() => quickLogin('supervisor1')}
                className="px-3 py-2 bg-purple-50 text-purple-700 rounded text-sm hover:bg-purple-100 transition-colors border border-purple-200"
              >
                Supervisor
              </button>
              <button
                onClick={() => quickLogin('manager1')}
                className="px-3 py-2 bg-blue-50 text-blue-700 rounded text-sm hover:bg-blue-100 transition-colors border border-blue-200"
              >
                Manager
              </button>
              <button
                onClick={() => quickLogin('admin')}
                className="px-3 py-2 bg-orange-50 text-orange-700 rounded text-sm hover:bg-orange-100 transition-colors border border-orange-200"
              >
                Admin
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Designed for manufacturing excellence
        </p>
      </div>
    </div>
  );
}
