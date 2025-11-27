import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Store, ShoppingBag, Lock, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Catalog = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageErrors, setImageErrors] = useState({});

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API}/products`);
      setProducts(response.data);
    } catch (err) {
      setError('Failed to load products');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageError = (productId) => {
    setImageErrors(prev => ({ ...prev, [productId]: true }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-slate-50">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <div className="text-lg text-slate-600">Loading products...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-slate-50">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <div className="text-lg text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                <Store className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-slate-900" data-testid="catalog-page-title">
                  HT Activewear Catalog
                </h1>
                <p className="text-slate-600 mt-1">Browse our collection of premium activewear</p>
              </div>
            </div>
            
            {/* Admin Link */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(isAuthenticated ? '/admin' : '/login')}
              className="text-slate-600 hover:text-slate-900"
            >
              {isAuthenticated ? (
                <>
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Admin
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Admin Login
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {products.length === 0 ? (
          <Card className="shadow-lg">
            <CardContent className="py-12 text-center">
              <ShoppingBag className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 text-lg">No products available at the moment.</p>
              <p className="text-slate-500 text-sm mt-2">Check back soon for new arrivals!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-6">
            {products.map((product) => (
              <Link 
                key={product.id} 
                to={`/catalog/${product.id}`}
                data-testid={`product-card-${product.id}`}
              >
                <Card className="h-full hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer border-2 hover:border-blue-400">
                  <CardHeader className="p-0">
                    <div className="aspect-square bg-slate-100 rounded-t-lg overflow-hidden relative">
                      {!imageErrors[product.id] ? (
                        <img 
                          src={product.main_image_url} 
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={() => handleImageError(product.id)}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-100">
                          <div className="text-center">
                            <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                            <p className="text-xs text-slate-400">No Image</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <Badge variant="outline" className="mb-2 bg-blue-50 text-blue-700 border-blue-200">
                      {product.category}
                    </Badge>
                    <CardTitle className="text-base mb-1 font-bold text-slate-900">{product.name}</CardTitle>
                    <CardDescription className="text-sm mb-2 text-slate-600">
                      {product.code}
                    </CardDescription>
                    {product.description && (
                      <p className="text-sm text-slate-600 line-clamp-2 mb-2">
                        {product.description}
                      </p>
                    )}
                    {product.colors && (
                      <p className="text-xs text-slate-500 mt-2">
                        Colors: {product.colors}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-6 py-6 text-center">
          <p className="text-slate-600">© 2025 HT Activewear. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Catalog;