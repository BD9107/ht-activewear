import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading product...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-red-600 mb-4">{error}</div>
          <Button onClick={() => navigate('/catalog')}>Back to Catalog</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        <Button 
          onClick={() => navigate('/catalog')} 
          variant="ghost" 
          className="mb-6"
        >
          ← Back to Catalog
        </Button>

        <Card>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Product Image */}
              <div className="aspect-square bg-slate-200 rounded-lg overflow-hidden">
                <img 
                  src={product.main_image_url} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/600x600?text=Product+Image';
                  }}
                  data-testid="product-image"
                />
              </div>

              {/* Product Details */}
              <div>
                <Badge variant="outline" className="mb-4">
                  {product.category}
                </Badge>
                <h1 className="text-3xl font-bold mb-2" data-testid="product-name">
                  {product.name}
                </h1>
                <p className="text-slate-600 mb-6" data-testid="product-code">
                  Product Code: {product.code}
                </p>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-slate-700" data-testid="product-description">
                      {product.description}
                    </p>
                  </div>

                  {product.colors && (
                    <div>
                      <h3 className="font-semibold mb-2">Available Colors</h3>
                      <p className="text-slate-700" data-testid="product-colors">
                        {product.colors}
                      </p>
                    </div>
                  )}

                  {product.sizes_available && (
                    <div>
                      <h3 className="font-semibold mb-2">Available Sizes</h3>
                      <p className="text-slate-700" data-testid="product-sizes">
                        {product.sizes_available}
                      </p>
                    </div>
                  )}

                  {product.tags && product.tags.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {product.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary">
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
    </div>
  );
};

export default ProductDetail;
