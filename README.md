[# 💡 Lumina Streetlight Fault Reporting System — React Frontend

A stunning, responsive, and fully integrated React Single Page Application (SPA) built using Vite, Tailwind CSS, Axios, and React Router. This project represents the frontend interface of the municipal civic safety program, connecting directly to the running FastAPI backend.

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
Open your command prompt or terminal in the `streetlight_frontend` directory and run:
```bash
npm install
```

### 2. Launch Development Server
```bash
npm run dev
```
The terminal will print:
`  ➜  Local:   http://localhost:5173/`

Open `http://localhost:5173/` in your browser to experience the system!

---

## 🎨 UI/UX Features Built

1. **Aesthetic Twilight Palette**: Premium dark-mode styling utilizing glassmorphism blur layers (`glass-panel`), harmonious glowing active status bulbs (`glow-bulb`), and vibrant neon indicator borders.
2. **Dual-View Complaint Listings**: Users can toggle effortlessly between a clean grid card layout (optimized for mobile/scannability) and a dense administrative spreadsheet table (optimized for bulk analysis).
3. **Smart Seeder Hook**: If the database has no poles registered, a quick-seed button appears in the complaint submission form to instantly register mock assets in one click, making demonstrations completely fail-safe.
4. **Interactive Dashboard**: Admins can dispatch technicians by modifying dropdown states (`Submitted` -> `Assigned` -> `In Progress` -> `Resolved`), and delete reports.

---
> - When an administrator resolves all complaints against a specific pole (updating status to **"Resolved"**), the backend dynamically verifies if any unresolved complaints remain. If none exist, it automatically reverts the pole's status back to **"Functional"**, which is immediately reflected in the frontend tables upon reload!
](http://localhost:5174/)
