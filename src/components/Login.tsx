// import { useState } from 'react';
// import { LogIn, Eye, EyeOff, AlertCircle } from 'lucide-react';
// import { useApp } from '../context/AppContext';
// import { supabase } from '../src//config/supabase';
// import autocratLogo from 'figma:asset/1ad85b15198cdb675e83e1093de980f6661c927d.png';

// export function Login() {
//   const { setCurrentUser, setCurrentScreen } = useApp();

//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [error, setError] = useState('');

//   const handleLogin = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError('');

//     try {
//       // 1️⃣ Supabase authentication
//       const { data, error: authError } =
//         await supabase.auth.signInWithPassword({
//           email,
//           password,
//         });

//       if (authError) {
//         setError(authError.message);
//         return;
//       }

//       if (!data.user) {
//         setError('Login failed');
//         return;
//       }

//       // 2️⃣ Fetch user profile (role-based)
//       const { data: profile, error: profileError } =
//         await supabase
//           .from('users')
//           .select('*')
//           .eq('id', data.user.id)
//           .single();

//       if (profileError || !profile) {
//         setError('User profile not found. Contact admin.');
//         return;
//       }

//       // 3️⃣ Store user in context
//       setCurrentUser(profile);
//       setCurrentScreen('dashboard');

//     } catch (err) {
//       console.error(err);
//       setError('Unexpected error occurred');
//     }
//   };

//   return (
//     <div
//       className="min-h-screen flex items-center justify-center p-4 relative"
//       style={{
//         backgroundImage:
//           'url(https://images.unsplash.com/photo-1764114235916-74de69e6851f)',
//         backgroundSize: 'cover',
//         backgroundPosition: 'center',
//       }}
//     >
//       <div className="absolute inset-0 bg-gradient-to-br from-gray-900/90 via-gray-900/85 to-blue-900/90"></div>

//       <div className="relative z-10 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 lg:p-10 w-full max-w-md">
//         {/* Logo */}
//         <div className="flex flex-col items-center mb-8">
//           <div className="bg-white p-3 rounded-xl shadow-lg mb-6">
//             <img
//               src={autocratLogo}
//               alt="Autocrat Engineers"
//               className="h-16 w-auto"
//             />
//           </div>
//           <h1 className="text-gray-900 text-center">
//             Autocrat Engineers
//           </h1>
//           <h2 className="text-gray-900 text-center mt-1">
//             Scrap Management System
//           </h2>
//         </div>

//         <form onSubmit={handleLogin} className="space-y-5">
//           {error && (
//             <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
//               <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
//               <p className="text-sm text-red-800">{error}</p>
//             </div>
//           )}

//           {/* EMAIL */}
//           <div>
//             <label className="block text-sm text-gray-700 mb-2">
//               Email
//             </label>
//             <input
//               type="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               placeholder="Enter your email"
//               required
//               className="w-full px-4 py-3 border border-gray-300 rounded-lg
//                          focus:outline-none focus:ring-2 focus:ring-red-500"
//             />
//           </div>

//           {/* PASSWORD */}
//           <div>
//             <label className="block text-sm text-gray-700 mb-2">
//               Password
//             </label>
//             <div className="relative">
//               <input
//                 type={showPassword ? 'text' : 'password'}
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 placeholder="Enter your password"
//                 required
//                 className="w-full px-4 py-3 border border-gray-300 rounded-lg
//                            focus:outline-none focus:ring-2 focus:ring-red-500 pr-12"
//               />
//               <button
//                 type="button"
//                 onClick={() => setShowPassword(!showPassword)}
//                 className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
//               >
//                 {showPassword ? <EyeOff /> : <Eye />}
//               </button>
//             </div>
//           </div>

//           <button
//             type="submit"
//             className="w-full bg-gradient-to-r from-red-600 to-red-700
//                        text-white py-3 rounded-lg flex justify-center gap-2"
//           >
//             <LogIn />
//             Login
//           </button>
//         </form>

//         <div className="mt-6 text-center text-xs text-gray-500">
//           © 2024 Autocrat Engineers. All rights reserved.
//         </div>
//       </div>
//     </div>
//   );
// }

import { useState } from 'react';
import { LogIn, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { supabase } from '../src//config/supabase';
import autocratLogo from 'figma:asset/1ad85b15198cdb675e83e1093de980f6661c927d.png';

export function Login() {
  const { setCurrentUser, setCurrentScreen } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // 1️⃣ AUTHENTICATE USER
      const { data, error: authError } =
        await supabase.auth.signInWithPassword({
          email: email.toLowerCase().trim(),
          password,
        });

      if (authError) {
        setError(authError.message);
        return;
      }

      if (!data.user) {
        setError('Login failed. Please try again.');
        return;
      }

      if (!data) {
        setError('User profile not found. Contact administrator.');
        await supabase.auth.signOut();
        return;
      }


      // 2️⃣ FETCH BUSINESS USER PROFILE
      const { data: profile, error: profileError } =
        await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();

      // if (profileError || !profile) {
      //   setError('User profile not found. Contact administrator.');
      //   await supabase.auth.signOut();
      //   return;
      // }

      if (profileError) {
        console.error(profileError);
        setError('Failed to load profile');
        await supabase.auth.signOut();
        return;
      }

      if (!profile) {
        setError('User profile not found. Contact administrator.');
        await supabase.auth.signOut();
        return;
      }

      // ✅ NORMALIZE ROLE (CRITICAL FIX)
      const normalizedProfile = {
        ...profile,
        role: profile.role.toUpperCase(), // OPERATOR | SUPERVISOR | MANAGER
      };

    // Debug once
      console.log('LOGIN PROFILE:', normalizedProfile);


      // 3️⃣ CHECK IF USER IS ACTIVE
      if (!profile.is_active) {
        setError('Your account is disabled. Contact administrator.');
        await supabase.auth.signOut();
        return;
      }

            // 3.5️⃣ UPDATE LAST LOGIN (AUDIT)
      await supabase
        .from('users')
        .update({
          last_login: new Date().toISOString(),
        })
        .eq('id', data.user.id),
        

      // 4️⃣ STORE USER IN CONTEXT
      // setCurrentUser(profile);
      // setCurrentScreen('dashboard');
      setCurrentUser(normalizedProfile);
      setCurrentScreen('dashboard');

      console.log('LOGGED IN PROFILE:', profile);


      // Optional cleanup
      setPassword('');

    } catch (err) {
      console.error('Login error:', err);
      setError('Unexpected error occurred. Please try again.');
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{
        backgroundImage:
          'url(https://images.unsplash.com/photo-1764114235916-74de69e6851f)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/90 via-gray-900/85 to-blue-900/90"></div>

      <div className="relative z-10 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 lg:p-10 w-full max-w-md">
        {/* LOGO */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-white p-3 rounded-xl shadow-lg mb-6">
            <img
              src={autocratLogo}
              alt="Autocrat Engineers"
              className="h-16 w-auto"
            />
          </div>
          <h1 className="text-gray-900 text-center">
            Autocrat Engineers
          </h1>
          <h2 className="text-gray-900 text-center mt-1">
            Scrap Management System
          </h2>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* EMAIL */}
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
                         focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* PASSWORD */}
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg
                           focus:outline-none focus:ring-2 focus:ring-red-500 pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-red-600 to-red-700
                       text-white py-3 rounded-lg flex justify-center gap-2"
          >
            <LogIn />
            Login
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-500">
          © 2024 Autocrat Engineers. All rights reserved.
        </div>
      </div>
    </div>
  );
}
