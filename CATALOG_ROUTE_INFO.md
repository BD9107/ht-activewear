# Catalog Route Configuration

## Current Routes

### React Router Configuration
**File:** `/app/frontend/src/App.js`

```javascript
<Routes>
  {/* Root redirects to catalog */}
  <Route path="/" element={<Navigate to="/catalog" replace />} />
  
  {/* Public Routes */}
  <Route path="/login" element={<Login />} />
  <Route path="/catalog" element={<Catalog />} />
  <Route path="/catalog/:id" element={<ProductDetail />} />
  
  {/* Protected Routes */}
  <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
  <Route path="/admin/catalog" element={<ProtectedRoute><AdminCatalog /></ProtectedRoute>} />
  <Route path="/order" element={<ProtectedRoute><Order /></ProtectedRoute>} />
</Routes>
```

### Root Route Behavior
- **`/`** → Redirects to `/catalog`
- **`/catalog`** → Public product catalog (Catalog component)

---

## API Endpoint Being Called

**Component:** `/app/frontend/src/pages/Catalog.js`

**Endpoint Configuration:**
```javascript
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Product list endpoint
const response = await axios.get(`${API}/products`);
```

**Full Endpoint Path:**
```
GET ${REACT_APP_BACKEND_URL}/api/products
```

**Example:**
```
GET https://ht-activewear-catalog.onrender.com/api/products
```

---

## Product Display Logic

### When Products Exist
- Shows a responsive grid of product cards
- Each card shows: image, category badge, name, code, description, colors
- Cards link to product detail page: `/catalog/:id`

### When Product List is Empty `[]`
Shows friendly empty state:
```
"No products in the catalog yet"
"Check back soon for new arrivals!"
```

### When HTTP Request Fails
Shows error state only for:
- Network errors (can't connect)
- 4xx errors (client error)
- 5xx errors (server error)

Error messages:
- `"Failed to load products (404)"` - API endpoint not found
- `"Failed to load products (500)"` - Server error
- `"Unable to connect to server"` - Network error

---

## SPA Routing Fix for Render

**File Created:** `/app/frontend/public/_redirects`

```
/*    /index.html   200
```

This ensures that when users directly visit `/catalog` on the deployed site, Render serves `index.html` and lets React Router handle the routing (instead of returning 404 from the server).

---

## Files Defining /catalog Route

1. **Route Definition:**
   - `/app/frontend/src/App.js` (line 25)

2. **Component Implementation:**
   - `/app/frontend/src/pages/Catalog.js` (entire file)

3. **SPA Routing Support:**
   - `/app/frontend/public/_redirects` (new file)

---

## Testing the Routes

### Local Testing
```bash
# Root should redirect to catalog
curl -L http://localhost:3000/ | grep "HT Activewear Catalog"

# Catalog route
curl http://localhost:3000/catalog | grep "HT Activewear Catalog"
```

### Production Testing
```bash
# Backend API
curl https://ht-activewear-catalog.onrender.com/api/products

# Frontend catalog (after deployment)
# Visit: https://your-frontend.onrender.com/catalog
```

---

## Deployment Notes

After pushing these changes:

1. **Frontend will rebuild** on Render
2. The `_redirects` file will be included in the build
3. Client-side routing will work properly
4. Accessing `/catalog` directly will load correctly (no more 404)

**Expected Result:**
- ✅ `/` → Shows catalog
- ✅ `/catalog` → Shows catalog
- ✅ `/login` → Shows login page
- ✅ `/admin` → Shows admin dashboard (if authenticated)
