import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { fetchSettings, clearSettingsCache } from "@/utils/settingsService";
import { Eye, EyeOff, Package, Percent, DollarSign, Palette, Ruler, Settings, Lock, Save, Plus, Trash2, RefreshCw, Check, X, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Simple PIN protection
const ADMIN_PIN = "9107";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Edit states
  const [editedGeneralSettings, setEditedGeneralSettings] = useState(null);
  const [editedGarments, setEditedGarments] = useState({});
  const [editedDiscounts, setEditedDiscounts] = useState([]);
  const [newDiscount, setNewDiscount] = useState(null);
  
  // Saving states
  const [savingGeneral, setSavingGeneral] = useState(false);
  const [savingGarments, setSavingGarments] = useState({});
  const [savingDiscounts, setSavingDiscounts] = useState({});

  // Check if already authenticated in session
  useEffect(() => {
    const authStatus = sessionStorage.getItem("admin_authenticated");
    if (authStatus === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  // Load settings when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadSettings();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const handlePinSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API}/admin/verify`, { pin: pinInput });
      if (response.data.success) {
        setIsAuthenticated(true);
        sessionStorage.setItem("admin_authenticated", "true");
        sessionStorage.setItem("admin_pin", pinInput);
        sessionStorage.setItem("admin_name", response.data.actor_name || "Admin");
        sessionStorage.setItem("admin_role", response.data.actor_role || "operator");
        setPinError(false);
      }
    } catch (err) {
      setPinError(true);
      setPinInput("");
    }
  };

  const getAdminPin = () => {
    return sessionStorage.getItem("admin_pin") || ADMIN_PIN;
  };

  const getAdminName = () => {
    return sessionStorage.getItem("admin_name") || "Admin";
  };

  const getAdminRole = () => {
    return sessionStorage.getItem("admin_role") || "operator";
  };

  const loadSettings = async () => {
    try {
      setLoading(true);
      clearSettingsCache(); // Force fresh fetch
      const data = await fetchSettings();
      setSettings(data);
      // Initialize edit states
      setEditedGeneralSettings({
        default_currency: data.currency?.default || "AWG",
        show_pricing: data.show_pricing ?? true
      });
      setEditedDiscounts(data.discounts?.order_discounts || []);
      setError(null);
    } catch (err) {
      console.error("Error loading settings:", err);
      setError("Failed to load settings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("admin_authenticated");
    sessionStorage.removeItem("admin_pin");
    sessionStorage.removeItem("admin_name");
    sessionStorage.removeItem("admin_role");
    setPinInput("");
  };

  // === SAVE HANDLERS ===
  
  const saveGeneralSettings = async () => {
    setSavingGeneral(true);
    try {
      const response = await axios.post(
        `${API}/admin/settings/general?pin=${getAdminPin()}`,
        editedGeneralSettings
      );
      if (response.data.success) {
        toast.success("General settings saved successfully");
        await loadSettings(); // Refresh
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to save settings");
    } finally {
      setSavingGeneral(false);
    }
  };

  const saveGarmentPrice = async (garmentType, newPrice) => {
    setSavingGarments(prev => ({ ...prev, [garmentType]: true }));
    try {
      const response = await axios.post(
        `${API}/admin/garments/price?pin=${getAdminPin()}`,
        { garment_type: garmentType, base_price: parseFloat(newPrice) }
      );
      if (response.data.success) {
        toast.success(`Price updated for ${garmentType}`);
        await loadSettings();
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to update price");
    } finally {
      setSavingGarments(prev => ({ ...prev, [garmentType]: false }));
    }
  };

  const saveGarmentStatus = async (garmentType, active) => {
    setSavingGarments(prev => ({ ...prev, [`${garmentType}_status`]: true }));
    try {
      const response = await axios.post(
        `${API}/admin/garments/status?pin=${getAdminPin()}`,
        { garment_type: garmentType, active }
      );
      if (response.data.success) {
        toast.success(`Status updated for ${garmentType}`);
        await loadSettings();
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to update status");
    } finally {
      setSavingGarments(prev => ({ ...prev, [`${garmentType}_status`]: false }));
    }
  };

  const saveGarmentIcon = async (garmentType, iconUrl) => {
    setSavingGarments(prev => ({ ...prev, [`${garmentType}_icon`]: true }));
    try {
      const response = await axios.post(
        `${API}/admin/garments/icon?pin=${getAdminPin()}`,
        { garment_type: garmentType, icon_url: iconUrl }
      );
      if (response.data.success) {
        toast.success(`Icon updated for ${garmentType}`);
        await loadSettings();
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to update icon");
    } finally {
      setSavingGarments(prev => ({ ...prev, [`${garmentType}_icon`]: false }));
    }
  };

  const saveDiscount = async (discount) => {
    setSavingDiscounts(prev => ({ ...prev, [discount.name]: true }));
    try {
      const response = await axios.post(
        `${API}/admin/discounts/bulk?pin=${getAdminPin()}`,
        {
          name: discount.name,
          min_total_qty: parseInt(discount.min_total_qty),
          discount_type: discount.discount_type,
          discount_value: parseFloat(discount.discount_value)
        }
      );
      if (response.data.success) {
        toast.success(`Discount "${discount.name}" updated`);
        await loadSettings();
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to update discount");
    } finally {
      setSavingDiscounts(prev => ({ ...prev, [discount.name]: false }));
    }
  };

  const createDiscount = async () => {
    if (!newDiscount?.name || !newDiscount?.min_total_qty || !newDiscount?.discount_value) {
      toast.error("Please fill all discount fields");
      return;
    }
    setSavingDiscounts(prev => ({ ...prev, new: true }));
    try {
      const response = await axios.post(
        `${API}/admin/discounts/bulk/create?pin=${getAdminPin()}`,
        {
          name: newDiscount.name,
          min_total_qty: parseInt(newDiscount.min_total_qty),
          discount_type: newDiscount.discount_type || "Percentage",
          discount_value: parseFloat(newDiscount.discount_value)
        }
      );
      if (response.data.success) {
        toast.success(`Discount "${newDiscount.name}" created`);
        setNewDiscount(null);
        await loadSettings();
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to create discount");
    } finally {
      setSavingDiscounts(prev => ({ ...prev, new: false }));
    }
  };

  const deleteDiscount = async (discountName) => {
    if (!confirm(`Delete discount "${discountName}"?`)) return;
    
    setSavingDiscounts(prev => ({ ...prev, [`${discountName}_delete`]: true }));
    try {
      const response = await axios.post(
        `${API}/admin/discounts/bulk/delete?pin=${getAdminPin()}`,
        { name: discountName }
      );
      if (response.data.success) {
        toast.success(`Discount "${discountName}" deleted`);
        await loadSettings();
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to delete discount");
    } finally {
      setSavingDiscounts(prev => ({ ...prev, [`${discountName}_delete`]: false }));
    }
  };

  // PIN Entry Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Admin Access</h1>
            <p className="text-sm text-gray-500 mt-1">Enter PIN to continue</p>
          </div>
          
          <form onSubmit={handlePinSubmit}>
            <Input
              type="password"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="Enter PIN"
              className={`h-12 text-center text-lg tracking-widest mb-4 ${pinError ? 'border-red-500' : ''}`}
              maxLength={10}
              autoFocus
            />
            {pinError && (
              <p className="text-red-500 text-sm text-center mb-4">Invalid PIN. Please try again.</p>
            )}
            <Button 
              type="submit" 
              className="w-full h-12 bg-gray-900 hover:bg-gray-800"
              disabled={!pinInput}
            >
              Access Dashboard
            </Button>
          </form>
        </div>
      </div>
    );
  }

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-sm">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadSettings} className="bg-gray-900 hover:bg-gray-800">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-8">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-sm text-gray-500">Manage settings</p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/admin/activity')}
              className="text-gray-600"
            >
              <Clock className="w-4 h-4 mr-1" />
              Activity Log
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadSettings}
              className="text-gray-600"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Refresh
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              className="text-gray-600"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-6 space-y-6">
        {/* Section 1: General Settings */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5 text-gray-700" />
              <h2 className="text-lg font-semibold text-gray-900">General Settings</h2>
            </div>
            <Button 
              size="sm" 
              onClick={saveGeneralSettings}
              disabled={savingGeneral}
              className="bg-gray-900 hover:bg-gray-800"
            >
              {savingGeneral ? (
                <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-1" />
              )}
              Save Changes
            </Button>
          </div>
          <div className="p-6 space-y-4">
            {/* Currency */}
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <p className="font-medium text-gray-900">Default Currency</p>
                <p className="text-sm text-gray-500">Currency used for pricing display</p>
              </div>
              <Select
                value={editedGeneralSettings?.default_currency || "AWG"}
                onValueChange={(value) => setEditedGeneralSettings(prev => ({ ...prev, default_currency: value }))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AWG">AWG</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Price Visibility */}
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-gray-900">Show Prices to Customers</p>
                <p className="text-sm text-gray-500">Whether pricing is visible on the order form</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-sm ${editedGeneralSettings?.show_pricing ? 'text-green-600' : 'text-gray-400'}`}>
                  {editedGeneralSettings?.show_pricing ? 'Visible' : 'Hidden'}
                </span>
                <Switch
                  checked={editedGeneralSettings?.show_pricing ?? true}
                  onCheckedChange={(checked) => setEditedGeneralSettings(prev => ({ ...prev, show_pricing: checked }))}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Garments */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center gap-3">
            <Package className="w-5 h-5 text-gray-700" />
            <h2 className="text-lg font-semibold text-gray-900">Garments</h2>
            <span className="ml-auto text-sm text-gray-500">{settings?.garments?.length || 0} items</span>
          </div>
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">Icon</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">Name</th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-gray-500">Base Price (AWG)</th>
                    <th className="text-center py-3 px-2 text-sm font-medium text-gray-500">Active</th>
                    <th className="text-center py-3 px-2 text-sm font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {settings?.garments?.map((garment, index) => (
                    <GarmentRow
                      key={garment.value}
                      garment={garment}
                      index={index}
                      editedGarments={editedGarments}
                      setEditedGarments={setEditedGarments}
                      savingGarments={savingGarments}
                      saveGarmentPrice={saveGarmentPrice}
                      saveGarmentStatus={saveGarmentStatus}
                      saveGarmentIcon={saveGarmentIcon}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Section 3: Bulk Discount Rules */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Percent className="w-5 h-5 text-gray-700" />
              <h2 className="text-lg font-semibold text-gray-900">Bulk Discount Rules</h2>
              <span className="text-sm text-gray-500">{settings?.discounts?.order_discounts?.length || 0} rules</span>
            </div>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setNewDiscount({ name: '', min_total_qty: '', discount_type: 'Percentage', discount_value: '' })}
              disabled={newDiscount !== null}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Rule
            </Button>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {/* New Discount Form */}
              {newDiscount !== null && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-3">
                  <p className="text-sm font-medium text-blue-900">New Discount Rule</p>
                  <div className="grid grid-cols-4 gap-3">
                    <Input
                      placeholder="Name"
                      value={newDiscount.name}
                      onChange={(e) => setNewDiscount(prev => ({ ...prev, name: e.target.value }))}
                    />
                    <Input
                      type="number"
                      placeholder="Min Qty"
                      value={newDiscount.min_total_qty}
                      onChange={(e) => setNewDiscount(prev => ({ ...prev, min_total_qty: e.target.value }))}
                    />
                    <Select
                      value={newDiscount.discount_type}
                      onValueChange={(value) => setNewDiscount(prev => ({ ...prev, discount_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Percentage">Percentage</SelectItem>
                        <SelectItem value="Fixed">Fixed Amount</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      placeholder="Value"
                      value={newDiscount.discount_value}
                      onChange={(e) => setNewDiscount(prev => ({ ...prev, discount_value: e.target.value }))}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="outline" onClick={() => setNewDiscount(null)}>
                      Cancel
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={createDiscount}
                      disabled={savingDiscounts.new}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {savingDiscounts.new ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 mr-1" />}
                      Create
                    </Button>
                  </div>
                </div>
              )}

              {/* Existing Discounts */}
              {settings?.discounts?.order_discounts
                ?.sort((a, b) => a.min_total_qty - b.min_total_qty)
                .map((discount) => (
                  <DiscountRow
                    key={discount.name}
                    discount={discount}
                    editedDiscounts={editedDiscounts}
                    setEditedDiscounts={setEditedDiscounts}
                    savingDiscounts={savingDiscounts}
                    saveDiscount={saveDiscount}
                    deleteDiscount={deleteDiscount}
                  />
                ))}
              
              {(!settings?.discounts?.order_discounts || settings.discounts.order_discounts.length === 0) && !newDiscount && (
                <p className="text-gray-500 text-center py-4">No bulk discount rules configured</p>
              )}
            </div>
          </div>
        </section>

        {/* Section 4: Colors (Read-only) */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center gap-3">
            <Palette className="w-5 h-5 text-gray-700" />
            <h2 className="text-lg font-semibold text-gray-900">Color Options</h2>
            <span className="ml-auto text-sm text-gray-400">(Read-only - Edit in Airtable)</span>
          </div>
          <div className="p-6">
            <div className="flex flex-wrap gap-3">
              {settings?.colors?.map((color) => (
                <div 
                  key={color.value} 
                  className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div 
                    className={`w-6 h-6 rounded-full border border-gray-300 ${color.value === 'White' ? 'border-gray-400' : ''}`}
                    style={{ background: color.hex }}
                  />
                  <span className="text-sm font-medium text-gray-700">{color.value}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 5: Sizes (Read-only) */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center gap-3">
            <Ruler className="w-5 h-5 text-gray-700" />
            <h2 className="text-lg font-semibold text-gray-900">Size Options</h2>
            <span className="ml-auto text-sm text-gray-400">(Read-only - Edit in Airtable)</span>
          </div>
          <div className="p-6">
            <div className="flex flex-wrap gap-2">
              {settings?.sizes?.map((size) => (
                <span 
                  key={size} 
                  className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-semibold text-gray-700"
                >
                  {size}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Footer Note */}
        <div className="text-center text-sm text-gray-500 pt-4">
          <p>Changes are saved to Airtable and take effect immediately.</p>
          <p className="mt-1">Last refreshed: {new Date().toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

// Garment Row Component
const GarmentRow = ({ garment, index, editedGarments, setEditedGarments, savingGarments, saveGarmentPrice, saveGarmentStatus, saveGarmentIcon }) => {
  const [editingPrice, setEditingPrice] = useState(false);
  const [editingIcon, setEditingIcon] = useState(false);
  const [localPrice, setLocalPrice] = useState(garment.base_price);
  const [localIcon, setLocalIcon] = useState(garment.icon);

  const handleSavePrice = () => {
    saveGarmentPrice(garment.value, localPrice);
    setEditingPrice(false);
  };

  const handleSaveIcon = () => {
    saveGarmentIcon(garment.value, localIcon);
    setEditingIcon(false);
  };

  return (
    <tr className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-gray-100`}>
      <td className="py-3 px-2">
        {editingIcon ? (
          <div className="flex items-center gap-2">
            <Input
              value={localIcon}
              onChange={(e) => setLocalIcon(e.target.value)}
              className="w-40 h-8 text-xs"
              placeholder="/icons/..."
            />
            <Button size="sm" variant="ghost" onClick={handleSaveIcon} disabled={savingGarments[`${garment.value}_icon`]}>
              <Check className="w-4 h-4 text-green-600" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => { setEditingIcon(false); setLocalIcon(garment.icon); }}>
              <X className="w-4 h-4 text-red-600" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setEditingIcon(true)}>
            <img 
              src={garment.icon} 
              alt={garment.label} 
              className="w-10 h-10 object-contain"
            />
          </div>
        )}
      </td>
      <td className="py-3 px-2 font-medium text-gray-900">{garment.value}</td>
      <td className="py-3 px-2 text-right">
        {editingPrice ? (
          <div className="flex items-center justify-end gap-2">
            <Input
              type="number"
              value={localPrice}
              onChange={(e) => setLocalPrice(e.target.value)}
              className="w-24 h-8 text-right"
              min="0"
              step="0.01"
            />
            <Button size="sm" variant="ghost" onClick={handleSavePrice} disabled={savingGarments[garment.value]}>
              {savingGarments[garment.value] ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 text-green-600" />}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => { setEditingPrice(false); setLocalPrice(garment.base_price); }}>
              <X className="w-4 h-4 text-red-600" />
            </Button>
          </div>
        ) : (
          <span 
            className="cursor-pointer hover:bg-blue-100 px-2 py-1 rounded font-semibold text-gray-900"
            onClick={() => setEditingPrice(true)}
          >
            {garment.base_price > 0 ? `AWG ${garment.base_price.toFixed(2)}` : '—'}
          </span>
        )}
      </td>
      <td className="py-3 px-2 text-center">
        <Switch
          checked={garment.active !== false}
          onCheckedChange={(checked) => saveGarmentStatus(garment.value, checked)}
          disabled={savingGarments[`${garment.value}_status`]}
        />
      </td>
      <td className="py-3 px-2 text-center">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${garment.active !== false ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
          {garment.active !== false ? 'Active' : 'Inactive'}
        </span>
      </td>
    </tr>
  );
};

// Discount Row Component
const DiscountRow = ({ discount, editedDiscounts, setEditedDiscounts, savingDiscounts, saveDiscount, deleteDiscount }) => {
  const [editing, setEditing] = useState(false);
  const [localDiscount, setLocalDiscount] = useState(discount);

  const handleSave = () => {
    saveDiscount(localDiscount);
    setEditing(false);
  };

  return (
    <div className={`p-4 rounded-xl border ${editing ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'}`}>
      {editing ? (
        <div className="space-y-3">
          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="text-xs text-gray-500">Name</label>
              <Input
                value={localDiscount.name}
                disabled
                className="bg-gray-100"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Min Quantity</label>
              <Input
                type="number"
                value={localDiscount.min_total_qty}
                onChange={(e) => setLocalDiscount(prev => ({ ...prev, min_total_qty: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Type</label>
              <Select
                value={localDiscount.discount_type}
                onValueChange={(value) => setLocalDiscount(prev => ({ ...prev, discount_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Percentage">Percentage</SelectItem>
                  <SelectItem value="Fixed">Fixed Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-gray-500">Value</label>
              <Input
                type="number"
                value={localDiscount.discount_value}
                onChange={(e) => setLocalDiscount(prev => ({ ...prev, discount_value: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="outline" onClick={() => { setEditing(false); setLocalDiscount(discount); }}>
              Cancel
            </Button>
            <Button 
              size="sm" 
              onClick={handleSave}
              disabled={savingDiscounts[discount.name]}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              {savingDiscounts[discount.name] ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
              Save
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="font-semibold text-gray-900">{discount.name}</span>
            <span className="text-sm text-gray-600">{discount.min_total_qty}+ pieces</span>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-lg text-sm font-medium">
              {discount.discount_type === 'Percentage' 
                ? `${discount.discount_value}% off` 
                : `AWG ${discount.discount_value} off`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
              Edit
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => deleteDiscount(discount.name)}
              disabled={savingDiscounts[`${discount.name}_delete`]}
              className="text-red-600 hover:bg-red-50"
            >
              {savingDiscounts[`${discount.name}_delete`] ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
