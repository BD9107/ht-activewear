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

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Airtable setup
airtable_api = Api(os.environ['AIRTABLE_API_KEY'])
base_id = os.environ['AIRTABLE_BASE_ID']

# Get tables (will be created via Airtable UI)
try:
    orders_table = airtable_api.table(base_id, 'Orders')
    items_table = airtable_api.table(base_id, 'Order Items')
except Exception as e:
    logging.warning(f"Airtable tables not yet created: {e}")
    orders_table = None
    items_table = None

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
    
    # In production, you'd use a persistent counter in Airtable or DB
    # For now, we'll use timestamp-based
    try:
        if orders_table:
            records = orders_table.all(formula=f"YEAR({{Timestamp}}) = {current_year}")
            counter = len(records) + 1
        else:
            counter = 1
    except:
        counter = 1
    
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

@api_router.post("/submitOrder", response_model=OrderResponse)
async def submit_order(submission: OrderSubmission):
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
            "Customization Type": submission.order.customizationType or "",
            "Customization Details": submission.order.customizationDetails or "",
            "Artwork Status": submission.order.artworkStatus or "",
            "Artwork": submission.order.artworkUrl or "",
            "Currency": submission.order.currency,
            "Signature": submission.order.signature or "",
            "Order Total Qty": order_total_qty
        }
        
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
        
        # TODO: Send email notifications (when SMTP configured)
        
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