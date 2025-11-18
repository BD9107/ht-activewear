import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Minus, Plus, Trash2, Shirt, Zap } from "lucide-react";
import { calculateItemPrice, formatPrice } from "@/utils/pricing";
import { useState } from "react";

const GARMENT_TYPES = [
  { value: "Shirts", label: "Shirts", icon: "👕", price: 20 },
  { value: "V-Neck", label: "V-Neck", icon: "👔", price: 25 },
  { value: "Tank Tops", label: "Tank Tops", icon: "🎽", price: 20 },
  { value: "Women Shirts", label: "Women Shirts", icon: "👚", price: 20 },
  { value: "Polo Shirts", label: "Polo Shirts", icon: "🏌️", price: 25 },
  { value: "Long Sleeve", label: "Long Sleeve", icon: "🧥", price: 35 },
  { value: "Long Sleeve with Hoodie", label: "LS Hoodie", icon: "🧥", price: 40 },
  { value: "Zippered Hoodie", label: "Zip Hoodie", icon: "🧥", price: 50 },
  { value: "Neck Gaiter", label: "Neck Gaiter", icon: "🧣", price: 10 },
  { value: "Sport Jersey", label: "Sport Jersey", icon: "⚽", price: 25 },
  { value: "Other", label: "Other", icon: "📦", price: 0 }
];

const COLORS = [
  { value: "Grey", color: "#9CA3AF" },
  { value: "Purple", color: "#A855F7" },
  { value: "Navy", color: "#1E3A8A" },
  { value: "Blue", color: "#3B82F6" },
  { value: "Seafoam", color: "#5EEAD4" },
  { value: "Green", color: "#22C55E" },
  { value: "Green-Yellow", color: "#84CC16" },
  { value: "Yellow", color: "#EAB308" },
  { value: "Orange", color: "#F97316" },
  { value: "Red", color: "#EF4444" },
  { value: "Pink", color: "#EC4899" },
  { value: "White", color: "#FFFFFF" },
  { value: "Custom", color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }
];

const SIZES = ["XS", "S", "M", "L", "XL", "2XL", "3XL"];

const ItemsStepNew = ({ items, setItems, customizationType, currency }) => {
  const [currencyToggle, setCurrencyToggle] = useState(currency || "AWG");

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
    const qty = getItemTotal(item);
    return calculateItemPrice(item.garmentType, customizationType, qty);
  };

  const getOrderTotal = () => {
    return items.reduce((total, item) => total + getItemPrice(item), 0);
  };

  return (
    <div className="space-y-6" data-testid="items-step">
      {/* Currency Toggle */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between">
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
              AWG (ƒ)
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
            <div className="grid grid-cols-3 gap-2">
              {GARMENT_TYPES.map((garment) => (
                <button
                  key={garment.value}
                  type="button"
                  onClick={() => updateItem(index, 'garmentType', garment.value)}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    item.garmentType === garment.value
                      ? "border-gray-900 bg-gray-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  data-testid={`garment-${index}-${garment.value}`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-1">{garment.icon}</div>
                    <div className="text-xs font-medium">{garment.label}</div>
                    <div className="text-xs text-gray-500">{formatPrice(garment.price, currencyToggle)}</div>
                  </div>
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
              {COLORS.map((colorOption) => (
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
                      <div className={`w-6 h-6 rounded-full ${
                        ["White", "Yellow", "Seafoam", "Green-Yellow"].includes(colorOption.value)
                          ? "bg-gray-900"
                          : "bg-white"
                      } flex items-center justify-center`}>
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
              {SIZES.map((size) => (
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
                    <span className="text-base font-semibold text-gray-900 min-w-[40px] text-center" data-testid={`size-qty-${index}-${size}`}>
                      {item.sizes[size]}
                    </span>
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
            <div className="flex items-center justify-between p-4 bg-blue-50 text-blue-900 rounded-xl border border-blue-200">
              <span className="text-base font-medium">Item Price</span>
              <span className="text-xl font-bold" data-testid={`item-price-${index}`}>
                {formatPrice(getItemPrice(item), currencyToggle)}
              </span>
            </div>
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
      <div className="bg-gradient-to-r from-gray-900 to-gray-700 text-white rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-lg font-semibold">Order Total</span>
          <span className="text-3xl font-bold" data-testid="order-total-price">
            {formatPrice(getOrderTotal(), currencyToggle)}
          </span>
        </div>
        <div className="text-sm text-gray-300">
          {currencyToggle === "AWG" ? "USD: " + formatPrice(getOrderTotal() / 1.75, "USD") : "AWG: " + formatPrice(getOrderTotal() * 1.75, "AWG")}
        </div>
      </div>
    </div>
  );
};

export default ItemsStepNew;
