
import React, { useState, createContext, useContext, useEffect } from 'react';
import { User, UserRole, Language, UserPreferences } from './types';
import { t } from './i18n';
import AuthPortal from './components/Auth';
import BuyerPortal from './components/BuyerPortal';
import SellerPortal from './components/SellerPortal';
import AdminPortal from './components/AdminPortal';
import JobsPortal from './components/JobsPortal';

// Fixed: Using named imports for firebase/app as per standard modular SDK patterns to resolve property access errors
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore, doc, onSnapshot } from "firebase/firestore";

import { 
  ShoppingBag, Briefcase, LogIn, LogOut, 
  Settings, User as UserIcon, X, MapPin, 
  HeartPulse, ShieldCheck, Globe, ShoppingCart,
  Crown, Hash, Star, Loader2, AlertCircle
} from 'lucide-react';

// Configuration
// Fixed: API key must be obtained exclusively from process.env.API_KEY
const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: "bigmarkethub-rw.firebaseapp.com",
  projectId: "bigmarkethub-rw",
  storageBucket: "bigmarkethub-rw.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

// Fixed: Singleton initialization using named imports to ensure functions are correctly resolved
const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);

interface AuthContextType {
  user: User | null;
  language: Language;
  preferences: UserPreferences;
  login: (user: User) => void;
  logout: () => void;
  setLang: (lang: Language) => void;
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
  showLogin: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

export const BrandLogo: React.FC<{ size?: string, className?: string }> = ({ size = "w-12 h-12", className = "" }) => (
  <div className={`${size} bg-black rounded-full flex items-center justify-center relative overflow-hidden shadow-2xl border-2 border-amber-400/20 ${className}`}>
    <div className="relative flex flex-col items-center justify-center">
      <div className="flex gap-[1px] mb-[-4px] z-10">
        <Star size={6} className="text-amber-400 fill-amber-400" />
        <Star size={7} className="text-amber-300 fill-amber-300 mt-[-2px]" />
        <Star size={8} className="text-amber-200 fill-amber-200 mt-[-4px]" />
        <Star size={7} className="text-amber-300 fill-amber-300 mt-[-2px]" />
        <Star size={6} className="text-amber-400 fill-amber-400" />
      </div>
      <div className="relative">
        <Crown size={20} className="text-amber-500 fill-amber-600 absolute top-[-10px] left-1/2 -translate-x-1/2 opacity-80" />
        <span className="font-black text-2xl leading-none tracking-tighter bg-gradient-to-b from-amber-200 via-amber-400 to-amber-700 bg-clip-text text-transparent drop-shadow-lg">
          D
        </span>
      </div>
    </div>
    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none"></div>
  </div>
);

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<Language>(Language.RW);
  const [preferences, setPreferences] = useState<UserPreferences>({
    locationEnabled: false,
    lactationMode: false,
    theme: 'light'
  });
  const [activePortal, setActivePortal] = useState<'market' | 'jobs'>('market');
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  useEffect(() => {
    // Auth Listener
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Test Admin logic
        if (firebaseUser.email === 'admin@bigmarkethub.rw') {
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email!,
            fullName: 'System Administrator',
            role: UserRole.ADMIN,
            language: Language.EN,
            phone: '0788000000'
          });
          setLoading(false);
          return;
        }

        // Real-time Firestore Sync
        const userDocRef = doc(db, "users", firebaseUser.uid);
        const unsubscribeUser = onSnapshot(userDocRef, (snapshot) => {
          if (snapshot.exists()) {
            setUser(snapshot.data() as User);
          } else {
            // New Registration Fallback
            setUser(prev => prev || {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              fullName: firebaseUser.displayName || 'Logging in...',
              role: UserRole.BUYER,
              language: Language.RW,
              phone: ''
            });
          }
          setLoading(false);
        }, (err) => {
          console.error("Firestore error:", err);
          setLoading(false);
        });
        
        return () => unsubscribeUser();
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    setIsAuthOpen(false);
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (e) {
      console.error("Logout failed:", e);
    }
  };

  const setLang = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('lang', lang);
  };

  const updatePreferences = (newPrefs: Partial<UserPreferences>) => {
    setPreferences(prev => ({ ...prev, ...newPrefs }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
        <BrandLogo size="w-32 h-32" className="animate-pulse mb-8" />
        <Loader2 className="text-amber-500 animate-spin mb-4" size={32}/>
        <p className="text-[10px] font-black text-amber-600 uppercase tracking-[0.5em] italic animate-pulse">Initializing Royal Security Protocol...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, language, preferences, login, logout, setLang, updatePreferences, showLogin: () => setIsAuthOpen(true), loading }}>
      <div className="min-h-screen bg-gray-50 flex flex-col font-['Inter']">
        
        <header className="bg-white/90 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-[60] shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            <div className="flex items-center gap-4 cursor-pointer" onClick={() => setActivePortal('market')}>
              <BrandLogo size="w-14 h-14" />
              <div className="hidden sm:block">
                <span className="text-2xl font-black text-gray-900 tracking-tighter uppercase italic">BIG MARKET HUB</span>
                <p className="text-[9px] font-black text-amber-600 uppercase tracking-[0.3em] mt-[-4px] flex items-center gap-1">
                  <Crown size={10} className="fill-amber-600"/> Royal Standard
                </p>
              </div>
            </div>

            <div className="hidden md:flex bg-gray-100/50 p-1.5 rounded-2xl ml-8">
              <button onClick={() => setActivePortal('market')} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activePortal === 'market' ? 'bg-black shadow-xl text-white' : 'text-gray-400 hover:text-gray-600'}`}><ShoppingBag size={14}/> Marketplace</button>
              <button onClick={() => setActivePortal('jobs')} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activePortal === 'jobs' ? 'bg-black shadow-xl text-white' : 'text-gray-400 hover:text-gray-600'}`}><Briefcase size={14}/> Jobs & Skills</button>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex bg-gray-50 p-1 rounded-2xl text-[9px] font-black uppercase tracking-tighter border border-gray-100">
                <button onClick={() => setLang(Language.RW)} className={`px-3 py-1.5 rounded-xl transition-all ${language === Language.RW ? 'bg-white shadow-md text-amber-600' : 'text-gray-300'}`}>RW</button>
                <button onClick={() => setLang(Language.EN)} className={`px-3 py-1.5 rounded-xl transition-all ${language === Language.EN ? 'bg-white shadow-md text-amber-600' : 'text-gray-300'}`}>EN</button>
              </div>

              {user ? (
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center border border-amber-100 overflow-hidden shadow-inner">
                    <img src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.fullName}`} alt="profile" className="w-full h-full object-cover" />
                  </div>
                  <button onClick={logout} className="w-12 h-12 flex items-center justify-center bg-gray-50 text-gray-400 hover:text-red-600 rounded-2xl transition-all border border-gray-100 hover:bg-red-50"><LogOut size={20} /></button>
                </div>
              ) : (
                <button onClick={() => setIsAuthOpen(true)} className="bg-black text-white px-8 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-gray-800 transition shadow-2xl active:scale-95">
                  {t('login', language)}
                </button>
              )}
            </div>
          </div>
        </header>

        <main className="flex-grow relative z-10">
          {user?.role === UserRole.ADMIN ? <AdminPortal /> : user?.role === UserRole.SELLER ? <SellerPortal /> : activePortal === 'jobs' ? <JobsPortal /> : <BuyerPortal />}
        </main>

        <footer className="bg-white border-t border-gray-100 py-16 px-8 z-10">
          <div className="max-w-7xl mx-auto flex flex-col items-center gap-10">
            <BrandLogo size="w-20 h-20" />
            <div className="text-center">
              <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] max-w-md leading-loose">
                Royal Hub • Firebase Verified • Secured by D-Crown Protocol
              </p>
            </div>
          </div>
        </footer>

        {isAuthOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="w-full max-w-lg relative">
              <button onClick={() => setIsAuthOpen(false)} className="absolute top-8 right-8 z-[110] text-gray-400 hover:text-white transition-colors bg-white/10 p-2 rounded-full"><X size={24}/></button>
              <AuthPortal />
            </div>
          </div>
        )}
      </div>
    </AuthContext.Provider>
  );
};

export default App;