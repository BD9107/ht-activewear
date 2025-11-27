import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock, Store } from 'lucide-react';

const Login = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if already authenticated
    if (isAuthenticated) {
      navigate('/admin');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await login(password);
    
    if (result.success) {
      navigate('/admin');
    } else {
      setError(result.error);
      setPassword('');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-slate-50 p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <Store className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">HT Activewear</h1>
          <p className="text-slate-600">Catalog Management System</p>
        </div>

        {/* Login Card */}
        <Card className="shadow-xl border-slate-200">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-bold text-center text-slate-900">
              Admin Login
            </CardTitle>
            <CardDescription className="text-center text-base">
              Enter your password to access the admin area
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-base font-medium text-slate-700">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="w-full h-12 pl-11 text-base border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                    data-testid="password-input"
                    autoFocus
                  />
                </div>
              </div>
              
              {error && (
                <Alert variant="destructive" className="border-red-200 bg-red-50" data-testid="error-message">
                  <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
              )}
              
              <Button 
                type="submit" 
                className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700 shadow-md" 
                disabled={isLoading || !password}
                data-testid="login-button"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Logging in...
                  </span>
                ) : (
                  'Log in'
                )}
              </Button>
            </form>
            
            <div className="mt-6 pt-6 border-t border-slate-200">
              <Button
                variant="ghost"
                onClick={() => navigate('/catalog')}
                className="w-full text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              >
                <Store className="w-4 h-4 mr-2" />
                View Public Catalog
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-slate-500 mt-6">
          © 2025 HT Activewear. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;
