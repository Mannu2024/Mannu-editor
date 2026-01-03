
import React, { useState } from 'react';
import { FileText, Menu, Search, Github, Mail, User as UserIcon, LogOut, ChevronDown } from 'lucide-react';
import { User } from '../types';
import { authService } from '../services/authService';

interface HeaderProps {
  onHome: () => void;
  user: User | null;
  onAuthClick: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onHome, user, onAuthClick, onLogout }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <button onClick={onHome} className="flex items-center space-x-2 group">
            <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-100 group-hover:rotate-3 transition-transform">
              <FileText className="text-white" size={24} />
            </div>
            <span className="text-2xl font-black tracking-tighter">Mannu<span className="text-indigo-600">Editor</span></span>
          </button>
          
          <nav className="hidden lg:flex items-center space-x-8">
            <button className="text-slate-500 font-bold hover:text-indigo-600 uppercase text-[11px] tracking-[0.2em] transition-colors">Tools</button>
            <button className="text-slate-500 font-bold hover:text-indigo-600 uppercase text-[11px] tracking-[0.2em] transition-colors">History</button>
            <button className="text-slate-500 font-bold hover:text-indigo-600 uppercase text-[11px] tracking-[0.2em] transition-colors">Enterprise</button>
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative hidden xl:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search features..." 
              className="bg-slate-100 pl-11 pr-4 py-2.5 rounded-2xl text-sm border-2 border-transparent focus:bg-white focus:border-indigo-100 transition-all outline-none w-64 font-medium"
            />
          </div>

          {user ? (
            <div className="relative">
              <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 p-1.5 pr-3 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-200 transition-all"
              >
                <img src={user.avatar} className="w-8 h-8 rounded-xl object-cover shadow-sm" alt={user.name} />
                <span className="text-sm font-bold text-slate-700 hidden sm:inline">{user.name}</span>
                <ChevronDown size={14} className={`text-slate-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-3 w-56 bg-white border border-slate-100 rounded-3xl shadow-2xl p-2 z-[60] animate-in slide-in-from-top-2">
                  <div className="p-4 border-b border-slate-50 mb-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Account</p>
                    <p className="text-sm font-bold truncate">{user.email}</p>
                  </div>
                  <button className="w-full text-left p-3 flex items-center gap-3 hover:bg-slate-50 rounded-2xl transition-all text-sm font-bold">
                    <UserIcon size={18} /> Profile settings
                  </button>
                  <button 
                    onClick={() => { onLogout(); setShowDropdown(false); }}
                    className="w-full text-left p-3 flex items-center gap-3 hover:bg-rose-50 rounded-2xl transition-all text-sm font-bold text-rose-600"
                  >
                    <LogOut size={18} /> Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button 
              onClick={onAuthClick}
              className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black text-sm hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center gap-2"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12">
          <div className="col-span-2 lg:col-span-1">
            <h3 className="text-white font-black text-lg mb-6 tracking-tighter uppercase">Mannu Editor</h3>
            <p className="text-sm leading-relaxed mb-6">The ultimate PDF workspace powered by AI. Simplifying document workflows for everyone, everywhere.</p>
            <div className="flex space-x-4">
               <a href="#" className="hover:text-indigo-400 transition-colors"><Github size={20} /></a>
               <a href="mailto:Thakur.manish@zohomail.in" className="hover:text-indigo-400 transition-colors"><Mail size={20} /></a>
            </div>
          </div>
          <div>
            <h3 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">Tools</h3>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Merge PDF</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Split PDF</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Compress PDF</a></li>
              <li><a href="#" className="hover:text-white transition-colors">PDF to JPG</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">AI Suite</h3>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">AI Summarizer</a></li>
              <li><a href="#" className="hover:text-white transition-colors">AI PDF Chat</a></li>
              <li><a href="#" className="hover:text-white transition-colors">AI OCR</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">Support</h3>
            <ul className="space-y-3 text-sm">
              <li><a href="mailto:Thakur.manish@zohomail.in" className="hover:text-white transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
            </ul>
          </div>
          <div className="col-span-2 lg:col-span-1">
             <div className="bg-slate-800 p-6 rounded-[2rem] border border-slate-700">
                <p className="text-xs text-slate-300 font-bold mb-4 flex items-center gap-2">
                    <Mail size={14} className="text-indigo-400" /> Thakur.manish@zohomail.in
                </p>
                <p className="text-[10px] text-slate-500 font-medium">Need custom PDF solutions? Drop us a line.</p>
             </div>
          </div>
        </div>
        <div className="border-t border-slate-800 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-xs">
          <p>© 2024 Mannu Editor. All rights reserved.</p>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
