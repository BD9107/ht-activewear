# Airtable Dynamic Pricing Setup - Step-by-Step Guide

## Quick Start

You need to create **3 new tables** in your Airtable base to enable dynamic pricing.

Base URL: https://airtable.com/app4uYAfZZ46oNMdN

---

## Table 1: Garment Pricing (REQUIRED ⚠️)

### Step 1: Create the Table
1. Click the **"+"** button next to your existing tables
2. Name it: **Garment Pricing** (exact name, case-sensitive)
3. Click "Create table"

### Step 2: Create Fields

Click the **"+"** button in the column headers to add these fields:

#### Field 1: Garment Type
- **Field Type:** Single select
- **Field Name:** `Garment Type`
- **Options to add:** (click "Add option" for each)
  ```
  Shirts
  V-Neck
  Tank Tops
  Women Shirts
  Polo Shirts
  Long Sleeve
  Long Sleeve with Hoodie
  Zippered Hoodie
  Neck Gaiter
  Sport Jersey
  Other
  ```

#### Field 2: Min Quantity
- **Field Type:** Number
- **Field Name:** `Min Quantity`
- **Number Format:** Integer
- **Allow negative numbers:** No

#### Field 3: Max Quantity  
- **Field Type:** Number
- **Field Name:** `Max Quantity`
- **Number Format:** Integer
- **Allow negative numbers:** No

#### Field 4: Price
- **Field Type:** Number
- **Field Name:** `Price`
- **Number Format:** Decimal (2 decimal places)
- **Allow negative numbers:** No

### Step 3: Add Sample Data

Add these rows to get started:

| Garment Type | Min Quantity | Max Quantity | Price |
|-------------|-------------|-------------|-------|
| Shirts | 1 | 5 | 25.00 |
| Shirts | 6 | 20 | 22.00 |
| Shirts | 21 | 50 | 20.00 |
| Shirts | 51 | 999 | 18.00 |
| V-Neck | 1 | 10 | 30.00 |
| V-Neck | 11 | 999 | 27.00 |
| Polo Shirts | 1 | 10 | 30.00 |
| Polo Shirts | 11 | 999 | 27.00 |
| Tank Tops | 1 | 10 | 22.00 |
| Tank Tops | 11 | 999 | 20.00 |

**💡 Tip:** Copy and paste this data directly into Airtable!

---

## Table 2: Order Discounts (OPTIONAL)

This table applies discounts based on the TOTAL quantity across the entire order.

### Step 1: Create the Table
1. Click **"+"** to add new table
2. Name it: **Order Discounts** (exact name)
3. Click "Create table"

### Step 2: Create Fields

#### Field 1: Discount Name
- **Field Type:** Single line text
- **Field Name:** `Discount Name`

#### Field 2: Min Order Total Qty
- **Field Type:** Number
- **Field Name:** `Min Order Total Qty`
- **Number Format:** Integer
- **Allow negative numbers:** No

#### Field 3: Discount Type
- **Field Type:** Single select
- **Field Name:** `Discount Type`
- **Options:**
  ```
  Percentage
  Fixed
  ```

#### Field 4: Discount Value
- **Field Type:** Number
- **Field Name:** `Discount Value`
- **Number Format:** Decimal (2 decimal places)
- **Allow negative numbers:** No

### Step 3: Add Sample Data

| Discount Name | Min Order Total Qty | Discount Type | Discount Value |
|--------------|--------------------|--------------|----|
| Small Bulk | 50 | Percentage | 5 |
| Medium Bulk | 100 | Percentage | 10 |
| Large Bulk | 200 | Percentage | 15 |
| Wholesale | 500 | Percentage | 20 |

**How it works:**
- Customer orders 75 total pieces → Gets 5% off entire order
- Customer orders 150 total pieces → Gets 10% off entire order

---

## Table 3: Customer Discounts (OPTIONAL)

Give specific customers special pricing (VIP, repeat customers, partners).

### Step 1: Create the Table
1. Click **"+"** to add new table
2. Name it: **Customer Discounts** (exact name)
3. Click "Create table"

### Step 2: Create Fields

#### Field 1: Customer Email
- **Field Type:** Email
- **Field Name:** `Customer Email`

#### Field 2: Discount Percentage
- **Field Type:** Number
- **Field Name:** `Discount Percentage`
- **Number Format:** Decimal (2 decimal places)
- **Allow negative numbers:** No

#### Field 3: Active
- **Field Type:** Checkbox
- **Field Name:** `Active`
- **Color:** Green

### Step 3: Add Sample Data

| Customer Email | Discount Percentage | Active |
|---------------|--------------------|----|
| vip@customer.com | 20 | ✓ |
| partner@business.com | 15 | ✓ |
| repeat@customer.com | 10 | ✓ |

**How it works:**
- When `vip@customer.com` places an order, they automatically get 20% off
- You can activate/deactivate discounts using the checkbox

---

## Testing Your Setup

### Test 1: Basic Pricing
1. Go to your order form
2. Add 3 Shirts → Should show AWG 25 each
3. Change quantity to 10 → Should show AWG 22 each
4. Change to 30 → Should show AWG 20 each

### Test 2: Order Discount
1. Create an order with 60 total pieces
2. Check if 5% discount appears in the order total
3. Subtotal and final total should show

### Test 3: Customer Discount
1. Enter an email from Customer Discounts table
2. Complete the order form
3. Check if the discount appears

---

## Common Issues & Solutions

### Issue: Prices not showing
**Solution:** 
- Make sure table name is exactly `Garment Pricing`
- Check that Garment Type options match your selection (case-sensitive)
- Verify Min/Max Quantity ranges cover all amounts (no gaps)

### Issue: Wrong prices
**Solution:**
- Check that Min/Max Quantity ranges don't overlap
- Ensure Price field is set to "Decimal" with 2 places
- Verify the garment type name matches exactly

### Issue: Discounts not applying
**Solution:**
- Order Discounts: Check Min Order Total Qty is correct
- Customer Discounts: Verify email matches exactly (not case-sensitive)
- Customer Discounts: Make sure Active checkbox is checked

### Issue: Can't see pricing in form
**Solution:**
- Toggle "Show Pricing" switch in the form
- Check backend env: `SHOW_PRICING=true` in `/app/backend/.env`
- Refresh the page (cache is 5 minutes)

---

## How Discounts Stack

Discounts are applied in this order:

1. **Base Price** (from Garment Pricing table, based on quantity)
2. **+ Customization Cost** (Embroidery adds AWG 10 per item)
3. **= Subtotal**
4. **- Customer Discount** (if email matches)
5. **- Order Discount** (if total quantity qualifies)
6. **= Final Total**

### Example Calculation:

**Order:**
- 25 Shirts (Navy, Embroidery)
- 30 Polo Shirts (White, Embroidery)
- Customer: vip@customer.com (20% discount)

**Math:**
```
Shirts:  25 × (20 + 10) = AWG 750
Polos:   30 × (27 + 10) = AWG 1,110
                Subtotal: AWG 1,860

Customer Discount (20%):  -AWG 372
          After Customer: AWG 1,488

Order Discount (55 items, 5%): -AWG 74.40
                 FINAL TOTAL: AWG 1,413.60
```

---

## Quick Reference

### Must-Have Table
✅ **Garment Pricing** - REQUIRED for pricing to work

### Optional Tables
⚪ **Order Discounts** - Bulk order discounts
⚪ **Customer Discounts** - VIP/Partner pricing

### Field Names (Must Match Exactly)
- Garment Pricing: `Garment Type`, `Min Quantity`, `Max Quantity`, `Price`
- Order Discounts: `Discount Name`, `Min Order Total Qty`, `Discount Type`, `Discount Value`
- Customer Discounts: `Customer Email`, `Discount Percentage`, `Active`

---

## Video Walkthrough (If Needed)

If you need help, you can:
1. Share your screen with someone who can help set it up
2. Follow Airtable's documentation: https://support.airtable.com
3. Contact: customorders@blindingmedia.com

---

## After Setup

Once your tables are created and populated:
1. ✅ Prices will appear in the order form within 5 minutes (or immediately on refresh)
2. ✅ Customers will see live pricing as they add items
3. ✅ Discounts will automatically apply
4. ✅ Admin emails will include pricing estimates
5. ✅ You can update prices anytime without touching code!

---

**🎉 That's it! Your dynamic pricing system is ready!**

Questions? Check `/app/PRICING_TABLES_SETUP.md` for more details.
