import { useState } from 'react';
import { LogIn, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { supabase } from '../config/supabase';
// import { mockUsers } from '../data/mockData';
import autocratLogo from 'figma:asset/1ad85b15198cdb675e83e1093de980f6661c927d.png';

export function Login() {
  const { setCurrentUser, setCurrentScreen } = useApp();
  // const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Find user by username
  //   const user = mockUsers.find(u => u.username === username.toLowerCase());
    
  //   if (!user) {
  //     setError('Invalid username. Please try again.');
  //     return;
  //   }

  //   // In a real system, password would be hashed and verified
  //   // For demo: password is same as username
  //   if (password !== username.toLowerCase()) {
  //     setError('Invalid password. Please try again.');
  //     return;
  //   }
    
  //   setCurrentUser(user);
  //   setCurrentScreen('dashboard');
  // };

  // return (
  
  const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');

  try {
    // 1. Supabase authentication
    const { data, error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (authError) {
      setError(authError.message);
      return;
    }

    if (!data.user) {
      setError('Login failed');
      return;
    }

    // 2. Fetch role-based profile from DB
    const { data: profile, error: profileError } =
      await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

    if (profileError || !profile) {
      setError('User profile not found. Contact admin.');
      return;
    }

    // 3. Store in AppContext
    setCurrentUser(profile);
    setCurrentScreen('dashboard');

  } catch (err) {
    console.error(err);
    setError('Unexpected error occurred');
  }
};

    <div 
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1764114235916-74de69e6851f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBpbmR1c3RyaWFsJTIwZmFjdG9yeSUyMHByZWNpc2lvbiUyMG1hbnVmYWN0dXJpbmd8ZW58MXx8fHwxNzY1NTA0MDE1fDA&ixlib=rb-4.1.0&q=80&w=1080)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/90 via-gray-900/85 to-blue-900/90"></div>

      {/* Login Card */}
      <div className="relative z-10 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 lg:p-10 w-full max-w-md">
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-white p-3 rounded-xl shadow-lg mb-6">
            <img 
              src={autocratLogo} 
              alt="Autocrat Engineers" 
              className="h-16 w-auto"
            />
          </div>
          <h1 className="text-gray-900 text-center leading-tight">
            Autocrat Engineers
          </h1>
          <h2 className="text-gray-900 text-center mt-1">
            Scrap Management System
          </h2>
          <p className="text-gray-600 text-center mt-3">
            Your Leading Partner in Precision Manufacturing Excellence
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* <div>
            <label className="block text-sm text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div> */}

          <div>
              <label className="block text-sm text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg
                          focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3 rounded-lg hover:from-red-700 hover:to-red-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            <LogIn className="w-5 h-5" />
            Login to System
          </button>
        </form>

        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-red-50 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-700 mb-2">
            <strong>Demo Credentials</strong>
          </p>
          <div className="text-sm text-gray-600 space-y-1">
            <p>• <strong>Operator:</strong> john.doe / john.doe</p>
            <p>• <strong>Supervisor:</strong> jane.smith / jane.smith</p>
            <p>• <strong>Manager:</strong> mike.johnson / mike.johnson</p>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Use username as password for demo purposes
          </p>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            © 2024 Autocrat Engineers. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
