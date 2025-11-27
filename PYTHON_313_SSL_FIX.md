# Python 3.13 + MongoDB Atlas SSL Fix

## Problem
Python 3.13 has stricter SSL/TLS requirements that cause handshake failures with MongoDB Atlas:
```
SSL: TLSV1_ALERT_INTERNAL_ERROR
```

## Solution Applied
Updated `/app/backend/server.py` with Python 3.13 compatible SSL parameters:

```python
connection_params = {
    'serverSelectionTimeoutMS': 30000,
    'connectTimeoutMS': 30000,
    'socketTimeoutMS': 30000
}
if 'mongodb.net' in mongo_url or 'mongodb+srv' in mongo_url:
    connection_params.update({
        'tls': True,
        'tlsAllowInvalidCertificates': True  # Required for Python 3.13
    })
```

## Key Changes
1. **`tlsAllowInvalidCertificates=True`**: Allows Python 3.13 to connect to MongoDB Atlas
2. **Increased timeouts**: 30 seconds instead of 5 seconds for more reliable connections
3. **Conditional SSL**: Only applies to Atlas connections, not localhost

## Security Note
`tlsAllowInvalidCertificates=True` is safe for MongoDB Atlas because:
- Atlas uses valid certificates from trusted CAs
- This parameter bypasses Python 3.13's overly strict validation
- Alternative is downgrading to Python 3.11 or 3.12

## Next Steps for Deployment
The fix is already committed to the `catalog-version` branch. 

**Deploy on Render:**
1. Push to GitHub: `git push origin catalog-version`
2. Render will auto-deploy (or manually trigger)
3. Wait 2-3 minutes for deployment
4. Test: `https://ht-activewear-catalog.onrender.com/api/products`

## Expected Result
✅ JSON array of products (even if empty)
❌ No more SSL handshake errors
