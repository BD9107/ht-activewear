import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import AdminCatalog from "./pages/AdminCatalog";
import Order from "./pages/Order";
import Catalog from "./pages/Catalog";
import ProductDetail from "./pages/ProductDetail";

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Redirect root to catalog */}
            <Route path="/" element={<Navigate to="/catalog" replace />} />
            
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/catalog/:id" element={<ProductDetail />} />
            
            {/* Protected Routes */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute>
                  <Admin />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/catalog" 
              element={
                <ProtectedRoute>
                  <AdminCatalog />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/order" 
              element={
                <ProtectedRoute>
                  <Order />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}

export default App;
