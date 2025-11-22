# 🚀 Complete Render Deployment Guide for HT Activewear Order Form

This guide will walk you through deploying your order form to Render.com step-by-step.

---

## 📋 Prerequisites

Before starting, you need:
1. ✅ A Render account (free tier available) - Sign up at https://render.com
2. ✅ Your code pushed to GitHub (we'll set this up if needed)
3. ✅ Your Airtable API key and Base ID
4. ✅ Your SMTP email credentials

---

## 🎯 Deployment Overview

We'll deploy 2 services on Render:
1. **Backend Service** (FastAPI) - Python web service
2. **Frontend Service** (React) - Static site

**Note:** MongoDB is already hosted via Airtable, so no database setup needed!

---

## STEP 1: Push Your Code to GitHub

### Option A: If You Have GitHub Access
1. Create a new repository on GitHub (e.g., `ht-activewear-order-form`)
2. In your Emergent workspace, run:
   ```bash
   cd /app
   git remote add github https://github.com/YOUR-USERNAME/ht-activewear-order-form.git
   git push github main
   ```

### Option B: Download and Upload
1. Download your entire `/app` folder from Emergent
2. Create a new GitHub repository
3. Upload files to GitHub

---

## STEP 2: Deploy Backend (FastAPI)

### 2.1: Create Backend Service

1. **Login to Render** → https://dashboard.render.com
2. Click **"New +"** → Select **"Web Service"**
3. **Connect GitHub repository:**
   - Click "Connect account" if first time
   - Select your repository: `ht-activewear-order-form`
   - Click "Connect"

### 2.2: Configure Backend Service

Fill in these settings:

**Basic Settings:**
- **Name:** `ht-activewear-backend` (or your choice)
- **Region:** Choose closest to you (e.g., Oregon USA)
- **Branch:** `main`
- **Root Directory:** `backend`
- **Runtime:** `Python 3`
- **Build Command:** 
  ```bash
  pip install -r requirements.txt
  ```
- **Start Command:**
  ```bash
  uvicorn server:app --host 0.0.0.0 --port $PORT
  ```

**Instance Type:**
- Select **"Free"** (or paid for better performance)

### 2.3: Add Environment Variables

Scroll down to **"Environment Variables"** section and add these:

Click **"Add Environment Variable"** for each:

```
AIRTABLE_API_KEY = your_airtable_api_key_here
AIRTABLE_BASE_ID = your_airtable_base_id_here
SMTP_HOST = blindingmedia.com
SMTP_PORT = 465
SMTP_USERNAME = customorders@blindingmedia.com
SMTP_PASSWORD = your_smtp_password_here
SMTP_FROM_EMAIL = customorders@blindingmedia.com
SMTP_FROM_NAME = Indy Chan - HT Activewear Orders
ADMIN_EMAIL = customorders@blindingmedia.com
```

**Important Notes:**
- Replace `your_airtable_api_key_here` with your actual Airtable API key
- Replace `your_smtp_password_here` with your actual SMTP password
- Keep the quotes OFF in Render (just paste the values directly)

### 2.4: Deploy Backend

1. Click **"Create Web Service"** at the bottom
2. Wait 5-10 minutes for deployment
3. Once deployed, you'll see: ✅ **Live**
4. **Copy your backend URL** (e.g., `https://ht-activewear-backend.onrender.com`)

---

## STEP 3: Deploy Frontend (React)

### 3.1: Update Frontend Environment Variable

**BEFORE deploying frontend**, you need to update the backend URL:

1. In your code, edit `/app/frontend/.env`:
   ```
   REACT_APP_BACKEND_URL=https://ht-activewear-backend.onrender.com
   ```
   (Replace with YOUR backend URL from Step 2.4)

2. Commit and push this change to GitHub:
   ```bash
   git add frontend/.env
   git commit -m "Update backend URL for production"
   git push github main
   ```

### 3.2: Create Frontend Service

1. **In Render Dashboard** → Click **"New +"** → Select **"Static Site"**
2. **Connect same GitHub repository**
3. Click "Connect"

### 3.3: Configure Frontend Service

Fill in these settings:

**Basic Settings:**
- **Name:** `ht-activewear-frontend` (or your choice)
- **Branch:** `main`
- **Root Directory:** `frontend`
- **Build Command:**
  ```bash
  yarn install && yarn build
  ```
- **Publish Directory:** `build`

**Environment Variables:**
Add this one variable:
```
REACT_APP_BACKEND_URL = https://ht-activewear-backend.onrender.com
```
(Use YOUR backend URL from Step 2.4)

### 3.4: Deploy Frontend

1. Click **"Create Static Site"**
2. Wait 5-10 minutes for deployment
3. Once deployed, you'll see: ✅ **Live**
4. **Your frontend URL** (e.g., `https://ht-activewear-frontend.onrender.com`)

---

## STEP 4: Configure CORS (Important!)

Your backend needs to allow requests from your frontend domain.

### 4.1: Update Backend CORS Settings

1. Edit `/app/backend/server.py`
2. Find the CORS configuration (around line 50):
   ```python
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["*"],  # Change this!
   ```

3. Replace with:
   ```python
   app.add_middleware(
       CORSMiddleware,
       allow_origins=[
           "https://ht-activewear-frontend.onrender.com",  # Your frontend URL
           "http://localhost:3000"  # For local development
       ],
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```

4. Commit and push:
   ```bash
   git add backend/server.py
   git commit -m "Update CORS for production"
   git push github main
   ```

5. Render will automatically redeploy your backend (takes 2-3 minutes)

---

## STEP 5: Test Your Deployment

### 5.1: Access Your Live Site

1. Open your frontend URL: `https://ht-activewear-frontend.onrender.com`
2. Test the complete order flow:
   - Fill in Details
   - Add Items
   - Review Order
   - Submit

### 5.2: Verify Everything Works

Check these:
- ✅ Form loads correctly
- ✅ Garment icons display
- ✅ Prices load from Airtable
- ✅ Discounts calculate correctly
- ✅ Order submits successfully
- ✅ Email confirmation sent
- ✅ Order appears in Airtable

---

## STEP 6: Custom Domain (Optional)

### 6.1: Add Your Own Domain

If you have a domain (e.g., `orders.htactivewear.com`):

1. In Render Dashboard → Click on your **frontend service**
2. Go to **"Settings"** tab
3. Scroll to **"Custom Domain"**
4. Click **"Add Custom Domain"**
5. Enter your domain: `orders.htactivewear.com`
6. Follow DNS instructions provided by Render
7. Wait for SSL certificate (automatic, takes 5-10 minutes)

### 6.2: Update Backend CORS

Don't forget to add your custom domain to the CORS settings in `server.py`:
```python
allow_origins=[
    "https://orders.htactivewear.com",  # Your custom domain
    "https://ht-activewear-frontend.onrender.com",
    "http://localhost:3000"
],
```

---

## 🔧 Troubleshooting

### Backend Issues

**Problem:** Backend shows "Application failed to start"
- **Solution:** Check Render logs → Look for Python errors → Usually missing environment variables

**Problem:** "Module not found" error
- **Solution:** Make sure `requirements.txt` is in `/backend` folder

### Frontend Issues

**Problem:** Frontend shows "Failed to load"
- **Solution:** Check build logs → Look for yarn/npm errors

**Problem:** API calls fail (CORS error)
- **Solution:** Verify backend URL in frontend `.env` and CORS settings in `server.py`

### Email Issues

**Problem:** Emails not sending
- **Solution:** Double-check SMTP environment variables in backend service

### Airtable Issues

**Problem:** No data loading
- **Solution:** Verify `AIRTABLE_API_KEY` and `AIRTABLE_BASE_ID` are correct

---

## 📊 Monitoring & Logs

### View Logs in Render

1. **Backend Logs:**
   - Dashboard → Select backend service → Click "Logs" tab
   - Shows all API requests and errors

2. **Frontend Logs:**
   - Dashboard → Select frontend service → Click "Logs" tab
   - Shows build logs and deploy status

### Email Notifications

Render will email you when:
- ✅ Deploy succeeds
- ❌ Deploy fails
- ⚠️ Service crashes

---

## 💰 Render Pricing

**Free Tier:**
- ✅ 750 hours/month per service
- ✅ Automatic SSL certificates
- ⚠️ Services sleep after 15 min of inactivity
- ⚠️ Takes 30-60 seconds to wake up

**Paid Tier ($7/month per service):**
- ✅ Always on (no sleep)
- ✅ Faster builds
- ✅ More resources

**For production, consider paid tier for better user experience.**

---

## 🔄 Updating Your App

When you make changes:

1. Edit code locally
2. Commit changes:
   ```bash
   git add .
   git commit -m "Update feature X"
   git push github main
   ```
3. Render automatically deploys (takes 5-10 minutes)
4. Check deployment status in Render Dashboard

**Auto-deploy is enabled by default!**

---

## ✅ Deployment Checklist

Before going live, verify:

- [ ] Backend deploys successfully on Render
- [ ] Frontend deploys successfully on Render
- [ ] All environment variables set correctly
- [ ] CORS configured properly
- [ ] Test order completes successfully
- [ ] Email confirmations working
- [ ] Airtable orders appearing
- [ ] All garment icons displaying
- [ ] Pricing loading from Airtable
- [ ] Signature canvas working
- [ ] PDF generation working
- [ ] Mobile responsive (test on phone)

---

## 🆘 Need Help?

**Render Support:**
- Docs: https://render.com/docs
- Community: https://community.render.com

**Common Issues:**
- Build fails → Check logs for specific error
- 502 error → Backend not responding (check start command)
- CORS error → Update allow_origins in server.py
- Environment variables → Case-sensitive, no quotes needed

---

## 📝 Summary

**Your deployment flow:**
1. Push code to GitHub ✅
2. Deploy backend to Render ✅
3. Deploy frontend to Render ✅
4. Update CORS settings ✅
5. Test everything ✅
6. (Optional) Add custom domain ✅

**Estimated time:** 30-45 minutes

**Your live URLs:**
- Backend: `https://ht-activewear-backend.onrender.com`
- Frontend: `https://ht-activewear-frontend.onrender.com`

**You're ready to go live!** 🚀
