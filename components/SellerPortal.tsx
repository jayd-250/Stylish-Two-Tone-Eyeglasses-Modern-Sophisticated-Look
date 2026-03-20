
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth, BrandLogo } from '../App';
import { t } from '../i18n';
import { Product, Order, Language, SellerWallet, Transaction, UserRole } from '../types';
import { LOGISTICS_PROVIDERS, CATEGORIES } from '../constants/rwanda';
import { GoogleGenAI } from "@google/genai";
import { 
  LayoutDashboard, Package, ShoppingBag, 
  Plus, Radio, Wallet, PieChart, Users, Tag, 
  MessageSquare, Star, Truck, ShieldCheck, 
  AlertCircle, CheckCircle2, FileCheck, ArrowUpRight,
  X, Sparkles, Loader2, Camera, Image as ImageIcon,
  Crown, Save, Trash2, Info, ArrowDownLeft, 
  Smartphone, Building2, Banknote, History, ExternalLink, RefreshCw,
  ClipboardList, AlertTriangle, MinusCircle, CheckCircle, SlidersHorizontal, Eye,
  LayoutGrid, TrendingUp, ShoppingCart, ListChecks, Building, MapPin, Globe, Hash,
  ShieldAlert, Hourglass, Mail, LogOut
} from 'lucide-react';

/* 
 * SellerPortal component handles the merchant dashboard. 
 * It includes an authorization check for new sellers and a management interface for verified ones.
 */
const SellerPortal: React.FC = () => {
  const { language, user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders' | 'verification' | 'wallet' | 'tasks'>('dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  // If user is pending authorization, show the waiting screen
  if (user?.role === UserRole.SELLER && user?.verificationStatus === 'pending') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6 bg-white">
        <div className="max-w-xl w-full bg-white rounded-[3.5rem] p-12 text-center border border-amber-100 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-700">
           {/* Decorative Crown */}
           <div className="absolute -top-10 -left-10 w-40 h-40 bg-amber-50 rounded-full opacity-50 blur-3xl"></div>
           <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-amber-50 rounded-full opacity-50 blur-3xl"></div>

           <div className="w-24 h-24 bg-amber-50 text-amber-600 rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-inner relative z-10">
              <Hourglass className="animate-spin-slow" size={48}/>
           </div>
           
           <h2 className="text-3xl font-black text-gray-900 tracking-tight italic uppercase mb-4 relative z-10">Royal Authorization Pending</h2>
           <p className="text-gray-500 font-bold mb-10 leading-relaxed italic relative z-10 px-4">
              Your merchant application for <span className="text-amber-600">"{user.businessProfile?.businessName}"</span> is currently being reviewed by our Royal Administrators. We will notify you at <span className="text-black">{user.email}</span> once you are authorized to trade.
           </p>

           <div className="space-y-4 relative z-10">
              <div className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100 flex items-center gap-4 text-left">
                 <ShieldAlert className="text-amber-600 shrink-0" size={24}/>
                 <div>
                    <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Why is my account pending?</h4>
                    <p className="text-[10px] font-bold text-gray-600 mt-1">To ensure the royal standard of BIG MARKET HUB, all merchants undergo a manual credential check.</p>
                 </div>
              </div>
              <div className="flex gap-3">
                 <button onClick={() => window.location.reload()} className="flex-1 bg-black text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-amber-600 transition flex items-center justify-center gap-2">
                    <RefreshCw size={16}/> Refresh Status
                 </button>
                 <button onClick={logout} className="flex-1 bg-gray-100 text-gray-500 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition flex items-center justify-center gap-2">
                    <LogOut size={16}/> Logout
                 </button>
              </div>
           </div>
           
           <div className="mt-12 opacity-30 italic flex items-center justify-center gap-3">
              <BrandLogo size="w-8 h-8"/>
              <span className="text-[8px] font-black uppercase tracking-[0.4em]">Decree Verification #B-742</span>
           </div>
        </div>
      </div>
    );
  }

  // Normal Seller Portal Content...
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      <aside className="w-full md:w-72 bg-white border-r border-gray-100 flex-shrink-0 z-10">
        <div className="p-8 pb-4">
          <div className="flex items-center gap-3 mb-8">
            <BrandLogo size="w-10 h-10" />
            <div>
              <h2 className="font-black text-gray-900 leading-tight">Partner Portal</h2>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{user?.fullName}</p>
            </div>
          </div>
        </div>
        <nav className="px-4 space-y-1">
          {[
            { id: 'dashboard', icon: <LayoutDashboard size={20}/>, label: 'Dashboard' },
            { id: 'verification', icon: <ShieldCheck size={20}/>, label: 'Verification Hub' },
            { id: 'products', icon: <Package size={20}/>, label: 'Inventory' },
            { id: 'orders', icon: <ShoppingBag size={20}/>, label: 'Orders' },
            { id: 'tasks', icon: <ClipboardList size={20}/>, label: 'Store Tasks' },
            { id: 'wallet', icon: <Wallet size={20}/>, label: 'Royal Wallet' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl font-bold transition-all ${activeTab === item.id ? 'bg-black text-white shadow-lg' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
            >
              {item.icon}
              <span className="text-sm">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-grow p-4 sm:p-10 overflow-y-auto max-h-screen no-scrollbar">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight italic uppercase">
            {activeTab.replace('_', ' ')}
          </h1>
        </div>
        
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in duration-500">
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Total Sales</p>
              <h2 className="text-4xl font-black text-gray-900">0 Frw</h2>
              <div className="flex items-center gap-2 mt-2 text-gray-400 font-bold text-xs italic">
                <TrendingUp size={14}/> Starting your journey
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default SellerPortal;
