
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth, BrandLogo } from '../App';
import { t } from '../i18n';
import { Language, Order, OrderStatus, Product, AdBanner, OrderItem, User, UserRole, LiveStream } from '../types';
import { DISTRICTS } from '../constants/rwanda';
import LiveSession from './LiveSession';
import { 
  Search, ShoppingCart, MapPin, CheckCircle2, 
  Store as StoreIcon, Heart, LayoutGrid, Package,
  Plus, Radio, Users, 
  Hash, Star, ShieldCheck, ArrowUpRight,
  ShoppingBag, Sparkles, X, MessageSquare, Send,
  Truck, Clock, MapPinned, Minus, ShoppingBasket, Trash2,
  CreditCard, Smartphone, Banknote, Loader2, Crown, User as UserIcon,
  Navigation, Box, ArrowLeft, ArrowRight, Play, ExternalLink,
  ShieldAlert, SlidersHorizontal, Filter, Award, Settings, Trash, AlertTriangle,
  History, Eye, UserPlus, FileCheck, Handshake, Building2, ClipboardList, RefreshCw, Upload,
  CreditCard as CardIcon, Receipt, Calendar, Map, Camera, Tv
} from 'lucide-react';

const FALLBACK_ADS: AdBanner[] = [
  {
    id: 'ad-default-1',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=2000',
    title: { rw: "Imyambaro Myiza", en: "Premium Rwandan Fashion" },
    subtitle: { rw: "Gura imyenda yakozwe n'abanyarwanda b'abahanga.", en: "Shop exquisite designs from Rwanda's top fashion houses." },
    ctaText: { rw: "Reba Ibicuruzwa", en: "Explore Collection" },
    priority: 1
  }
];

const MOCK_PRODUCTS: (Product & { store: string, rating: number, img: string })[] = [
  { id: '1', storeId: 's1', name: 'Agaseke (Traditional Basket)', description: 'Handcrafted traditional Rwandan basket made from natural fibers. Perfect for home decor or gift storage.', price: 15000, stock: 12, category: 'home', store: 'Kigali Crafts', rating: 4.8, img: 'https://images.unsplash.com/photo-1590424744299-cc27d62f483a?auto=format&fit=crop&q=80&w=800', images: [], status: 'active' },
  { id: '2', storeId: 's2', name: 'Premium Arabica Coffee (250g)', description: 'Single-origin coffee beans from the volcanic soil of Huye. Rich aroma with chocolate notes.', price: 7500, stock: 45, category: 'food', store: 'Huye Coffee', rating: 4.9, img: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&q=80&w=800', images: [], status: 'active' },
  { id: '3', storeId: 's3', name: 'Hand-woven Igitenge Fabric', description: 'High-quality 6-yard wax print fabric with vibrant cultural patterns.', price: 25000, stock: 5, category: 'clothing', store: 'Nyarugenge Textiles', rating: 4.7, img: 'https://images.unsplash.com/photo-1590736704728-f4730bb30770?auto=format&fit=crop&q=80&w=800', images: [], status: 'active' }
];

const MOCK_LIVE_STREAMS: (LiveStream & { thumbnail: string, store: string })[] = [
  { id: 'ls1', sellerId: 's1', sellerName: 'Jean Damascene', title: 'Traditional Crafting Live', viewerCount: 125, startTime: new Date().toISOString(), thumbnail: 'https://images.unsplash.com/photo-1511204610793-9c0df1140986?auto=format&fit=crop&q=80&w=600', store: 'Kigali Crafts' },
  { id: 'ls2', sellerId: 's2', sellerName: 'Marie Claire', title: 'Huye Coffee Tasting Session', viewerCount: 89, startTime: new Date().toISOString(), thumbnail: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=600', store: 'Huye Coffee' }
];

const ProductCard: React.FC<{ 
  product: any, 
  onAddToCart?: () => void, 
  onClick?: () => void, 
  onWishlistToggle?: () => void,
  isWishlisted?: boolean,
  language: Language
}> = ({ product, onAddToCart, onClick, onWishlistToggle, isWishlisted, language }) => (
  <div className="bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 group hover:shadow-2xl transition-all duration-700 flex flex-col h-full cursor-pointer" onClick={onClick}>
    <div className="relative h-64 overflow-hidden">
      <img src={product.img || 'https://picsum.photos/seed/prod/400'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={product.name} />
      <button 
        className={`absolute top-4 right-4 p-3 backdrop-blur rounded-2xl transition shadow-lg ${isWishlisted ? 'bg-red-500 text-white' : 'bg-white/80 text-gray-400 hover:text-red-500'}`} 
        onClick={(e) => { e.stopPropagation(); onWishlistToggle?.(); }}
      >
        <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
      </button>
      <div className="absolute bottom-4 left-4 flex items-center gap-1 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-black text-white uppercase tracking-widest border border-white/10">
        <Star size={10} className="text-amber-400 fill-amber-400"/> {product.rating}
      </div>
    </div>
    <div className="p-6 flex flex-col flex-grow">
      <h4 className="text-base font-black text-gray-900 mb-2 leading-tight group-hover:text-amber-600 transition h-12 line-clamp-2 italic">{product.name}</h4>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-1">
        <StoreIcon size={12}/> {product.store || 'Domestic Vendor'}
      </p>
      <div className="mt-auto space-y-4">
        <span className="text-xl font-black text-gray-900 block">{product.price.toLocaleString()} Frw</span>
        <button 
          onClick={(e) => { e.stopPropagation(); onAddToCart?.(); }}
          className="w-full bg-black text-white py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-amber-600 transition shadow-xl active:scale-95 font-black text-[10px] uppercase tracking-widest"
        >
          <ShoppingCart size={16}/>
          {language === Language.RW ? 'Ongeramo mu Kagite' : 'Add to Cart'}
        </button>
      </div>
    </div>
  </div>
);

const BuyerPortal: React.FC = () => {
  const { language, user, showLogin, login } = useAuth();
  const [activeTab, setActiveTab] = useState<'home' | 'browse' | 'orders'>('home');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Cart & Checkout State
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<(OrderItem & { img: string, store: string })[]>([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [lastOrderTracking, setLastOrderTracking] = useState('');

  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Live Shopping State
  const [activeLiveSession, setActiveLiveSession] = useState<LiveStream | null>(null);
  const [liveMode, setLiveMode] = useState<'buyer' | 'seller'>('buyer');

  // Guest Info State (Pre-filled from localStorage)
  const [checkoutForm, setCheckoutForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    district: DISTRICTS[0],
    sector: '',
    cell: '',
    village: '',
    details: '',
    paymentMethod: 'MOMO' as 'MOMO' | 'CARD' | 'CASH'
  });

  const [ads, setAds] = useState<AdBanner[]>([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);

  // Load persistence
  useEffect(() => {
    const savedAds = JSON.parse(localStorage.getItem('global_ads') || '[]');
    setAds(savedAds.length > 0 ? savedAds.sort((a: any, b: any) => b.priority - a.priority) : FALLBACK_ADS);

    const savedCart = JSON.parse(localStorage.getItem('bmh_cart') || '[]');
    setCartItems(savedCart);

    const savedOrders = JSON.parse(localStorage.getItem('global_orders') || '[]');
    setOrders(savedOrders);

    const savedGuestInfo = JSON.parse(localStorage.getItem('bmh_guest_info') || '{}');
    if (user) {
      setCheckoutForm(prev => ({
        ...prev,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone
      }));
    } else if (savedGuestInfo.fullName) {
      setCheckoutForm(prev => ({ ...prev, ...savedGuestInfo }));
    }
  }, [user]);

  // Persist Cart
  useEffect(() => {
    localStorage.setItem('bmh_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product: any) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        return prev.map(item => item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, {
        productId: product.id,
        productName: product.name,
        quantity: 1,
        priceAtPurchase: product.price,
        img: product.img,
        store: product.store
      }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    setCartItems(prev => prev.filter(item => item.productId !== id));
  };

  const updateCartQty = (id: string, delta: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.productId === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const cartTotal = useMemo(() => cartItems.reduce((acc, item) => acc + (item.priceAtPurchase * item.quantity), 0), [cartItems]);

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    
    const orderId = 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    const trackingNo = 'BMH-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    
    const newOrder: Order = {
      id: orderId,
      buyerId: user?.id || 'GUEST',
      buyerName: checkoutForm.fullName,
      buyerPhone: checkoutForm.phone,
      storeId: cartItems[0]?.store || 'BMH-GENERIC',
      items: cartItems.map(({ img, store, ...rest }) => rest), // Remove UI-only fields for storage
      totalAmount: cartTotal,
      status: OrderStatus.PENDING,
      trackingNumber: trackingNo,
      shippingMethod: 'Domestic Courier',
      paymentMethod: checkoutForm.paymentMethod,
      paymentStatus: 'PENDING',
      shippingAddress: {
        district: checkoutForm.district,
        sector: checkoutForm.sector,
        cell: checkoutForm.cell,
        village: checkoutForm.village,
        details: checkoutForm.details
      },
      createdAt: new Date().toISOString()
    };

    const updatedOrders = [...orders, newOrder];
    setOrders(updatedOrders);
    localStorage.setItem('global_orders', JSON.stringify(updatedOrders));

    if (!user) {
      localStorage.setItem('bmh_guest_info', JSON.stringify(checkoutForm));
    }

    setLastOrderTracking(trackingNo);
    setCartItems([]);
    setIsCheckoutOpen(false);
    setIsSuccessOpen(true);
  };

  const getStatusBadge = (status: OrderStatus) => {
    const colors: Record<OrderStatus, string> = {
      [OrderStatus.PENDING]: 'bg-amber-100 text-amber-700',
      [OrderStatus.PAID]: 'bg-blue-100 text-blue-700',
      [OrderStatus.PROCESSING]: 'bg-purple-100 text-purple-700',
      [OrderStatus.SHIPPED]: 'bg-indigo-100 text-indigo-700',
      [OrderStatus.DELIVERED]: 'bg-green-100 text-green-700',
      [OrderStatus.CANCELLED]: 'bg-red-100 text-red-700'
    };
    return (
      <span className={`${colors[status]} px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest`}>
        {status}
      </span>
    );
  };

  const openStream = (stream: LiveStream, mode: 'buyer' | 'seller') => {
    if (!user && mode === 'seller') {
      showLogin();
      return;
    }
    setActiveLiveSession(stream);
    setLiveMode(mode);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">
      
      {/* Sub-Navigation */}
      <div className="flex justify-center mb-10">
        <div className="bg-white p-2 rounded-[2.5rem] shadow-sm border border-gray-100 flex gap-2">
          <button 
            onClick={() => setActiveTab('home')}
            className={`px-8 py-3.5 rounded-[1.8rem] font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'home' ? 'bg-black text-white' : 'text-gray-400 hover:text-black'}`}
          >
            {language === Language.RW ? 'Ibanze' : 'Home'}
          </button>
          <button 
            onClick={() => setActiveTab('browse')}
            className={`px-8 py-3.5 rounded-[1.8rem] font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'browse' ? 'bg-black text-white' : 'text-gray-400 hover:text-black'}`}
          >
            {language === Language.RW ? 'Shakisha' : 'Browse'}
          </button>
          <button 
            onClick={() => setActiveTab('orders')}
            className={`px-8 py-3.5 rounded-[1.8rem] font-black text-[10px] uppercase tracking-widest transition-all relative ${activeTab === 'orders' ? 'bg-black text-white' : 'text-gray-400 hover:text-black'}`}
          >
            {language === Language.RW ? 'Ibyo Naguze' : 'Orders'}
            {orders.filter(o => o.status === OrderStatus.PENDING).length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full border-2 border-white animate-pulse" />
            )}
          </button>
        </div>
      </div>

      {/* Search & Cart Trigger */}
      <div className="flex flex-col md:flex-row gap-6 mb-12 items-center">
        <div className="relative flex-grow group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-amber-500 transition-colors" size={20} />
          <input 
            type="text" placeholder="Search the Royal Repository..." 
            className="w-full pl-16 pr-6 py-5 rounded-[2.5rem] bg-white border border-gray-100 shadow-sm outline-none font-bold text-gray-900 focus:ring-4 focus:ring-amber-500/10 transition-all placeholder:text-gray-300 italic" 
          />
        </div>
        <button 
          onClick={() => setIsCartOpen(true)}
          className="relative bg-black text-white w-20 h-20 rounded-[2rem] flex items-center justify-center shadow-2xl hover:bg-amber-600 transition-all active:scale-90"
        >
          <ShoppingCart size={28}/>
          {cartItems.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-black w-8 h-8 rounded-full flex items-center justify-center border-4 border-gray-50 animate-bounce">
              {cartItems.reduce((a, b) => a + b.quantity, 0)}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'home' && (
        <div className="space-y-16 animate-in fade-in duration-1000">
           {/* Ad Carousel */}
           {ads.length > 0 && (
             <div className="relative h-[450px] md:h-[600px] rounded-[4rem] overflow-hidden group shadow-2xl border-4 border-white">
                {ads.map((ad, idx) => (
                  <div 
                    key={ad.id} 
                    className={`absolute inset-0 transition-all duration-1000 ease-out ${idx === currentAdIndex ? 'opacity-100 scale-100 translate-x-0' : 'opacity-0 scale-110 translate-x-20 pointer-events-none'}`}
                  >
                     <img src={ad.url} className="w-full h-full object-cover" alt={ad.title.en}/>
                     <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent flex items-center p-12 md:p-24">
                        <div className="max-w-2xl space-y-8">
                           <div className="flex items-center gap-3 bg-amber-500/20 backdrop-blur-xl px-5 py-2 rounded-full border border-amber-500/20 w-fit">
                              <Crown size={14} className="text-amber-400 fill-amber-400"/>
                              <span className="text-[10px] font-black text-amber-300 uppercase tracking-[0.3em]">Royal Selection</span>
                           </div>
                           <h2 className="text-5xl md:text-8xl font-black text-white leading-none tracking-tighter italic uppercase drop-shadow-2xl">
                              {language === Language.RW ? ad.title.rw : ad.title.en}
                           </h2>
                           <button onClick={() => setActiveTab('browse')} className="bg-white text-black px-12 py-6 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl flex items-center gap-4 hover:bg-amber-500 hover:text-white transition-all active:scale-95 group">
                              {language === Language.RW ? ad.ctaText.rw : ad.ctaText.en} 
                              <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform"/>
                           </button>
                        </div>
                     </div>
                  </div>
                ))}
             </div>
           )}

           {/* Live Shopping Section */}
           <div className="space-y-10">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-red-600">
                    <Radio size={24} className="animate-pulse"/>
                    <h3 className="text-3xl font-black tracking-tighter uppercase italic">{language === Language.RW ? 'Ubucuruzi bwa Live' : 'Live Shopping'}</h3>
                  </div>
                  <p className="text-sm text-gray-400 font-medium italic">Witness the finest Rwandan crafts as they are created and sold in real-time.</p>
                </div>
                {user?.role === UserRole.SELLER && (
                  <button 
                    onClick={() => openStream({ id: 'new', sellerId: user.id, sellerName: user.fullName, title: 'My Royal Stream', viewerCount: 0, startTime: new Date().toISOString() }, 'seller')}
                    className="bg-black text-white px-10 py-5 rounded-[1.8rem] font-black text-[10px] uppercase tracking-[0.3em] shadow-xl hover:bg-red-600 transition-all flex items-center gap-3"
                  >
                    <Camera size={18}/> Go Live Now
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Watch Live List */}
                {MOCK_LIVE_STREAMS.map(stream => (
                  <div 
                    key={stream.id} 
                    onClick={() => openStream(stream, 'buyer')}
                    className="relative aspect-video rounded-[2.5rem] overflow-hidden group cursor-pointer border-4 border-white shadow-lg hover:shadow-2xl transition-all duration-700"
                  >
                    <img src={stream.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={stream.title}/>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute top-6 left-6 flex gap-3">
                       <span className="bg-red-600 text-white text-[9px] font-black px-3 py-1.5 rounded-full flex items-center gap-1.5 animate-pulse uppercase tracking-widest shadow-xl">
                          <Tv size={12}/> Live
                       </span>
                       <span className="bg-black/40 backdrop-blur-md text-white text-[9px] font-black px-3 py-1.5 rounded-full flex items-center gap-1.5 uppercase tracking-widest shadow-xl border border-white/10">
                          <Users size={12}/> {stream.viewerCount}
                       </span>
                    </div>
                    <div className="absolute bottom-6 left-6 right-6">
                       <h4 className="text-white font-black text-lg italic uppercase leading-tight mb-1">{stream.title}</h4>
                       <p className="text-amber-400 font-black text-[10px] uppercase tracking-[0.2em]">{stream.store}</p>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                       <div className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/20 shadow-2xl scale-75 group-hover:scale-100 transition-transform">
                          <Play fill="white" className="text-white translate-x-1" size={32}/>
                       </div>
                    </div>
                  </div>
                ))}

                {/* Promotional Card for Streamers */}
                <div className="bg-amber-600 rounded-[2.5rem] p-8 flex flex-col justify-center items-center text-center space-y-6 text-white border-4 border-amber-500 shadow-xl group hover:bg-amber-500 transition-all">
                  <div className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-[2rem] flex items-center justify-center shadow-inner group-hover:rotate-12 transition-transform">
                    <Sparkles size={40}/>
                  </div>
                  <div>
                    <h4 className="text-xl font-black italic uppercase leading-tight">{language === Language.RW ? 'Ba Umucuruzi wa Live' : 'Become a Live Seller'}</h4>
                    <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest mt-2">Reach thousands of domestic buyers instantly.</p>
                  </div>
                  <button className="bg-white text-black px-8 py-3 rounded-2xl font-black text-[9px] uppercase tracking-widest shadow-2xl hover:bg-black hover:text-white transition-all active:scale-95">
                    Upgrade to Merchant Hub
                  </button>
                </div>
              </div>
           </div>

           {/* Products Section */}
           <div className="space-y-10">
              <h3 className="text-3xl font-black tracking-tighter uppercase italic">{language === Language.RW ? 'Ibicuruzwa bishya' : 'Royal New Arrivals'}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                  {MOCK_PRODUCTS.map(p => (
                    <ProductCard key={p.id} product={p} language={language} onAddToCart={() => addToCart(p)} />
                  ))}
              </div>
           </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="animate-in slide-in-from-bottom-8 duration-700 space-y-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-amber-50 rounded-[2rem] flex items-center justify-center text-amber-600 shadow-inner">
              <History size={32} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic">Royal Archives</h2>
              <p className="text-sm text-gray-400 font-medium">Your imperial transaction history and status.</p>
            </div>
          </div>

          {orders.length === 0 ? (
            <div className="py-32 text-center bg-white rounded-[4rem] border border-gray-100 shadow-sm">
              <ShoppingBag size={100} className="text-gray-100 mx-auto mb-8" />
              <h3 className="text-xl font-black text-gray-300 uppercase italic">No Orders Recorded</h3>
              <p className="text-gray-400 mt-2">The royal repository for your purchases is currently empty.</p>
              <button onClick={() => setActiveTab('home')} className="mt-10 px-10 py-4 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-amber-600 transition-all">Start Shopping</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {orders.map((order) => (
                <div 
                  key={order.id} 
                  onClick={() => setSelectedOrder(order)}
                  className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all cursor-pointer group flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-gray-50 rounded-[1.5rem] flex items-center justify-center text-gray-400 group-hover:bg-amber-50 group-hover:text-amber-600 transition-colors">
                      <Receipt size={28} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-lg font-black text-gray-900 tracking-tight">{order.trackingNumber}</span>
                        {getStatusBadge(order.status)}
                      </div>
                      <div className="flex items-center gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        <span className="flex items-center gap-1"><Calendar size={12}/> {new Date(order.createdAt).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1"><Package size={12}/> {order.items.reduce((a, b) => a + b.quantity, 0)} Items</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-2 border-t md:border-none pt-4 md:pt-0">
                    <span className="text-2xl font-black text-gray-900">{order.totalAmount.toLocaleString()} Frw</span>
                    <span className="text-[10px] font-black text-amber-600 flex items-center gap-1 italic uppercase tracking-widest">
                      View Details <ArrowUpRight size={14}/>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* LIVE SESSION OVERLAY */}
      {activeLiveSession && (
        <LiveSession 
          mode={liveMode}
          language={language}
          streamTitle={activeLiveSession.title}
          onClose={() => setActiveLiveSession(null)}
          featuredProduct={activeLiveSession.id === 'new' ? undefined : MOCK_PRODUCTS.find(p => p.id === activeLiveSession.featuredProductId)}
        />
      )}

      {/* ORDER DETAILS MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[1300] flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl">
          <div className="bg-white w-full max-w-2xl rounded-[4rem] overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-500 max-h-[90vh] overflow-y-auto no-scrollbar">
            <button onClick={() => setSelectedOrder(null)} className="absolute top-10 right-10 text-gray-300 hover:text-black transition z-10"><X size={32}/></button>
            
            <div className="p-10 md:p-14 space-y-12">
              <div className="text-center space-y-2">
                <p className="text-[10px] font-black text-amber-600 uppercase tracking-[0.4em] italic">Royal Receipt</p>
                <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic">{selectedOrder.trackingNumber}</h2>
                <div className="flex justify-center pt-2">
                  {getStatusBadge(selectedOrder.status)}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <MapPin size={14} className="text-amber-600"/> Delivery Address
                  </h4>
                  <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100 text-sm font-bold text-gray-700 space-y-1 italic">
                    <p>{selectedOrder.shippingAddress.district}, {selectedOrder.shippingAddress.sector}</p>
                    <p>{selectedOrder.shippingAddress.cell}, {selectedOrder.shippingAddress.village}</p>
                    <p className="text-gray-400 pt-2">{selectedOrder.shippingAddress.details || 'No additional details provided'}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <CreditCard size={14} className="text-amber-600"/> Payment Info
                  </h4>
                  <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100 space-y-3">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-gray-400 uppercase">Method</span>
                      <span className="font-black text-gray-900">{selectedOrder.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-gray-400 uppercase">Status</span>
                      <span className={`font-black ${selectedOrder.paymentStatus === 'PAID' ? 'text-green-600' : 'text-amber-600'}`}>{selectedOrder.paymentStatus}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <ShoppingBag size={14} className="text-amber-600"/> Purchased Items
                </h4>
                <div className="space-y-4">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center py-4 border-b border-gray-50 last:border-none">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 font-black text-[10px]">
                           {item.quantity}x
                        </div>
                        <span className="text-sm font-black text-gray-900 italic">{item.productName}</span>
                      </div>
                      <span className="text-sm font-black text-gray-900">{(item.priceAtPurchase * item.quantity).toLocaleString()} Frw</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-10 border-t border-gray-100 flex justify-between items-end">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Transaction</p>
                  <p className="text-3xl font-black text-gray-900 italic tracking-tighter">{selectedOrder.totalAmount.toLocaleString()} Frw</p>
                </div>
                <button 
                  onClick={() => window.print()} 
                  className="bg-black text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-amber-600 transition-all flex items-center gap-2"
                >
                  Download Scroll <ExternalLink size={16}/>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CART OVERLAY */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[1000] flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in" onClick={() => setIsCartOpen(false)} />
          <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 overflow-hidden">
            <div className="p-10 border-b border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <ShoppingBag className="text-amber-600" size={32}/>
                <div>
                  <h3 className="text-2xl font-black text-gray-900 tracking-tighter uppercase italic">Royal Basket</h3>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{cartItems.length} items collected</p>
                </div>
              </div>
              <button onClick={() => setIsCartOpen(false)} className="w-12 h-12 rounded-2xl bg-gray-50 text-gray-400 hover:text-black flex items-center justify-center"><X size={24}/></button>
            </div>

            <div className="flex-grow overflow-y-auto p-10 space-y-8 no-scrollbar">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <ShoppingBasket size={100} className="text-gray-100 mb-8"/>
                  <h4 className="text-xl font-black text-gray-300 uppercase italic">Basket is Empty</h4>
                  <p className="text-xs text-gray-400 font-medium mt-2">Fill your royal collection with premium items.</p>
                </div>
              ) : (
                cartItems.map(item => (
                  <div key={item.productId} className="flex gap-6 items-center group">
                    <div className="w-24 h-24 rounded-[1.5rem] bg-gray-100 overflow-hidden shrink-0 border border-gray-100">
                      <img src={item.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={item.productName}/>
                    </div>
                    <div className="flex-grow">
                      <h4 className="text-sm font-black text-gray-900 mb-1 italic">{item.productName}</h4>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">{item.store}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-base font-black text-amber-600">{(item.priceAtPurchase * item.quantity).toLocaleString()} Frw</span>
                        <div className="flex items-center bg-gray-50 rounded-xl p-1 border border-gray-100">
                          <button onClick={() => updateCartQty(item.productId, -1)} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-black"><Minus size={14}/></button>
                          <span className="w-8 text-center text-xs font-black">{item.quantity}</span>
                          <button onClick={() => updateCartQty(item.productId, 1)} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-black"><Plus size={14}/></button>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => removeFromCart(item.productId)} className="text-gray-300 hover:text-red-600 transition-colors p-2"><Trash2 size={18}/></button>
                  </div>
                ))
              )}
            </div>

            <div className="p-10 bg-gray-50/50 border-t border-gray-100 space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-black text-gray-400 uppercase tracking-widest">Grand Total</span>
                <span className="text-3xl font-black text-gray-900 tracking-tighter">{cartTotal.toLocaleString()} Frw</span>
              </div>
              <button 
                disabled={cartItems.length === 0}
                onClick={() => { setIsCartOpen(false); setIsCheckoutOpen(true); }}
                className="w-full bg-black text-white py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl hover:bg-amber-600 transition-all active:scale-95 flex items-center justify-center gap-4 disabled:opacity-50"
              >
                Secure Checkout <ArrowRight size={20}/>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CHECKOUT MODAL */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
          <div className="bg-white w-full max-w-4xl rounded-[4rem] overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-500 max-h-[95vh] overflow-y-auto no-scrollbar">
            <button onClick={() => setIsCheckoutOpen(false)} className="absolute top-10 right-10 text-gray-300 hover:text-black transition z-10"><X size={32}/></button>
            
            <form onSubmit={handleCheckout} className="flex flex-col md:flex-row h-full">
              {/* Form Left Side */}
              <div className="flex-grow p-10 md:p-16 space-y-10">
                <div className="space-y-2">
                   <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic">Authorize Purchase</h2>
                   <p className="text-sm text-gray-400 font-medium">Complete your delivery credentials below.</p>
                </div>

                <div className="space-y-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-amber-600 uppercase tracking-[0.4em] italic flex items-center gap-2">
                      <UserIcon size={14}/> {user ? 'Royal Profile' : 'Guest Identification'}
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <input 
                        type="text" required placeholder="Full Legal Name"
                        className="w-full px-6 py-5 bg-gray-50 rounded-2xl font-bold border-none focus:ring-4 focus:ring-amber-500/10 transition outline-none"
                        value={checkoutForm.fullName} onChange={e => setCheckoutForm({...checkoutForm, fullName: e.target.value})}
                      />
                      <input 
                        type="email" required placeholder="Email for Receipt"
                        className="w-full px-6 py-5 bg-gray-50 rounded-2xl font-bold border-none focus:ring-4 focus:ring-amber-500/10 transition outline-none"
                        value={checkoutForm.email} onChange={e => setCheckoutForm({...checkoutForm, email: e.target.value})}
                      />
                    </div>
                    <input 
                      type="tel" required placeholder="Phone Number (MOMO Preferred)"
                      className="w-full px-6 py-5 bg-gray-50 rounded-2xl font-bold border-none focus:ring-4 focus:ring-amber-500/10 transition outline-none"
                      value={checkoutForm.phone} onChange={e => setCheckoutForm({...checkoutForm, phone: e.target.value})}
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-amber-600 uppercase tracking-[0.4em] italic flex items-center gap-2">
                      <Navigation size={14}/> Destination Details
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <select 
                        className="w-full px-6 py-5 bg-gray-50 rounded-2xl font-bold border-none focus:ring-4 focus:ring-amber-500/10 outline-none"
                        value={checkoutForm.district} onChange={e => setCheckoutForm({...checkoutForm, district: e.target.value})}
                      >
                        {DISTRICTS.map(d => <option key={d}>{d}</option>)}
                      </select>
                      <input 
                        type="text" required placeholder="Sector"
                        className="w-full px-6 py-5 bg-gray-50 rounded-2xl font-bold border-none focus:ring-4 focus:ring-amber-500/10 transition outline-none"
                        value={checkoutForm.sector} onChange={e => setCheckoutForm({...checkoutForm, sector: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <input 
                        type="text" required placeholder="Cell"
                        className="w-full px-6 py-5 bg-gray-50 rounded-2xl font-bold border-none focus:ring-4 focus:ring-amber-500/10 transition outline-none"
                        value={checkoutForm.cell} onChange={e => setCheckoutForm({...checkoutForm, cell: e.target.value})}
                      />
                      <input 
                        type="text" required placeholder="Village"
                        className="w-full px-6 py-5 bg-gray-50 rounded-2xl font-bold border-none focus:ring-4 focus:ring-amber-500/10 transition outline-none"
                        value={checkoutForm.village} onChange={e => setCheckoutForm({...checkoutForm, village: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-amber-600 uppercase tracking-[0.4em] italic flex items-center gap-2">
                      <CreditCard size={14}/> Payment Method
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      <button 
                        type="button" onClick={() => setCheckoutForm({...checkoutForm, paymentMethod: 'MOMO'})}
                        className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${checkoutForm.paymentMethod === 'MOMO' ? 'border-amber-600 bg-amber-50' : 'border-gray-50 opacity-60 hover:opacity-100'}`}
                      >
                        <Smartphone className={checkoutForm.paymentMethod === 'MOMO' ? 'text-amber-600' : 'text-gray-300'}/>
                        <span className="text-[8px] font-black uppercase tracking-widest">MoMo</span>
                      </button>
                      <button 
                        type="button" onClick={() => setCheckoutForm({...checkoutForm, paymentMethod: 'CARD'})}
                        className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${checkoutForm.paymentMethod === 'CARD' ? 'border-amber-600 bg-amber-50' : 'border-gray-50 opacity-60 hover:opacity-100'}`}
                      >
                        <CardIcon className={checkoutForm.paymentMethod === 'CARD' ? 'text-amber-600' : 'text-gray-300'}/>
                        <span className="text-[8px] font-black uppercase tracking-widest">Card</span>
                      </button>
                      <button 
                        type="button" onClick={() => setCheckoutForm({...checkoutForm, paymentMethod: 'CASH'})}
                        className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${checkoutForm.paymentMethod === 'CASH' ? 'border-amber-600 bg-amber-50' : 'border-gray-50 opacity-60 hover:opacity-100'}`}
                      >
                        <Banknote className={checkoutForm.paymentMethod === 'CASH' ? 'text-amber-600' : 'text-gray-300'}/>
                        <span className="text-[8px] font-black uppercase tracking-widest">Cash</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Summary Right Side */}
              <div className="w-full md:w-[380px] bg-gray-50 p-10 md:p-16 flex flex-col border-l border-gray-100">
                <h3 className="text-xl font-black text-gray-900 tracking-tighter uppercase italic mb-10">Order Summary</h3>
                <div className="flex-grow space-y-6">
                  {cartItems.map(item => (
                    <div key={item.productId} className="flex justify-between items-center text-xs">
                      <span className="font-bold text-gray-500 truncate pr-4">{item.quantity}x {item.productName}</span>
                      <span className="font-black text-gray-900 shrink-0">{(item.priceAtPurchase * item.quantity).toLocaleString()} Frw</span>
                    </div>
                  ))}
                  <div className="h-px bg-gray-200 my-4" />
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-400">
                    <span>Shipping Fee</span>
                    <span>2,500 Frw</span>
                  </div>
                </div>

                <div className="mt-auto space-y-8">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest pb-1">Total Payable</span>
                    <span className="text-3xl font-black text-gray-900 tracking-tighter italic">{(cartTotal + 2500).toLocaleString()} Frw</span>
                  </div>
                  <button 
                    type="submit"
                    className="w-full bg-black text-white py-6 rounded-3xl font-black uppercase text-[11px] tracking-[0.3em] shadow-2xl hover:bg-amber-600 transition-all flex items-center justify-center gap-4 active:scale-95"
                  >
                    Authorize Entry <ShieldCheck size={20}/>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUCCESS MODAL */}
      {isSuccessOpen && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-3xl animate-in fade-in">
           <div className="max-w-xl w-full text-center space-y-12 animate-in zoom-in-90 duration-700">
              <div className="w-32 h-32 bg-amber-500 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl shadow-amber-500/20 rotate-12 group hover:rotate-0 transition-transform duration-700">
                 <CheckCircle2 size={64} className="text-black"/>
              </div>
              <div className="space-y-4">
                 <h2 className="text-5xl font-black text-white italic uppercase tracking-tighter">Purchase Verified</h2>
                 <p className="text-amber-500 font-black text-xs uppercase tracking-[0.5em] italic flex items-center justify-center gap-2">
                   <Crown size={14}/> Royal Decree Issued
                 </p>
              </div>
              <div className="p-10 bg-white/5 backdrop-blur-xl rounded-[3rem] border border-white/10 space-y-6">
                 <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Imperial Tracking ID</p>
                    <h3 className="text-2xl font-black text-white font-mono tracking-widest">{lastOrderTracking}</h3>
                 </div>
                 <p className="text-sm text-gray-400 font-medium leading-relaxed italic">
                   Your domestic dispatch is being prepared in <span className="text-white">{checkoutForm.district}</span>. 
                   A confirmation royal scroll (email) has been sent to {checkoutForm.email}.
                 </p>
              </div>
              <button 
                onClick={() => { setIsSuccessOpen(false); setActiveTab('orders'); }}
                className="bg-white text-black px-16 py-6 rounded-[2rem] font-black uppercase text-xs tracking-widest hover:bg-amber-500 hover:text-white transition-all shadow-2xl"
              >
                Return to Kingdom
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default BuyerPortal;
