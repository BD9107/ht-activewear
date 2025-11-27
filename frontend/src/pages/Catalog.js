import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Catalog = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading products...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2" data-testid="catalog-page-title">
            HT Activewear Catalog
          </h1>
          <p className="text-slate-600">Browse our collection of premium activewear</p>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-600">No products available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <Link 
                key={product.id} 
                to={`/catalog/${product.id}`}
                data-testid={`product-card-${product.id}`}
              >
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="p-0">
                    <div className="aspect-square bg-slate-200 rounded-t-lg overflow-hidden">
                      <img 
                        src={product.main_image_url} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/400x400?text=Product+Image';
                        }}
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <Badge variant="outline" className="mb-2">
                      {product.category}
                    </Badge>
                    <CardTitle className="text-lg mb-1">{product.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {product.code}
                    </CardDescription>
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
    </div>
  );
};

export default Catalog;
