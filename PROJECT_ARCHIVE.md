# HT Activewear Order Form - Project Archive

## Project State: COMPLETE & GitHub-Ready
**Archive Date:** December 20, 2025

---

## Quick Recall Message

Copy and paste this to continue working on this project:

```
Continue working on the HT Activewear Order Form project.

Current State: GitHub-ready, fully functional B2B order intake system.

Tech Stack:
- Frontend: React + Tailwind CSS + shadcn/ui (port 3000)
- Backend: FastAPI Python (port 8001)
- Database: Airtable

Key Features Implemented:
1. Multi-step order form (customer details → items → review)
2. Dynamic pricing from Airtable with tiered discounts
3. PIN-per-user admin authentication (bcrypt hashed, stored in Airtable Admin_Users table)
4. Admin dashboard for settings management
5. Immutable audit trail with actor identity (who made each change)
6. Email notifications (optional)
7. Google Drive artwork upload (optional)

Admin Access:
- PIN 9107 → System Overwatch (overwatch role)
- PIN 6666 → Primary Operator (operator role)

Key Files:
- Backend: /app/backend/server.py
- Admin auth: Uses Admin_Users Airtable table with bcrypt
- Frontend pages: /app/frontend/src/pages/
  - OrderForm.jsx (main form)
  - AdminDashboard.jsx (settings)
  - AdminActivity.jsx (audit logs)

Routes:
- / → Order form (public)
- /admin → Admin dashboard (PIN required)
- /admin/activity → Audit log viewer (PIN required)

No code changes needed. Project is production-ready.
```

---

## Detailed Technical Summary

### Architecture
```
/app
├── backend/
│   ├── server.py              # FastAPI app (all endpoints)
│   ├── seed_admin_users.py    # One-time admin seeding script
│   ├── ADMIN_SETUP.md         # Admin setup docs
│   ├── requirements.txt       # Python deps
│   └── .env.example           # Environment template
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── OrderForm.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   └── AdminActivity.jsx
│   │   ├── components/
│   │   └── utils/
│   └── .env.example           # Environment template
├── README.md                  # Full documentation
└── .gitignore                 # Clean gitignore
```

### Airtable Tables Required
1. Orders
2. Order Items
3. Garment Pricing
4. Order Discounts
5. Customer Discounts
6. Admin_Users (user_id, name, role, pin_hash, active)
7. Admin_Changes (audit log - auto-populated)

### API Endpoints
**Public:**
- GET /api/settings
- GET /api/pricing
- POST /api/submitOrder
- POST /api/uploadArtwork

**Admin (PIN required as query param):**
- POST /api/admin/verify
- GET /api/admin/activity
- POST /api/admin/settings/general
- POST /api/admin/garments/price
- POST /api/admin/garments/status
- POST /api/admin/discounts/bulk
- POST /api/admin/discounts/bulk/create
- POST /api/admin/discounts/bulk/delete

### Environment Variables
**Backend:**
- AIRTABLE_API_KEY (required)
- AIRTABLE_BASE_ID (required)
- SMTP_* (optional, for emails)
- GOOGLE_* (optional, for Drive uploads)

**Frontend:**
- REACT_APP_BACKEND_URL

### Recent Changes (This Session)
1. Implemented PIN-per-user authentication with Airtable Admin_Users table
2. Added bcrypt hashing for PINs (no plain text storage)
3. Added logged-in user display in admin topbar
4. Removed Emergent branding from index.html
5. Prepared GitHub-ready documentation

### What's NOT Implemented (By Design)
- No user management UI (admins added via Airtable directly)
- No JWT/OAuth/session system (PIN-only by design)
- No customer accounts (B2B internal use)

---

## To Resume Development

1. The project is fully functional as-is
2. To add new admin users: Add directly to Admin_Users table in Airtable with bcrypt-hashed PIN
3. To generate PIN hash: `python -c "import bcrypt; print(bcrypt.hashpw(b'YOUR_PIN', bcrypt.gensalt()).decode())"`

---
