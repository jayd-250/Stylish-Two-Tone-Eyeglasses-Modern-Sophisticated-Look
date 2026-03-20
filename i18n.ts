
import { Language } from './types';

export const translations: Record<string, { rw: string; en: string }> = {
  // Common
  welcome: { rw: "Murakaza neza kuri BIG MARKET HUB", en: "Welcome to BIG MARKET HUB" },
  login: { rw: "Injira", en: "Login" },
  register: { rw: "Iyandikishe", en: "Register" },
  logout: { rw: "Sohoka", en: "Logout" },
  currency: { rw: "Frw", en: "RWF" },
  explore: { rw: "Shakisha", en: "Explore" },
  shop_now: { rw: "Gura ubu", en: "Shop Now" },
  learn_more: { rw: "Ibindi bisobanuro", en: "Learn More" },
  
  // Live Shopping
  live_shopping: { rw: "🔴 Ubucuruzi bwa Live", en: "🔴 Live Shopping" },
  start_stream: { rw: "Tangira Live", en: "Start Stream" },
  go_live: { rw: "Gura kuri Live", en: "Go Live" },
  featured_product: { rw: "Igicuruzwa kigezweho", en: "Featured Product" },
  live_now: { rw: "Iri kuri Live", en: "Live Now" },
  ai_cohost: { rw: "AI Ishinzwe Kugurisha", en: "AI Sales Assistant" },
  viewer_count: { rw: "Abareba", en: "Viewers" },

  // Settings & Preferences
  preferences: { rw: "Igenamiterere", en: "Preferences" },
  location_services: { rw: "Serivisi z'aho uherereye", en: "Location Services" },
  location_services_desc: { rw: "Emerera porogaramu gukoresha aho uherereye kuri Maps.", en: "Allow the app to use your location for Maps search." },
  maternal_care: { rw: "Kwita ku Babyeyi (Lactation Mode)", en: "Maternal Care (Lactation Mode)" },
  maternal_care_desc: { rw: "Erekana ibicuruzwa n'amakuru byerekeye ababyeyi bonsa.", en: "Prioritize products and info for nursing mothers." },
  settings_saved: { rw: "Igenamiterere ryawe ryabitswe.", en: "Your preferences have been saved." },

  // Portals
  client_portal: { rw: "🛒 Isoko ry'Abaguzi", en: "🛒 Client Portal" },
  partner_portal: { rw: "🏬 Isoko ry'Abafatanya", en: "🏬 Partner Portal" },
  admin_portal: { rw: "🛡️ Igenzura rya Sisitemu", en: "🛡️ Admin Portal" },
  jobs_portal: { rw: "💼 Akazi n'Ubumenyi", en: "💼 Jobs & Skills" },

  // Actions
  approve: { rw: "Emeza", en: "Approve" },
  reject: { rw: "Yanga", en: "Reject" },
  suspend: { rw: "Hagarika by'agateganyo", en: "Suspend" },
  activate: { rw: "Kora", en: "Activate" },
  save_changes: { rw: "Bika amahinduka", en: "Save Changes" },
  
  // Logistics
  add_logistics: { rw: "Ongeramo Sosiyete y'ubwikorezi", en: "Add Logistics Partner" },
  logistics_name: { rw: "Izina rya Sosiyete", en: "Company Name" },
};

export const t = (key: string, lang: Language): string => {
  return translations[key]?.[lang] || key;
};
