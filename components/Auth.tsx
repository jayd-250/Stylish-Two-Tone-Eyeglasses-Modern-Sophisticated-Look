
import React, { useState } from 'react';
import { useAuth, auth, db } from '../App';
import { UserRole, Language, User } from '../types';
import { t } from '../i18n';
import { DISTRICTS } from '../constants/rwanda';

// Fixed: Correcting Firebase modular imports for authentication
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

import { 
  ChevronRight, ChevronLeft, Store, User as UserIcon, 
  CheckCircle2, Mail, Key, ShoppingCart, Smartphone, 
  Clock, ShieldAlert, Loader2, AlertCircle, Sparkles
} from 'lucide-react';

const AuthPortal: React.FC = () => {
  const { language, login } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [role, setRole] = useState<UserRole>(UserRole.BUYER);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    storeName: '',
    district: DISTRICTS[0],
  });

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    
    try {
      if (authMode === 'register') {
        if (role === UserRole.SELLER && step < 2) {
          setStep(2);
          setLoading(false);
          return;
        }

        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        const fbUser = userCredential.user;

        const newUser: User = {
          id: fbUser.uid,
          email: formData.email,
          phone: formData.phone,
          fullName: formData.fullName,
          role: role,
          language: language,
          verificationStatus: role === UserRole.SELLER ? 'pending' : 'verified',
          businessProfile: role === UserRole.SELLER ? {
            businessName: formData.storeName || formData.fullName + "'s Store",
            tinNumber: 'PENDING',
            businessAddress: formData.district,
            businessType: 'Retail',
            submittedAt: new Date().toISOString()
          } : undefined
        };

        // Important: Use the shared 'db' from App.tsx
        await setDoc(doc(db, "users", fbUser.uid), newUser);
        login(newUser);
      } else {
        await signInWithEmailAndPassword(auth, formData.email, formData.password);
      }
    } catch (error: any) {
      console.error("Auth Exception:", error);
      let msg = error.message;
      if (error.code === 'auth/invalid-credential') msg = "Invalid email or password.";
      if (error.code === 'auth/email-already-in-use') msg = "Email already registered.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl p-8 sm:p-12 border border-gray-100 relative overflow-hidden animate-in zoom-in-95 duration-500">
        
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-500 via-amber-700 to-amber-900"></div>

        <div className="text-center mb-10">
          <h2 className="text-4xl font-black text-gray-900 mb-3 tracking-tight italic uppercase">
            {authMode === 'register' ? t('register', language) : t('login', language)}
          </h2>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest italic">Encrypted Secure Portal</p>
        </div>

        <div className="flex bg-gray-100 p-1.5 rounded-2xl mb-8 border border-gray-200 shadow-inner">
          <button type="button" onClick={() => { setAuthMode('login'); setErrorMsg(null); }} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${authMode === 'login' ? 'bg-white text-black shadow-sm' : 'text-gray-400'}`}>Login</button>
          <button type="button" onClick={() => { setAuthMode('register'); setErrorMsg(null); }} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${authMode === 'register' ? 'bg-white text-black shadow-sm' : 'text-gray-400'}`}>Register</button>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 animate-in slide-in-from-top-4">
             <AlertCircle size={18} className="shrink-0"/>
             <p className="text-[10px] font-black uppercase tracking-tight leading-tight">{errorMsg}</p>
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-6">
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Account Role</label>
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => setRole(UserRole.BUYER)} className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${role === UserRole.BUYER ? 'border-amber-600 bg-amber-50' : 'border-gray-50'}`}>
                    <ShoppingCart size={20} className={role === UserRole.BUYER ? 'text-amber-600' : 'text-gray-300'}/>
                    <span className="text-[10px] font-black uppercase">Client</span>
                  </button>
                  <button type="button" onClick={() => setRole(UserRole.SELLER)} className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${role === UserRole.SELLER ? 'border-amber-600 bg-amber-50' : 'border-gray-50'}`}>
                    <Store size={20} className={role === UserRole.SELLER ? 'text-amber-600' : 'text-gray-300'}/>
                    <span className="text-[10px] font-black uppercase">Merchant</span>
                  </button>
                </div>
              </div>

              {authMode === 'register' && (
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                  <input type="text" placeholder="Full Legal Name" required className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})}/>
                </div>
              )}
              
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input type="email" placeholder="Email Address" required className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}/>
              </div>

              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input type="password" placeholder="Secure Password" required className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}/>
              </div>
            </div>
          )}

          {step === 2 && authMode === 'register' && role === UserRole.SELLER && (
            <div className="space-y-6 animate-in slide-in-from-right-4">
               <div className="space-y-2">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Store Name</label>
                 <input type="text" required className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold" value={formData.storeName} onChange={e => setFormData({...formData, storeName: e.target.value})}/>
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Operating District</label>
                 <select className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold" value={formData.district} onChange={e => setFormData({...formData, district: e.target.value})}>
                    {DISTRICTS.map(d => <option key={d}>{d}</option>)}
                 </select>
               </div>
            </div>
          )}

          <div className="flex gap-4 pt-4">
            {step > 1 && (
              <button type="button" onClick={() => setStep(1)} className="p-5 bg-gray-100 text-gray-500 rounded-2xl font-bold">
                <ChevronLeft size={24} />
              </button>
            )}
            <button type="submit" disabled={loading} className="flex-grow bg-black text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-amber-600 transition disabled:opacity-50">
              {loading ? <Loader2 className="animate-spin mx-auto" size={20}/> : (step === 1 && authMode === 'register' && role === UserRole.SELLER ? 'Next Step' : 'Authorize Entry')}
            </button>
          </div>
        </form>

        <div className="mt-12 text-center pt-8 border-t border-gray-50">
           <button type="button" onClick={() => setFormData({...formData, email: 'admin@bigmarkethub.rw', password: 'password'})} className="text-[10px] font-black text-amber-700 hover:text-black uppercase tracking-widest flex items-center justify-center gap-2 mx-auto">
              <Sparkles size={12}/> Demo Admin Login
           </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPortal;
