# Dynamic Pricing Tables Setup - Airtable

## Overview
Your order form now uses Airtable for dynamic pricing! Update prices anytime without touching code.

---

## Table 1: Garment Pricing (REQUIRED)

**Table Name:** `Garment Pricing`

### Fields:

| Field Name | Field Type | Description | Example |
|------------|-----------|-------------|---------|
| Garment Type | Single select | Type of garment | Shirts, Polo Shirts, etc. |
| Min Quantity | Number (Integer) | Minimum qty for this price | 1 |
| Max Quantity | Number (Integer) | Maximum qty for this price | 5 |
| Price | Number (Decimal, 2 places) | Price per item in AWG | 25.00 |

### Example Data:

| Garment Type | Min Qty | Max Qty | Price |
|--------------|---------|---------|-------|
| Shirts | 1 | 5 | 25.00 |
| Shirts | 6 | 20 | 22.00 |
| Shirts | 21 | 50 | 20.00 |
| Shirts | 51 | 999 | 18.00 |
| Polo Shirts | 1 | 10 | 30.00 |
| Polo Shirts | 11 | 999 | 27.00 |

**Single Select Options for Garment Type:**
- Shirts
- V-Neck
- Tank Tops
- Women Shirts
- Polo Shirts
- Long Sleeve
- Long Sleeve with Hoodie
- Zippered Hoodie
- Neck Gaiter
- Sport Jersey
- Other

---

## Table 2: Order Discounts (OPTIONAL)

**Table Name:** `Order Discounts`

### Fields:

| Field Name | Field Type | Description | Example |
|------------|-----------|-------------|---------|
| Discount Name | Single line text | Name of discount | Bulk Order Discount |
| Min Order Total Qty | Number (Integer) | Min total pieces | 100 |
| Discount Type | Single select | Percentage or Fixed | Percentage |
| Discount Value | Number (Decimal) | Discount amount | 10 (for 10%) |

### Example Data:

| Discount Name | Min Order Total Qty | Discount Type | Discount Value |
|---------------|---------------------|---------------|----------------|
| Bulk Discount | 50 | Percentage | 5 |
| Large Order | 100 | Percentage | 10 |
| Wholesale | 500 | Percentage | 20 |

**Single Select Options for Discount Type:**
- Percentage
- Fixed

---

## Table 3: Customer Discounts (OPTIONAL)

**Table Name:** `Customer Discounts`

### Fields:

| Field Name | Field Type | Description | Example |
|------------|-----------|-------------|---------|
| Customer Email | Email | Customer's email | loyal@customer.com |
| Discount Percentage | Number (Decimal) | Discount % | 15 |
| Active | Checkbox | Is discount active? | ✓ |

### Example Data:

| Customer Email | Discount Percentage | Active |
|----------------|---------------------|--------|
| vip@customer.com | 20 | ✓ |
| loyal@customer.com | 10 | ✓ |
| partner@business.com | 15 | ✓ |

---

## How Pricing Works

### 1. **Quantity-Based Pricing**
Prices adjust based on how many of ONE garment type is ordered:
- Order 3 Shirts → $25 each
- Order 10 Shirts → $22 each
- Order 30 Shirts → $20 each

### 2. **Order Discounts (Applied to Total)**
Based on TOTAL pieces in the entire order:
- 50+ total pieces → 5% off entire order
- 100+ total pieces → 10% off entire order

### 3. **Customer Discounts**
Special discount for specific customers by email address.
Applied BEFORE order discounts.

### 4. **Discount Stacking**
Discounts apply in this order:
1. Base price (from quantity tier)
2. Customization cost (Embroidery +AWG 10)
3. Customer discount (if applicable)
4. Order discount (if applicable)

---

## Setup Instructions

### Step 1: Create Tables

1. Go to your Airtable base: https://airtable.com/app4uYAfZZ46oNMdN
2. Create three new tables:
   - `Garment Pricing`
   - `Order Discounts`
   - `Customer Discounts`

### Step 2: Add Fields

For each table, click the + button to add fields with the exact names and types listed above.

### Step 3: Add Sample Data

Start with the example data provided, then customize to your needs.

### Step 4: Test

1. Go to your order form
2. Add items and quantities
3. See prices update live
4. Test different quantity ranges

---

## Price Display Toggle

Users can hide/show pricing in the order form:
- **Show Pricing ON:** Displays all prices, discounts, and totals
- **Show Pricing OFF:** Hides all pricing (quantities still shown)

Admin can set default in `/app/backend/.env`:
```
SHOW_PRICING=true
```

---

## Price Caching

Prices are cached for 5 minutes to improve performance and reduce API calls.
To force refresh, customer can reload the page.

---

## Example Calculation

**Order:**
- 10 Shirts (Navy)
- 15 Polo Shirts (White)  
- Customer: vip@customer.com (20% customer discount)
- Customization: Embroidery (+AWG 10 per item)

**Calculation:**
1. Shirts: 10 × (22 + 10) = AWG 320
2. Polo: 15 × (27 + 10) = AWG 555
3. Subtotal: AWG 875
4. Customer Discount (20%): -AWG 175
5. After Customer Discount: AWG 700
6. Order Discount (25+ items, 5%): -AWG 35
7. **Final Total: AWG 665**

---

## Updating Prices

To change prices:
1. Go to Airtable
2. Edit the relevant table
3. Save changes
4. Prices update within 5 minutes (or immediately on page reload)

**No code changes needed!** ✅

---

## Troubleshooting

**Prices not showing?**
- Check that table names match exactly
- Verify Garment Type names match your garment options
- Ensure Min/Max Quantity ranges don't have gaps

**Discounts not applying?**
- Check Min Order Total Qty is correct
- Verify customer email matches exactly (case-insensitive)
- Ensure "Active" checkbox is checked for customer discounts

**API Errors?**
- Check backend logs: `tail -f /var/log/supervisor/backend.err.log`
- Verify Airtable API key has read permissions for all pricing tables

---

## Support

Questions? Check the main README or contact: customorders@blindingmedia.com
