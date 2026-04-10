/**
 * Centralized Settings Service
 * Fetches all configuration from /api/settings endpoint
 * Provides backwards-compatible data transformation for existing components
 */

import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

let settingsCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch all settings from the centralized endpoint
 * Returns cached data if still valid
 */
export const fetchSettings = async () => {
  // Return cached data if still valid
  if (settingsCache && cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_DURATION)) {
    return settingsCache;
  }

  try {
    const response = await axios.get(`${API}/settings`);
    settingsCache = response.data;
    cacheTimestamp = Date.now();
    return settingsCache;
  } catch (error) {
    console.error('Error fetching settings:', error);
    // Return fallback settings
    return getDefaultSettings();
  }
};

/**
 * Clear the settings cache (useful for forcing refresh)
 */
export const clearSettingsCache = () => {
  settingsCache = null;
  cacheTimestamp = null;
};

/**
 * Get default settings as fallback
 */
export const getDefaultSettings = () => ({
  currency: {
    default: "AWG",
    options: ["AWG", "USD"],
    exchange_rate: 1.75
  },
  show_pricing: true,
  garments: [
    { value: "Shirts", label: "Shirts", icon: "/icons/garments/shirts.png", active: true, base_price: 0, pricing_tiers: [] },
    { value: "V-Neck", label: "V-Neck", icon: "/icons/garments/vneck.png", active: true, base_price: 0, pricing_tiers: [] },
    { value: "Tank Tops", label: "Tank Tops", icon: "/icons/garments/tank.png", active: true, base_price: 0, pricing_tiers: [] },
    { value: "Women Shirts", label: "Women Shirts", icon: "/icons/garments/women-shirts.png", active: true, base_price: 0, pricing_tiers: [] },
    { value: "Polo Shirts", label: "Polo Shirts", icon: "/icons/garments/polo.png", active: true, base_price: 0, pricing_tiers: [] },
    { value: "Long Sleeve", label: "Long Sleeve", icon: "/icons/garments/longsleeve.png", active: true, base_price: 0, pricing_tiers: [] },
    { value: "Long Sleeve with Hoodie", label: "LS Hoodie", icon: "/icons/garments/hoodie.png", active: true, base_price: 0, pricing_tiers: [] },
    { value: "Zippered Hoodie", label: "Zip Hoodie", icon: "/icons/garments/zip-hoodie.png", active: true, base_price: 0, pricing_tiers: [] },
    { value: "Neck Gaiter", label: "Neck Gaiter", icon: "/icons/garments/gaiter.png", active: true, base_price: 0, pricing_tiers: [] },
    { value: "Sport Jersey", label: "Sport Jersey", icon: "/icons/garments/jersey.png", active: true, base_price: 0, pricing_tiers: [] },
    { value: "Other", label: "Other", icon: "/icons/garments/other.png", active: true, base_price: 0, pricing_tiers: [] }
  ],
  colors: [
    { value: "Grey", hex: "#9CA3AF" },
    { value: "Purple", hex: "#A855F7" },
    { value: "Navy", hex: "#1E3A8A" },
    { value: "Blue", hex: "#3B82F6" },
    { value: "Seafoam", hex: "#5EEAD4" },
    { value: "Green", hex: "#22C55E" },
    { value: "Green-Yellow", hex: "#84CC16" },
    { value: "Yellow", hex: "#EAB308" },
    { value: "Orange", hex: "#F97316" },
    { value: "Red", hex: "#EF4444" },
    { value: "Pink", hex: "#EC4899" },
    { value: "White", hex: "#FFFFFF" },
    { value: "Custom", hex: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }
  ],
  sizes: ["XS", "S", "M", "L", "XL", "2XL", "3XL"],
  customization: {
    types: [
      { value: "Printing", label: "Printing", additional_cost: 0 },
      { value: "Embroidery", label: "Embroidery", additional_cost: -10 }
    ],
    artwork_statuses: [
      "Will Upload Later",
      "Will Email Separately",
      "Already Emailed",
      "Already Uploaded",
      "Not Needed",
      "Other"
    ]
  },
  pricing: {
    garment_pricing: [],
    customization_prices: {
      'Printing': 0,
      'Embroidery': -10
    }
  },
  discounts: {
    order_discounts: [],
    customer_discounts: []
  }
});

/**
 * Transform settings to pricing data format (backwards compatibility)
 * This allows existing pricing logic to work unchanged
 */
export const settingsToPricingData = (settings) => {
  if (!settings) return null;
  
  return {
    garment_pricing: settings.pricing?.garment_pricing || [],
    order_discounts: settings.discounts?.order_discounts || [],
    customer_discounts: settings.discounts?.customer_discounts || [],
    customization_prices: settings.pricing?.customization_prices || {
      'Printing': 0,
      'Embroidery': -10
    },
    show_pricing: settings.show_pricing ?? true
  };
};

/**
 * Get garment types from settings (for components that need garment list)
 */
export const getGarmentTypes = (settings) => {
  if (!settings || !settings.garments) return [];
  return settings.garments.filter(g => g.active !== false);
};

/**
 * Get color options from settings
 */
export const getColorOptions = (settings) => {
  if (!settings || !settings.colors) return [];
  return settings.colors.map(c => ({
    value: c.value,
    color: c.hex
  }));
};

/**
 * Get size options from settings
 */
export const getSizeOptions = (settings) => {
  if (!settings || !settings.sizes) return ["XS", "S", "M", "L", "XL", "2XL", "3XL"];
  return settings.sizes;
};

/**
 * Get customization types from settings
 */
export const getCustomizationTypes = (settings) => {
  if (!settings || !settings.customization) return [];
  return settings.customization.types || [];
};

/**
 * Get artwork status options from settings
 */
export const getArtworkStatuses = (settings) => {
  if (!settings || !settings.customization) return [];
  return settings.customization.artwork_statuses || [];
};

/**
 * Get currency configuration from settings
 */
export const getCurrencyConfig = (settings) => {
  if (!settings || !settings.currency) {
    return { default: "AWG", options: ["AWG", "USD"], exchange_rate: 1.75 };
  }
  return settings.currency;
};

export default {
  fetchSettings,
  clearSettingsCache,
  getDefaultSettings,
  settingsToPricingData,
  getGarmentTypes,
  getColorOptions,
  getSizeOptions,
  getCustomizationTypes,
  getArtworkStatuses,
  getCurrencyConfig
};
