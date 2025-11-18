# Email Configuration - HT Activewear Order Form

## ✅ Email Setup Complete

Your order form now automatically sends confirmation emails when orders are placed!

### Email Recipients
- **Customer:** Receives confirmation at the email they provide
- **Admin:** customorders@blindingmedia.com receives a copy of every order

### SMTP Configuration
- **Host:** blindingmedia.com
- **Port:** 465 (SSL)
- **From:** Indy Chan - HT Activewear Orders <customorders@blindingmedia.com>

### Email Content Includes:
1. **Order Header**
   - Order number (e.g., 2025-0001)
   - Timestamp

2. **Customer Information**
   - Name, Email, Phone
   - Order notes

3. **Customization Details** (if applicable)
   - Type (Printing/Embroidery)
   - Artwork status
   - Customization details
   - Artwork URL link

4. **Order Items**
   - Garment type and color
   - Size breakdown (e.g., S×5 • M×10 • L×5)
   - Quantity per item

5. **Order Total**
   - Total pieces ordered

### Email Design
- Professional HTML email template
- Responsive design
- HT Activewear branding
- Clear order summary format

### Testing
✅ Test email sent successfully to:
- test@example.com (customer)
- customorders@blindingmedia.com (admin)

### Troubleshooting

**If emails are not being received:**
1. Check spam/junk folders
2. Verify SMTP credentials in `/app/backend/.env`
3. Check backend logs: `tail -f /var/log/supervisor/backend.err.log | grep email`

**To modify email template:**
Edit the `send_order_confirmation_email()` function in `/app/backend/server.py` (starts around line 107)

**To change admin email:**
Update `ADMIN_EMAIL` in `/app/backend/.env`

### Email Logs
Emails are logged in the backend error log:
```bash
grep "Order confirmation" /var/log/supervisor/backend.err.log
```

---

## Security Note
SMTP credentials are stored in `/app/backend/.env` and are not exposed to the frontend or in logs.
