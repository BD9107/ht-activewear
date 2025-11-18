// Pricing configuration (AWG)
export const GARMENT_PRICES = {
  'Shirts': 20,
  'V-Neck': 25,
  'Tank Tops': 20,
  'Women Shirts': 20,
  'Polo Shirts': 25,
  'Long Sleeve': 35,
  'Long Sleeve with Hoodie': 40,
  'Zippered Hoodie': 50,
  'Neck Gaiter': 10,
  'Sport Jersey': 25,
  'Other': 0 // Will be manually priced
};

export const CUSTOMIZATION_PRICES = {
  'Printing': 0, // Included in base price
  'Embroidery': 10 // Additional $10 per item
};

export const USD_TO_AWG = 1.75;

export const calculateItemPrice = (garmentType, customizationType, quantity) => {
  const basePrice = GARMENT_PRICES[garmentType] || 0;
  const customizationCost = CUSTOMIZATION_PRICES[customizationType] || 0;
  const pricePerUnit = basePrice + customizationCost;
  return pricePerUnit * quantity;
};

export const calculateOrderTotal = (items, customizationType) => {
  return items.reduce((total, item) => {
    const quantity = Object.values(item.sizes).reduce((sum, qty) => sum + qty, 0);
    return total + calculateItemPrice(item.garmentType, customizationType, quantity);
  }, 0);
};

export const convertCurrency = (amount, fromCurrency, toCurrency) => {
  if (fromCurrency === toCurrency) return amount;
  if (fromCurrency === 'AWG' && toCurrency === 'USD') {
    return amount / USD_TO_AWG;
  }
  if (fromCurrency === 'USD' && toCurrency === 'AWG') {
    return amount * USD_TO_AWG;
  }
  return amount;
};

export const formatPrice = (amount, currency = 'AWG') => {
  const symbol = currency === 'AWG' ? 'AWG ' : '$';
  return `${symbol}${amount.toFixed(2)}`;
};