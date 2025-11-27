from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from enum import Enum
import uuid
from datetime import datetime, timezone, timedelta
from jose import JWTError, jwt


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Auth configuration
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'admin123')
JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'secret-key')
JWT_ALGORITHM = os.environ.get('JWT_ALGORITHM', 'HS256')
JWT_EXPIRATION_HOURS = int(os.environ.get('JWT_EXPIRATION_HOURS', '24'))

# Security
security = HTTPBearer(auto_error=False)

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")  # Ignore MongoDB's _id field
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str


# Auth Models
class LoginRequest(BaseModel):
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


# Auth Functions
def create_access_token(data: dict) -> str:
    """Create JWT access token"""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return encoded_jwt


def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """Verify JWT token and return payload"""
    if credentials is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")


# Product Category Enum
class ProductCategory(str, Enum):
    JERSEY = "Jersey"
    HOODIE = "Hoodie"
    POLO = "Polo"
    SHORTS = "Shorts"
    PANTS = "Pants"
    TRACKSUIT = "Tracksuit"
    ACCESSORIES = "Accessories"


# Product Model
class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    code: str
    category: ProductCategory
    description: str
    main_image_url: str
    colors: Optional[str] = None
    sizes_available: Optional[str] = None
    tags: Optional[List[str]] = None
    is_published: bool = True
    sort_order: int = 100
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ProductCreate(BaseModel):
    name: str
    code: str
    category: ProductCategory
    description: str
    main_image_url: str
    colors: Optional[str] = None
    sizes_available: Optional[str] = None
    tags: Optional[List[str]] = None
    is_published: bool = True
    sort_order: int = 100


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    category: Optional[ProductCategory] = None
    description: Optional[str] = None
    main_image_url: Optional[str] = None
    colors: Optional[str] = None
    sizes_available: Optional[str] = None
    tags: Optional[List[str]] = None
    is_published: Optional[bool] = None
    sort_order: Optional[int] = None

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    # Exclude MongoDB's _id field from the query results
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    # Convert ISO string timestamps back to datetime objects
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks


# ============ AUTH API ENDPOINTS ============

@api_router.post("/login", response_model=LoginResponse)
async def login(login_data: LoginRequest):
    """Login with password and receive JWT token"""
    if login_data.password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Incorrect password")
    
    # Create token with simple payload
    access_token = create_access_token({"sub": "admin", "role": "admin"})
    return LoginResponse(access_token=access_token)


@api_router.get("/verify")
async def verify_auth(payload: dict = Depends(verify_token)):
    """Verify if user is authenticated"""
    return {"authenticated": True, "user": payload.get("sub")}


# ============ PRODUCT API ENDPOINTS ============

@api_router.post("/products", response_model=Product)
async def create_product(product_input: ProductCreate):
    """Create a new product"""
    product_dict = product_input.model_dump()
    product_obj = Product(**product_dict)
    
    # Convert to dict and serialize datetime fields to ISO string for MongoDB
    doc = product_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    
    # Insert into database
    await db.products.insert_one(doc)
    return product_obj


@api_router.get("/products", response_model=List[Product])
async def get_products(published_only: bool = False):
    """Get all products, optionally filter by published status"""
    query = {}
    if published_only:
        query['is_published'] = True
    
    # Exclude MongoDB's _id field and sort by sort_order
    products = await db.products.find(query, {"_id": 0}).sort("sort_order", 1).to_list(1000)
    
    # Convert ISO string timestamps back to datetime objects
    for product in products:
        if isinstance(product.get('created_at'), str):
            product['created_at'] = datetime.fromisoformat(product['created_at'])
        if isinstance(product.get('updated_at'), str):
            product['updated_at'] = datetime.fromisoformat(product['updated_at'])
    
    return products


@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    """Get a single product by ID"""
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Convert ISO string timestamps back to datetime objects
    if isinstance(product.get('created_at'), str):
        product['created_at'] = datetime.fromisoformat(product['created_at'])
    if isinstance(product.get('updated_at'), str):
        product['updated_at'] = datetime.fromisoformat(product['updated_at'])
    
    return product


@api_router.put("/products/{product_id}", response_model=Product)
async def update_product(product_id: str, product_update: ProductUpdate):
    """Update a product by ID"""
    # Get existing product
    existing_product = await db.products.find_one({"id": product_id}, {"_id": 0})
    
    if not existing_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Convert existing product timestamps
    if isinstance(existing_product.get('created_at'), str):
        existing_product['created_at'] = datetime.fromisoformat(existing_product['created_at'])
    if isinstance(existing_product.get('updated_at'), str):
        existing_product['updated_at'] = datetime.fromisoformat(existing_product['updated_at'])
    
    # Update only provided fields
    update_data = product_update.model_dump(exclude_unset=True)
    update_data['updated_at'] = datetime.now(timezone.utc)
    
    # Merge updates with existing data
    existing_product.update(update_data)
    
    # Serialize datetime fields
    existing_product['created_at'] = existing_product['created_at'].isoformat()
    existing_product['updated_at'] = existing_product['updated_at'].isoformat()
    
    # Update in database
    await db.products.update_one(
        {"id": product_id},
        {"$set": existing_product}
    )
    
    # Convert back to datetime for response
    existing_product['created_at'] = datetime.fromisoformat(existing_product['created_at'])
    existing_product['updated_at'] = datetime.fromisoformat(existing_product['updated_at'])
    
    return Product(**existing_product)


@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str):
    """Delete a product by ID"""
    result = await db.products.delete_one({"id": product_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return {"message": "Product deleted successfully", "id": product_id}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()