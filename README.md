<div align="center">
  
# ♻️ SmartWaste Platform (Eco-Air)

**Advanced AI-Powered Waste Collection & E-Waste Disposal System**

A comprehensive, full-stack waste management ecosystem bridging the gap between residents, municipal admins, businesses/societies, and waste collection vendors. Powered by Machine Learning for predictive heatmaps and route optimization, and built with a premium "Eco-Air" UI design system.

</div>
---

## 🌟 Project Overview

SmartWaste is an intelligent marketplace and logistics platform designed to optimize municipal and corporate waste management. It transitions from traditional, inefficient garbage collection to a dynamic, data-driven approach. 

By utilizing **four distinct user roles**, the platform ensures every stakeholder in the waste lifecycle is empowered: from individuals reporting street trash, to societies selling bulk recyclable e-waste, to vendors optimizing their collection routes.

---

## 🛰️ AI Satellite Geospatial Pipeline (NEW)

The platform now features a cutting-edge **Satellite AI Prediction** module that predicts waste accumulation hotspots before they happen using real-world multi-spectral satellite imagery and machine learning.

*   **Sentinel-2 Imagery:** Integrates with Google Earth Engine (GEE) to live-fetch B4 (Red), B8 (NIR), and B11 (SWIR) multi-spectral bands.
*   **Spectral Indices:** Dynamically calculates **NDVI** (Normalized Difference Vegetation Index) to detect destroyed vegetation and **NDBI** (Normalized Difference Built-up Index) to detect dense urban concrete.
*   **OpenStreetMap (OSM) Integration:** Fuses satellite data with geographical infrastructure data (proximity to roads, bus stops, markets, and railway stations) using the Overpass API. Vectorized Haversine math ensures instant location processing.
*   **Machine Learning:** A tuned **Random Forest Classifier** evaluates the environmental indicators using weak-supervision and outputs an accumulation risk score.
*   **Organic Heatmap Visualization:** Risk data is plotted onto the frontend using React-Leaflet. Instead of rendering artificial grids, the system uses spatial jitter and **Percentile-based Thresholding (Top 150 points)** to render completely organic, sparse, highly accurate heatmap hotspots across the city.

---

## ✨ Key Features by Role

### 👤 1. User (Resident)
*   **Report Waste:** Effortlessly report overflowing bins or street trash with photo uploads. Integrated ML categorizes the waste (General, Plastic, E-Waste).
*   **Request Pickup:** Schedule personal waste pickups with address geocoding via interactive **Leaflet maps**. 
*   **Impact Leaderboard:** Gamified sustainability tracking. Users earn points for recycling, fostering community competition.
*   **E-Waste Centers:** Interactive map displaying verified nearby e-waste recycling facilities.

### 👑 2. Admin (Municipal / Platform Manager)
*   **Live Job Tracker:** Real-time satellite-style map tracking the status of all active pickups and vendor fleet locations.
*   **Predictive Heatmaps:** AI-generated heatmaps visualizing waste density across the city.
*   **Optimized Route Map:** Automated Transport Salesperson Problem (TSP) logic calculating the most fuel-efficient route points, which are integrated with the **Open Source Routing Machine (OSRM) API** to continuously trace true physical roads and driving paths.
*   **Efficiency Analytics:** Rich data visualization using Recharts to track fleet performance, daily waste volumes, and platform growth.
*   **B2B CRM:** Full Customer Relationship Management module. Track active Societies (Customers) and Fleet Operators (Vendors), complete with contact details, historically assigned orders, and financial transaction logs.

### 🏢 3. Business / Society Manager
*   **Bulk Marketplace:** Post bulk waste requests (e.g., 500kg E-waste). Instead of fixed pricing, the request enters a marketplace where vendors compete and bid.
*   **Bid Management:** Review vendor bids, compare prices, and assign the job to the preferred vendor.
*   **EcoCoins Reward System:** Earn **10 EcoCoins per kg** of waste recycled. 
*   **Rewards Hub:** Redeem accumulated EcoCoins for sustainability rewards like bulk vendor discounts, tree plantations, or corporate Platinum Sustainability Badges.

### 🚛 4. Vendor (Waste Collector)
*   **Live Bidding:** Access the marketplace to place competitive bids on bulk requests posted by Businesses.
*   **Job Management:** Accept jobs, update statuses (In Transit, Completed), and track lifetime earnings.
*   **Vendor Route Optimization:** Dedicated routing map that generates the most efficient path between all of their assigned pickup locations.

---

## 💻 Technology Stack

### Frontend (Client)
*   **Framework:** React 18 + Vite
*   **Styling:** Tailwind CSS (Premium *Eco-Air* custom design system, glassmorphism, clean light-mode aesthetics)
*   **Routing:** React Router DOM (Role-based route guarding)
*   **Mapping:** Leaflet & React-Leaflet (Complete migration from Google Maps for robust, quota-free geospatial plotting)
*   **Data Visualization:** Recharts
*   **Icons:** React Icons (Material Design)

### Backend (Server)
*   **Runtime:** Node.js + Express.js
*   **Database:** MongoDB via Mongoose ODM (Persistent storage, complex aggregations)
*   **Architecture:** RESTful API design (Decoupled Controllers, Routes, and Models)

### Machine Learning (ML Service)
*   **Framework:** Python 3.x + Flask
*   **Engine:** Google Earth Engine (GEE), OpenStreetMap (OSM / Overpass)
*   **Libraries:** NumPy, Pandas, Scikit-learn
*   **Capabilities:** Predictive heat-mapping, vectorized spatial matrices, synthetic data generation.

---

## 📂 Project Structure

```text
SMART_WASTE/
├── client/                     # React Frontend
│   ├── src/
│   │   ├── components/         # Reusable UI (Sidebar, Layout, Cards)
│   │   ├── contexts/           # AuthContext (Role switching logic)
│   │   ├── pages/              # Role-specific Pages (AdminCRM, Heatmap, RequestPickup, etc.)
│   │   ├── services/           # Axios API integrations
│   │   ├── App.jsx             # React Router setup
│   │   └── index.css           # Tailwind configuration & Eco-Air design tokens
├── server/                     # Node.js Backend
│   ├── config/                 # MongoDB connection logic
│   ├── controllers/            # Business logic (crmController, pickupController, etc.)
│   ├── models/                 # Mongoose Schemas (Customer, Vendor, PickupRequest)
│   ├── routes/                 # Express API routing
│   ├── utils/                  # Helper algorithms (Route Optimizer)
│   ├── seed.js                 # Database population script
│   └── server.js               # Entry point
└── ml_service/                 # Python Microservice
    ├── gee-key.json            # Google Earth Engine Service Account credentials
    ├── satellite_engine.py     # Sentinel-2 image extraction and Random Forest logic
    └── app.py                  # Flask server for React frontend communication
```

---

## 👥 Team Members
- Ritesh Jadhav
- Neha Gupta
- Mayank Kalode


## 🚀 Getting Started

### Prerequisites
*   Node.js (v20+)
*   MongoDB (Running locally on `mongodb://127.0.0.1:27017` or MongoDB Atlas)
*   Python 3.10+ (For the ML Service)
*   Google Earth Engine Access (Service Account JSON)
*   Docker & Docker Compose (Optional, for containerized deployment)

### 1. Installation
Clone the repository and install all dependencies (root, server, and client) with a single command:
```bash
git clone https://github.com/THERITESHJADHAV/SMART_WASTE.git
cd SMART_WASTE
npm run install:all
```

### 2. Environment Setup
Create `.env` files in `server/`, `client/`, and `ml_service/` directories.

**Server (.env):**
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/smartwaste
GEMINI_API_KEY=your_key_here
ML_SERVICE_URL=http://localhost:5001
```

**ML Service (.env):**
```env
GEE_SERVICE_ACCOUNT=your-service-account@developer.gserviceaccount.com
GEE_KEY_PATH=gee-key.json
GEE_PROJECT=your-gcp-project-name
```

### 3. Local Development
You can start all services (Backend, Frontend, and ML) concurrently from the root directory:
```bash
# Seed data (optional, first run only)
npm run seed

# Start everything (Frontend, Backend, and ML Service)
npm run dev
```
The application will be accessible at **http://localhost:5173**.

The application will be accessible at **http://localhost:5173**.

---

## 🐳 Deployment (Docker)

To deploy the entire stack using Docker Compose:

1. Ensure your `.env` variables are set.
2. Run the following command from the root:
```bash
docker-compose up --build
```
This will spin up:
- **Express Backend** (Port 5000)
- **React Frontend** (Served via Express in production mode)
- **Python ML Service** (Port 5001)
- **MongoDB** (Port 27017)

---


## 🎨 The "Eco-Air" Design System
This project features a meticulously crafted UI framework internally dubbed **Eco-Air**. Moving away from generic bootstrap designs, Eco-Air focuses on:
*   **Vibrant accents:** Emerald greens, deep indigos, and warm ambers to signify sustainability and success.
*   **Depth and Glassmorphism:** Soft shadows (`shadow-sm`, `premium-card` tokens) and faint background gradients.
*   **Typography:** Bold, uppercase tracking labels for micro-copy, paired with clean, heavy headers for immediate data comprehension.

---

<p align="center">
  <i>Built with ❤️ for a cleaner, smarter future.</i>
</p>
