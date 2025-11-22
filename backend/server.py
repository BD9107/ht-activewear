from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict
from datetime import datetime, timezone
from pyairtable import Api
import httpx
import base64
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Airtable setup
airtable_api = Api(os.environ['AIRTABLE_API_KEY'])
base_id = os.environ['AIRTABLE_BASE_ID']

# Get tables (will be created via Airtable UI)
try:
    orders_table = airtable_api.table(base_id, 'Orders')
    items_table = airtable_api.table(base_id, 'Order Items')
    pricing_table = airtable_api.table(base_id, 'Garment Pricing')
    order_discounts_table = airtable_api.table(base_id, 'Order Discounts')
    customer_discounts_table = airtable_api.table(base_id, 'Customer Discounts')
except Exception as e:
    logging.warning(f"Airtable tables not yet created: {e}")
    orders_table = None
    items_table = None
    pricing_table = None
    order_discounts_table = None
    customer_discounts_table = None

app = FastAPI()
api_router = APIRouter(prefix="/api")

# Models
class OrderDetails(BaseModel):
    customerName: str
    email: EmailStr
    phone: Optional[str] = ""
    notes: Optional[str] = ""
    customizationNeeded: bool
    customizationType: Optional[str] = "Printing"
    customizationDetails: Optional[str] = ""
    artworkStatus: Optional[str] = ""
    artworkStatusOther: Optional[str] = ""
    artworkUrl: Optional[str] = ""
    currency: str = "AWG"
    signature: Optional[str] = ""

class OrderItem(BaseModel):
    lineNumber: int
    garmentType: str
    otherGarment: Optional[str] = ""
    color: str
    customColor: Optional[str] = ""
    sizes: Dict[str, int]
    notes: Optional[str] = ""

class OrderSubmission(BaseModel):
    order: OrderDetails
    items: List[OrderItem]

class OrderResponse(BaseModel):
    orderNumber: str
    orderId: str
    order: OrderDetails
    items: List[OrderItem]
    orderTotalQty: int

# Helper functions
def generate_order_number() -> str:
    """Generate order number in format YYYY-####"""
    current_year = datetime.now(timezone.utc).year
    
    # Optimized: Only fetch count instead of all records
    try:
        if orders_table:
            # Use max_records to limit fetch and sort by newest first
            records = orders_table.all(
                formula=f"YEAR({{Timestamp}}) = {current_year}",
                max_records=1000,
                sort=[("Timestamp", "desc")]
            )
            counter = len(records) + 1
        else:
            counter = 1
    except Exception as e:
        logging.error(f"Error generating order number: {e}")
        # Fallback to timestamp-based counter
        counter = int(datetime.now(timezone.utc).timestamp() % 10000)
    
    return f"{current_year}-{counter:04d}"

def calculate_size_breakdown(sizes: Dict[str, int]) -> str:
    """Convert sizes dict to string like 'S:5, M:10, L:5'"""
    size_order = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL']
    parts = []
    for size in size_order:
        qty = sizes.get(size, 0)
        if qty > 0:
            parts.append(f"{size}:{qty}")
    return ", ".join(parts)

def calculate_item_total(sizes: Dict[str, int]) -> int:
    """Calculate total quantity for an item"""
    return sum(sizes.values())

async def send_order_confirmation_email(order_data: dict, submission: OrderSubmission, discount_type: str = "none"):
    """Send order confirmation emails to customer and admin"""
    try:
        smtp_host = os.environ.get('SMTP_HOST')
        smtp_port = int(os.environ.get('SMTP_PORT', 465))
        smtp_username = os.environ.get('SMTP_USERNAME')
        smtp_password = os.environ.get('SMTP_PASSWORD')
        smtp_from_email = os.environ.get('SMTP_FROM_EMAIL')
        smtp_from_name = os.environ.get('SMTP_FROM_NAME', 'HT Activewear Orders')
        admin_email = os.environ.get('ADMIN_EMAIL')
        
        # Skip if SMTP not configured
        if not all([smtp_host, smtp_username, smtp_password]):
            logging.warning("SMTP not configured, skipping email")
            return
        
        order_number = order_data.get('Order Number')
        customer_email = submission.order.email
        
        # Calculate order total and pricing
        order_total_qty = sum(calculate_item_total(item.sizes) for item in submission.items)
        
        # Fetch pricing data for calculations including discounts
        try:
            pricing_data = {
                "garment_pricing": [],
                "customization_prices": {"Printing": 0, "Embroidery": 10},
                "order_discounts": [],
                "customer_discounts": []
            }
            if pricing_table:
                records = pricing_table.all()
                pricing_data["garment_pricing"] = [
                    {
                        "garment_type": r['fields'].get('Garment Type'),
                        "min_qty": r['fields'].get('Min Quantity', 1),
                        "max_qty": r['fields'].get('Max Quantity', 999),
                        "price": r['fields'].get('Price', 0)
                    }
                    for r in records
                ]
            if order_discounts_table:
                records = order_discounts_table.all()
                pricing_data["order_discounts"] = [
                    {
                        "name": r['fields'].get('Discount Name'),
                        "min_total_qty": r['fields'].get('Min Order Total Qty', 0),
                        "discount_type": r['fields'].get('Discount Type', 'Percentage'),
                        "discount_value": r['fields'].get('Discount Value', 0)
                    }
                    for r in records
                ]
            if customer_discounts_table:
                records = customer_discounts_table.all(formula="Active = TRUE()")
                pricing_data["customer_discounts"] = [
                    {
                        "email": r['fields'].get('Customer Email'),
                        "discount_percentage": r['fields'].get('Discount Percentage', 0)
                    }
                    for r in records
                ]
        except:
            pricing_data = {
                "garment_pricing": [],
                "customization_prices": {"Printing": 0, "Embroidery": 10},
                "order_discounts": [],
                "customer_discounts": []
            }
        
        # Helper function to get price
        def get_item_price(garment_type, quantity, customization_type):
            base_price = 0
            for p in pricing_data["garment_pricing"]:
                if (p["garment_type"] == garment_type and 
                    quantity >= p["min_qty"] and 
                    quantity <= p["max_qty"]):
                    base_price = p["price"]
                    break
            customization_cost = pricing_data["customization_prices"].get(customization_type, 0)
            return (base_price + customization_cost) * quantity
        
        # Calculate discounts - ALWAYS calculate ALL applicable discounts (matching frontend behavior)
        def calculate_discounts(subtotal, total_qty, customer_email_addr):
            discounts = []
            total = subtotal
            
            # Check for customer discount (always check, regardless of discount_type)
            customer_discount = next((d for d in pricing_data["customer_discounts"] if d["email"].lower() == customer_email_addr.lower()), None)
            if customer_discount and customer_discount["discount_percentage"] > 0:
                discount_amount = (total * customer_discount["discount_percentage"]) / 100
                total -= discount_amount
                discounts.append({
                    "name": "Customer Discount",
                    "type": "Percentage",
                    "value": customer_discount["discount_percentage"],
                    "amount": discount_amount
                })
            
            # Check for order discount (always check, regardless of discount_type)
            applicable_order_discounts = [d for d in pricing_data["order_discounts"] if total_qty >= d["min_total_qty"]]
            if applicable_order_discounts:
                applicable_order_discounts.sort(key=lambda x: x["min_total_qty"], reverse=True)
                order_discount = applicable_order_discounts[0]
                if order_discount["discount_type"] == "Percentage":
                    discount_amount = (total * order_discount["discount_value"]) / 100
                else:
                    discount_amount = order_discount["discount_value"]
                total -= discount_amount
                discounts.append({
                    "name": order_discount["name"],
                    "type": order_discount["discount_type"],
                    "value": order_discount["discount_value"],
                    "amount": discount_amount
                })
            
            return discounts, max(0, total)
        
        # Build items HTML with pricing
        items_html = ""
        order_subtotal = 0
        for item in submission.items:
            item_total = calculate_item_total(item.sizes)
            size_breakdown = calculate_size_breakdown(item.sizes)
            garment = item.garmentType if item.garmentType != "Other" else item.otherGarment
            color = item.color if item.color != "Custom" else item.customColor
            item_price = get_item_price(item.garmentType, item_total, submission.order.customizationType or "Printing")
            order_subtotal += item_price
            
            items_html += f"""
            <tr>
                <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
                    <strong>{garment}</strong> - {color}<br>
                    <span style="color: #6b7280; font-size: 14px;">{size_breakdown}</span>
                </td>
                <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">
                    <strong>{item_total} pcs</strong>
                </td>
                <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
                    <strong>AWG {item_price:.2f}</strong>
                </td>
            </tr>
            """
        
        # Calculate discounts
        discounts, order_total = calculate_discounts(order_subtotal, order_total_qty, customer_email)
        
        # Calculate 70% downpayment
        downpayment_70 = order_total * 0.70
        remaining_30 = order_total * 0.30
        
        # Build discount HTML
        discount_html = ""
        if discounts:
            for discount in discounts:
                discount_display = f"{discount['value']}%" if discount['type'] == 'Percentage' else f"AWG {discount['value']:.2f}"
                discount_html += f"""
                <tr style="background: #f9fafb;">
                    <td colspan="2" style="padding: 12px; text-align: right; color: #10b981; font-weight: bold;">
                        {discount['name']} ({discount_display})
                    </td>
                    <td style="padding: 12px; text-align: right; color: #10b981; font-weight: bold;">
                        -AWG {discount['amount']:.2f}
                    </td>
                </tr>
                """
        
        # Email HTML template
        email_html = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: #111827; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                    <img src="https://f9aa4d84-41de-443f-94da-63ebf0e6ccb4.preview.emergent.systems/images/logo.png" alt="HT Activewear" style="height: 60px; margin-bottom: 15px;" />
                    <h1 style="margin: 0;">Order Confirmation</h1>
                    <p style="margin: 10px 0 0 0; font-size: 18px;">Thank you for your order!</p>
                </div>
                
                <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb;">
                    <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                        <h2 style="margin-top: 0; color: #111827;">Order #{order_number}</h2>
                        <p style="color: #6b7280; margin: 5px 0;">Placed on {datetime.now(timezone.utc).strftime('%B %d, %Y at %I:%M %p UTC')}</p>
                    </div>
                    
                    <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                        <h3 style="margin-top: 0; color: #111827;">Customer Information</h3>
                        <p style="margin: 5px 0;"><strong>Name:</strong> {submission.order.customerName}</p>
                        <p style="margin: 5px 0;"><strong>Email:</strong> {submission.order.email}</p>
                        {f'<p style="margin: 5px 0;"><strong>Phone:</strong> {submission.order.phone}</p>' if submission.order.phone else ''}
                        {f'<p style="margin: 5px 0;"><strong>Notes:</strong> {submission.order.notes}</p>' if submission.order.notes else ''}
                    </div>
                    
                    {f'''<div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                        <h3 style="margin-top: 0; color: #111827;">Customization</h3>
                        <p style="margin: 5px 0;"><strong>Type:</strong> {submission.order.customizationType}</p>
                        <p style="margin: 5px 0;"><strong>Artwork Status:</strong> {submission.order.artworkStatus}{f" - {submission.order.artworkStatusOther}" if submission.order.artworkStatus == "Other" else ""}</p>
                        <p style="margin: 5px 0;"><strong>Details:</strong> {submission.order.customizationDetails}</p>
                        {f'<p style="margin: 5px 0;"><strong>Artwork:</strong> <a href="{submission.order.artworkUrl}">{submission.order.artworkUrl}</a></p>' if submission.order.artworkUrl else ''}
                    </div>''' if submission.order.customizationNeeded else ''}
                    
                    <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                        <h3 style="margin-top: 0; color: #111827;">Order Items</h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="background: #f9fafb;">
                                    <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb;">Item</th>
                                    <th style="padding: 12px; text-align: center; border-bottom: 2px solid #e5e7eb;">Quantity</th>
                                    <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb;">Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items_html}
                            </tbody>
                            <tfoot>
                                <tr style="background: #f9fafb;">
                                    <td colspan="2" style="padding: 12px; text-align: right; border-top: 2px solid #e5e7eb;"><strong>Subtotal:</strong></td>
                                    <td style="padding: 12px; text-align: right; border-top: 2px solid #e5e7eb;"><strong>AWG {order_subtotal:.2f}</strong></td>
                                </tr>
                                {discount_html}
                                <tr style="background: #111827; color: white;">
                                    <td colspan="2" style="padding: 12px; text-align: right;"><strong>Order Total:</strong></td>
                                    <td style="padding: 12px; text-align: right;"><strong>AWG {order_total:.2f}</strong></td>
                                </tr>
                                <tr style="background: #f9fafb;">
                                    <td colspan="2" style="padding: 12px; text-align: right;"><em style="color: #6b7280;">Approx USD:</em></td>
                                    <td style="padding: 12px; text-align: right;"><em style="color: #6b7280;">${(order_total / 1.75):.2f}</em></td>
                                </tr>
                            </tfoot>
                        </table>
                        <p style="margin-top: 15px; padding: 10px; background: #fef3c7; border-left: 4px solid #f59e0b; color: #92400e; font-size: 14px;">
                            <strong>Note:</strong> Prices shown are estimates based on current pricing tiers. Final pricing may vary and will be confirmed before production.
                        </p>
                    </div>
                    
                </div>
                
                <div style="background: #f3f4f6; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none;">
                    <!-- Payment Terms with actual amounts -->
                    <div style="margin: 20px 0; padding: 20px; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; text-align: left;">
                        <p style="margin: 0 0 10px 0; color: #92400e; font-weight: bold; font-size: 16px;">💰 Payment Terms</p>
                        <p style="margin: 5px 0; color: #92400e;"><strong>70% downpayment required: AWG {downpayment_70:.2f}</strong> (≈ ${(downpayment_70 / 1.75):.2f} USD)</p>
                        <p style="margin: 5px 0; color: #92400e;">Remaining 30%: AWG {remaining_30:.2f} (≈ ${(remaining_30 / 1.75):.2f} USD)</p>
                        <p style="margin: 5px 0; color: #92400e; font-size: 13px;"><em>Production starts after downpayment received. Final payment due before delivery.</em></p>
                    </div>
                    
                    <!-- Order Summary Box (smaller) -->
                    <div style="margin: 20px 0; padding: 15px; background: white; border-radius: 8px; border: 2px solid #111827;">
                        <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 14px;">Order Summary</p>
                        <p style="font-size: 24px; font-weight: bold; margin: 5px 0; color: #111827;">{order_total_qty} pieces</p>
                        <p style="font-size: 20px; font-weight: bold; margin: 5px 0; color: #111827;">AWG {order_total:.2f}</p>
                    </div>
                    
                    <p style="margin: 5px 0; color: #6b7280;">We'll contact you shortly to arrange payment and confirm your order details.</p>
                    <div style="margin: 20px 0; padding: 15px; background: white; border-radius: 8px;">
                        <p style="margin: 0 0 10px 0; color: #111827; font-weight: bold;">Contact Information</p>
                        <p style="margin: 5px 0; color: #4b5563;"><strong>Indy Chan</strong> - HT Activewear</p>
                        <p style="margin: 5px 0; color: #4b5563;">WhatsApp/Call: <a href="tel:+2975942982" style="color: #2563eb; text-decoration: none;">(297) 594-2982</a></p>
                        <p style="margin: 5px 0; color: #4b5563;">Email: <a href="mailto:{smtp_from_email}" style="color: #2563eb; text-decoration: none;">{smtp_from_email}</a></p>
                    </div>
                    <p style="margin: 15px 0 5px 0; color: #6b7280; font-size: 14px;">HT Activewear</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        # Send to customer
        msg_customer = MIMEMultipart('alternative')
        msg_customer['Subject'] = f"Order Confirmation - #{order_number}"
        msg_customer['From'] = f"{smtp_from_name} <{smtp_from_email}>"
        msg_customer['To'] = customer_email
        msg_customer.attach(MIMEText(email_html, 'html'))
        
        with smtplib.SMTP_SSL(smtp_host, smtp_port) as server:
            server.login(smtp_username, smtp_password)
            server.send_message(msg_customer)
        
        logging.info(f"Order confirmation sent to customer: {customer_email}")
        
        # Send to admin (create separate message object)
        if admin_email and admin_email != customer_email:
            msg_admin = MIMEMultipart('alternative')
            msg_admin['Subject'] = f"New Order Received - #{order_number}"
            msg_admin['From'] = f"{smtp_from_name} <{smtp_from_email}>"
            msg_admin['To'] = admin_email
            msg_admin.attach(MIMEText(email_html, 'html'))
            
            with smtplib.SMTP_SSL(smtp_host, smtp_port) as server:
                server.login(smtp_username, smtp_password)
                server.send_message(msg_admin)
            
            logging.info(f"Order notification sent to admin: {admin_email}")
            
    except Exception as e:
        logging.error(f"Error sending email: {e}")
        # Don't fail the order if email fails

async def upload_to_google_drive(file_content: bytes, filename: str, mime_type: str) -> str:
    """Upload file to Google Drive via Apps Script"""
    try:
        apps_script_url = os.environ['GOOGLE_APPS_SCRIPT_URL']
        
        # Encode file to base64
        file_base64 = base64.b64encode(file_content).decode('utf-8')
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                apps_script_url,
                json={
                    'action': 'upload',
                    'filename': filename,
                    'content': file_base64,
                    'mimeType': mime_type,
                    'folderId': os.environ['GOOGLE_DRIVE_FOLDER_ID']
                }
            )
            result = response.json()
            if result.get('success'):
                return result.get('url', '')
            else:
                logging.error(f"Drive upload failed: {result.get('error')}")
                return ''
    except Exception as e:
        logging.error(f"Error uploading to Drive: {e}")
        return ''

# Routes
@api_router.get("/")
async def root():
    return {"message": "HT Activewear Order API"}

@api_router.get("/pricing")
async def get_pricing():
    """Get all pricing data from Airtable"""
    try:
        pricing_data = {
            "garment_pricing": [],
            "order_discounts": [],
            "customer_discounts": [],
            "customization_prices": {
                "Printing": 0,
                "Embroidery": 10
            },
            "show_pricing": os.environ.get('SHOW_PRICING', 'true').lower() == 'true'
        }
        
        # Get garment pricing
        if pricing_table:
            records = pricing_table.all()
            pricing_data["garment_pricing"] = [
                {
                    "garment_type": record['fields'].get('Garment Type'),
                    "min_qty": record['fields'].get('Min Quantity', 1),
                    "max_qty": record['fields'].get('Max Quantity', 999),
                    "price": record['fields'].get('Price', 0)
                }
                for record in records
            ]
        
        # Get order discounts
        if order_discounts_table:
            records = order_discounts_table.all()
            pricing_data["order_discounts"] = [
                {
                    "name": record['fields'].get('Discount Name'),
                    "min_total_qty": record['fields'].get('Min Order Total Qty', 0),
                    "discount_type": record['fields'].get('Discount Type', 'Percentage'),
                    "discount_value": record['fields'].get('Discount Value', 0)
                }
                for record in records
            ]
        
        # Get customer discounts
        if customer_discounts_table:
            records = customer_discounts_table.all(formula="Active = TRUE()")
            pricing_data["customer_discounts"] = [
                {
                    "email": record['fields'].get('Customer Email'),
                    "discount_percentage": record['fields'].get('Discount Percentage', 0)
                }
                for record in records
            ]
        
        return pricing_data
        
    except Exception as e:
        logging.error(f"Error fetching pricing: {e}")
        # Return default pricing if Airtable fails
        return {
            "garment_pricing": [],
            "order_discounts": [],
            "customer_discounts": [],
            "customization_prices": {
                "Printing": 0,
                "Embroidery": 10
            },
            "show_pricing": True
        }

@api_router.post("/uploadArtwork")
async def upload_artwork(file: UploadFile = File(...)):
    """Upload artwork file to Google Drive"""
    try:
        content = await file.read()
        file_url = await upload_to_google_drive(content, file.filename, file.content_type)
        
        if file_url:
            return {"success": True, "url": file_url}
        else:
            raise HTTPException(status_code=500, detail="Failed to upload file")
    except Exception as e:
        logging.error(f"Upload error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

class OrderSubmissionWithDiscount(BaseModel):
    order: OrderDetails
    items: List[OrderItem]
    discountType: Optional[str] = "none"

@api_router.post("/submitOrder", response_model=OrderResponse)
async def submit_order(submission: OrderSubmissionWithDiscount):
    """Submit order to Airtable"""
    try:
        # Generate order number
        order_number = generate_order_number()
        
        # Calculate order total qty
        order_total_qty = sum(calculate_item_total(item.sizes) for item in submission.items)
        
        # Prepare Orders table data
        order_data = {
            "Timestamp": datetime.now(timezone.utc).isoformat(),
            "Order Number": order_number,
            "Customer Name": submission.order.customerName,
            "Email": submission.order.email,
            "Phone": submission.order.phone or "",
            "Notes": submission.order.notes or "",
            "Customization Needed": submission.order.customizationNeeded,
            "Currency": submission.order.currency,
            "Order Total Qty": order_total_qty
        }
        
        # Only add these fields if customization is needed
        if submission.order.customizationNeeded:
            order_data["Customization Type"] = submission.order.customizationType or "Printing"
            order_data["Customization Details"] = submission.order.customizationDetails or ""
            if submission.order.artworkStatus:  # Only add if not empty
                order_data["Artwork Status"] = submission.order.artworkStatus
            if submission.order.artworkStatusOther:
                order_data["Artwork Status Other"] = submission.order.artworkStatusOther
            if submission.order.artworkUrl:
                order_data["Artwork"] = submission.order.artworkUrl
        
        # Add signature if provided
        if submission.order.signature:
            order_data["Signature"] = submission.order.signature
        
        # Insert into Orders table
        if orders_table:
            order_record = orders_table.create(order_data)
            order_id = order_record['id']
        else:
            raise HTTPException(status_code=500, detail="Airtable 'Orders' table not found")
        
        # Insert items into Order Items table
        if items_table:
            for item in submission.items:
                item_total = calculate_item_total(item.sizes)
                size_breakdown = calculate_size_breakdown(item.sizes)
                
                item_data = {
                    "Order Number": order_number,
                    "Line Number": item.lineNumber,
                    "Garment Type": item.garmentType,
                    "Other Garment": item.otherGarment or "",
                    "Color": item.color,
                    "Custom Color": item.customColor or "",
                    "Size Breakdown": size_breakdown,
                    "Total Qty": item_total,
                    "Notes": item.notes or ""
                }
                items_table.create(item_data)
        else:
            raise HTTPException(status_code=500, detail="Airtable 'Order Items' table not found")
        
        # Send email notifications with discount type
        await send_order_confirmation_email(order_data, submission, submission.discountType)
        
        return OrderResponse(
            orderNumber=order_number,
            orderId=order_id,
            order=submission.order,
            items=submission.items,
            orderTotalQty=order_total_qty
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Order submission error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to submit order: {str(e)}")

@api_router.get("/order/{order_number}")
async def get_order(order_number: str):
    """Retrieve order details by order number"""
    try:
        if not orders_table or not items_table:
            raise HTTPException(status_code=500, detail="Airtable tables not configured")
        
        # Get order
        order_records = orders_table.all(formula=f"{{Order Number}} = '{order_number}'")
        if not order_records:
            raise HTTPException(status_code=404, detail="Order not found")
        
        order_record = order_records[0]['fields']
        
        # Get items
        item_records = items_table.all(formula=f"{{Order Number}} = '{order_number}'")
        
        return {
            "orderNumber": order_number,
            "order": order_record,
            "items": [item['fields'] for item in item_records]
        }
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error retrieving order: {e}")
        raise HTTPException(status_code=500, detail=str(e))

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)