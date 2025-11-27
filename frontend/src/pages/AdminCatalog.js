import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { ArrowLeft, LogOut, Edit, Plus, Save, ChevronDown, ChevronUp, Grid3x3, List, ArrowUp, ArrowDown, ShoppingBag, X } from 'lucide-react';
import { PRODUCT_CATEGORIES, PRODUCT_COLORS, PRODUCT_SIZES } from '../constants/productConstants';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminCatalog = () => {
  const { logout, getAuthHeader } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    category: '',
    description: '',
    colors: [],
    sizes_available: [],
    main_image_url: '',
    is_published: true,
    sort_order: 100,
    tags: ''
  });

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formExpanded, setFormExpanded] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [sortMode, setSortMode] = useState('custom');
  const [imageErrors, setImageErrors] = useState({});

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API}/products`, {
        headers: getAuthHeader()
      });
      setProducts(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive"
      });
    }
  };

  const getSortedProducts = () => {
    const sorted = [...products];
    if (sortMode === 'custom') {
      sorted.sort((a, b) => {
        if (a.sort_order !== b.sort_order) {
          return a.sort_order - b.sort_order;
        }
        return new Date(b.created_at) - new Date(a.created_at);
      });
    } else if (sortMode === 'newest') {
      sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (sortMode === 'oldest') {
      sorted.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    }
    return sorted;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      category: '',
      description: '',
      colors: [],
      sizes_available: [],
      main_image_url: '',
      is_published: true,
      sort_order: 100,
      tags: ''
    });
  };

  const handleSave = async (clearAfter = false) => {
    if (!formData.name || !formData.code || !formData.category || !formData.description || !formData.main_image_url) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        colors: Array.isArray(formData.colors) ? formData.colors.join(' / ') : formData.colors,
        sizes_available: Array.isArray(formData.sizes_available) ? formData.sizes_available.join(', ') : formData.sizes_available,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(t => t) : []
      };

      await axios.post(`${API}/products`, payload, {
        headers: getAuthHeader()
      });

      toast({
        title: "Success",
        description: "Product saved successfully"
      });

      fetchProducts();
      
      if (clearAfter) {
        resetForm();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to save product",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublish = async (product) => {
    try {
      await axios.put(
        `${API}/products/${product.id}`,
        { is_published: !product.is_published },
        { headers: getAuthHeader() }
      );

      toast({
        title: "Success",
        description: `Product ${!product.is_published ? 'published' : 'unpublished'}`
      });

      fetchProducts();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive"
      });
    }
  };

  const openEditModal = (product) => {
    setEditingProduct({
      ...product,
      colors: product.colors ? product.colors.split(' / ').map(c => c.trim()) : [],
      sizes_available: product.sizes_available ? product.sizes_available.split(',').map(s => s.trim()) : [],
      tags: product.tags ? product.tags.join(', ') : ''
    });
    setEditModalOpen(true);
  };

  const handleEditSave = async () => {
    if (!editingProduct.name || !editingProduct.code || !editingProduct.category || 
        !editingProduct.description || !editingProduct.main_image_url) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const payload = {
        ...editingProduct,
        colors: Array.isArray(editingProduct.colors) ? editingProduct.colors.join(' / ') : editingProduct.colors,
        sizes_available: Array.isArray(editingProduct.sizes_available) ? editingProduct.sizes_available.join(', ') : editingProduct.sizes_available,
        tags: editingProduct.tags ? editingProduct.tags.split(',').map(t => t.trim()).filter(t => t) : []
      };
      delete payload.id;
      delete payload.created_at;
      delete payload.updated_at;

      await axios.put(
        `${API}/products/${editingProduct.id}`,
        payload,
        { headers: getAuthHeader() }
      );

      toast({
        title: "Success",
        description: "Product updated successfully"
      });

      setEditModalOpen(false);
      setEditingProduct(null);
      fetchProducts();
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to update product",
        variant: "destructive"
      });
    }
  };

  const moveProduct = async (index, direction) => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= products.length) return;

    const items = Array.from(products);
    [items[index], items[newIndex]] = [items[newIndex], items[index]];
    setProducts(items);

    const updates = items.map((product, idx) => ({
      product_id: product.id,
      sort_order: idx * 10
    }));

    try {
      await axios.post(`${API}/products/bulk-sort-order`, updates, {
        headers: getAuthHeader()
      });

      toast({
        title: "Success",
        description: "Product order updated"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update order",
        variant: "destructive"
      });
      fetchProducts();
    }
  };

  const handleImageError = (productId) => {
    setImageErrors(prev => ({ ...prev, [productId]: true }));
  };

  const toggleColor = (color) => {
    setFormData(prev => {
      const colors = Array.isArray(prev.colors) ? prev.colors : [];
      if (colors.includes(color)) {
        return { ...prev, colors: colors.filter(c => c !== color) };
      } else {
        return { ...prev, colors: [...colors, color] };
      }
    });
  };

  const removeColor = (color) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.filter(c => c !== color)
    }));
  };

  const toggleSize = (size) => {
    setFormData(prev => {
      const sizes = Array.isArray(prev.sizes_available) ? prev.sizes_available : [];
      if (sizes.includes(size)) {
        return { ...prev, sizes_available: sizes.filter(s => s !== size) };
      } else {
        return { ...prev, sizes_available: [...sizes, size] };
      }
    });
  };

  const removeSize = (size) => {
    setFormData(prev => ({
      ...prev,
      sizes_available: prev.sizes_available.filter(s => s !== size)
    }));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50">
      <Toaster />
      
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Button 
                onClick={() => navigate('/admin')} 
                variant="ghost"
                size="lg"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back
              </Button>
              <h1 className="text-2xl font-bold text-slate-900" data-testid="admin-catalog-page-title">
                Manage Catalog
              </h1>
            </div>
            <Button onClick={handleLogout} variant="outline" size="lg">
              <LogOut className="w-5 h-5 mr-2" />
              Log out
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <Card className="mb-8 shadow-lg border-2">
          <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => setFormExpanded(!formExpanded)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Plus className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Add New Product</CardTitle>
                  <CardDescription>Click to {formExpanded ? 'collapse' : 'expand'} the form</CardDescription>
                </div>
              </div>
              {formExpanded ? <ChevronUp className="w-6 h-6 text-slate-400" /> : <ChevronDown className="w-6 h-6 text-slate-400" />}
            </div>
          </CardHeader>
          
          {formExpanded && (
            <CardContent className="pt-6 border-t">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name" className="text-base">Product Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="e.g. Classic Football Jersey"
                      className="mt-2 h-12 text-base"
                      data-testid="product-name-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="code" className="text-base">Product Code *</Label>
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => handleInputChange('code', e.target.value)}
                      placeholder="e.g. JER-001"
                      className="mt-2 h-12 text-base"
                      data-testid="product-code-input"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="category" className="text-base">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger className="mt-2 h-12 text-base" data-testid="category-select">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRODUCT_CATEGORIES.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="description" className="text-base">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Detailed product description..."
                    className="mt-2 min-h-32 text-base"
                    data-testid="product-description-input"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-base">Available Colors</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start h-12 mt-2"
                        >
                          {formData.colors.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {formData.colors.map(color => (
                                <Badge key={color} variant="secondary" className="text-xs">
                                  {color}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-500">Select colors...</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64 p-3">
                        <div className="space-y-2">
                          <p className="text-sm font-medium mb-2">Select Colors</p>
                          <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                            {PRODUCT_COLORS.map(color => (
                              <div key={color} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`color-${color}`}
                                  checked={formData.colors.includes(color)}
                                  onCheckedChange={() => toggleColor(color)}
                                />
                                <label
                                  htmlFor={`color-${color}`}
                                  className="text-sm cursor-pointer flex-1"
                                >
                                  {color}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                    {formData.colors.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.colors.map(color => (
                          <Badge key={color} variant="secondary" className="text-xs">
                            {color}
                            <button
                              onClick={() => removeColor(color)}
                              className="ml-1 hover:text-red-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <Label className="text-base">Available Sizes</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start h-12 mt-2"
                        >
                          {formData.sizes_available.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {formData.sizes_available.map(size => (
                                <Badge key={size} variant="secondary" className="text-xs">
                                  {size}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-500">Select sizes...</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64 p-3">
                        <div className="space-y-2">
                          <p className="text-sm font-medium mb-2">Select Sizes</p>
                          <div className="grid grid-cols-2 gap-2">
                            {PRODUCT_SIZES.map(size => (
                              <div key={size} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`size-${size}`}
                                  checked={formData.sizes_available.includes(size)}
                                  onCheckedChange={() => toggleSize(size)}
                                />
                                <label
                                  htmlFor={`size-${size}`}
                                  className="text-sm cursor-pointer flex-1"
                                >
                                  {size}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                    {formData.sizes_available.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.sizes_available.map(size => (
                          <Badge key={size} variant="secondary" className="text-xs">
                            {size}
                            <button
                              onClick={() => removeSize(size)}
                              className="ml-1 hover:text-red-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="image" className="text-base">Main Image URL *</Label>
                  <Input
                    id="image"
                    value={formData.main_image_url}
                    onChange={(e) => handleInputChange('main_image_url', e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="mt-2 h-12 text-base"
                    data-testid="product-image-input"
                  />
                  <p className="text-sm text-slate-500 mt-1">Enter the full URL to the product image</p>
                </div>

                <div>
                  <Label htmlFor="tags" className="text-base">Tags</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => handleInputChange('tags', e.target.value)}
                    placeholder="e.g. Football, Basketball, School"
                    className="mt-2 h-12 text-base"
                  />
                  <p className="text-sm text-slate-500 mt-1">Separate tags with commas</p>
                </div>

                <div className="flex items-center space-x-3 p-4 border rounded-lg bg-slate-50">
                  <Switch
                    id="published"
                    checked={formData.is_published}
                    onCheckedChange={(checked) => handleInputChange('is_published', checked)}
                    data-testid="publish-toggle"
                  />
                  <Label htmlFor="published" className="text-base cursor-pointer">
                    Show in catalog?
                  </Label>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    onClick={() => handleSave(false)}
                    disabled={loading}
                    size="lg"
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    data-testid="save-button"
                  >
                    <Save className="w-5 h-5 mr-2" />
                    {loading ? 'Saving...' : 'Save'}
                  </Button>
                  <Button
                    onClick={() => handleSave(true)}
                    disabled={loading}
                    variant="outline"
                    size="lg"
                    className="flex-1"
                    data-testid="save-add-new-button"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Save & Add New
                  </Button>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        <Card className="shadow-lg border-2">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-2xl">Products ({products.length})</CardTitle>
                <CardDescription>Manage your product catalog</CardDescription>
              </div>
              <div className="flex gap-4 items-center">
                {/* Sort Mode Toggle */}
                <Select value={sortMode} onValueChange={setSortMode}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">Custom Order</SelectItem>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                  </SelectContent>
                </Select>
                
                {/* View Mode Toggle */}
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className={viewMode === 'grid' ? 'bg-blue-600' : ''}
                  >
                    <Grid3x3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className={viewMode === 'list' ? 'bg-blue-600' : ''}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {products.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 text-lg">No products yet</p>
                <p className="text-slate-500 text-sm mt-2">Add your first product using the form above.</p>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4' : 'space-y-2'}>
                {getSortedProducts().map((product, index) => (
                  <div key={product.id} data-testid={`product-item-${product.id}`}>
                    {viewMode === 'grid' ? (
                      <Card className="overflow-hidden hover:shadow-lg transition-shadow border-2">
                        <div className="aspect-square bg-slate-100 overflow-hidden relative">
                          {!imageErrors[product.id] ? (
                            <img
                              src={product.main_image_url}
                              alt={product.name}
                              className="w-full h-full object-cover"
                              onError={() => handleImageError(product.id)}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-100">
                              <ShoppingBag className="w-12 h-12 text-slate-300" />
                            </div>
                          )}
                          {sortMode === 'custom' && (
                            <div className="absolute top-2 right-2 flex gap-1">
                              <Button
                                size="sm"
                                variant="secondary"
                                className="h-8 w-8 p-0"
                                onClick={() => moveProduct(index, 'up')}
                                disabled={index === 0}
                              >
                                <ArrowUp className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="secondary"
                                className="h-8 w-8 p-0"
                                onClick={() => moveProduct(index, 'down')}
                                disabled={index === products.length - 1}
                              >
                                <ArrowDown className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                        <CardContent className="p-3">
                          <Badge variant="outline" className="mb-2 text-xs bg-blue-50 text-blue-700 border-blue-200">{product.category}</Badge>
                          <h3 className="font-semibold text-sm mb-1 truncate">{product.name}</h3>
                          <p className="text-xs text-slate-600 mb-2">{product.code}</p>
                          
                          <div className="flex items-center justify-between mb-2 p-2 bg-slate-50 rounded text-xs">
                            <span className="font-medium">Visible:</span>
                            <Switch
                              checked={product.is_published}
                              onCheckedChange={() => handleTogglePublish(product)}
                              data-testid={`publish-toggle-${product.id}`}
                            />
                          </div>

                          <Button
                            onClick={() => openEditModal(product)}
                            className="w-full text-xs bg-blue-600 hover:bg-blue-700"
                            size="sm"
                            data-testid={`edit-button-${product.id}`}
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="flex items-center gap-4 p-4 bg-white border-2 rounded-lg hover:shadow-md transition-shadow">
                        {sortMode === 'custom' && (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0"
                              onClick={() => moveProduct(index, 'up')}
                              disabled={index === 0}
                            >
                              <ArrowUp className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0"
                              onClick={() => moveProduct(index, 'down')}
                              disabled={index === products.length - 1}
                            >
                              <ArrowDown className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                        {!imageErrors[product.id] ? (
                          <img
                            src={product.main_image_url}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded"
                            onError={() => handleImageError(product.id)}
                          />
                        ) : (
                          <div className="w-16 h-16 flex items-center justify-center bg-slate-100 rounded">
                            <ShoppingBag className="w-8 h-8 text-slate-300" />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">{product.category}</Badge>
                            <h3 className="font-semibold">{product.name}</h3>
                          </div>
                          <p className="text-sm text-slate-600">{product.code}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-600">Visible:</span>
                            <Switch
                              checked={product.is_published}
                              onCheckedChange={() => handleTogglePublish(product)}
                            />
                          </div>
                          <Button
                            onClick={() => openEditModal(product)}
                            variant="outline"
                            size="sm"
                            className="border-blue-200 text-blue-600 hover:bg-blue-50"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Edit Product</DialogTitle>
            <DialogDescription>Update product details</DialogDescription>
          </DialogHeader>
          
          {editingProduct && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Product Name *</Label>
                  <Input
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Product Code *</Label>
                  <Input
                    value={editingProduct.code}
                    onChange={(e) => setEditingProduct({...editingProduct, code: e.target.value})}
                    className="mt-2"
                  />
                </div>
              </div>

              <div>
                <Label>Category *</Label>
                <Select 
                  value={editingProduct.category} 
                  onValueChange={(value) => setEditingProduct({...editingProduct, category: value})}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRODUCT_CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Description *</Label>
                <Textarea
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                  className="mt-2 min-h-24"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Colors</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start mt-2"
                      >
                        {editingProduct.colors && editingProduct.colors.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {editingProduct.colors.map(color => (
                              <Badge key={color} variant="secondary" className="text-xs">
                                {color}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-500">Select colors...</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-3">
                      <div className="space-y-2">
                        <p className="text-sm font-medium mb-2">Select Colors</p>
                        <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                          {PRODUCT_COLORS.map(color => (
                            <div key={color} className="flex items-center space-x-2">
                              <Checkbox
                                id={`edit-color-${color}`}
                                checked={editingProduct.colors?.includes(color)}
                                onCheckedChange={() => {
                                  const colors = editingProduct.colors || [];
                                  if (colors.includes(color)) {
                                    setEditingProduct({
                                      ...editingProduct,
                                      colors: colors.filter(c => c !== color)
                                    });
                                  } else {
                                    setEditingProduct({
                                      ...editingProduct,
                                      colors: [...colors, color]
                                    });
                                  }
                                }}
                              />
                              <label
                                htmlFor={`edit-color-${color}`}
                                className="text-sm cursor-pointer flex-1"
                              >
                                {color}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                  {editingProduct.colors && editingProduct.colors.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {editingProduct.colors.map(color => (
                        <Badge key={color} variant="secondary" className="text-xs">
                          {color}
                          <button
                            onClick={() => setEditingProduct({
                              ...editingProduct,
                              colors: editingProduct.colors.filter(c => c !== color)
                            })}
                            className="ml-1 hover:text-red-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <Label>Sizes</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start mt-2"
                      >
                        {editingProduct.sizes_available && editingProduct.sizes_available.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {editingProduct.sizes_available.map(size => (
                              <Badge key={size} variant="secondary" className="text-xs">
                                {size}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-500">Select sizes...</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-3">
                      <div className="space-y-2">
                        <p className="text-sm font-medium mb-2">Select Sizes</p>
                        <div className="grid grid-cols-2 gap-2">
                          {PRODUCT_SIZES.map(size => (
                            <div key={size} className="flex items-center space-x-2">
                              <Checkbox
                                id={`edit-size-${size}`}
                                checked={editingProduct.sizes_available?.includes(size)}
                                onCheckedChange={() => {
                                  const sizes = editingProduct.sizes_available || [];
                                  if (sizes.includes(size)) {
                                    setEditingProduct({
                                      ...editingProduct,
                                      sizes_available: sizes.filter(s => s !== size)
                                    });
                                  } else {
                                    setEditingProduct({
                                      ...editingProduct,
                                      sizes_available: [...sizes, size]
                                    });
                                  }
                                }}
                              />
                              <label
                                htmlFor={`edit-size-${size}`}
                                className="text-sm cursor-pointer flex-1"
                              >
                                {size}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                  {editingProduct.sizes_available && editingProduct.sizes_available.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {editingProduct.sizes_available.map(size => (
                        <Badge key={size} variant="secondary" className="text-xs">
                          {size}
                          <button
                            onClick={() => setEditingProduct({
                              ...editingProduct,
                              sizes_available: editingProduct.sizes_available.filter(s => s !== size)
                            })}
                            className="ml-1 hover:text-red-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label>Image URL *</Label>
                <Input
                  value={editingProduct.main_image_url}
                  onChange={(e) => setEditingProduct({...editingProduct, main_image_url: e.target.value})}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Tags</Label>
                <Input
                  value={editingProduct.tags || ''}
                  onChange={(e) => setEditingProduct({...editingProduct, tags: e.target.value})}
                  placeholder="Separate with commas"
                  className="mt-2"
                />
              </div>

              <div className="flex items-center space-x-3 p-3 border rounded bg-slate-50">
                <Switch
                  checked={editingProduct.is_published}
                  onCheckedChange={(checked) => setEditingProduct({...editingProduct, is_published: checked})}
                />
                <Label>Show in catalog?</Label>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSave} data-testid="modal-save-button" className="bg-blue-600 hover:bg-blue-700">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCatalog;