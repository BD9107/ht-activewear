import { useState, useEffect } from "react";
import { fetchSettings } from "@/utils/settingsService";
import { Eye, EyeOff, Package, Percent, DollarSign, Palette, Ruler, Settings, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Simple PIN protection - admin page is not linked publicly
const ADMIN_PIN = "9107"; // Simple access code

const AdminDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pinInput === ADMIN_PIN) {
      setIsAuthenticated(true);
      sessionStorage.setItem("admin_authenticated", "true");
      setPinError(false);
    } else {
      setPinError(true);
      setPinInput("");
    }
  };

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await fetchSettings();
      setSettings(data);
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
    setPinInput("");
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
            <p className="text-sm text-gray-500">View-only settings</p>
          </div>
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

      <div className="max-w-4xl mx-auto px-6 py-6 space-y-6">
        {/* Read-Only Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
          <Eye className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-blue-900">Read-Only Mode</p>
            <p className="text-sm text-blue-700">
              This dashboard displays current settings. To make changes, please update values directly in Airtable.
            </p>
          </div>
        </div>

        {/* Section 1: General Settings */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center gap-3">
            <Settings className="w-5 h-5 text-gray-700" />
            <h2 className="text-lg font-semibold text-gray-900">General Settings</h2>
          </div>
          <div className="p-6 space-y-4">
            {/* Currency */}
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <p className="font-medium text-gray-900">Default Currency</p>
                <p className="text-sm text-gray-500">Currency used for pricing display</p>
              </div>
              <span className="px-4 py-2 bg-gray-100 rounded-lg font-semibold text-gray-900">
                {settings?.currency?.default || "AWG"}
              </span>
            </div>

            {/* Currency Options */}
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <p className="font-medium text-gray-900">Available Currencies</p>
                <p className="text-sm text-gray-500">Currencies customers can switch between</p>
              </div>
              <div className="flex gap-2">
                {settings?.currency?.options?.map((curr) => (
                  <span key={curr} className="px-3 py-1 bg-gray-100 rounded-lg text-sm font-medium text-gray-700">
                    {curr}
                  </span>
                ))}
              </div>
            </div>

            {/* Exchange Rate */}
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <p className="font-medium text-gray-900">Exchange Rate</p>
                <p className="text-sm text-gray-500">AWG to USD conversion rate</p>
              </div>
              <span className="px-4 py-2 bg-gray-100 rounded-lg font-semibold text-gray-900">
                1 USD = {settings?.currency?.exchange_rate || 1.75} AWG
              </span>
            </div>

            {/* Price Visibility */}
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-gray-900">Show Prices to Customers</p>
                <p className="text-sm text-gray-500">Whether pricing is visible on the order form</p>
              </div>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${settings?.show_pricing ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                {settings?.show_pricing ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                <span className="font-semibold">{settings?.show_pricing ? "Visible" : "Hidden"}</span>
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
                    <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">Display Label</th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-gray-500">Base Price</th>
                    <th className="text-center py-3 px-2 text-sm font-medium text-gray-500">Status</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">Price Tiers</th>
                  </tr>
                </thead>
                <tbody>
                  {settings?.garments?.map((garment, index) => (
                    <tr key={garment.value} className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-gray-100`}>
                      <td className="py-3 px-2">
                        <img 
                          src={garment.icon} 
                          alt={garment.label} 
                          className="w-10 h-10 object-contain"
                        />
                      </td>
                      <td className="py-3 px-2 font-medium text-gray-900">{garment.value}</td>
                      <td className="py-3 px-2 text-gray-600">{garment.label}</td>
                      <td className="py-3 px-2 text-right font-semibold text-gray-900">
                        {garment.base_price > 0 ? `AWG ${garment.base_price.toFixed(2)}` : '—'}
                      </td>
                      <td className="py-3 px-2 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${garment.active !== false ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                          {garment.active !== false ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        {garment.pricing_tiers?.length > 0 ? (
                          <div className="text-xs text-gray-600 space-y-1">
                            {garment.pricing_tiers.map((tier, i) => (
                              <div key={i}>
                                {tier.min_qty}-{tier.max_qty} pcs: AWG {tier.price}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">No tiers</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Section 3: Colors */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center gap-3">
            <Palette className="w-5 h-5 text-gray-700" />
            <h2 className="text-lg font-semibold text-gray-900">Color Options</h2>
            <span className="ml-auto text-sm text-gray-500">{settings?.colors?.length || 0} colors</span>
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

        {/* Section 4: Sizes */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center gap-3">
            <Ruler className="w-5 h-5 text-gray-700" />
            <h2 className="text-lg font-semibold text-gray-900">Size Options</h2>
            <span className="ml-auto text-sm text-gray-500">{settings?.sizes?.length || 0} sizes</span>
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

        {/* Section 5: Customization Options */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center gap-3">
            <Settings className="w-5 h-5 text-gray-700" />
            <h2 className="text-lg font-semibold text-gray-900">Customization Options</h2>
          </div>
          <div className="p-6 space-y-6">
            {/* Customization Types */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-3">Customization Types</h3>
              <div className="space-y-2">
                {settings?.customization?.types?.map((type) => (
                  <div 
                    key={type.value} 
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <span className="font-medium text-gray-900">{type.label}</span>
                    <span className={`px-3 py-1 rounded-lg text-sm font-medium ${type.additional_cost > 0 ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                      {type.additional_cost > 0 ? `+AWG ${type.additional_cost}/item` : 'Included'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Artwork Statuses */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-3">Artwork Status Options</h3>
              <div className="flex flex-wrap gap-2">
                {settings?.customization?.artwork_statuses?.map((status) => (
                  <span 
                    key={status} 
                    className="px-3 py-1 bg-gray-100 rounded-lg text-sm text-gray-700"
                  >
                    {status}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Section 6: Bulk Discount Rules */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center gap-3">
            <Percent className="w-5 h-5 text-gray-700" />
            <h2 className="text-lg font-semibold text-gray-900">Bulk Discount Rules</h2>
            <span className="ml-auto text-sm text-gray-500">{settings?.discounts?.order_discounts?.length || 0} rules</span>
          </div>
          <div className="p-6">
            {settings?.discounts?.order_discounts?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">Discount Name</th>
                      <th className="text-right py-3 px-2 text-sm font-medium text-gray-500">Minimum Quantity</th>
                      <th className="text-right py-3 px-2 text-sm font-medium text-gray-500">Discount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {settings?.discounts?.order_discounts
                      ?.sort((a, b) => a.min_total_qty - b.min_total_qty)
                      .map((discount, index) => (
                        <tr key={discount.name} className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                          <td className="py-3 px-2 font-medium text-gray-900">{discount.name}</td>
                          <td className="py-3 px-2 text-right text-gray-600">{discount.min_total_qty}+ pieces</td>
                          <td className="py-3 px-2 text-right">
                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-lg font-semibold">
                              {discount.discount_type === 'Percentage' 
                                ? `${discount.discount_value}% off` 
                                : `AWG ${discount.discount_value} off`}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No bulk discount rules configured</p>
            )}
          </div>
        </section>

        {/* Section 7: Customer Discounts */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center gap-3">
            <DollarSign className="w-5 h-5 text-gray-700" />
            <h2 className="text-lg font-semibold text-gray-900">Customer Discounts</h2>
            <span className="ml-auto text-sm text-gray-500">{settings?.discounts?.customer_discounts?.length || 0} customers</span>
          </div>
          <div className="p-6">
            {settings?.discounts?.customer_discounts?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">Customer Email</th>
                      <th className="text-right py-3 px-2 text-sm font-medium text-gray-500">Discount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {settings?.discounts?.customer_discounts?.map((customer, index) => (
                      <tr key={customer.email} className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                        <td className="py-3 px-2 text-gray-900">{customer.email}</td>
                        <td className="py-3 px-2 text-right">
                          <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-lg font-semibold">
                            {customer.discount_percentage}% off
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No customer-specific discounts configured</p>
            )}
          </div>
        </section>

        {/* Footer Note */}
        <div className="text-center text-sm text-gray-500 pt-4">
          <p>Data loaded from Airtable via <code className="bg-gray-100 px-2 py-0.5 rounded">/api/settings</code></p>
          <p className="mt-1">Last refreshed: {new Date().toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
