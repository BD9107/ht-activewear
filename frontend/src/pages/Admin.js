import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, ClipboardList, LogOut } from 'lucide-react';

const Admin = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-5xl mx-auto px-6 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900" data-testid="admin-page-title">
              HT Activewear Admin
            </h1>
            <p className="text-slate-600 mt-1">Welcome back! Choose an option below.</p>
          </div>
          <Button 
            onClick={handleLogout} 
            variant="outline" 
            size="lg"
            className="flex items-center gap-2"
            data-testid="logout-button"
          >
            <LogOut className="w-5 h-5" />
            Log out
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Order Form Card */}
          <Card 
            className="cursor-pointer hover:shadow-2xl hover:scale-105 transition-all duration-200 border-2 hover:border-blue-400 shadow-lg"
            onClick={() => navigate('/order')}
            data-testid="order-form-card"
          >
            <CardHeader className="pb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-4">
                <ClipboardList className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle className="text-3xl font-bold text-slate-900">Order Form</CardTitle>
              <CardDescription className="text-lg mt-2">
                Create and manage customer orders
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-slate-600 text-base leading-relaxed">
                Process new orders, track existing orders, and manage your customer order workflow efficiently.
              </p>
              <div className="mt-6 pt-4 border-t border-slate-200">
                <span className="text-blue-600 font-semibold text-lg">
                  Tap to open →
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Manage Catalog Card */}
          <Card 
            className="cursor-pointer hover:shadow-2xl hover:scale-105 transition-all duration-200 border-2 hover:border-green-400 shadow-lg"
            onClick={() => navigate('/admin/catalog')}
            data-testid="manage-catalog-card"
          >
            <CardHeader className="pb-4">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-4">
                <Package className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-3xl font-bold text-slate-900">Manage Catalog</CardTitle>
              <CardDescription className="text-lg mt-2">
                Edit products and inventory
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-slate-600 text-base leading-relaxed">
                Add new products, update existing items, manage pricing, images, and control product visibility.
              </p>
              <div className="mt-6 pt-4 border-t border-slate-200">
                <span className="text-green-600 font-semibold text-lg">
                  Tap to open →
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Links Section */}
        <div className="mt-8">
          <Card 
            className="cursor-pointer hover:shadow-xl transition-shadow border-2 border-slate-200 hover:border-blue-300 shadow-lg"
            onClick={() => window.open('/catalog', '_blank')}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                    <Package className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-slate-900">View Public Catalog</h3>
                    <p className="text-sm text-slate-600">See how customers view your products</p>
                  </div>
                </div>
                <span className="text-blue-600 font-semibold">→</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t mt-12">
        <div className="max-w-5xl mx-auto px-6 py-6 text-center">
          <p className="text-slate-600">© 2025 HT Activewear. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Admin;
