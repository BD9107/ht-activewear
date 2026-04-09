import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, ArrowLeft, Filter, RefreshCw, Lock, Settings, Package, Percent, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminActivity = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters
  const [sectionFilter, setSectionFilter] = useState("all");
  const [limitFilter, setLimitFilter] = useState(100);

  // Check if already authenticated in session
  useEffect(() => {
    const authStatus = sessionStorage.getItem("admin_authenticated");
    if (authStatus === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const loadLogs = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        pin: sessionStorage.getItem("admin_pin") || "",
        limit: limitFilter.toString()
      });
      if (sectionFilter && sectionFilter !== "all") {
        params.append("section", sectionFilter);
      }

      const response = await axios.get(`${API}/admin/activity?${params}`);
      setLogs(response.data.logs || []);
      setError(null);
    } catch (err) {
      console.error("Error loading logs:", err);
      setError("Failed to load activity logs. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [sectionFilter, limitFilter]);

  // Load logs when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadLogs();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, loadLogs]);

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

  const getAdminName = () => {
    return sessionStorage.getItem("admin_name") || "Admin";
  };

  const getAdminRole = () => {
    return sessionStorage.getItem("admin_role") || "operator";
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "Unknown";
    try {
      const date = new Date(timestamp);
      return date.toLocaleString();
    } catch {
      return timestamp;
    }
  };

  const formatValue = (value) => {
    if (!value || value === "None" || value === "null") return "—";
    try {
      // Try to parse as JSON for pretty display
      const parsed = JSON.parse(value);
      if (typeof parsed === "object") {
        return Object.entries(parsed)
          .map(([k, v]) => `${k}: ${v}`)
          .join(", ");
      }
      return String(parsed);
    } catch {
      return String(value);
    }
  };

  const getSectionIcon = (section) => {
    switch (section) {
      case "settings":
        return <Settings className="w-4 h-4" />;
      case "garments":
        return <Package className="w-4 h-4" />;
      case "discounts":
        return <Percent className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getSectionColor = (section) => {
    switch (section) {
      case "settings":
        return "bg-blue-100 text-blue-800";
      case "garments":
        return "bg-green-100 text-green-800";
      case "discounts":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case "create":
        return "bg-emerald-100 text-emerald-800";
      case "update":
        return "bg-amber-100 text-amber-800";
      case "delete":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
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
            <p className="text-sm text-gray-500 mt-1">Enter PIN to view activity logs</p>
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
              View Activity
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-8">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/admin')}
              className="text-gray-600"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Activity Log</h1>
              <p className="text-sm text-gray-500">Admin change history</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Logged-in user display */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
              <div className="w-7 h-7 rounded-full bg-gray-900 flex items-center justify-center text-white text-xs font-medium">
                {getAdminName().charAt(0).toUpperCase()}
              </div>
              <div className="text-sm">
                <p className="font-medium text-gray-900 leading-tight">{getAdminName()}</p>
                <p className={`text-xs leading-tight ${getAdminRole() === 'overwatch' ? 'text-red-600' : 'text-gray-500'}`}>
                  {getAdminRole()}
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadLogs}
              disabled={loading}
              className="text-gray-600"
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6 space-y-6">
        {/* Read-Only Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
          <Clock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-blue-900">Audit Trail (Read-Only)</p>
            <p className="text-sm text-blue-700">
              This page shows all admin changes. Logs cannot be edited or deleted.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Section:</span>
              <Select value={sectionFilter} onValueChange={setSectionFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sections</SelectItem>
                  <SelectItem value="settings">Settings</SelectItem>
                  <SelectItem value="garments">Garments</SelectItem>
                  <SelectItem value="discounts">Discounts</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Show:</span>
              <Select value={limitFilter.toString()} onValueChange={(v) => setLimitFilter(parseInt(v))}>
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25 logs</SelectItem>
                  <SelectItem value="50">50 logs</SelectItem>
                  <SelectItem value="100">100 logs</SelectItem>
                  <SelectItem value="500">500 logs</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="ml-auto text-sm text-gray-500">
              Showing {logs.length} log{logs.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
            <p className="text-red-600">{error}</p>
            <Button onClick={loadLogs} variant="outline" size="sm" className="mt-2">
              Retry
            </Button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="w-10 h-10 border-4 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading activity logs...</p>
          </div>
        )}

        {/* Logs List */}
        {!loading && !error && (
          <div className="space-y-3">
            {logs.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
                <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No activity logs found</p>
                <p className="text-sm text-gray-400 mt-1">Changes will appear here after admin actions</p>
              </div>
            ) : (
              logs.map((log, index) => (
                <div 
                  key={log.id || index}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getSectionColor(log.section)}`}>
                      {getSectionIcon(log.section)}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getSectionColor(log.section)}`}>
                          {log.section || 'unknown'}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getActionColor(log.action)}`}>
                          {log.action || 'unknown'}
                        </span>
                        <span className="text-sm font-semibold text-gray-900">
                          {log.field || 'unknown field'}
                        </span>
                      </div>
                      
                      {log.details && (
                        <p className="text-sm text-gray-600 mb-2">{log.details}</p>
                      )}
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Old value: </span>
                          <span className="font-mono text-gray-700 bg-red-50 px-1 rounded">
                            {formatValue(log.old_value)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">New value: </span>
                          <span className="font-mono text-gray-700 bg-green-50 px-1 rounded">
                            {formatValue(log.new_value)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Timestamp & Actor Info */}
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-gray-500">{formatTimestamp(log.timestamp)}</p>
                      {log.actor_name && (
                        <p className="text-xs text-gray-700 font-medium mt-1">
                          By: {log.actor_name}
                        </p>
                      )}
                      {log.actor_role && (
                        <span className={`inline-block px-1.5 py-0.5 rounded text-xs mt-1 ${
                          log.actor_role === 'overwatch' 
                            ? 'bg-red-100 text-red-700' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {log.actor_role}
                        </span>
                      )}
                      <p className="text-xs text-gray-400 mt-1">ID: {log.id}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 pt-4">
          <p>Activity logs are stored immutably and cannot be modified.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminActivity;
