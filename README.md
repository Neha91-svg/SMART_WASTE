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

## ✨ Key Features by Role

### 👤 1. User (Resident)
*   **Report Waste:** Effortlessly report overflowing bins or street trash with photo uploads. Integrated ML categorizes the waste (General, Plastic, E-Waste).
*   **Request Pickup:** Schedule personal waste pickups with address geocoding via interactive **Leaflet maps**. 
*   **Impact Leaderboard:** Gamified sustainability tracking. Users earn points for recycling, fostering community competition.
*   **E-Waste Centers:** Interactive map displaying verified nearby e-waste recycling facilities.

### 👑 2. Admin (Municipal / Platform Manager)
*   **Live Job Tracker:** Real-time satellite-style map tracking the status of all active pickups and vendor fleet locations.
*   **Predictive Heatmaps:** AI-generated heatmaps visualizing waste density across the city, predicting overflow hotspots before they happen.
*   **Optimized Route Map:** Automated Transport Salesperson Problem (TSP) logic calculating the most fuel-efficient routes for collection trucks.
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
*   **Libraries:** NumPy, Pandas, Scikit-learn
*   **Capabilities:** predictive heat-mapping, synthetic data generation, and theoretical image classification parsing.

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
    ├── app.py                  # Flask server
    └── generate_data.py        # ML prediction logic
```

---

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18+)
*   MongoDB (Running locally on `mongodb://127.0.0.1:27017` or MongoDB Atlas)
*   Python 3.8+ (For the ML Service)

### 1. Clone the Repository
```bash
git clone https://github.com/THERITESHJADHAV/SMART_WASTE.git
cd SMART_WASTE
```

### 2. Setup the Node Backend
```bash
cd server
npm install
```
Create a `.env` file in the `server` directory:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/smartwaste
ML_SERVICE_URL=http://localhost:5001
```
Run the seed script to populate realistic test data (Customers, Vendors, Pickups):
```bash
npm run seed
```
Start the backend server:
```bash
npm start
```

### 3. Setup the Python ML Service
Open a new terminal configuration:
```bash
cd ml_service
pip install -r requirements.txt
python app.py
```
*(The Flask server will run on port 5001)*

### 4. Setup the React Frontend
Open a third terminal:
```bash
cd client
npm install
```
Start the Vite development server:
```bash
npm run dev
```

The application will be accessible at **http://localhost:5173**. Use the **Role Switcher** at the bottom left of the Sidebar to instantly toggle between User, Admin, Business, and Vendor views.

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
