import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ShoppingBag, Package } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`${API}/products/${id}`);
      setProduct(response.data);
    } catch (err) {
      setError('Product not found');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-slate-50">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <div className="text-lg text-slate-600">Loading product...</div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-slate-50">
        <div className="text-center">
          <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <div className="text-lg text-slate-600 mb-4">{error}</div>
          <Button onClick={() => navigate('/catalog')} className="bg-blue-600 hover:bg-blue-700">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Catalog
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <Button 
            onClick={() => navigate('/catalog')} 
            variant="ghost"
            size="lg"
            className="hover:bg-slate-100"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Catalog
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <Card className="shadow-xl border-2">
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Product Image */}
              <div className="aspect-square bg-slate-100 rounded-xl overflow-hidden shadow-lg">
                {!imageError ? (
                  <img 
                    src={product.main_image_url} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                    data-testid="product-image"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-100">
                    <div className="text-center">
                      <ShoppingBag className="w-20 h-20 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-400">Image not available</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div>
                <Badge variant="outline" className="mb-4 bg-blue-50 text-blue-700 border-blue-200 text-sm">
                  {product.category}
                </Badge>
                <h1 className="text-4xl font-bold mb-2 text-slate-900" data-testid="product-name">
                  {product.name}
                </h1>
                <p className="text-slate-600 mb-6 text-lg" data-testid="product-code">
                  Product Code: <span className="font-semibold">{product.code}</span>
                </p>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-2 text-slate-900">Description</h3>
                    <p className="text-slate-700 leading-relaxed" data-testid="product-description">
                      {product.description}
                    </p>
                  </div>

                  {product.colors && (
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <h3 className="font-semibold mb-2 text-slate-900">Available Colors</h3>
                      <p className="text-slate-700" data-testid="product-colors">
                        {product.colors}
                      </p>
                    </div>
                  )}

                  {product.sizes_available && (
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <h3 className="font-semibold mb-2 text-slate-900">Available Sizes</h3>
                      <p className="text-slate-700" data-testid="product-sizes">
                        {product.sizes_available}
                      </p>
                    </div>
                  )}

                  {product.tags && product.tags.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2 text-slate-900">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {product.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="bg-slate-200 text-slate-700">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="bg-white border-t mt-12">
        <div className="max-w-6xl mx-auto px-6 py-6 text-center">
          <p className="text-slate-600">© 2025 HT Activewear. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;