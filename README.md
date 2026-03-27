# 🌱 SmartWaste — Web-Based Waste Collection & E-Waste Disposal System

SmartWaste is a modern, full-stack web application designed to optimize waste collection and e-waste disposal for smart cities, targeting the Mumbai region. It connects citizens with municipal waste management services, providing an interactive map, priority-based reporting, and an AI-simulated route optimization engine for garbage collection trucks.

Designed with a sleek, high-contrast **Neobrutalist UI**, the platform prioritizes clarity, usability, and dynamic data visualization.

---

## 🚀 Features

### 👤 For Citizens
- **Report Waste with Precision**: Click anywhere on the interactive Leaflet map to report waste locations. Tag priority levels (Low, Medium, High) and waste types (General, E-Waste).
- **Request Waste Pickup**: Schedule a direct waste collection pickup during preferred time slots (e.g., 10:00 AM - 12:00 PM).
- **Find Certified E-Waste Centers**: View nearby authorized e-waste recycling centers, sorted by distance, with direct contact numbers and operating hours.

### 🏢 For Municipal Authorities (Dashboard)
- **Live Data Dashboard**: View real-time aggregated metrics—Total Reports, Collection Rates, and Pending tasks.
- **Dynamic Charts (Recharts)**: Interactive Area, Bar, and Pie charts displaying weekly trends, status distributions, and waste-level breakdowns.
- **AI Route Optimization (Simulation)**: Compare fixed collection routes vs. mathematically optimized routes. The efficiency tab instantly calculates time saved, distance reduced, and fuel cost savings.

---

## 🛠️ Tech Stack

**Frontend:**
- **React.js** (Vite)
- **Tailwind CSS v4** (Custom Neobrutalist design system)
- **React-Leaflet** (Interactive maps & location pinning)
- **Recharts** (Dynamic data visualization)
- **React Icons** (Material Design icons)

**Backend:**
- **Node.js & Express.js** (REST API architecture)
- **MongoDB (In-Memory)** (via `mongodb-memory-server` for effortless local setup without Docker/local MongoDB installation)
- **Mongoose** (Data modeling)

---

## 📥 Local Setup & Installation

### Prerequisites
- Node.js (v18+ recommended)
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/THERITESHJADHAV/SMART_WASTE.git
cd SMART_WASTE
```

### 2. Run the Backend Server
The backend uses an in-memory MongoDB instance, which automatically seeds 15+ data points on startup. No `.env` or database configuration is required!
```bash
cd server
npm install
node server.js
```
*The server will start on `http://localhost:5000`.*

### 3. Run the Frontend Client
Open a new terminal window:
```bash
cd client
npm install
npm run dev
```
*The React app will be accessible at `http://localhost:5173`.*

---

## 🎨 Design Philosophy (Neobrutalism)
The UI incorporates a "Neobrutalist" aesthetic, characterized by:
- Sharp, bold black borders (`var(--border)`).
- Hard drop shadows on cards, buttons, and inputs instead of diffuse blurs.
- High-contrast color palette: Warning Red (`#ef4444`), Alert Yellow (`#facc15`), and Success Green (`#10b981`).
- Strong typography pairings using **Space Grotesk** (headings) and **Inter** (body text).

---

## 📂 Project Structure

```
SMART_WASTE/
├── client/                 # React Frontend (Vite)
│   ├── src/
│   │   ├── components/     # Layout, Sidebar, Navbar
│   │   ├── pages/          # Dashboard, Map, Reports, Efficiency
│   │   ├── services/       # Axios API integration
│   │   ├── App.jsx         # React Router setup
│   │   └── index.css       # Core design system & Tailwind
├── server/                 # Express Backend
│   ├── config/             # DB Connection (Memory Server)
│   ├── controllers/        # Waste, Pickup, Route Logic
│   ├── models/             # Mongoose Schemas
│   ├── routes/             # API Endpoints
│   ├── utils/              # Optimization Algorithms
│   └── seed.js             # Initial database seeding
```

---

## 📝 API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server status check |
| POST | `/api/report-waste` | Submit new waste location |
| GET | `/api/waste-data` | Retrieve reported waste list |
| GET | `/api/waste-stats` | Aggregated dashboard metrics |
| POST | `/api/request-pickup` | Schedule a home pickup |
| GET | `/api/ewaste-centers` | View certified recyclers |
| POST | `/api/optimize-route` | Run efficiency simulation |

---

## 🧑‍💻 Author
**Ritesh Jadhav**
- GitHub: [@THERITESHJADHAV](https://github.com/THERITESHJADHAV)
