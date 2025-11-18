# HT Activewear Order Form - Setup Instructions

## 1. Airtable Setup

### Create Base Tables

You need to create two tables in your Airtable base (ID: `4uYAfZZ46oNMdN`):

#### Table 1: Orders
Create a table named **"Orders"** with the following fields:

| Field Name | Field Type | Notes |
|------------|-----------|-------|
| Timestamp | Date | Include time |
| Order Number | Single line text | Format: YYYY-#### |
| Customer Name | Single line text | Required |
| Email | Email | Required |
| Phone | Phone number | Optional |
| Notes | Long text | Optional |
| Customization Needed | Checkbox | Boolean |
| Customization Details | Long text | Optional |
| Artwork URL | URL | Optional |
| Currency | Single select | Options: USD, AWG |
| Order Total Qty | Number | Integer |

#### Table 2: Order Items
Create a table named **"Order Items"** with the following fields:

| Field Name | Field Type | Notes |
|------------|-----------|-------|
| Order Number | Single line text | Links to Orders |
| Line Number | Number | Integer |
| Garment Type | Single select | Options: T-Shirt, Hoodie, Polo, Tank, Jersey, Other |
| Other Garment | Single line text | When "Other" selected |
| Color | Single select | Options: White, Black, Navy, Red, Royal, Grey, Custom |
| Custom Color | Single line text | When "Custom" selected |
| Size Breakdown | Long text | Format: S:5, M:10, L:5 |
| Total Qty | Number | Integer |
| Notes | Long text | Optional |

### Steps:
1. Log in to Airtable
2. Go to your base: https://airtable.com/4uYAfZZ46oNMdN
3. Create the two tables above with exact field names and types
4. The API will automatically connect and start saving orders

---

## 2. Google Apps Script Setup (File Upload)

### Create Apps Script Web App

1. Go to https://script.google.com/
2. Create a new project
3. Replace the default code with the following:

```javascript
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    
    if (data.action === 'upload') {
      return uploadFile(data);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: 'Invalid action'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function uploadFile(data) {
  try {
    var folderId = data.folderId || '1QZwyeffmQoJaXEf9zndLj4AFOX2M8Hfh';
    var folder = DriveApp.getFolderById(folderId);
    
    // Decode base64 content
    var fileBlob = Utilities.newBlob(
      Utilities.base64Decode(data.content),
      data.mimeType,
      data.filename
    );
    
    // Create file in Drive
    var file = folder.createFile(fileBlob);
    
    // Make file publicly accessible (view only)
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      url: file.getUrl(),
      fileId: file.getId()
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
```

4. **Deploy as Web App:**
   - Click "Deploy" > "New deployment"
   - Select type: "Web app"
   - Execute as: "Me"
   - Who has access: "Anyone"
   - Click "Deploy"
   - Copy the deployment URL (it should match: `https://script.google.com/macros/s/AKfycbw11YAjGvDMqNIGB5ruqz-nBMq0tMigtu-JcQIDZ1u51hxfeWcslaTLAIySD4MkrUMU/exec`)

5. **Verify Google Drive Folder:**
   - Make sure folder ID `1QZwyeffmQoJaXEf9zndLj4AFOX2M8Hfh` exists
   - The Apps Script needs access to this folder
   - You can test by uploading a file through the order form

---

## 3. Email Configuration (Optional - To be added later)

When you're ready to enable email notifications:

1. Update `/app/backend/.env` with your SMTP settings:
```
SMTP_HOST="mail.yourdomain.com"
SMTP_PORT="587"
SMTP_USERNAME="your-email@yourdomain.com"
SMTP_PASSWORD="your-password"
SMTP_FROM_EMAIL="orders@yourdomain.com"
```

2. Restart the backend:
```bash
sudo supervisorctl restart backend
```

---

## Testing the System

### Test with Sample Data:

**Details:**
- Name: Jane Doe
- Email: jane@example.com
- Customization: ON
- Details: Front chest logo + back number

**Items:**
- Item #1: T-Shirt, Black → S:5, M:10, L:5
- Item #2: Hoodie, Navy → S:10, M:10, L:10

**Expected Results:**
- Order Total Qty: 40
- Order Number: 2025-####
- Data appears in both Airtable tables
- Success page shows complete summary

---

## Troubleshooting

### Airtable Issues:
- Verify table names are exactly "Orders" and "Order Items"
- Check field names match exactly (case-sensitive)
- Confirm API key has write permissions

### Google Drive Upload Issues:
- Verify Apps Script deployment is active
- Check folder ID is correct
- Ensure Apps Script has Drive permissions
- Test the deployment URL in Postman/curl

### Backend Issues:
- Check logs: `tail -f /var/log/supervisor/backend.*.log`
- Verify environment variables in `/app/backend/.env`
- Restart backend: `sudo supervisorctl restart backend`

---

## Current Status

✅ Backend API configured with Airtable integration
✅ Frontend form with 3-step flow (Details → Items → Review)
✅ Mobile-first design (Samsung A9, 5:3 aspect ratio)
✅ Google Drive integration ready (needs Apps Script deployment)
⏳ Email notifications (SMTP settings pending)

---

## API Endpoints

- `POST /api/submitOrder` - Submit new order
- `GET /api/order/{order_number}` - Retrieve order details
- `POST /api/uploadArtwork` - Upload artwork file

---

## Need Help?

Contact: blindingmedia@gmail.com
