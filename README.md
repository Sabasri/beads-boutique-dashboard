# Beads & Bracelets Boutique - Business Management Dashboard

![Beads & Bracelets Boutique](https://img.shields.io/badge/Beads%20&%20Bracelets-Boutique-B76E79?style=for-the-badge)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Node.js](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)

## 📖 Project Overview

**Beads & Bracelets Boutique** is a premium, full-stack Business Management Dashboard designed specifically for a modern jewelry and accessories business. It provides a centralized hub for business owners and staff to manage products, track inventory, fulfill orders, analyze sales, and oversee customer relationships.

## 🎯 Problem Statement

Managing a growing jewelry business often involves juggling multiple disjointed systems—spreadsheets for inventory, paper trails for orders, and separate tools for customer management. This dashboard solves that problem by offering an integrated, elegant, and highly responsive portal that brings all crucial business operations into a single, unified view with real-time analytics and alerts.

## ✨ Features

- **📊 Comprehensive Analytics**: Deep-dive insights into revenue growth, customer retention, and product performance.
- **📦 Inventory Management**: Real-time stock tracking with low-stock alerts and turnover analysis (Fast vs. Slow-moving items).
- **🛍️ Product Catalog**: Complete CRUD operations for handmade bracelets, earrings, and custom jewelry.
- **🛒 Order Fulfillment**: Track order statuses from pending to delivered.
- **👥 Customer Profiles**: Manage customer data, purchase history, and loyalty metrics.
- **🔔 Real-time Notifications**: Alerts for low inventory, new orders, and revenue milestones.
- **🌓 Dark/Light Mode**: Premium, aesthetic interface with seamless theme switching.
- **🔐 Role-Based Access Control**: Secure JWT authentication for Admins and Staff.

## 🛠️ Tech Stack

### Frontend
- **React.js (Vite)**: Fast, modern UI development.
- **Tailwind CSS**: Utility-first styling for a custom, elegant design.
- **Recharts**: Responsive and interactive data visualization.
- **React Router**: Client-side routing.
- **Axios**: HTTP client for API requests.

### Backend
- **Node.js & Express.js**: Robust and scalable server architecture.
- **MongoDB**: NoSQL database for flexible data storage.
- **JWT (JSON Web Tokens)**: Secure user authentication.

## 🏗️ Project Architecture

```
Newproject/
├── backend/                  # Express.js REST API
│   ├── config/               # Database and environment configurations
│   ├── controllers/          # Business logic and request handlers
│   ├── data/                 # JSON fallback data (if MongoDB is disconnected)
│   ├── middleware/           # Auth and role verification
│   ├── models/               # Mongoose schemas
│   ├── routes/               # API endpoints
│   └── server.js             # Entry point
│
└── frontend/                 # React UI
    ├── public/               # Static assets and images
    ├── src/
    │   ├── components/       # Reusable UI components (Sidebar, Topbar, etc.)
    │   ├── context/          # React Context (Auth, Theme, Notifications)
    │   ├── layouts/          # Dashboard layouts
    │   ├── pages/            # Application views
    │   ├── services/         # API integration layer
    │   └── App.jsx           # Main application component
    └── tailwind.config.js    # Tailwind theme and custom animations
```

## 🚀 Installation & Environment Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher)
- [MongoDB](https://www.mongodb.com/) (Local instance or Atlas cluster)
- Git

### 1. Clone the repository
```bash
git clone https://github.com/Sabasri/beads-boutique-dashboard.git
cd beads-boutique-dashboard
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory based on the `.env.example`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/beads-bracelets-boutique
JWT_SECRET=your_super_secret_jwt_key
```
Start the backend server:
```bash
npm run dev
```

### 3. Frontend Setup
Open a new terminal window:
```bash
cd frontend
npm install
```
Start the frontend development server:
```bash
npm run dev
```

## 💻 Running the Application

Once both servers are running:
1. Open your browser and navigate to `http://localhost:5173`.
2. Register a new account or log in.
3. Explore the dashboard!

*(Note: If MongoDB is not running, the backend will automatically use the local JSON files in `backend/data/` as a fallback database.)*

## 📸 Screenshots
- **Dashboard Overview**:
  ![image alt][https://github.com/Sabasri/beads-boutique-dashboard/blob/02c524a5b174830e54368629cb7cd3475134f020/page1.png]
- https://github.com/Sabasri/beads-boutique-dashboard/blob/02c524a5b174830e54368629cb7cd3475134f020/page2.png
- https://github.com/Sabasri/beads-boutique-dashboard/blob/02c524a5b174830e54368629cb7cd3475134f020/page3.png
- **Advanced Analytics**:
- https://github.com/Sabasri/beads-boutique-dashboard/blob/a1e0a239da13d9b16c976a2121499df237c67bd1/page%204.png
- https://github.com/Sabasri/beads-boutique-dashboard/blob/a1e0a239da13d9b16c976a2121499df237c67bd1/page5.png
- https://github.com/Sabasri/beads-boutique-dashboard/blob/a1e0a239da13d9b16c976a2121499df237c67bd1/page6.png  
- https://github.com/Sabasri/beads-boutique-dashboard/blob/a1e0a239da13d9b16c976a2121499df237c67bd1/page7.png
- https://github.com/Sabasri/beads-boutique-dashboard/blob/a1e0a239da13d9b16c976a2121499df237c67bd1/page8.png
- https://github.com/Sabasri/beads-boutique-dashboard/blob/a1e0a239da13d9b16c976a2121499df237c67bd1/page9.png
- https://github.com/Sabasri/beads-boutique-dashboard/blob/a1e0a239da13d9b16c976a2121499df237c67bd1/page10.png
- https://github.com/Sabasri/beads-boutique-dashboard/blob/a1e0a239da13d9b16c976a2121499df237c67bd1/page11.png
- https://github.com/Sabasri/beads-boutique-dashboard/blob/a1e0a239da13d9b16c976a2121499df237c67bd1/page12.png
- https://github.com/Sabasri/beads-boutique-dashboard/blob/a1e0a239da13d9b16c976a2121499df237c67bd1/page13.png
- https://github.com/Sabasri/beads-boutique-dashboard/blob/a1e0a239da13d9b16c976a2121499df237c67bd1/page14.png
- https://github.com/Sabasri/beads-boutique-dashboard/blob/a1e0a239da13d9b16c976a2121499df237c67bd1/page15.png
- https://github.com/Sabasri/beads-boutique-dashboard/blob/a1e0a239da13d9b16c976a2121499df237c67bd1/page16.png


## 📖 Usage Guide

- **Dashboard**: Get a quick glance at today's KPIs and alerts.
- **Analytics**: Use the toggle buttons to switch between Top Sellers and Slow Movers.
- **Theme**: Click the Sun/Moon icon in the top right to toggle between Light and Dark mode.
- **Settings**: Update your profile and business metadata.

## 🔮 Future Enhancements

- Integration with Stripe for payment processing.
- Automated email notifications using SendGrid.
- Barcode/QR code scanner integration for inventory management.
- Exporting reports to PDF/Excel directly from the client.

## 🚧 Challenges Faced

- **Aesthetic UI**: Ensuring the design felt like a premium jewelry boutique rather than a generic admin template required custom Tailwind configurations and fluid animations.
- **Data Fallback**: Implementing a robust JSON fallback system for the backend to ensure the application remains functional even without an active MongoDB connection.

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md) for details on our process.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ✍️ Author

**Sabasri**
- GitHub: [@Sabasri](https://github.com/Sabasri)
