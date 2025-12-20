# HT Activewear Order Form

A B2B/internal order intake system for HT Activewear with Airtable backend, admin dashboard, and audit trail.

## Features

- **Multi-step Order Form**: Customer details → Item selection → Review & submit
- **Dynamic Pricing**: Tiered pricing from Airtable, with order and customer discounts
- **Admin Dashboard**: PIN-protected settings management
- **Audit Trail**: Immutable logging of all admin changes with actor identity
- **PIN-per-User Authentication**: Secure admin access with bcrypt-hashed PINs
- **Email Notifications**: Order confirmations to customers and admin (optional)
- **Artwork Upload**: Google Drive integration for artwork files (optional)

## Tech Stack

- **Frontend**: React, Tailwind CSS, shadcn/ui
- **Backend**: FastAPI (Python)
- **Database**: Airtable
- **Authentication**: PIN-based with bcrypt hashing

## Project Structure

```
/app
├── backend/
│   ├── server.py           # FastAPI application
│   ├── seed_admin_users.py # One-time admin user seeding
│   ├── ADMIN_SETUP.md      # Admin setup documentation
│   ├── requirements.txt    # Python dependencies
│   └── .env               # Environment variables
├── frontend/
│   ├── src/
│   │   ├── pages/         # React page components
│   │   ├── components/    # Reusable UI components
│   │   └── utils/         # Utility functions
│   ├── public/            # Static assets
│   └── package.json       # Node dependencies
└── README.md              # This file
```

## Prerequisites

- Node.js 18+
- Python 3.11+
- Airtable account with API access

## Environment Setup

### Backend (.env)

```env
# Airtable Configuration (Required)
AIRTABLE_API_KEY=your_airtable_api_key
AIRTABLE_BASE_ID=your_base_id

# Google Drive Configuration (Optional)
GOOGLE_APPS_SCRIPT_URL=
GOOGLE_DRIVE_FOLDER_ID=

# Email Configuration (Optional)
SMTP_HOST=
SMTP_PORT=465
SMTP_USERNAME=
SMTP_PASSWORD=
SMTP_FROM_EMAIL=
SMTP_FROM_NAME=HT Activewear Orders
ADMIN_EMAIL=

# Display Settings
SHOW_PRICING=true
```

### Frontend (.env)

```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

## Airtable Setup

### Required Tables

1. **Orders** - Customer order records
2. **Order Items** - Line items for each order
3. **Garment Pricing** - Price tiers per garment type
4. **Order Discounts** - Bulk order discount rules
5. **Customer Discounts** - Customer-specific discounts
6. **Admin_Users** - Admin authentication (see below)
7. **Admin_Changes** - Audit log (auto-created)

### Admin_Users Table Structure

| Field | Type | Description |
|-------|------|-------------|
| User ID | Single line text | Unique identifier |
| Name | Single line text | Display name |
| Role | Single select | `operator` or `overwatch` |
| PIN Hash | Single line text | bcrypt hash |
| Active | Checkbox | Only active users can login |

## Installation

### Backend

```bash
cd backend
pip install -r requirements.txt
```

### Frontend

```bash
cd frontend
yarn install
```

## Running the Application

### Backend

```bash
cd backend
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

### Frontend

```bash
cd frontend
yarn start
```

## Admin Setup

After creating the Admin_Users table in Airtable:

```bash
cd backend
python seed_admin_users.py
```

This creates initial admin users:
- **System Overwatch** (PIN: 9107, role: overwatch)
- **Primary Operator** (PIN: 6666, role: operator)

See `backend/ADMIN_SETUP.md` for detailed instructions.

## API Endpoints

### Public
- `GET /api/settings` - Get all configuration data
- `GET /api/pricing` - Get pricing data
- `POST /api/submitOrder` - Submit a new order
- `POST /api/uploadArtwork` - Upload artwork file

### Admin (PIN required)
- `POST /api/admin/verify` - Verify admin PIN
- `GET /api/admin/activity` - Get audit logs
- `POST /api/admin/settings/general` - Update general settings
- `POST /api/admin/garments/price` - Update garment price
- `POST /api/admin/garments/status` - Toggle garment active status
- `POST /api/admin/discounts/bulk` - Update discount rule
- `POST /api/admin/discounts/bulk/create` - Create discount rule
- `POST /api/admin/discounts/bulk/delete` - Delete discount rule

## Routes

- `/` - Order form (public)
- `/admin` - Admin dashboard (PIN required)
- `/admin/activity` - Audit log viewer (PIN required)

## Security Notes

- Admin PINs are stored as bcrypt hashes (never plain text)
- All admin changes are logged with actor identity
- Audit logs are immutable
- Admin_Users table is never exposed to frontend

## License

Private / Proprietary
