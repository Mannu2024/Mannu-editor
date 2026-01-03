
import React, { useState } from 'react';
import { X, Mail, Lock, Loader2 } from 'lucide-react';
import { authService } from '../services/authService';
import { User } from '../types';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState<'email' | 'google' | null>(null);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading('email');
    try {
      const user = await authService.login(email);
      onSuccess(user);
    } finally {
      setLoading(null);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading('google');
    try {
      const user = await authService.loginWithGoogle();
      onSuccess(user);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-black tracking-tighter">Sign In</h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleEmailLogin} className="space-y-4 mb-8">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="email" 
                required
                placeholder="Email address"
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl outline-none transition-all font-medium"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="password" 
                placeholder="Password"
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl outline-none transition-all font-medium"
              />
            </div>
            <button 
              disabled={!!loading}
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {loading === 'email' ? <Loader2 className="animate-spin" /> : 'Continue with Email'}
            </button>
          </form>

          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase font-bold tracking-widest text-slate-400">
              <span className="bg-white px-4">Or use social</span>
            </div>
          </div>

          <button 
            onClick={handleGoogleLogin}
            disabled={!!loading}
            className="w-full py-4 border-2 border-slate-100 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-slate-50 transition-all active:scale-[0.98]"
          >
            {loading === 'google' ? (
              <Loader2 className="animate-spin text-indigo-600" />
            ) : (
              <>
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
                Sign in with Google
              </>
            )}
          </button>
        </div>
        <div className="bg-slate-50 p-6 text-center">
          <p className="text-sm font-medium text-slate-500">
            Don't have an account? <button className="text-indigo-600 font-bold hover:underline">Sign Up</button>
          </p>
        </div>
      </div>
    </div>
  );
};
