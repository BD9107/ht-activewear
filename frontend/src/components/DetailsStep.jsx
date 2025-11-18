import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
          placeholder="e.g., Rush order, specific delivery date, special instructions..."
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
            {/* Customization Type */}
            <div className="space-y-2">
              <Label className="text-base font-medium text-gray-900">
                Customization Type <span className="text-red-500">*</span>
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleChange('customizationType', 'Printing')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    orderDetails.customizationType === 'Printing'
                      ? 'border-gray-900 bg-gray-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  data-testid="customization-type-printing"
                >
                  <div className="text-center">
                    <div className="text-2xl mb-1">🖨️</div>
                    <div className="font-semibold">Printing</div>
                    <div className="text-xs text-gray-500">Included</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handleChange('customizationType', 'Embroidery')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    orderDetails.customizationType === 'Embroidery'
                      ? 'border-gray-900 bg-gray-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  data-testid="customization-type-embroidery"
                >
                  <div className="text-center">
                    <div className="text-2xl mb-1">🧵</div>
                    <div className="font-semibold">Embroidery</div>
                    <div className="text-xs text-gray-500">+AWG 10/item</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Artwork Status */}
            <div className="space-y-2">
              <Label className="text-base font-medium text-gray-900">
                Artwork Status <span className="text-red-500">*</span>
              </Label>
              <Select
                value={orderDetails.artworkStatus}
                onValueChange={(value) => handleChange('artworkStatus', value)}
              >
                <SelectTrigger className="h-12 text-base rounded-xl" data-testid="artwork-status-select">
                  <SelectValue placeholder="Select artwork status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Will Upload Later">Will Upload Later</SelectItem>
                  <SelectItem value="Will Email Separately">Will Email Separately</SelectItem>
                  <SelectItem value="Already Emailed">Already Emailed</SelectItem>
                  <SelectItem value="Already Uploaded">Already Uploaded</SelectItem>
                  <SelectItem value="Not Needed">Not Needed</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

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

            {/* Artwork URL */}
            <div className="space-y-2">
              <Label htmlFor="artworkUrl" className="text-base font-medium text-gray-900">
                Artwork URL (optional)
              </Label>
              <p className="text-sm text-gray-500 mb-2">Provide a link to your artwork (Google Drive, Dropbox, etc.)</p>
              <Input
                id="artworkUrl"
                type="url"
                value={orderDetails.artworkUrl}
                onChange={(e) => handleChange('artworkUrl', e.target.value)}
                placeholder="https://drive.google.com/..."
                className="h-12 text-base rounded-xl border-gray-300"
                data-testid="artwork-url-input"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailsStep;