import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import DetailsStep from "@/components/DetailsStep";
import ItemsStepNew from "@/components/ItemsStepNew";
import ReviewStepNew from "@/components/ReviewStepNew";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const OrderForm = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set page title
  useEffect(() => {
    document.title = "HT Activewear Order Form";
  }, []);

  // Scroll to top whenever the step changes (Details -> Items -> Review)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [currentStep]);

  // Form data
  const [orderDetails, setOrderDetails] = useState({
    customerName: "",
    email: "",
    phone: "",
    notes: "",
    customizationNeeded: false,
    customizationType: "Printing",
    customizationDetails: "",
    artworkStatus: "",
    artworkStatusOther: "",
    artworkUrl: "",
    currency: "AWG",
  });

  const [items, setItems] = useState([
    {
      lineNumber: 1,
      garmentType: "",
      otherGarment: "",
      color: "",
      customColor: "",
      sizes: { XS: 0, S: 0, M: 0, L: 0, XL: 0, "2XL": 0, "3XL": 0 },
      notes: "",
    },
  ]);

  const [confirmed, setConfirmed] = useState(false);
  const [signatureEnabled, setSignatureEnabled] = useState(false);
  const [signature, setSignature] = useState("");
  const [discountType, setDiscountType] = useState("none");

  // Validation
  const validateDetails = () => {
    if (!orderDetails.customerName.trim()) {
      toast.error("Customer name is required");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!orderDetails.email.trim() || !emailRegex.test(orderDetails.email)) {
      toast.error("Valid email is required");
      return false;
    }
    if (orderDetails.customizationNeeded && !orderDetails.customizationDetails.trim()) {
      toast.error("Customization details are required when customization is enabled");
      return false;
    }
    if (orderDetails.customizationNeeded && !orderDetails.artworkStatus) {
      toast.error("Artwork status is required when customization is enabled");
      return false;
    }
    if (orderDetails.customizationNeeded && orderDetails.artworkStatus === "Other" && !orderDetails.artworkStatusOther.trim()) {
      toast.error("Please specify the artwork status");
      return false;
    }
    return true;
  };

  const validateItems = () => {
    if (items.length === 0) {
      toast.error("At least one item is required");
      return false;
    }

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      if (!item.garmentType) {
        toast.error(`Item ${i + 1}: Garment type is required`);
        return false;
      }
      
      if (item.garmentType === "Other" && !item.otherGarment.trim()) {
        toast.error(`Item ${i + 1}: Please specify the garment type`);
        return false;
      }
      
      if (!item.color) {
        toast.error(`Item ${i + 1}: Color is required`);
        return false;
      }
      
      if (item.color === "Custom" && !item.customColor.trim()) {
        toast.error(`Item ${i + 1}: Please specify the custom color`);
        return false;
      }
      
      const totalQty = Object.values(item.sizes).reduce((sum, qty) => sum + qty, 0);
      if (totalQty === 0) {
        toast.error(`Item ${i + 1}: At least one size must have quantity > 0`);
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1 && !validateDetails()) return;
    if (currentStep === 2 && !validateItems()) return;
    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    if (!confirmed) {
      toast.error("Please confirm your order details");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post(`${API}/submitOrder`, {
        order: {
          ...orderDetails,
          signature: signatureEnabled ? signature : ""
        },
        items: items,
        discountType: discountType,
      });

      const { orderNumber } = response.data;
      navigate(`/success?order=${orderNumber}`);
    } catch (error) {
      console.error("Submission error:", error);
      toast.error(error.response?.data?.detail || "Failed to submit order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#FAFAFA] pb-32" data-testid="order-form">
        {/* Stepper */}
        <div className="max-w-[460] md:max-w-2xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between" data-testid="stepper">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                      currentStep >= step
                        ? "bg-gray-900 text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                    data-testid={`step-indicator-${step}`}
                  >
                    {step}
                  </div>
                  <span
                    className={`text-xs mt-2 font-medium ${
                      currentStep >= step ? "text-gray-900" : "text-gray-500"
                    }`}
                  >
                    {step === 1 ? "Details" : step === 2 ? "Items" : "Review"}
                  </span>
                </div>
                {step < 3 && (
                  <div
                    className={`h-0.5 flex-1 mx-2 transition-colors ${
                      currentStep > step ? "bg-gray-900" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="max-w-[460] md:max-w-2xl mx-auto px-6">
          {currentStep === 1 && (
            <DetailsStep
              orderDetails={orderDetails}
              setOrderDetails={setOrderDetails}
            />
          )}
          {currentStep === 2 && (
            <ItemsStepNew 
              items={items} 
              setItems={setItems}
              customizationType={orderDetails.customizationType}
              currency={orderDetails.currency}
              customerEmail={orderDetails.email}
              discountType={discountType}
              setDiscountType={setDiscountType}
            />
          )}
          {currentStep === 3 && (
            <ReviewStepNew
              orderDetails={orderDetails}
              items={items}
              confirmed={confirmed}
              setConfirmed={setConfirmed}
              signatureEnabled={signatureEnabled}
              setSignatureEnabled={setSignatureEnabled}
              signature={signature}
              setSignature={setSignature}
              discountType={discountType}
            />
          )}
        </div>

        {/* Sticky Bottom Actions */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50" data-testid="bottom-actions">
          <div className="max-w-[460] md:max-w-2xl mx-auto px-6 py-4 flex gap-3">
            {currentStep > 1 && (
              <Button
                variant="outline"
                onClick={handleBack}
                className="flex-1 h-12 text-base font-medium rounded-full"
                data-testid="back-button"
              >
                Back
              </Button>
            )}
            {currentStep < 3 ? (
              <Button
                onClick={handleNext}
                className="flex-1 h-12 text-base font-medium bg-gray-900 hover:bg-gray-800 rounded-full"
                data-testid="next-button"
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 h-12 text-base font-medium bg-gray-900 hover:bg-gray-800 rounded-full disabled:opacity-50"
                data-testid="submit-button"
              >
                {isSubmitting ? "Submitting..." : "Submit Order"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderForm;