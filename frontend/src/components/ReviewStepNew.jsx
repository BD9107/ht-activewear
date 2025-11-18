import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { calculateItemPrice, calculateOrderTotal, formatPrice, convertCurrency } from "@/utils/pricing";
import { useState } from "react";

const ReviewStepNew = ({ 
  orderDetails, 
  items, 
  confirmed, 
  setConfirmed,
  signatureEnabled,
  setSignatureEnabled,
  signature,
  setSignature
}) => {
  const [currency, setCurrency] = useState("AWG");
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
    const qty = getItemTotal(item);
    return calculateItemPrice(item.garmentType, orderDetails.customizationType, qty);
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

      {/* Items */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
        <div className="space-y-4">
          {items.map((item, index) => (
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
                    {getItemTotal(item)}
                  </p>
                  <p className="text-sm text-gray-500">pcs</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Total */}
      <div className="bg-gray-900 text-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold">Order Total Quantity</span>
          <span className="text-2xl font-bold" data-testid="review-order-total">{getOrderTotal()} pcs</span>
        </div>
      </div>

      {/* Confirmation */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
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
      </div>
    </div>
  );
};

export default ReviewStep;