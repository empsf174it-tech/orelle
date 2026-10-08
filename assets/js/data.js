// Mock Data for Orelle Luxury Fragrances

const MOCK_FRAGRANCES = [
  {
    id: "f1",
    name: "Obsidian Rose",
    concentration: "Eau de Parfum",
    family: "floral",
    price: 245,
    sizes: [
      { size: 50, price: 245 },
      { size: 100, price: 340 }
    ],
    rating: 4.8,
    reviewCount: 124,
    occasion: "evening",
    season: "autumn",
    longevity: 85, // out of 100
    sillage: 80,
    notes: {
      top: ["pink pepper", "bergamot"],
      heart: ["rose", "jasmine"],
      base: ["oud", "vanilla"]
    },
    image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=600",
    description: "A dark, seductive take on the classic rose, enveloped in smoked oud and crushed pink pepper.",
    category: ["women", "unisex"]
  },
  {
    id: "f2",
    name: "Velvet Santal",
    concentration: "Extrait de Parfum",
    family: "woody",
    price: 320,
    sizes: [
      { size: 50, price: 320 },
      { size: 100, price: 450 }
    ],
    rating: 4.9,
    reviewCount: 89,
    occasion: "special",
    season: "winter",
    longevity: 95,
    sillage: 90,
    notes: {
      top: ["cardamom", "iris"],
      heart: ["sandalwood", "leather"],
      base: ["amber", "musk"]
    },
    image: "https://images.unsplash.com/photo-1587017539504-67cfbddac569?auto=format&fit=crop&q=80&w=600",
    description: "Creamy, spiced sandalwood draped in supple leather and glowing amber.",
    category: ["unisex", "men"]
  },
  {
    id: "f3",
    name: "Lumina Citrus",
    concentration: "Eau de Parfum",
    family: "fresh/citrus",
    price: 195,
    sizes: [
      { size: 50, price: 195 },
      { size: 100, price: 275 }
    ],
    rating: 4.6,
    reviewCount: 210,
    occasion: "day",
    season: "summer",
    longevity: 70,
    sillage: 65,
    notes: {
      top: ["bergamot", "neroli", "lemon"],
      heart: ["orange blossom", "petitgrain"],
      base: ["white musk", "cedar"]
    },
    image: "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&q=80&w=600",
    description: "A brilliant burst of Mediterranean sunlight captured in zesty bergamot and neroli.",
    category: ["women", "unisex"]
  },
  {
    id: "f4",
    name: "Midnight Chypre",
    concentration: "Eau de Parfum",
    family: "chypre",
    price: 260,
    sizes: [
      { size: 50, price: 260 },
      { size: 100, price: 360 }
    ],
    rating: 4.7,
    reviewCount: 156,
    occasion: "evening",
    season: "autumn",
    longevity: 88,
    sillage: 82,
    notes: {
      top: ["bergamot", "blackcurrant"],
      heart: ["patchouli", "rose"],
      base: ["oakmoss", "vetiver"]
    },
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=600",
    description: "A mysterious and structured chypre, modernizing oakmoss with dark fruits.",
    category: ["women"]
  },
  {
    id: "f5",
    name: "Amber Resonance",
    concentration: "Extrait de Parfum",
    family: "amber/oriental",
    price: 310,
    sizes: [
      { size: 50, price: 310 },
      { size: 100, price: 430 }
    ],
    rating: 4.9,
    reviewCount: 302,
    occasion: "special",
    season: "winter",
    longevity: 98,
    sillage: 95,
    notes: {
      top: ["coriander", "cinnamon"],
      heart: ["labdanum", "incense"],
      base: ["amber", "vanilla", "tonka"]
    },
    image: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?auto=format&fit=crop&q=80&w=600",
    description: "Deep, resinous amber glowing with ceremonial incense and warm spices.",
    category: ["unisex", "men"]
  },
  {
    id: "f6",
    name: "Nectar Gourmand",
    concentration: "Eau de Parfum",
    family: "gourmand",
    price: 220,
    sizes: [
      { size: 50, price: 220 },
      { size: 100, price: 310 }
    ],
    rating: 4.5,
    reviewCount: 180,
    occasion: "day",
    season: "spring",
    longevity: 80,
    sillage: 75,
    notes: {
      top: ["almond", "pear"],
      heart: ["jasmine", "coffee"],
      base: ["vanilla", "praline"]
    },
    image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=600",
    description: "An addictive confection of bitter almond, coffee, and praline.",
    category: ["women"]
  }
];

const DISCOVERY_SETS = [
  { id: "ds1", name: "The Complete Collection", size: 6, price: 120, type: "custom", image: "https://images.unsplash.com/photo-1610461888750-10bfc601b874?auto=format&fit=crop&q=80&w=600" },
  { id: "ds2", name: "Woody Trio", size: 3, price: 65, type: "curated", items: ["f2", "f4", "f5"], image: "https://images.unsplash.com/photo-1615529328331-f8917597711f?auto=format&fit=crop&q=80&w=600" },
  { id: "ds3", name: "Floral Five", size: 5, price: 95, type: "curated", items: ["f1", "f3", "f4", "f6", "f1"], image: "https://images.unsplash.com/photo-1563170351-be82bc888aa4?auto=format&fit=crop&q=80&w=600" }
];

const PACKAGING_OPTIONS = {
  boxStyle: [
    { id: "box-classic", name: "Classic Noir", price: 0, color: "#111" },
    { id: "box-velvet", name: "Velvet Obsidian", price: 15, color: "#0a0a0a" },
    { id: "box-gold", name: "Champagne Gold", price: 25, color: "#d4af37" }
  ],
  ribbon: [
    { id: "ribbon-none", name: "No Ribbon", price: 0, color: "transparent" },
    { id: "ribbon-silk", name: "Black Silk", price: 5, color: "#000" },
    { id: "ribbon-gold", name: "Gold Satin", price: 10, color: "#d4af37" }
  ],
  engravingPrice: 20
};

const STORE_CONFIG = {
  sampleCreditWindowDays: 30,
  currency: "$",
  shippingFee: 15,
  taxRate: 0.08
};

// Global formatters
const formatPrice = (amount) => `${STORE_CONFIG.currency}${amount.toFixed(2)}`;

window.OrelleData = {
  MOCK_FRAGRANCES,
  DISCOVERY_SETS,
  PACKAGING_OPTIONS,
  STORE_CONFIG,
  formatPrice
};
