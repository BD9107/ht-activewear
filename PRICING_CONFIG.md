# HT Activewear - Pricing Configuration

## How to Update Prices

Prices are stored in **two places** for easy updates:

### 1. Backend Environment Variables
File: `/app/backend/.env`

```bash
# Pricing (AWG)
PRICE_SHIRTS=20
PRICE_VNECK=25
PRICE_TANK_TOPS=20
PRICE_WOMEN_SHIRTS=20
PRICE_POLO_SHIRTS=25
PRICE_LONG_SLEEVE=35
PRICE_LONG_SLEEVE_HOODIE=40
PRICE_ZIPPERED_HOODIE=50
PRICE_NECK_GAITER=10
PRICE_SPORT_JERSEY=25
PRICE_EMBROIDERY_ADDON=10

# Currency Conversion
USD_TO_AWG_RATE=1.75
```

### 2. Frontend Pricing File
File: `/app/frontend/src/utils/pricing.js`

```javascript
export const GARMENT_PRICES = {
  'Shirts': 20,
  'V-Neck': 25,
  'Tank Tops': 20,
  'Women Shirts': 20,
  'Polo Shirts': 25,
  'Long Sleeve': 35,
  'Long Sleeve with Hoodie': 40,
  'Zippered Hoodie': 50,
  'Neck Gaiter': 10,
  'Sport Jersey': 25,
  'Other': 0
};

export const CUSTOMIZATION_PRICES = {
  'Printing': 0,        // Included in base price
  'Embroidery': 10      // Additional ƒ10 per item
};

export const USD_TO_AWG = 1.75;
```

## Current Pricing (AWG)

| Garment Type | Base Price | With Embroidery |
|--------------|------------|-----------------|
| Shirts | ƒ20 | ƒ30 |
| V-Neck | ƒ25 | ƒ35 |
| Tank Tops | ƒ20 | ƒ30 |
| Women Shirts | ƒ20 | ƒ30 |
| Polo Shirts | ƒ25 | ƒ35 |
| Long Sleeve | ƒ35 | ƒ45 |
| Long Sleeve with Hoodie | ƒ40 | ƒ50 |
| Zippered Hoodie | ƒ50 | ƒ60 |
| Neck Gaiter | ƒ10 | ƒ20 |
| Sport Jersey | ƒ25 | ƒ35 |

## How to Change Prices

### Quick Update (Frontend Only):
1. Edit `/app/frontend/src/utils/pricing.js`
2. Update the numbers in `GARMENT_PRICES`
3. Save the file (auto-reloads)
4. Refresh your browser

### Complete Update (Backend + Frontend):
1. Edit `/app/backend/.env` - Update price variables
2. Edit `/app/frontend/src/utils/pricing.js` - Update GARMENT_PRICES object
3. Restart backend: `sudo supervisorctl restart backend`
4. Frontend auto-reloads

## Currency Conversion

- **1 USD = 1.75 AWG** (current rate)
- To change: Update `USD_TO_AWG_RATE` in both files
- Users can toggle between AWG and USD in the order form

## Customization Pricing

- **Printing:** Included in base price (no additional charge)
- **Embroidery:** +ƒ10 per item

To change embroidery price:
- Update `PRICE_EMBROIDERY_ADDON` in `.env`
- Update `'Embroidery': 10` in `pricing.js`

## Examples

**Order: 10 Polo Shirts with Embroidery**
- Base: 10 × ƒ25 = ƒ250
- Embroidery: 10 × ƒ10 = ƒ100
- **Total: ƒ350 AWG (≈ $200 USD)**

**Order: 20 T-Shirts with Printing**
- Base: 20 × ƒ20 = ƒ400
- Printing: Included
- **Total: ƒ400 AWG (≈ $228.57 USD)**

---

**Note:** Prices are calculated automatically in the order form. Customers see live price updates as they add items and select sizes.
