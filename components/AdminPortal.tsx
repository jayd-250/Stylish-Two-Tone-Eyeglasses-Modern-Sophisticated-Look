
import React, { useState, useMemo, useEffect } from 'react';
import { useAuth, db } from '../App';
import { Language, UserRole, User } from '../types';
import { t } from '../i18n';
import { DISTRICTS } from '../constants/rwanda';
import { doc, setDoc, collection, getDocs, updateDoc, deleteDoc } from "firebase/firestore";
// Fix: Added missing 'Hash' import from lucide-react
import { 
  Shield, Users, Store, Globe, AlertCircle, CheckCircle, 
  LayoutDashboard, Truck, Wallet, Settings, 
  Search, UserPlus, Ban, X, Plus,
  Monitor, Sparkles, Trash, AlertTriangle, 
  ClipboardList, Handshake, ShieldCheck, MapPin,
  Bell, CheckCircle2, UserCheck, Clock, ShieldAlert,
  ArrowRight, Mail, Phone, BadgeCheck, Building2, Upload, Loader2, Crown, Hash
} from 'lucide-react';

type AdminModule = 'dashboard' | 'auth_hub' | 'users' | 'sellers' | 'content' | 'settings';

const AdminPortal: React.FC = () => {
  const { language, user } = useAuth();
  const [activeModule, setActiveModule] = useState<AdminModule>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Onboarding Form State
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [onboardingForm, setOnboardingForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    businessName: '',
    tinNumber: '',
    businessAddress: DISTRICTS[0],
    businessType: 'Retail'
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const users: User[] = [];
      querySnapshot.forEach((doc) => users.push({ id: doc.id, ...doc.data() } as User));
      setAllUsers(users);
    } catch (err) {
      console.error("Fetch users error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOnboardMerchant = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // In a real app, this would also create a Firebase Auth user via Admin SDK.
      // Here we simulate the Firestore profile creation.
      const tempId = 'MERCHANT-' + Math.random().toString(36).substr(2, 9).toUpperCase();
      const newUser: User = {
        id: tempId,
        email: onboardingForm.email,
        phone: onboardingForm.phone,
        fullName: onboardingForm.fullName,
        role: UserRole.SELLER,
        language: Language.RW,
        verificationStatus: 'verified',
        businessProfile: {
          businessName: onboardingForm.businessName,
          tinNumber: onboardingForm.tinNumber,
          businessAddress: onboardingForm.businessAddress,
          businessType: onboardingForm.businessType,
          submittedAt: new Date().toISOString()
        }
      };

      await setDoc(doc(db, "users", tempId), newUser);
      await fetchUsers();
      setIsOnboardingOpen(false);
      alert("New Merchant successfully onboarded and verified.");
    } catch (err) {
      console.error("Onboarding error:", err);
    } finally {
      setLoading(false);
    }
  };

  const authorizeMerchant = async (userId: string) => {
    try {
      await updateDoc(doc(db, "users", userId), { 
        verificationStatus: 'verified',
        role: UserRole.SELLER 
      });
      fetchUsers();
    } catch (err) {
      console.error("Auth error:", err);
    }
  };

  const denyMerchant = async (userId: string) => {
    try {
      await updateDoc(doc(db, "users", userId), { 
        verificationStatus: 'rejected' 
      });
      fetchUsers();
    } catch (err) {
      console.error("Deny error:", err);
    }
  };

  // Expanded to include all merchants with a status for the "column" display
  const merchantApplications = useMemo(() => 
    allUsers.filter(u => u.role === UserRole.SELLER && u.verificationStatus && u.verificationStatus !== 'none'), 
    [allUsers]
  );

  const pendingCount = useMemo(() => 
    allUsers.filter(u => u.role === UserRole.SELLER && u.verificationStatus === 'pending').length,
    [allUsers]
  );

  const sidebarItems = [
    { id: 'dashboard', icon: <LayoutDashboard size={20}/>, label: 'Overview' },
    { 
      id: 'auth_hub', 
      icon: <ShieldCheck size={20}/>, 
      label: 'Authorization Hub',
      badge: pendingCount > 0 ? pendingCount : null 
    },
    { id: 'users', icon: <Users size={20}/>, label: 'Market Users' },
    { id: 'sellers', icon: <Store size={20}/>, label: 'Merchant Audit' },
    { id: 'content', icon: <Monitor size={20}/>, label: 'App Content' },
    { id: 'settings', icon: <Settings size={20}/>, label: 'System Prefs' },
  ];

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'verified':
        return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1"><BadgeCheck size={12}/> Verified</span>;
      case 'rejected':
        return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1"><Ban size={12}/> Rejected</span>;
      case 'pending':
      default:
        return <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1 animate-pulse"><Clock size={12}/> Pending</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      <aside className="w-full md:w-72 bg-gray-900 text-gray-400 flex-shrink-0 z-20">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-amber-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg border-2 border-amber-400/20">A</div>
            <div>
              <h2 className="font-black text-white leading-tight">Admin Console</h2>
              <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest italic">The Royal Authority</p>
            </div>
          </div>
          <nav className="space-y-1">
            {sidebarItems.map(item => (
              <button 
                key={item.id}
                onClick={() => setActiveModule(item.id as AdminModule)}
                className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl font-bold transition-all ${activeModule === item.id ? 'bg-white/10 text-white shadow-sm' : 'hover:text-white hover:bg-white/5'}`}
              >
                <div className="flex items-center gap-4">
                  {item.icon}
                  <span className="text-sm">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full animate-pulse">{item.badge}</span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      <main className="flex-grow p-4 sm:p-10 overflow-y-auto max-h-screen no-scrollbar relative">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
           <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight italic uppercase">
                {sidebarItems.find(i => i.id === activeModule)?.label}
              </h1>
              <div className="flex items-center gap-2 mt-2">
                 <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                 <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">System Operational • RW-DC-01</span>
              </div>
           </div>
           
           <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsOnboardingOpen(true)}
                className="bg-black text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl hover:bg-amber-600 transition-all flex items-center gap-2"
              >
                <Plus size={16}/> Onboard Merchant
              </button>
           </div>
        </div>

        {activeModule === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in duration-500">
             <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm group hover:shadow-xl transition-all">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Auth Queue</p>
                <h2 className="text-4xl font-black text-gray-900">{pendingCount}</h2>
                <p className="text-xs text-amber-600 font-bold mt-2 italic flex items-center gap-2">
                   <Clock size={14}/> Pending Royal Review
                </p>
             </div>
             <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm group hover:shadow-xl transition-all">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Active Merchants</p>
                <h2 className="text-4xl font-black text-gray-900">{allUsers.filter(u => u.role === UserRole.SELLER && u.verificationStatus === 'verified').length}</h2>
                <p className="text-xs text-green-600 font-bold mt-2 italic flex items-center gap-2">
                   <BadgeCheck size={14}/> Verified Entities
                </p>
             </div>
          </div>
        )}

        {activeModule === 'auth_hub' && (
           <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
              <div className="bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-sm">
                 <div className="flex items-center gap-4 mb-10">
                    <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shadow-inner">
                       <ShieldAlert size={32}/>
                    </div>
                    <div>
                       <h3 className="text-2xl font-black text-gray-900 tracking-tight italic uppercase">Merchant Authorizations</h3>
                       <p className="text-sm text-gray-400 font-medium">Review and verify legal credentials for new store owners.</p>
                    </div>
                 </div>

                 {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-4">
                       <Loader2 className="animate-spin text-amber-600" size={40}/>
                       <p className="text-xs font-black uppercase text-gray-400 tracking-widest">Accessing Registry...</p>
                    </div>
                 ) : merchantApplications.length === 0 ? (
                    <div className="py-32 text-center bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-100">
                       <UserCheck className="mx-auto text-gray-200 mb-6" size={64}/>
                       <p className="text-lg font-black text-gray-300 uppercase tracking-widest italic">Authorization Queue is Empty.</p>
                    </div>
                 ) : (
                    <div className="grid grid-cols-1 gap-6">
                       {/* Header for the "table" look */}
                       <div className="hidden lg:grid grid-cols-12 px-8 mb-4 text-[10px] font-black uppercase tracking-widest text-gray-400 italic">
                          <div className="col-span-4">Merchant Entity</div>
                          <div className="col-span-3">Contact / Credentials</div>
                          <div className="col-span-2">Verification Status</div>
                          <div className="col-span-3 text-right">Actions</div>
                       </div>

                       {merchantApplications.map(u => (
                          <div key={u.id} className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 grid grid-cols-1 lg:grid-cols-12 items-center gap-8 group hover:bg-white hover:shadow-2xl transition-all duration-500">
                             <div className="col-span-4 flex items-center gap-6">
                                <div className="w-16 h-16 bg-white rounded-[2rem] flex items-center justify-center shadow-sm text-amber-600 font-black text-xl border border-amber-50 group-hover:border-amber-200 transition-colors">
                                   {u.fullName.charAt(0)}
                                </div>
                                <div className="space-y-1">
                                   <h4 className="text-xl font-black text-gray-900 flex items-center gap-2 italic">
                                      {u.businessProfile?.businessName || u.fullName}
                                   </h4>
                                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{u.fullName}</p>
                                </div>
                             </div>

                             <div className="col-span-3 space-y-1">
                                <div className="flex flex-col gap-1">
                                   <span className="text-[10px] font-black text-blue-600 flex items-center gap-1"><Hash size={12}/> TIN: {u.businessProfile?.tinNumber}</span>
                                   <span className="text-[10px] font-black text-gray-500 flex items-center gap-1"><MapPin size={12}/> {u.businessProfile?.businessAddress}</span>
                                </div>
                             </div>

                             <div className="col-span-2">
                                {getStatusBadge(u.verificationStatus)}
                             </div>

                             <div className="col-span-3 flex justify-end gap-3 w-full">
                                {u.verificationStatus === 'pending' ? (
                                  <>
                                    <button 
                                      onClick={() => authorizeMerchant(u.id)}
                                      className="px-6 py-4 bg-black text-white rounded-2xl font-black text-[9px] uppercase tracking-[0.2em] shadow-xl hover:bg-green-600 transition active:scale-95 flex items-center justify-center gap-2"
                                    >
                                      Authorize <CheckCircle size={14}/>
                                    </button>
                                    <button 
                                      onClick={() => denyMerchant(u.id)}
                                      className="px-6 py-4 bg-white text-red-600 border border-red-50 rounded-2xl font-black text-[9px] uppercase tracking-[0.2em] hover:bg-red-600 hover:text-white transition active:scale-95 flex items-center justify-center gap-2"
                                    >
                                      Deny <X size={14}/>
                                    </button>
                                  </>
                                ) : (
                                  <button 
                                    disabled
                                    className="px-6 py-4 bg-gray-100 text-gray-400 rounded-2xl font-black text-[9px] uppercase tracking-[0.2em] cursor-not-allowed opacity-60"
                                  >
                                    Action Finalized
                                  </button>
                                )}
                             </div>
                          </div>
                       ))}
                    </div>
                 )}
              </div>
           </div>
        )}

        {/* MERCHANT ONBOARDING MODAL */}
        {isOnboardingOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
             <div className="bg-white w-full max-w-2xl rounded-[3.5rem] overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-300 max-h-[95vh] overflow-y-auto no-scrollbar">
                <button onClick={() => setIsOnboardingOpen(false)} className="absolute top-10 right-10 text-gray-300 hover:text-black transition z-10"><X size={28}/></button>
                
                <form onSubmit={handleOnboardMerchant} className="p-10 md:p-14 space-y-10">
                   <div className="text-center">
                      <div className="w-20 h-20 bg-amber-50 text-amber-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner">
                         <Crown size={40}/>
                      </div>
                      <h2 className="text-3xl font-black text-gray-900 tracking-tight italic uppercase">Manual Onboarding</h2>
                      <p className="text-sm text-gray-400 font-medium">Verify credentials and issue immediate trading rights.</p>
                   </div>

                   <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 italic">Legal Owner Name</label>
                            <input 
                               type="text" required
                               className="w-full px-6 py-5 bg-gray-50 border-none rounded-2xl font-bold text-gray-900 focus:ring-4 focus:ring-amber-100 transition outline-none"
                               value={onboardingForm.fullName}
                               onChange={e => setOnboardingForm({...onboardingForm, fullName: e.target.value})}
                               placeholder="e.g. Jean Damascene"
                            />
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 italic">Merchant Email</label>
                            <input 
                               type="email" required
                               className="w-full px-6 py-5 bg-gray-50 border-none rounded-2xl font-bold text-gray-900 focus:ring-4 focus:ring-amber-100 transition outline-none"
                               value={onboardingForm.email}
                               onChange={e => setOnboardingForm({...onboardingForm, email: e.target.value})}
                               placeholder="merchant@example.rw"
                            />
                         </div>
                      </div>

                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 italic">Business / Store Name</label>
                         <input 
                            type="text" required
                            className="w-full px-6 py-5 bg-gray-50 border-none rounded-2xl font-bold text-gray-900 focus:ring-4 focus:ring-amber-100 transition outline-none"
                            value={onboardingForm.businessName}
                            onChange={e => setOnboardingForm({...onboardingForm, businessName: e.target.value})}
                            placeholder="e.g. Kigali Artisans Hub"
                         />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 italic">TIN Number (Verified)</label>
                            <input 
                               type="text" required pattern="[0-9]{9}" title="TIN must be 9 digits"
                               className="w-full px-6 py-5 bg-gray-50 border-none rounded-2xl font-bold text-gray-900 focus:ring-4 focus:ring-amber-100 transition outline-none"
                               value={onboardingForm.tinNumber}
                               onChange={e => setOnboardingForm({...onboardingForm, tinNumber: e.target.value})}
                               placeholder="123456789"
                            />
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 italic">Contact Phone</label>
                            <input 
                               type="tel" required
                               className="w-full px-6 py-5 bg-gray-50 border-none rounded-2xl font-bold text-gray-900 focus:ring-4 focus:ring-amber-100 transition outline-none"
                               value={onboardingForm.phone}
                               onChange={e => setOnboardingForm({...onboardingForm, phone: e.target.value})}
                               placeholder="078..."
                            />
                         </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 italic">District Hub</label>
                            <select 
                               className="w-full px-6 py-5 bg-gray-50 border-none rounded-2xl font-bold text-gray-700 outline-none"
                               value={onboardingForm.businessAddress}
                               onChange={e => setOnboardingForm({...onboardingForm, businessAddress: e.target.value})}
                            >
                               {DISTRICTS.map(d => <option key={d}>{d}</option>)}
                            </select>
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 italic">Business Category</label>
                            <select 
                               className="w-full px-6 py-5 bg-gray-50 border-none rounded-2xl font-bold text-gray-700 outline-none appearance-none"
                               value={onboardingForm.businessType}
                               onChange={e => setOnboardingForm({...onboardingForm, businessType: e.target.value})}
                            >
                               <option>Retail & Consumer</option>
                               <option>Artisan & Handmade</option>
                               <option>Agricultural Cooperative</option>
                               <option>Tech & Innovation</option>
                            </select>
                         </div>
                      </div>

                      <div className="p-6 bg-amber-50 rounded-[2rem] border-2 border-dashed border-amber-200 flex flex-col items-center justify-center gap-4 group cursor-pointer hover:border-amber-400 transition-all">
                         <Upload className="text-amber-600" size={32}/>
                         <div className="text-center">
                            <p className="text-[10px] font-black text-amber-900 uppercase tracking-widest italic">Attach Government ID / Certificate</p>
                            <p className="text-[8px] font-bold text-amber-400 uppercase tracking-[0.2em] mt-1">Verified Document Storage Only</p>
                         </div>
                         <input type="file" className="hidden" />
                      </div>
                   </div>

                   <div className="pt-6 border-t border-gray-100">
                      <button 
                         type="submit" disabled={loading}
                         className="w-full bg-black text-white py-6 rounded-[2.2rem] font-black uppercase text-xs tracking-[0.3em] shadow-2xl hover:bg-amber-600 transition flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                      >
                         {loading ? <Loader2 className="animate-spin"/> : <><ShieldCheck size={20}/> Issue Royal License</>}
                      </button>
                      <p className="text-[9px] font-bold text-gray-300 uppercase text-center tracking-widest mt-6 italic">This action will grant immediate "Verified" status in the Marketplace.</p>
                   </div>
                </form>
             </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPortal;
