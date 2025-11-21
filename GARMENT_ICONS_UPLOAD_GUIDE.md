# Garment Icons Upload Guide

## 📁 Where to Upload Your Icon Images

Upload your icon images to: `/app/frontend/public/icons/garments/`

## 🖼️ Image Requirements

- **Format:** PNG (recommended for transparency)
- **Size:** 48x48 pixels (or larger, will be scaled down)
- **Background:** Transparent recommended
- **File naming:** Use lowercase with hyphens

## 📝 Required Icon Files

You need 11 icon images for the following garment types:

1. **shirts.png** - Regular T-Shirts
2. **vneck.png** - V-Neck Shirts
3. **tank.png** - Tank Tops
4. **women-shirts.png** - Women's Shirts
5. **polo.png** - Polo Shirts
6. **longsleeve.png** - Long Sleeve
7. **hoodie.png** - Long Sleeve with Hoodie
8. **zip-hoodie.png** - Zippered Hoodie
9. **gaiter.png** - Neck Gaiter
10. **jersey.png** - Sport Jersey
11. **other.png** - Other (generic package icon)

## 🔧 After Uploading Icons

Once you've uploaded all icons to `/app/frontend/public/icons/garments/`, you need to update the code:

### Edit: `/app/frontend/src/components/ItemsStepNew.jsx`

Find this section (around line 18-30):

```javascript
const GARMENT_TYPES = [
  { value: "Shirts", label: "Shirts", icon: "👕" },
  { value: "V-Neck", label: "V-Neck", icon: "👔" },
  // ... etc
];
```

Replace it with:

```javascript
const GARMENT_TYPES = [
  { value: "Shirts", label: "Shirts", icon: "/icons/garments/shirts.png" },
  { value: "V-Neck", label: "V-Neck", icon: "/icons/garments/vneck.png" },
  { value: "Tank Tops", label: "Tank Tops", icon: "/icons/garments/tank.png" },
  { value: "Women Shirts", label: "Women Shirts", icon: "/icons/garments/women-shirts.png" },
  { value: "Polo Shirts", label: "Polo Shirts", icon: "/icons/garments/polo.png" },
  { value: "Long Sleeve", label: "Long Sleeve", icon: "/icons/garments/longsleeve.png" },
  { value: "Long Sleeve with Hoodie", label: "LS Hoodie", icon: "/icons/garments/hoodie.png" },
  { value: "Zippered Hoodie", label: "Zip Hoodie", icon: "/icons/garments/zip-hoodie.png" },
  { value: "Neck Gaiter", label: "Neck Gaiter", icon: "/icons/garments/gaiter.png" },
  { value: "Sport Jersey", label: "Sport Jersey", icon: "/icons/garments/jersey.png" },
  { value: "Other", label: "Other", icon: "/icons/garments/other.png" }
];
```

Then find this section (around line 218-226):

```javascript
{/* Icon - Use emoji by default, uncomment below for image icons */}
<div className="text-2xl">{garment.icon}</div>
{/* For custom image icons (48x48px recommended):
<img 
  src={garment.icon} 
  alt={garment.label}
  className="w-10 h-10 object-contain"
/>
*/}
```

Replace it with:

```javascript
{/* Custom image icons */}
<img 
  src={garment.icon} 
  alt={garment.label}
  className="w-12 h-12 object-contain"
/>
```

## ✅ Testing

After making these changes:
1. The frontend will hot-reload automatically
2. Check the Items page - you should see your custom icons
3. Make sure all 11 icons display correctly

## 💡 Tips

- If an icon doesn't show, check the browser console for 404 errors
- Verify the file name matches exactly (case-sensitive)
- Clear browser cache if icons don't update immediately
