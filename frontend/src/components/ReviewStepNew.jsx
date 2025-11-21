import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { calculateItemPrice, calculateOrderTotal, formatPrice, convertCurrency, fetchPricing, calculateVolumeSavings } from "@/utils/dynamicPricing";
import { useState, useEffect, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";

const ReviewStepNew = ({ 
  orderDetails, 
  items, 
  confirmed, 
  setConfirmed,
  signatureEnabled,
  setSignatureEnabled,
  signature,
  setSignature,
  discountType
}) => {
  const [currency, setCurrency] = useState("AWG");
  const [pricingData, setPricingData] = useState(null);

  useEffect(() => {
    const loadPricing = async () => {
      const data = await fetchPricing();
      setPricingData(data);
    };
    loadPricing();
  }, []);
  const getItemTotal = (item) => {
    return Object.values(item.sizes).reduce((sum, qty) => sum + qty, 0);
  };

  const getSizeBreakdown = (sizes) => {
    const parts = [];
    const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'];
    sizeOrder.forEach((size) => {
      const qty = sizes[size];
      if (qty > 0) {
        parts.push(`${size}×${qty}`);
      }
    });
    return parts.join(' • ');
  };

  const getOrderTotalQty = () => {
    return items.reduce((sum, item) => sum + getItemTotal(item), 0);
  };

  const getOrderTotalPrice = () => {
    return calculateOrderTotal(items, orderDetails.customizationType);
  };

  const getItemPrice = (item) => {
    if (!pricingData) return 0;
    const qty = getItemTotal(item);
    return calculateItemPrice(pricingData, item.garmentType, orderDetails.customizationType, qty);
  };

  const getOrderTotalData = () => {
    if (!pricingData) return { subtotal: 0, total: 0, discounts: [] };
    
    // Always calculate with customer email to show all available discounts
    return calculateOrderTotal(pricingData, items, orderDetails.customizationType, orderDetails.email);
  };

  const getGarmentDisplay = (item) => {
    return item.garmentType === "Other" ? item.otherGarment : item.garmentType;
  };

  const getColorDisplay = (item) => {
    return item.color === "Custom" ? item.customColor : item.color;
  };

  return (
    <div className="space-y-6" data-testid="review-step">
      {/* Currency Toggle */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">View Prices In</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setCurrency("AWG")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                currency === "AWG"
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              AWG
            </button>
            <button
              type="button"
              onClick={() => setCurrency("USD")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                currency === "USD"
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              USD ($)
            </button>
          </div>
        </div>
      </div>

      {/* Customer Details */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Details</h3>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-gray-500">Name</p>
            <p className="text-base font-medium text-gray-900" data-testid="review-customer-name">{orderDetails.customerName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="text-base font-medium text-gray-900" data-testid="review-email">{orderDetails.email}</p>
          </div>
          {orderDetails.phone && (
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="text-base font-medium text-gray-900" data-testid="review-phone">{orderDetails.phone}</p>
            </div>
          )}
          {orderDetails.notes && (
            <div>
              <p className="text-sm text-gray-500">Notes</p>
              <p className="text-base text-gray-900" data-testid="review-notes">{orderDetails.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Customization */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Customization</h3>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-gray-500">Customization Needed</p>
            <p className="text-base font-medium text-gray-900" data-testid="review-customization-needed">
              {orderDetails.customizationNeeded ? "Yes" : "No"}
            </p>
          </div>
          {orderDetails.customizationNeeded && (
            <>
              <div>
                <p className="text-sm text-gray-500">Type</p>
                <p className="text-base font-medium text-gray-900" data-testid="review-customization-type">
                  {orderDetails.customizationType}
                  {orderDetails.customizationType === 'Embroidery' && (
                    <span className="ml-2 text-sm text-blue-600">(+AWG 10 per item)</span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Artwork Status</p>
                <p className="text-base font-medium text-gray-900" data-testid="review-artwork-status">
                  {orderDetails.artworkStatus}
                  {orderDetails.artworkStatus === "Other" && orderDetails.artworkStatusOther && (
                    <span className="text-gray-600"> - {orderDetails.artworkStatusOther}</span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Details</p>
                <p className="text-base text-gray-900" data-testid="review-customization-details">{orderDetails.customizationDetails}</p>
              </div>
              {orderDetails.artworkUrl && (
                <div>
                  <p className="text-sm text-gray-500">Artwork</p>
                  <a
                    href={orderDetails.artworkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base text-blue-600 hover:underline"
                    data-testid="review-artwork-link"
                  >
                    View uploaded artwork
                  </a>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Items with Pricing */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
        <div className="space-y-4">
          {items.map((item, index) => {
            const itemQty = getItemTotal(item);
            const itemPrice = getItemPrice(item);
            const displayPrice = currency === 'USD' ? convertCurrency(itemPrice, 'AWG', 'USD') : itemPrice;
            
            return (
              <div key={index} className="pb-4 border-b border-gray-200 last:border-0 last:pb-0" data-testid={`review-item-${index}`}>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <p className="text-base font-semibold text-gray-900" data-testid={`review-item-title-${index}`}>
                      {getGarmentDisplay(item)} — {getColorDisplay(item)}
                    </p>
                    <p className="text-sm text-gray-500 mt-1" data-testid={`review-item-sizes-${index}`}>
                      {getSizeBreakdown(item.sizes)}
                    </p>
                    {item.notes && (
                      <p className="text-sm text-gray-600 mt-1 italic" data-testid={`review-item-notes-${index}`}>
                        Note: {item.notes}
                      </p>
                    )}
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-lg font-bold text-gray-900" data-testid={`review-item-qty-${index}`}>
                      {itemQty} pcs
                    </p>
                    <p className="text-sm text-blue-600 font-semibold" data-testid={`review-item-price-${index}`}>
                      {formatPrice(displayPrice, currency)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-700 text-white rounded-2xl p-6 shadow-lg">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-base font-medium">Total Quantity</span>
            <span className="text-xl font-bold" data-testid="review-order-total-qty">{getOrderTotalQty()} pcs</span>
          </div>
          {(() => {
            const orderData = getOrderTotalData();
            const volumeSavings = calculateVolumeSavings(pricingData, items, orderDetails.customizationType);
            const displaySubtotal = currency === 'USD' ? convertCurrency(orderData.subtotal, 'AWG', 'USD') : orderData.subtotal;
            const displayTotal = currency === 'USD' ? convertCurrency(orderData.total, 'AWG', 'USD') : orderData.total;
            const displayVolumeSavings = currency === 'USD' ? convertCurrency(volumeSavings, 'AWG', 'USD') : volumeSavings;
            const hasDiscounts = orderData.discounts && orderData.discounts.length > 0;
            const hasVolumeSavings = volumeSavings > 0;
            const hasAnySavings = hasDiscounts || hasVolumeSavings;
            
            return (
              <>
                {hasAnySavings ? (
                  <>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-600">
                      <span className="text-base font-medium">Subtotal</span>
                      <span className="text-xl font-semibold">
                        {formatPrice(displaySubtotal, currency)}
                      </span>
                    </div>
                    
                    {/* Volume Savings */}
                    {hasVolumeSavings && (
                      <div className="flex items-center justify-between text-yellow-300">
                        <span className="text-sm font-medium">Volume Savings</span>
                        <span className="text-sm font-bold">
                          -{formatPrice(displayVolumeSavings, currency)}
                        </span>
                      </div>
                    )}
                    
                    {/* Order Discounts */}
                    {orderData.discounts.map((discount, idx) => (
                      <div key={idx} className="flex items-center justify-between text-green-300 italic">
                        <span className="text-sm">
                          {discount.name} ({discount.type === 'Percentage' ? `${discount.value}%` : formatPrice(discount.value, currency)})
                        </span>
                        <span className="text-sm font-semibold">
                          -{formatPrice(currency === 'USD' ? convertCurrency(discount.amount, 'AWG', 'USD') : discount.amount, currency)}
                        </span>
                      </div>
                    ))}
                    
                    <div className="flex items-center justify-between pt-3 border-t border-gray-600">
                      <span className="text-lg font-semibold">Order Total</span>
                      <span className="text-3xl font-bold" data-testid="review-order-total-price">
                        {formatPrice(displayTotal, currency)}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-between pt-3 border-t border-gray-600">
                    <span className="text-lg font-semibold">Order Total</span>
                    <span className="text-3xl font-bold" data-testid="review-order-total-price">
                      {formatPrice(displayTotal, currency)}
                    </span>
                  </div>
                )}
                <div className="text-sm text-gray-300">
                  {currency === "AWG" 
                    ? `≈ ${formatPrice(orderData.total / 1.75, "USD")}`
                    : `≈ ${formatPrice(orderData.total * 1.75, "AWG")}`
                  }
                </div>
              </>
            );
          })()}
        </div>
      </div>

      {/* Confirmation */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
        <div className="flex items-start space-x-3">
          <Checkbox
            id="confirm"
            checked={confirmed}
            onCheckedChange={setConfirmed}
            className="mt-1"
            data-testid="confirm-checkbox"
          />
          <Label
            htmlFor="confirm"
            className="text-base font-medium text-gray-900 leading-relaxed cursor-pointer"
          >
            I've reviewed all details and confirm that the information above is correct.
          </Label>
        </div>

        {/* Signature Toggle */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div>
            <Label htmlFor="signature-toggle" className="text-base font-medium text-gray-900">
              Add Digital Signature
            </Label>
            <p className="text-sm text-gray-500 mt-1">Optional - Add your signature for verification</p>
          </div>
          <Switch
            id="signature-toggle"
            checked={signatureEnabled}
            onCheckedChange={setSignatureEnabled}
            data-testid="signature-toggle"
          />
        </div>

        {/* Signature Field */}
        {signatureEnabled && (
          <div className="space-y-2 pt-2">
            <Label htmlFor="signature" className="text-base font-medium text-gray-900">
              Your Signature
            </Label>
            <Input
              id="signature"
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              placeholder="Type your full name as signature"
              className="h-12 text-base rounded-xl border-gray-300"
              style={{ fontFamily: 'cursive' }}
              data-testid="signature-input"
            />
            <p className="text-xs text-gray-500">This will be recorded with your order</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewStepNew;