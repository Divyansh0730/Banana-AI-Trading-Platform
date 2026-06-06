"use client";
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://20.244.83.76:8000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        login(data.access_token);
      } else {
        setError(data.detail || 'Login failed');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden animate-fade-in">
      {/* Background aesthetics */}
      <div className="absolute top-0 left-0 w-full h-full bg-[#09090b] -z-20"></div>
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-banana/20 blur-[150px] rounded-full -z-10 mix-blend-screen opacity-50"></div>
      
      <div className="w-full max-w-md p-8 glass-card border border-white/10 relative z-10 flex flex-col gap-6">
        <div className="text-center mb-4">
          <div className="w-12 h-12 bg-banana rounded-xl flex items-center justify-center text-black font-bold text-2xl mx-auto mb-4">B</div>
          <h1 className="text-3xl font-bold text-white tracking-wider">BANANA AI</h1>
          <p className="text-gray-400 text-sm mt-2">Sign in to your trading terminal</p>
        </div>

        {error && <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm text-center">{error}</div>}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#1C1D21] border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-banana transition-colors"
              placeholder="trader@banana.ai"
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#1C1D21] border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-banana transition-colors"
              placeholder="••••••••"
              required
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-banana hover:bg-[#FFE55C] text-black font-bold py-4 rounded-xl mt-4 transition-all shadow-[0_0_15px_rgba(255,215,0,0.2)] disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Secure Login'}
          </button>
        </form>

        <div className="text-center text-sm text-gray-500 mt-2">
          New to Banana AI? <Link href="/register" className="text-banana hover:underline">Create an account</Link>
        </div>
      </div>
    </div>
  );
}
