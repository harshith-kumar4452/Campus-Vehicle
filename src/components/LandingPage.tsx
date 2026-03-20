import React, { useState } from 'react';
import { Car, ArrowRight, UserCheck, Mail, Lock, ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';

export interface UserAuth {
  role: 'Student' | 'Faculty' | 'Admin';
  email: string;
}

interface LandingPageProps {
  onLogin: (user: UserAuth) => void;
}

export default function LandingPage({ onLogin }: LandingPageProps) {
  const [role, setRole] = useState<'Student' | 'Faculty' | 'Admin'>('Student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!email.trim()) {
      setError('Please enter your email.');
      setIsLoading(false);
      return;
    }

    if (role === 'Admin') {
      if (!password) {
        setError('Please enter your admin password.');
        setIsLoading(false);
        return;
      }

      // Check DB for admin
      const { data, error: dbError } = await supabase
        .from('admins')
        .select('*')
        .eq('email', email.toLowerCase())
        .eq('password', password)
        .single();

      if (dbError || !data) {
        setError('Invalid admin credentials.');
        setIsLoading(false);
        return;
      }
    } else {
      if (!email.toLowerCase().endsWith('@vnrvjiet.in')) {
        setError('Invalid email domain. You must use a @vnrvjiet.in email address.');
        setIsLoading(false);
        return;
      }
    }

    setIsLoading(false);
    onLogin({ role, email });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3 transition-transform hover:rotate-0">
          <Car className="text-white w-12 h-12" />
        </div>
        <h2 className="mt-6 text-center text-4xl font-extrabold text-gray-900 tracking-tight">
          Campus Portal
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 font-medium">
          Vehicle Security & Monitoring System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-8 shadow-2xl rounded-3xl border border-gray-100">
          
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-1">Welcome back</h3>
            <p className="text-gray-500 text-sm">Sign in with your university credentials to continue to the portal.</p>
          </div>

          <form className="space-y-6" onSubmit={handleContinue}>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                I am registering/logging in as:
              </label>
              <div className="flex bg-gray-100 p-1.5 rounded-xl gap-1">
                <button
                  type="button"
                  onClick={() => setRole('Student')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg transition-all ${
                    role === 'Student' 
                    ? 'bg-white shadow-sm text-blue-700' 
                    : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setRole('Faculty')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg transition-all ${
                    role === 'Faculty' 
                    ? 'bg-white shadow-sm text-blue-700' 
                    : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Faculty
                </button>
                <button
                  type="button"
                  onClick={() => setRole('Admin')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg transition-all ${
                    role === 'Admin' 
                    ? 'bg-white shadow-sm text-blue-700' 
                    : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Admin
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-gray-400"
                    placeholder={role === 'Admin' ? "admin@example.com" : "username@vnrvjiet.in"}
                  />
                </div>
              </div>

              {role === 'Admin' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Admin Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-gray-400"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-white font-extrabold shadow-lg transform transition-all active:scale-95 ${
                isLoading 
                ? 'bg-blue-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-200 cursor-pointer'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying...</span>
                </div>
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="mt-8 text-center text-xs text-gray-400 font-bold uppercase tracking-widest">
          Secure Access Protocol • 2026
        </p>
      </div>
    </div>
  );
}
