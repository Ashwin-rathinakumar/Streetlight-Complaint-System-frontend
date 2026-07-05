# 💡 Lumina Streetlight Fault Reporting System — React Frontend

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

## 🎓 Viva / Exam Q&A Guide

To make your academic project presentation or lab viva completely stress-free, here are the exact answers to questions examiners frequently ask:

### Q1. Why did you use Vite instead of Create-React-App (CRA)?
> **Answer**: Vite is a modern frontend build tool that is significantly faster than CRA. CRA relies on Webpack, which bundles the entire application before starting the dev server. Vite uses native ES modules (ESM) in the browser, compiling only the files currently viewed on the fly. This results in instant server startups and lightning-fast Hot Module Replacement (HMR).

### Q2. Why did you choose Axios over the browser's native `fetch` API?
> **Answer**: While `fetch` is capable, Axios offers several developer-friendly features:
> 1. **Automatic JSON Parsing**: Axios automatically converts JSON responses into Javascript objects (`response.data`), whereas `fetch` requires a second `.json()` promise resolution step.
> 2. **Better Error Handling**: Axios automatically treats status codes outside the 2xx range (like 400, 404, or 500) as errors and enters the `catch` block, whereas `fetch` resolves successfully even on error codes (you have to check `response.ok` manually).
> 3. **Configurability**: Axios allows setting a base URL (`baseURL`) and request headers globally, which simplifies all subsequent API requests inside `src/services/api.js`.

### Q3. How does SPA routing work in React Router?
> **Answer**: The application is configured as a Single Page Application (SPA) using `react-router-dom`. When a user clicks a link (via the `<Link>` component), the browser does **not** reload or fetch a new HTML page from a server. Instead, React Router intercepts the URL change, updates the browser history stack, and dynamically renders the matching page component inside `<Routes>` on the client side instantly.

### Q4. How does the frontend handle image uploads?
> **Answer**: Since the database schema stores tabular textual properties, the frontend parses the uploaded file locally using the browser's standard `FileReader` API. It generates a base64 Data URL to render a local preview instantly (`imagePreview`), while logging metadata and sending the core validated payload (`streetlight_id`, `issue_category`, etc.) to the FastAPI database, keeping database operations fast and clean.

### Q5. How does the frontend stay synchronized with the backend statuses?
> **Answer**: We built an intelligent status syncer in the CRUD layers:
> - Submitting an outage report on the frontend automatically sets that specific streetlight pole's status to **"Faulty"** in the backend.
> - When an administrator resolves all complaints against a specific pole (updating status to **"Resolved"**), the backend dynamically verifies if any unresolved complaints remain. If none exist, it automatically reverts the pole's status back to **"Functional"**, which is immediately reflected in the frontend tables upon reload!
