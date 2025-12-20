# Admin_Users Table Setup Guide

## Step 1: Create Admin_Users Table in Airtable

Create a new table called `Admin_Users` with these fields:

| Field Name | Field Type | Notes |
|------------|------------|-------|
| User ID | Single line text | Unique identifier (e.g., "overwatch_001") |
| Name | Single line text | Display name (e.g., "System Overwatch") |
| Role | Single select | Options: `operator`, `overwatch` |
| PIN Hash | Single line text | bcrypt hash of the PIN |
| Active | Checkbox | Only checked users can authenticate |

## Step 2: Run the Seed Script

```bash
cd backend
python seed_admin_users.py
```

This will create:
- **System Overwatch** (PIN: 9107, role: overwatch)
- **Primary Operator** (PIN: 6666, role: operator)

## Step 3: Verify Authentication Works

Test with curl (replace YOUR_BACKEND_URL with your actual backend URL):
```bash
# Test overwatch user (PIN: 9107)
curl -X POST "http://localhost:8001/api/admin/verify" \
  -H "Content-Type: application/json" \
  -d '{"pin":"9107"}'

# Test operator user (PIN: 6666)
curl -X POST "http://localhost:8001/api/admin/verify" \
  -H "Content-Type: application/json" \
  -d '{"pin":"6666"}'
```

## Adding More Users

### Option A: Via Airtable UI
1. Go to Admin_Users table in Airtable
2. Add a new row with User ID, Name, Role
3. Generate PIN hash using:
   ```bash
   python -c "import bcrypt; print(bcrypt.hashpw(b'YOUR_PIN', bcrypt.gensalt()).decode())"
   ```
4. Paste the hash into PIN Hash field
5. Check the Active checkbox

### Option B: Via Script
1. Edit `seed_admin_users.py`
2. Add new user to `INITIAL_USERS` list
3. Run `python seed_admin_users.py`

## Security Notes

- PINs are NEVER stored in plain text
- bcrypt hashing is used with random salt
- Only Active=true users can authenticate
- Admin_Users table is never exposed to frontend
