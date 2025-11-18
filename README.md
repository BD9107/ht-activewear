# HT Activewear Order Form

A mobile-first order form system built for Samsung A9 (5:3 aspect ratio) with Airbnb-inspired clean design.

## 🎯 Features

### Order Form (3-Step Flow)
1. **Details Step**
   - Customer information (name, email, phone)
   - Order notes
   - Customization toggle with details
   - Artwork file upload to Google Drive

2. **Items Step**
   - Multiple item support (add/remove)
   - Garment type selection (T-Shirt, Hoodie, Polo, Tank, Jersey, Other)
   - Color selection (White, Black, Navy, Red, Royal, Grey, Custom)
   - Size grid with steppers (XS, S, M, L, XL, 2XL, 3XL)
   - Live item total calculation
   - Item-specific notes

3. **Review Step**
   - Complete order summary
   - Customer details
   - Customization information
   - Items with size breakdown (e.g., "S×5 • M×10 • L×5")
   - Order total quantity
   - Confirmation checkbox

### Success Page
- Order confirmation with order number
- Complete order summary
- Customer information
- Items with size breakdown
- Actions: New Order, Print, Share link

## 🛠️ Tech Stack

- **Frontend:** React, Tailwind CSS, Shadcn UI
- **Backend:** FastAPI (Python)
- **Database:** Airtable
- **File Storage:** Google Drive (via Apps Script)

## 📱 Mobile-First Design

- Optimized for Samsung A9 (5:3 aspect ratio)
- Base font size ≥16px (prevents zoom on input focus)
- Single column layout, max width 460px
- Sticky header and sticky bottom actions
- Large tap targets (≥44px height)
- Stepper controls for quantities (no keyboard popup)
- Clean, modern Airbnb-inspired aesthetics

## 🚀 Setup Instructions

### ⚠️ IMPORTANT: Airtable Configuration Required
You **MUST** create two tables in your Airtable base before the system will work:

1. Create table **"Orders"** with fields:
   - Timestamp (Date with time)
   - Order Number (Text)
   - Customer Name (Text)
   - Email (Email)
   - Phone (Phone)
   - Notes (Long text)
   - Customization Needed (Checkbox)
   - Customization Details (Long text)
   - Artwork URL (URL)
   - Currency (Single select: USD, AWG)
   - Order Total Qty (Number)

2. Create table **"Order Items"** with fields:
   - Order Number (Text)
   - Line Number (Number)
   - Garment Type (Single select)
   - Other Garment (Text)
   - Color (Single select)
   - Custom Color (Text)
   - Size Breakdown (Long text)
   - Total Qty (Number)
   - Notes (Long text)

**See SETUP_INSTRUCTIONS.md for detailed field configurations and Apps Script code.**

## 🧪 Testing

### Quick Test Data
Use this data to verify the system:

**Details:**
- Name: Jane Doe
- Email: jane@example.com
- Customization: ON
- Details: Front chest logo + back number

**Items:**
- Item #1: T-Shirt, Black → S:5, M:10, L:5 (Total: 20)
- Item #2: Hoodie, Navy → S:10, M:10, L:10 (Total: 30)

**Expected:**
- Order Total Qty: 40 pieces
- Order Number: 2025-#### format
- Both tables populated in Airtable
- Success page with complete summary

## 📁 Project Structure

```
/app/
├── backend/
│   ├── server.py              # FastAPI application
│   ├── .env                   # Environment variables
│   └── requirements.txt       # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── OrderForm.jsx  # Main form component
│   │   │   └── Success.jsx    # Success page
│   │   ├── components/
│   │   │   ├── DetailsStep.jsx
│   │   │   ├── ItemsStep.jsx
│   │   │   └── ReviewStep.jsx
│   │   ├── App.js
│   │   ├── App.css
│   │   └── index.css
│   └── package.json
├── SETUP_INSTRUCTIONS.md      # Detailed setup guide
└── README.md                  # This file
```

## 🔗 API Endpoints

- `GET /api/` - Health check
- `POST /api/submitOrder` - Submit new order
- `GET /api/order/{order_number}` - Retrieve order details
- `POST /api/uploadArtwork` - Upload artwork file

## ✅ Current Status

- ✅ Mobile-first responsive UI (Samsung A9 optimized)
- ✅ 3-step form with validation
- ✅ Backend API with Airtable integration
- ✅ Google Drive file upload (Apps Script ready)
- ✅ Success page with order summary
- ⏳ **Airtable tables (needs user setup)**
- ⏳ Email notifications (SMTP pending)

## 🎯 Next Steps

1. **Create Airtable tables** following SETUP_INSTRUCTIONS.md
2. **Deploy Google Apps Script** for file uploads (optional)
3. **Test with sample data** to verify everything works
4. **Configure SMTP** when ready for email notifications

---

**Contact:** blindingmedia@gmail.com
