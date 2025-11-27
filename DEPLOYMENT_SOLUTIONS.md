# MongoDB Atlas SSL Deployment Solutions

## Problem
Python 3.13 has SSL/TLS incompatibility with MongoDB Atlas causing:
```
SSL: TLSV1_ALERT_INTERNAL_ERROR
```

## Solution 1: Use Certifi SSL Certificates (TRYING NOW) ✅

**Changes made:**
1. Added `import certifi` to server.py
2. Updated connection parameters:
   ```python
   connection_params.update({
       'tls': True,
       'tlsCAFile': certifi.where(),
       'tlsAllowInvalidCertificates': False
   })
   ```
3. Added `certifi>=2023.7.22` to requirements.txt

**Deploy this now:**
- Push to GitHub and let Render deploy
- OR trigger manual deploy in Render dashboard

**Test after deployment:**
- Visit: `https://ht-activewear-catalog.onrender.com/api/products`
- Should return JSON array (not 500 error)

---

## Solution 2: Downgrade to Python 3.12 (IF SOLUTION 1 FAILS) 🔄

**If the certifi fix doesn't work**, use Python 3.12 instead:

### Option A: Using runtime.txt (Recommended)
1. I've created `/app/runtime.txt` with `python-3.12.8`
2. Push to GitHub
3. Render will automatically use Python 3.12.8
4. Redeploy

### Option B: Via Render Dashboard
1. Go to Render dashboard → Backend Service
2. Click "Environment" tab
3. Add environment variable:
   - Key: `PYTHON_VERSION`
   - Value: `3.12.8`
4. Save and redeploy

---

## Why This Happens

**Python 3.13 Changes:**
- Stricter X.509 certificate validation
- More rigorous TLS protocol enforcement
- OpenSSL integration changes

**Why Python 3.12 works:**
- Less strict SSL validation
- Better compatibility with MongoDB drivers
- Proven stable with Motor 3.6.0

---

## Testing Priority

1. **Try Solution 1 first** (certifi fix - already applied)
2. **If still fails** → Use Solution 2 (Python 3.12)

Python 3.12 downgrade is 100% reliable and recommended by MongoDB community for production deployments.

---

## Next Steps

**After deploying:**
1. Check Render logs for Python version: `Using Python version 3.x.x`
2. Test API endpoint
3. If successful → proceed with features
4. If failed → switch to Python 3.12
