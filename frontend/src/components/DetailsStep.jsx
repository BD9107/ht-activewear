import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const DetailsStep = ({ orderDetails, setOrderDetails }) => {
  const [uploading, setUploading] = useState(false);

  const handleChange = (field, value) => {
    setOrderDetails({ ...orderDetails, [field]: value });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only PNG, JPEG, or PDF files are allowed");
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(`${API}/uploadArtwork`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success) {
        handleChange('artworkUrl', response.data.url);
        toast.success("Artwork uploaded successfully");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload artwork");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6" data-testid="details-step">
      {/* Customer Name */}
      <div className="space-y-2">
        <Label htmlFor="customerName" className="text-base font-medium text-gray-900">
          Customer Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="customerName"
          value={orderDetails.customerName}
          onChange={(e) => handleChange('customerName', e.target.value)}
          placeholder="Enter full name"
          className="h-12 text-base rounded-xl border-gray-300"
          data-testid="customer-name-input"
        />
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-base font-medium text-gray-900">
          Email <span className="text-red-500">*</span>
        </Label>
        <Input
          id="email"
          type="email"
          value={orderDetails.email}
          onChange={(e) => handleChange('email', e.target.value)}
          placeholder="email@example.com"
          className="h-12 text-base rounded-xl border-gray-300"
          data-testid="email-input"
        />
      </div>

      {/* Phone */}
      <div className="space-y-2">
        <Label htmlFor="phone" className="text-base font-medium text-gray-900">
          Phone (optional)
        </Label>
        <Input
          id="phone"
          type="tel"
          value={orderDetails.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          placeholder="(000) 000-0000"
          className="h-12 text-base rounded-xl border-gray-300"
          data-testid="phone-input"
        />
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes" className="text-base font-medium text-gray-900">
          Order Notes (optional)
        </Label>
        <Textarea
          id="notes"
          value={orderDetails.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          placeholder="Any additional information..."
          className="min-h-[100px] text-base rounded-xl border-gray-300 resize-none"
          data-testid="notes-textarea"
        />
      </div>

      {/* Customization Toggle */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm" data-testid="customization-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <Label htmlFor="customization" className="text-base font-medium text-gray-900">
              Customization Needed? <span className="text-red-500">*</span>
            </Label>
            <p className="text-sm text-gray-500 mt-1">Enable if you need custom printing or embroidery</p>
          </div>
          <Switch
            id="customization"
            checked={orderDetails.customizationNeeded}
            onCheckedChange={(checked) => handleChange('customizationNeeded', checked)}
            data-testid="customization-switch"
          />
        </div>

        {orderDetails.customizationNeeded && (
          <div className="space-y-4 pt-4 border-t border-gray-200">
            {/* Customization Details */}
            <div className="space-y-2">
              <Label htmlFor="customizationDetails" className="text-base font-medium text-gray-900">
                Customization Details <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="customizationDetails"
                value={orderDetails.customizationDetails}
                onChange={(e) => handleChange('customizationDetails', e.target.value)}
                placeholder="Describe your customization needs (e.g., logo placement, text, colors)..."
                className="min-h-[100px] text-base rounded-xl border-gray-300 resize-none"
                data-testid="customization-details-textarea"
              />
            </div>

            {/* Artwork Upload */}
            <div className="space-y-2">
              <Label htmlFor="artwork" className="text-base font-medium text-gray-900">
                Upload Artwork (optional)
              </Label>
              <p className="text-sm text-gray-500 mb-2">PNG, JPEG, or PDF (max 10MB)</p>
              <div className="relative">
                <input
                  id="artwork"
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,application/pdf"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="block w-full text-base text-gray-900 border border-gray-300 rounded-xl cursor-pointer bg-white file:mr-4 file:py-3 file:px-4 file:rounded-l-xl file:border-0 file:text-base file:font-medium file:bg-gray-900 file:text-white hover:file:bg-gray-800 file:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  data-testid="artwork-upload-input"
                />
              </div>
              {uploading && <p className="text-sm text-blue-600">Uploading...</p>}
              {orderDetails.artworkUrl && (
                <p className="text-sm text-green-600" data-testid="artwork-uploaded-message">
                  ✓ Artwork uploaded successfully
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailsStep;