# 🔧 Render Deployment Fix - MongoDB SSL Issue

## Problem
The production deployment on Render was failing with a MongoDB SSL handshake error:
```
pymongo.errors.ServerSelectionTimeoutError: SSL handshake failed
[SSL: TLSV1_ALERT_INTERNAL_ERROR] tlsv1 alert internal error
```

This was caused by Python 3.13's stricter SSL requirements combined with outdated `motor` and `pymongo` versions.

## Solution Applied

### 1. Updated Dependencies ✅
**File: `/app/backend/requirements.txt`**
- Upgraded `motor` from `3.3.1` → `3.6.0`
- Removed hardcoded `pymongo` version (now auto-resolved by motor)

### 2. Added Conditional SSL/TLS Support ✅
**File: `/app/backend/server.py`**
- Added intelligent SSL detection for MongoDB Atlas connections
- Local MongoDB (localhost) uses no SSL
- Remote MongoDB (Atlas with `mongodb.net` or `mongodb+srv://`) uses SSL/TLS
- Reduced server selection timeout to 5 seconds for faster failure detection

## 🚀 Deployment Steps for Render

### Step 1: Push Updated Code to GitHub
```bash
# From your local machine
git add backend/requirements.txt backend/server.py
git commit -m "Fix MongoDB SSL handshake for Python 3.13"
git push origin catalog-version
```

### Step 2: Verify Render Environment Variables

**Backend Service** must have:
```
MONGO_URL=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority
DB_NAME=your_database_name
CORS_ORIGINS=https://your-frontend-url.onrender.com
ADMIN_PASSWORD=66HTAdmin
JWT_SECRET_KEY=your-production-secret-key
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24
```

**Frontend Service** must have:
```
REACT_APP_BACKEND_URL=https://ht-activewear-catalog.onrender.com
```

### Step 3: Trigger Redeploy
1. Go to your Render dashboard
2. Navigate to your **backend service**
3. Click **"Manual Deploy" → "Deploy latest commit"**
4. Wait for the build to complete (~2-3 minutes)

### Step 4: Verify Deployment
Once deployed, test the API:
```bash
curl https://ht-activewear-catalog.onrender.com/api/products
```

You should see a JSON array of products (not a 404 or 500 error).

## 🔍 Troubleshooting

### If you still see SSL errors:
1. **Check MongoDB Connection String Format**
   - Must start with `mongodb+srv://` for Atlas
   - Must include proper credentials
   - Test the connection string with MongoDB Compass first

2. **Check Python Version on Render**
   - Should be Python 3.11+ (ideally 3.12 or 3.13)
   - Render should auto-detect from `runtime.txt` or `requirements.txt`

3. **Check Backend Logs**
   - In Render dashboard → Backend Service → Logs
   - Look for startup errors or connection failures

### If connection times out:
- Your MongoDB Atlas cluster might have IP whitelist restrictions
- In MongoDB Atlas, add `0.0.0.0/0` to allow connections from anywhere
- Or add Render's outbound IPs to your whitelist

## ✅ Expected Results
- Products load on `/catalog` page
- Admin login works at `/login`
- Admin catalog management works at `/admin/catalog`
- No 404 errors
- No SSL handshake errors

## 📋 Next Steps
After confirming the fix works in production:
1. Test the full admin workflow
2. Add a product via `/admin/catalog`
3. Verify it appears on `/catalog`
4. Ready to implement **Multiple Images Feature** next!
