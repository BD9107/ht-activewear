#!/usr/bin/env python3
"""
One-time seed script for Admin_Users Airtable table.

This script creates initial admin users with hashed PINs.
It will NOT overwrite existing users - only creates if user_id doesn't exist.

Usage:
    python seed_admin_users.py

Initial Users Created:
    - System Overwatch (overwatch role) - PIN: 9107
    - Primary Operator (operator role) - PIN: 6666

IMPORTANT: 
    1. Create the Admin_Users table in Airtable FIRST with these fields:
       - User ID (Single line text)
       - Name (Single line text)
       - Role (Single select: operator, overwatch)
       - PIN Hash (Single line text)
       - Active (Checkbox)
    
    2. Run this script once to seed the initial users.
    
    3. After running, you can add more users directly in Airtable
       by generating PIN hashes using: python -c "import bcrypt; print(bcrypt.hashpw(b'YOUR_PIN', bcrypt.gensalt()).decode())"
"""

import os
import sys
from pathlib import Path
import bcrypt

# Load environment
from dotenv import load_dotenv
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from pyairtable import Api

# Airtable setup
airtable_api = Api(os.environ['AIRTABLE_API_KEY'])
base_id = os.environ['AIRTABLE_BASE_ID']

# Initial admin users to seed
INITIAL_USERS = [
    {
        "user_id": "overwatch_001",
        "name": "System Overwatch",
        "role": "overwatch",
        "pin": "9107",
        "active": True
    },
    {
        "user_id": "operator_001",
        "name": "Primary Operator",
        "role": "operator",
        "pin": "6666",
        "active": True
    }
]

def hash_pin(pin: str) -> str:
    """Hash a PIN using bcrypt"""
    return bcrypt.hashpw(pin.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def seed_admin_users():
    """Seed initial admin users into Airtable"""
    print("=" * 60)
    print("Admin Users Seed Script")
    print("=" * 60)
    
    try:
        admin_users_table = airtable_api.table(base_id, 'Admin_Users')
    except Exception as e:
        print(f"\n❌ ERROR: Could not connect to Admin_Users table: {e}")
        print("\nPlease create the Admin_Users table in Airtable first with these fields:")
        print("  - User ID (Single line text)")
        print("  - Name (Single line text)")
        print("  - Role (Single select: operator, overwatch)")
        print("  - PIN Hash (Single line text)")
        print("  - Active (Checkbox)")
        sys.exit(1)
    
    # Get existing users to avoid duplicates
    try:
        existing_records = admin_users_table.all()
        existing_user_ids = {
            record['fields'].get('User ID', ''): record['id'] 
            for record in existing_records
        }
        print(f"\nFound {len(existing_user_ids)} existing users in Admin_Users table")
    except Exception as e:
        print(f"\n⚠️  Warning: Could not fetch existing users: {e}")
        existing_user_ids = {}
    
    # Seed each user
    created_count = 0
    skipped_count = 0
    
    for user in INITIAL_USERS:
        user_id = user["user_id"]
        
        if user_id in existing_user_ids:
            print(f"\n⏭️  Skipping '{user['name']}' (user_id: {user_id}) - already exists")
            skipped_count += 1
            continue
        
        # Hash the PIN
        pin_hash = hash_pin(user["pin"])
        
        # Create the record
        try:
            record_data = {
                "User ID": user["user_id"],
                "Name": user["name"],
                "Role": user["role"],
                "PIN Hash": pin_hash,
                "Active": user["active"]
            }
            
            admin_users_table.create(record_data)
            print(f"\n✅ Created '{user['name']}'")
            print(f"   User ID: {user['user_id']}")
            print(f"   Role: {user['role']}")
            print(f"   PIN: {user['pin']} (stored as bcrypt hash)")
            print(f"   Active: {user['active']}")
            created_count += 1
            
        except Exception as e:
            print(f"\n❌ Failed to create '{user['name']}': {e}")
    
    # Summary
    print("\n" + "=" * 60)
    print("Summary")
    print("=" * 60)
    print(f"  Created: {created_count}")
    print(f"  Skipped: {skipped_count}")
    print(f"  Total in table: {len(existing_user_ids) + created_count}")
    
    if created_count > 0:
        print("\n🎉 Admin users seeded successfully!")
        print("\nYou can now authenticate using:")
        for user in INITIAL_USERS:
            if user["user_id"] not in existing_user_ids:
                print(f"  - PIN '{user['pin']}' → {user['name']} ({user['role']})")
    
    print("\n💡 To add more users, either:")
    print("   1. Add them directly in Airtable (generate PIN hash with bcrypt)")
    print("   2. Add to INITIAL_USERS list and re-run this script")
    print("\nTo generate a PIN hash manually:")
    print("   python -c \"import bcrypt; print(bcrypt.hashpw(b'YOUR_PIN', bcrypt.gensalt()).decode())\"")

if __name__ == "__main__":
    seed_admin_users()
