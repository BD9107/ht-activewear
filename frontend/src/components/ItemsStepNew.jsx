import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Minus, Plus, Trash2 } from "lucide-react";
import { calculateItemPrice, formatPrice, calculateOrderTotal, fetchPricing, calculateVolumeSavings } from "@/utils/dynamicPricing";
import { fetchSettings, getGarmentTypes, getColorOptions, getSizeOptions } from "@/utils/settingsService";
import { useState, useEffect } from "react";

const ItemsStepNew = ({ items, setItems, customizationType, currency, customerEmail, discountType, setDiscountType }) => {
  const [currencyToggle, setCurrencyToggle] = useState(currency || "AWG");
  const [pricingData, setPricingData] = useState(null);
  const [showPricing, setShowPricing] = useState(false);
  const [loadingPricing, setLoadingPricing] = useState(true);
  
  // Settings-driven configuration
  const [garmentTypes, setGarmentTypes] = useState([]);
  const [colorOptions, setColorOptions] = useState([]);
  const [sizeOptions, setSizeOptions] = useState(["XS", "S", "M", "L", "XL", "2XL", "3XL"]);

  useEffect(() => {
    const loadSettings = async () => {
      // Fetch centralized settings
      const settings = await fetchSettings();
      
      // Extract garment types from settings
      const garments = getGarmentTypes(settings);
      setGarmentTypes(garments);
      
      // Extract color options from settings
      const colors = getColorOptions(settings);
      setColorOptions(colors);
      
      // Extract size options from settings
      const sizes = getSizeOptions(settings);
      setSizeOptions(sizes);
      
      // Set pricing visibility from settings
      setShowPricing(settings.show_pricing ?? true);
      
      // Load pricing data (backwards compatible)
      const pricing = await fetchPricing();
      setPricingData(pricing);
      setLoadingPricing(false);
    };
    loadSettings();
  }, []);

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const updateSize = (itemIndex, size, delta) => {
    const newItems = [...items];
    const currentQty = newItems[itemIndex].sizes[size];
    const newQty = Math.max(0, Math.min(999, currentQty + delta));
    newItems[itemIndex].sizes[size] = newQty;
    setItems(newItems);
  };

  const addItem = () => {
    const newLineNumber = items.length + 1;
    setItems([
      ...items,
      {
        lineNumber: newLineNumber,
        garmentType: "",
        otherGarment: "",
        color: "",
        customColor: "",
        sizes: { XS: 0, S: 0, M: 0, L: 0, XL: 0, "2XL": 0, "3XL": 0 },
        notes: "",
      },
    ]);
  };

  const removeItem = (index) => {
    if (items.length === 1) return;
    const newItems = items.filter((_, i) => i !== index);
    newItems.forEach((item, i) => {
      item.lineNumber = i + 1;
    });
    setItems(newItems);
  };

  const getItemTotal = (item) => {
    return Object.values(item.sizes).reduce((sum, qty) => sum + qty, 0);
  };

  const getItemPrice = (item) => {
    if (!pricingData) return 0;
    const qty = getItemTotal(item);
    return calculateItemPrice(pricingData, item.garmentType, customizationType, qty);
  };

  const getOrderTotalData = () => {
    if (!pricingData) return { subtotal: 0, total: 0, discounts: [] };
    
    // Always calculate with customer email to show all available discounts
    return calculateOrderTotal(pricingData, items, customizationType, customerEmail);
  };

  return (
    <div className="space-y-6" data-testid="items-step">
      {/* Currency & Pricing Toggle */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Show Pricing</span>
          <Switch
            checked={showPricing}
            onCheckedChange={setShowPricing}
            data-testid="pricing-toggle"
          />
        </div>
        {showPricing && (
          <div className="flex items-center justify-between pt-3 border-t border-gray-200">
            <span className="text-sm font-medium text-gray-700">Currency</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCurrencyToggle("AWG")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currencyToggle === "AWG"
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                AWG
              </button>
              <button
                type="button"
                onClick={() => setCurrencyToggle("USD")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currencyToggle === "USD"
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                USD ($)
              </button>
            </div>
          </div>
        )}
      </div>

      {items.map((item, index) => (
        <div
          key={index}
          className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-5"
          data-testid={`item-card-${index}`}
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900" data-testid={`item-title-${index}`}>
              Item #{item.lineNumber}
            </h3>
            {items.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeItem(index)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full"
                data-testid={`remove-item-${index}`}
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            )}
          </div>

          {/* Garment Type with Icons */}
          <div className="space-y-3">
            <Label className="text-base font-medium text-gray-900">
              Garment Type <span className="text-red-500">*</span>
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {garmentTypes.map((garment) => (
                <button
                  key={garment.value}
                  type="button"
                  onClick={() => updateItem(index, 'garmentType', garment.value)}
                  className={`relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                    item.garmentType === garment.value
                      ? "border-gray-900 bg-gray-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  data-testid={`garment-${index}-${garment.value}`}
                >
                  {/* Custom image icons */}
                  <img 
                    src={garment.icon} 
                    alt={garment.label}
                    className="w-12 h-12 object-contain"
                  />
                  
                  <div className="text-center">
                    <div className="text-xs font-semibold text-gray-900 leading-tight">{garment.label}</div>
                    {showPricing && pricingData && (() => {
                      // Get pricing for this garment type
                      const priceOptions = pricingData.garment_pricing.filter(p => p.garment_type === garment.value);
                      if (priceOptions.length > 0) {
                        // Sort by min_qty to get the base price (lowest quantity tier)
                        const sortedPrices = priceOptions.sort((a, b) => a.min_qty - b.min_qty);
                        const basePrice = sortedPrices[0].price; // Price for smallest quantity
                        const displayPrice = currencyToggle === 'USD' ? basePrice / 1.75 : basePrice;
                        return (
                          <div className="text-xs font-bold text-blue-600 mt-1">
                            From {formatPrice(displayPrice, currencyToggle)}
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                  {item.garmentType === garment.value && (
                    <div className="absolute top-1 right-1 w-5 h-5 bg-gray-900 text-white rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Other Garment */}
          {item.garmentType === "Other" && (
            <div className="space-y-2">
              <Label className="text-base font-medium text-gray-900">
                Specify Garment <span className="text-red-500">*</span>
              </Label>
              <input
                value={item.otherGarment}
                onChange={(e) => updateItem(index, 'otherGarment', e.target.value)}
                placeholder="Enter garment type"
                className="h-12 w-full text-base rounded-xl border border-gray-300 px-4"
                data-testid={`other-garment-input-${index}`}
              />
            </div>
          )}

          {/* Color Swatches */}
          <div className="space-y-3">
            <Label className="text-base font-medium text-gray-900">
              Color <span className="text-red-500">*</span>
            </Label>
            <div className="grid grid-cols-6 gap-2">
              {colorOptions.map((colorOption) => (
                <button
                  key={colorOption.value}
                  type="button"
                  onClick={() => updateItem(index, 'color', colorOption.value)}
                  className={`relative h-14 rounded-xl border-2 transition-all ${
                    item.color === colorOption.value
                      ? "border-gray-900 ring-2 ring-gray-300"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  data-testid={`color-${index}-${colorOption.value}`}
                >
                  <div
                    className={`absolute inset-1 rounded-lg ${
                      colorOption.value === "White" ? "border border-gray-300" : ""
                    }`}
                    style={{
                      background: colorOption.color,
                    }}
                  />
                  {item.color === colorOption.value && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        colorOption.value === "White"
                          ? "bg-gray-900 text-white"
                          : "bg-white text-gray-900"
                      }`}>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                        </svg>
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
            <div className="text-xs text-gray-500 mt-2">
              Selected: <span className="font-medium">{item.color || "None"}</span>
            </div>
          </div>

          {/* Custom Color */}
          {item.color === "Custom" && (
            <div className="space-y-2">
              <Label className="text-base font-medium text-gray-900">
                Specify Color <span className="text-red-500">*</span>
              </Label>
              <input
                value={item.customColor}
                onChange={(e) => updateItem(index, 'customColor', e.target.value)}
                placeholder="Enter custom color"
                className="h-12 w-full text-base rounded-xl border border-gray-300 px-4"
                data-testid={`custom-color-input-${index}`}
              />
            </div>
          )}

          {/* Size Grid */}
          <div className="space-y-3">
            <Label className="text-base font-medium text-gray-900">
              Sizes <span className="text-red-500">*</span>
            </Label>
            <div className="grid grid-cols-1 gap-3">
              {sizeOptions.map((size) => (
                <div
                  key={size}
                  className="flex items-center justify-between bg-gray-50 rounded-xl p-3 border border-gray-200"
                  data-testid={`size-row-${index}-${size}`}
                >
                  <span className="text-base font-medium text-gray-900 min-w-[50px]">{size}</span>
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => updateSize(index, size, -1)}
                      disabled={item.sizes[size] === 0}
                      className="h-10 w-10 rounded-full border-gray-300"
                      data-testid={`size-decrement-${index}-${size}`}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <input
                      type="number"
                      min="0"
                      max="999"
                      value={item.sizes[size]}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 0;
                        const clampedValue = Math.max(0, Math.min(999, value));
                        const newItems = [...items];
                        newItems[index].sizes[size] = clampedValue;
                        setItems(newItems);
                      }}
                      className="w-16 h-10 text-base font-semibold text-gray-900 text-center border border-gray-300 rounded-lg"
                      data-testid={`size-qty-${index}-${size}`}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => updateSize(index, size, 1)}
                      disabled={item.sizes[size] === 999}
                      className="h-10 w-10 rounded-full border-gray-300"
                      data-testid={`size-increment-${index}-${size}`}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Item Total & Price */}
          <div className="space-y-2">
            <div className="flex items-center justify-between p-4 bg-gray-900 text-white rounded-xl">
              <span className="text-base font-medium">Item Quantity</span>
              <span className="text-xl font-bold" data-testid={`item-total-${index}`}>{getItemTotal(item)} pcs</span>
            </div>
            {showPricing && pricingData && (
              <div className="flex items-center justify-between p-4 bg-blue-50 text-blue-900 rounded-xl border border-blue-200">
                <span className="text-base font-medium">Item Price</span>
                <span className="text-xl font-bold" data-testid={`item-price-${index}`}>
                  {formatPrice(getItemPrice(item), currencyToggle)}
                </span>
              </div>
            )}
          </div>

          {/* Item Notes */}
          <div className="space-y-2">
            <Label className="text-base font-medium text-gray-900">Item Notes (optional)</Label>
            <Textarea
              value={item.notes}
              onChange={(e) => updateItem(index, 'notes', e.target.value)}
              placeholder="Special instructions for this item..."
              className="min-h-[80px] text-base rounded-xl resize-none"
              data-testid={`item-notes-${index}`}
            />
          </div>
        </div>
      ))}

      {/* Add Item Button */}
      <Button
        type="button"
        variant="outline"
        onClick={addItem}
        className="w-full h-12 text-base font-medium border-2 border-dashed border-gray-300 rounded-xl hover:border-gray-900 hover:bg-gray-50"
        data-testid="add-item-button"
      >
        <Plus className="w-5 h-5 mr-2" />
        Add Another Product
      </Button>

      {/* Order Total */}
      {showPricing && pricingData && (
        <div className="bg-gradient-to-r from-gray-900 to-gray-700 text-white rounded-2xl p-6 shadow-lg">
          <div className="space-y-3">
            {(() => {
              const orderData = getOrderTotalData();
              const volumeSavings = calculateVolumeSavings(pricingData, items, customizationType);
              const displaySubtotal = currencyToggle === 'USD' ? orderData.subtotal / 1.75 : orderData.subtotal;
              const displayTotal = currencyToggle === 'USD' ? orderData.total / 1.75 : orderData.total;
              const displayVolumeSavings = currencyToggle === 'USD' ? volumeSavings / 1.75 : volumeSavings;
              const hasDiscounts = orderData.discounts && orderData.discounts.length > 0;
              const hasVolumeSavings = volumeSavings > 0;
              const hasAnySavings = hasDiscounts || hasVolumeSavings;
              
              return (
                <>
                  {hasAnySavings ? (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-base font-medium">Subtotal</span>
                        <span className="text-xl font-semibold">
                          {formatPrice(displaySubtotal, currencyToggle)}
                        </span>
                      </div>
                      
                      {/* Order Discounts */}
                      {orderData.discounts.map((discount, idx) => (
                        <div key={idx} className="flex items-center justify-between text-green-300">
                          <span className="text-sm font-bold">
                            {discount.name} ({discount.type === 'Percentage' ? `${discount.value}%` : formatPrice(discount.value, currencyToggle)})
                          </span>
                          <span className="text-sm font-bold">
                            -{formatPrice(currencyToggle === 'USD' ? discount.amount / 1.75 : discount.amount, currencyToggle)}
                          </span>
                        </div>
                      ))}
                      
                      <div className="border-t border-gray-600 pt-3"></div>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold">Order Total</span>
                        <span className="text-3xl font-bold" data-testid="order-total-price">
                          {formatPrice(displayTotal, currencyToggle)}
                        </span>
                      </div>
                      
                      {/* Volume Savings (below total) */}
                      {hasVolumeSavings && (
                        <div className="flex items-center justify-between text-yellow-300 italic">
                          <span className="text-xs">Volume Savings Applied</span>
                          <span className="text-xs font-semibold">
                            -{formatPrice(displayVolumeSavings, currencyToggle)}
                          </span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold">Order Total</span>
                      <span className="text-3xl font-bold" data-testid="order-total-price">
                        {formatPrice(displayTotal, currencyToggle)}
                      </span>
                    </div>
                  )}
                  <div className="text-sm text-gray-300">
                    {currencyToggle === "AWG" ? "≈ " + formatPrice(orderData.total / 1.75, "USD") : "≈ " + formatPrice(orderData.total * 1.75, "AWG")}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemsStepNew;
