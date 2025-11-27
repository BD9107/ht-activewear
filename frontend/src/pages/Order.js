import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';

const Order = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <Button 
              onClick={() => navigate('/admin')} 
              variant="ghost" 
              className="mb-2"
            >
              ← Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold" data-testid="order-page-title">
              Order Management
            </h1>
          </div>
          <Button onClick={handleLogout} variant="outline" data-testid="logout-button">
            Log out
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-slate-600">
            Order management interface will be implemented here.
            <br />
            You can view and manage customer orders from this page.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Order;
