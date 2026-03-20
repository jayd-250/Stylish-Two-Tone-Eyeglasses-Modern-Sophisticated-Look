
export const PROVINCES = ["Kigali City", "Northern Province", "Southern Province", "Eastern Province", "Western Province"];

export const DISTRICTS = [
  "Nyarugenge", "Gasabo", "Kicukiro", // Kigali
  "Burera", "Gakenke", "Gicumbi", "Musanze", "Rulindo", // North
  "Gisagara", "Huye", "Kamonyi", "Muhanga", "Nyamagabe", "Nyanza", "Nyaruguru", "Ruhango", // South
  "Bugesera", "Gatsibo", "Kayonza", "Kirehe", "Ngoma", "Nyagatare", "Rwamagana", // East
  "Karongi", "Ngororero", "Nyabihu", "Nyamasheke", "Rubavu", "Rusizi", "Rutsiro" // West
];

export const CATEGORIES = [
  { id: 'electronics', rw: 'Ibyuma bya elegitoroniki', en: 'Electronics' },
  { id: 'clothing', rw: 'Imyambaro', en: 'Clothing' },
  { id: 'agriculture', rw: 'Ubuhinzi n\'Ubworozi', en: 'Agriculture' },
  { id: 'home', rw: 'Ibikoresho byo mu nzu', en: 'Home & Living' },
  { id: 'food', rw: 'Ibiribwa', en: 'Food & Groceries' },
  { id: 'baby', rw: 'Ababyeyi n\'Abana', en: 'Mother & Baby' }
];

export interface LogisticsProvider {
  id: string;
  name: string;
  type: 'domestic' | 'regional';
  coverage: string[]; // Provinces or specific routes
  baseFee: number;
  estimatedHours: number;
  description: string;
}

export const LOGISTICS_PROVIDERS: LogisticsProvider[] = [
  {
    id: 'volcano',
    name: 'Volcano Express',
    type: 'domestic',
    coverage: ['Southern Province', 'Kigali City'],
    baseFee: 1500,
    estimatedHours: 4,
    description: 'Best for Huye, Muhanga, and Nyamagabe routes.'
  },
  {
    id: 'horizon',
    name: 'Horizon Express',
    type: 'domestic',
    coverage: ['Southern Province', 'Kigali City'],
    baseFee: 1500,
    estimatedHours: 4,
    description: 'Reliable daily service to Southern districts.'
  },
  {
    id: 'ritco',
    name: 'RITCO (National)',
    type: 'domestic',
    coverage: ['Northern Province', 'Western Province', 'Eastern Province', 'Southern Province'],
    baseFee: 1200,
    estimatedHours: 12,
    description: 'Government-backed wide network covering all 30 districts.'
  },
  {
    id: 'stella',
    name: 'Stella Express',
    type: 'domestic',
    coverage: ['Western Province', 'Kigali City'],
    baseFee: 1800,
    estimatedHours: 5,
    description: 'Specialized in Rubavu and Karongi routes.'
  },
  {
    id: 'jaguar',
    name: 'Jaguar Executive',
    type: 'regional',
    coverage: ['Uganda', 'Kigali City'],
    baseFee: 8500,
    estimatedHours: 24,
    description: 'Cross-border logistics from Kigali to Kampala.'
  },
  {
    id: 'kigali_fast',
    name: 'Kigali Fast Courier',
    type: 'domestic',
    coverage: ['Kigali City'],
    baseFee: 2000,
    estimatedHours: 2,
    description: 'Door-to-door moto delivery within Kigali.'
  }
];
