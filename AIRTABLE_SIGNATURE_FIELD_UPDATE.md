# Airtable Signature Field Update

## ⚠️ IMPORTANT: Update Your Airtable Field Type

The signature is now stored as a **base64 image string** (not plain text anymore).

### What You Need to Do:

1. **Go to your Airtable base**
2. **Find the "Signature" field in the "Orders" table**
3. **Change the field type:**
   - Current: Single line text
   - **Change to: Long text** (allows storing large base64 strings)

### Why?
- Base64 image data is very long (thousands of characters)
- Single line text fields have character limits
- Long text fields can handle the full signature image data

### Steps:
1. Click on the "Signature" field header in Airtable
2. Select "Customize field type"
3. Choose "Long text"
4. Save

### Alternative Option:
If you prefer to see the signature as an actual image in Airtable:
1. Create a new field called "Signature Image"
2. Set type to "Attachment"
3. You'll need to manually convert base64 to image file and upload
4. Or keep the Long text field for automatic storage

**Recommended: Use "Long text" field type for simplicity and automation.**
