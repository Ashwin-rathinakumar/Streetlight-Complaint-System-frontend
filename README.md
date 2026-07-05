# 💡 Streetlight Fault Reporting System - Frontend

A React + Vite frontend for the Streetlight Fault Reporting System.

The application allows citizens to report faulty streetlights and administrators to monitor and manage complaints.

---

## 🚀 Features

- Responsive UI
- Register streetlight complaints
- View all complaints
- Update complaint status
- Delete complaints
- Connected to FastAPI backend
- Axios API integration

---

## 🛠️ Tech Stack

- React
- Vite
- Axios
- CSS

---

## 📂 Project Structure

```
streetlight_frontend/
│── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── App.jsx
│── public/
│── package.json
│── vite.config.js
│── README.md
```

---

## ⚙️ Installation

Clone repository

```bash
git clone https://github.com/<your-username>/streetlight_frontend.git
```

Go inside

```bash
cd streetlight_frontend
```

Install packages

```bash
npm install
```

---

## 🔧 Environment Variables

Create a `.env` file

```env
VITE_API_BASE_URL=https://your-render-backend.onrender.com
```

---

## ▶️ Run Development Server

```bash
npm run dev
```

Runs at

```
http://localhost:5173
```

---

## 🌐 Backend Connection

The frontend communicates with the FastAPI backend using Axios.

Example

```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
```

---

## 📷 Features

- Submit Complaint
- View Complaints
- Admin Dashboard
- Complaint Status Updates
- Delete Complaint

---

## 🚀 Deployment

Recommended platform: **Vercel**

Backend: Render

Database: Supabase PostgreSQL
