# 🚚 Traders & Drivers Platform

MERN Stack logistics platform connecting traders with drivers across Oman.

## MongoDB Collections
- **Usertbl** — traders and drivers
- **Orderstbl** — delivery orders with server-side fare calculation

## Stack
- Frontend: React 19 + Vite + Redux Toolkit + Bootstrap + Reactstrap + react-hook-form + yup
- Backend: Node.js + Express + MongoDB (Mongoose)
- Container: Docker | Tests: Vitest + React Testing Library

## Quick Start
```
cd server && npm install && npm run seed   # seed DB
cd ../client && npm install
cd .. 
# In terminal 1:
cd server && npm run dev
# In terminal 2:
cd client && npm run dev
```

## Seed Credentials
- Trader: ahmed@trader.com / password123
- Driver: mo@driver.com / password123

## Run Tests
```
cd client && npm test
```

## Deployment
- Client → Vercel  |  Server → Render  |  DB → MongoDB Atlas
