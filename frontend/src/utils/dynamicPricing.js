import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

let pricingCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const fetchPricing = async () => {
  // Return cached data if still valid
  if (pricingCache && cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_DURATION)) {
    return pricingCache;
  }

  try {
    const response = await axios.get(`${API}/pricing`);
    pricingCache = response.data;
    cacheTimestamp = Date.now();
    return pricingCache;
  } catch (error) {
    console.error('Error fetching pricing:', error);
    // Return fallback pricing
    return {
      garment_pricing: [],
      order_discounts: [],
      customer_discounts: [],
      customization_prices: {
        'Printing': 0,
        'Embroidery': 10
      },
      show_pricing: true
    };
  }
};

export const getGarmentPrice = (pricingData, garmentType, quantity) => {
  if (!pricingData || !pricingData.garment_pricing) return 0;

  // Find matching price tier
  const priceTier = pricingData.garment_pricing.find(p => 
    p.garment_type === garmentType &&
    quantity >= p.min_qty &&
    quantity <= p.max_qty
  );

  return priceTier ? priceTier.price : 0;
};

export const getCustomizationCost = (pricingData, customizationType) => {
  if (!pricingData || !pricingData.customization_prices) return 0;
  return pricingData.customization_prices[customizationType] || 0;
};

export const calculateItemPrice = (pricingData, garmentType, customizationType, quantity) => {
  const basePrice = getGarmentPrice(pricingData, garmentType, quantity);
  const customizationCost = getCustomizationCost(pricingData, customizationType);
  return (basePrice + customizationCost) * quantity;
};

export const getBasePrice = (pricingData, garmentType) => {
  if (!pricingData || !pricingData.garment_pricing) return 0;
  
  // Get the first/lowest quantity tier price (base price)
  const basePriceTier = pricingData.garment_pricing
    .filter(p => p.garment_type === garmentType)
    .sort((a, b) => a.min_qty - b.min_qty)[0];
  
  return basePriceTier ? basePriceTier.price : 0;
};

export const calculateVolumeSavings = (pricingData, items, customizationType) => {
  let totalSavings = 0;
  
  items.forEach(item => {
    const quantity = Object.values(item.sizes).reduce((sum, qty) => sum + qty, 0);
    if (quantity === 0) return;
    
    const basePrice = getBasePrice(pricingData, item.garmentType);
    const actualPrice = getGarmentPrice(pricingData, item.garmentType, quantity);
    const customizationCost = getCustomizationCost(pricingData, customizationType);
    
    const baseTotalPrice = (basePrice + customizationCost) * quantity;
    const actualTotalPrice = (actualPrice + customizationCost) * quantity;
    
    const savings = baseTotalPrice - actualTotalPrice;
    if (savings > 0) {
      totalSavings += savings;
    }
  });
  
  return totalSavings;
};

export const getCustomerDiscount = (pricingData, email) => {
  if (!pricingData || !pricingData.customer_discounts || !email) return 0;
  
  const customerDiscount = pricingData.customer_discounts.find(
    d => d.email.toLowerCase() === email.toLowerCase()
  );
  
  return customerDiscount ? customerDiscount.discount_percentage : 0;
};

export const getOrderDiscount = (pricingData, totalQty) => {
  if (!pricingData || !pricingData.order_discounts) return { type: null, value: 0 };
  
  // Find applicable discount (highest min_total_qty that's still <= totalQty)
  const applicableDiscounts = pricingData.order_discounts
    .filter(d => totalQty >= d.min_total_qty)
    .sort((a, b) => b.min_total_qty - a.min_total_qty);
  
  if (applicableDiscounts.length > 0) {
    const discount = applicableDiscounts[0];
    return {
      name: discount.name,
      type: discount.discount_type,
      value: discount.discount_value
    };
  }
  
  return { type: null, value: 0 };
};

export const calculateOrderTotal = (pricingData, items, customizationType, customerEmail) => {
  let subtotal = 0;
  
  // Calculate subtotal
  items.forEach(item => {
    const quantity = Object.values(item.sizes).reduce((sum, qty) => sum + qty, 0);
    subtotal += calculateItemPrice(pricingData, item.garmentType, customizationType, quantity);
  });
  
  let total = subtotal;
  let discounts = [];
  
  // Apply customer discount
  const customerDiscountPercent = getCustomerDiscount(pricingData, customerEmail);
  if (customerDiscountPercent > 0) {
    const customerDiscountAmount = (subtotal * customerDiscountPercent) / 100;
    total -= customerDiscountAmount;
    discounts.push({
      name: 'Customer Discount',
      type: 'Percentage',
      value: customerDiscountPercent,
      amount: customerDiscountAmount
    });
  }
  
  // Apply order discount
  const totalQty = items.reduce((sum, item) => 
    sum + Object.values(item.sizes).reduce((s, q) => s + q, 0), 0
  );
  const orderDiscount = getOrderDiscount(pricingData, totalQty);
  if (orderDiscount.type) {
    let orderDiscountAmount = 0;
    if (orderDiscount.type === 'Percentage') {
      orderDiscountAmount = (total * orderDiscount.value) / 100;
    } else {
      orderDiscountAmount = orderDiscount.value;
    }
    total -= orderDiscountAmount;
    discounts.push({
      name: orderDiscount.name || 'Order Discount',
      type: orderDiscount.type,
      value: orderDiscount.value,
      amount: orderDiscountAmount
    });
  }
  
  return {
    subtotal,
    total: Math.max(0, total),
    discounts
  };
};

export const formatPrice = (amount, currency = 'AWG') => {
  const symbol = currency === 'AWG' ? 'AWG ' : '$';
  return `${symbol}${amount.toFixed(2)}`;
};

export const convertCurrency = (amount, fromCurrency, toCurrency) => {
  const USD_TO_AWG = 1.75;
  if (fromCurrency === toCurrency) return amount;
  if (fromCurrency === 'AWG' && toCurrency === 'USD') {
    return amount / USD_TO_AWG;
  }
  if (fromCurrency === 'USD' && toCurrency === 'AWG') {
    return amount * USD_TO_AWG;
  }
  return amount;
};
