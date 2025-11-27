# Authentication System Documentation

## Overview
This project implements a simple password-based authentication system to protect internal admin pages while keeping the public catalog accessible to everyone.

## Environment Variables

### Backend (.env)
Located at: `/app/backend/.env`

```env
ADMIN_PASSWORD="htadmin2024"
JWT_SECRET_KEY="your-secret-key-change-this-in-production-12345"
JWT_ALGORITHM="HS256"
JWT_EXPIRATION_HOURS="24"
```

**Important**: Change `ADMIN_PASSWORD` and `JWT_SECRET_KEY` to secure values in production!

## Backend Authentication Logic

### File: `/app/backend/server.py`

#### Key Components:

1. **Login Endpoint** (`POST /api/login`)
   - Accepts password in request body
   - Validates against `ADMIN_PASSWORD` environment variable
   - Returns JWT token on success
   - Returns 401 error on failure

2. **Token Verification Function** (`verify_token()`)
   - Used as a dependency in protected endpoints
   - Validates JWT token from Authorization header
   - Raises 401 error if token is invalid or missing

3. **Protected Endpoints** (require authentication):
   - `POST /api/products` - Create product
   - `PUT /api/products/{product_id}` - Update product
   - `DELETE /api/products/{product_id}` - Delete product

4. **Public Endpoints** (smart filtering):
   - `GET /api/products` - Returns only published products for unauthenticated users, all products for authenticated users
   - `GET /api/products/{product_id}` - Returns only if published for unauthenticated users, any product for authenticated users

#### How to Mark an Endpoint as "Requires Login":

Add `payload: dict = Depends(verify_token)` to the function parameters:

```python
@api_router.post("/products", response_model=Product)
async def create_product(
    product_input: ProductCreate,
    payload: dict = Depends(verify_token)  # This makes it protected
):
    # endpoint logic here
```

For optional authentication (to show different data based on auth status):

```python
@api_router.get("/products", response_model=List[Product])
async def get_products(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    # Check if authenticated
    is_authenticated = False
    if credentials:
        try:
            jwt.decode(credentials.credentials, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
            is_authenticated = True
        except JWTError:
            pass
    
    # Return different data based on authentication
    query = {} if is_authenticated else {"is_published": True}
    # ... rest of logic
```

## Frontend Authentication Logic

### Key Files:

#### 1. `/app/frontend/src/contexts/AuthContext.js`
- Manages authentication state globally
- Stores JWT token in localStorage
- Provides login/logout functions
- Provides `getAuthHeader()` for API calls

#### 2. `/app/frontend/src/components/ProtectedRoute.js`
- Wrapper component for protected routes
- Redirects to `/login` if user is not authenticated
- Shows loading state while checking authentication

#### 3. `/app/frontend/src/pages/Login.js`
- Login form with password input
- Calls `POST /api/login` endpoint
- Stores token on success
- Shows error message on failure
- Redirects to `/admin` after successful login

### Route Configuration

In `/app/frontend/src/App.js`:

```javascript
// Public Routes (accessible without login)
<Route path="/login" element={<Login />} />
<Route path="/catalog" element={<Catalog />} />
<Route path="/catalog/:id" element={<ProductDetail />} />

// Protected Routes (require login)
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
```

#### How to Mark a Route as "Requires Login":

Simply wrap the component in `<ProtectedRoute>`:

```javascript
<Route 
  path="/your-protected-page" 
  element={
    <ProtectedRoute>
      <YourComponent />
    </ProtectedRoute>
  } 
/>
```

### Making Authenticated API Calls

Use the `getAuthHeader()` function from AuthContext:

```javascript
import { useAuth } from '../contexts/AuthContext';

const MyComponent = () => {
  const { getAuthHeader } = useAuth();
  
  const fetchProtectedData = async () => {
    const response = await axios.post(
      `${API}/products`,
      productData,
      { headers: getAuthHeader() }  // Adds Authorization header with token
    );
  };
};
```

## Testing the Authentication

### 1. Test Login API:
```bash
# Correct password
curl -X POST http://localhost:8001/api/login \
  -H "Content-Type: application/json" \
  -d '{"password": "htadmin2024"}'

# Wrong password
curl -X POST http://localhost:8001/api/login \
  -H "Content-Type: application/json" \
  -d '{"password": "wrongpassword"}'
```

### 2. Test Protected Endpoint:
```bash
# Get token
TOKEN=$(curl -s -X POST http://localhost:8001/api/login \
  -H "Content-Type: application/json" \
  -d '{"password": "htadmin2024"}' | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

# Use token to create product
curl -X POST http://localhost:8001/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Test Product",
    "code": "TST-001",
    "category": "Jersey",
    "description": "Test",
    "main_image_url": "https://example.com/test.jpg"
  }'
```

### 3. Test Public vs Authenticated Access:
```bash
# Public access (no token) - only returns published products
curl -s http://localhost:8001/api/products

# Authenticated access (with token) - returns all products
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:8001/api/products
```

## Security Notes

1. **Change Default Password**: Update `ADMIN_PASSWORD` in `/app/backend/.env`
2. **Change JWT Secret**: Update `JWT_SECRET_KEY` in `/app/backend/.env`
3. **Token Expiration**: Tokens expire after 24 hours (configurable via `JWT_EXPIRATION_HOURS`)
4. **HTTPS**: In production, always use HTTPS to protect tokens in transit
5. **Password Storage**: Currently using single shared password - consider implementing user accounts for multi-user scenarios

## Default Credentials

**Password**: `htadmin2024`

⚠️ **IMPORTANT**: Change this immediately by updating the `ADMIN_PASSWORD` value in `/app/backend/.env`

## Flow Diagram

```
User visits /admin
    ↓
ProtectedRoute checks authentication
    ↓
Not authenticated → Redirect to /login
    ↓
User enters password
    ↓
POST /api/login
    ↓
Backend validates password
    ↓
Returns JWT token
    ↓
Frontend stores token in localStorage
    ↓
User redirected to /admin
    ↓
All protected routes now accessible
    ↓
API calls include Authorization header
```
