"# Hopping - Modern Wishlist App

A full-stack Node.js + React application for managing wishlists. Built with Express, React, Vite, and vanilla JavaScript - simple, lightweight, and ready to deploy like PlantPartner.

## 📋 Features

- ✦ Create and manage multiple wishlist boards
- 🛍️ Save products from any shopping website
- 🎨 Modern, responsive UI
- 📱 Mobile-friendly design
- 🔍 Automatic product metadata extraction (title, image, price)
- 🚀 No build step required for backend
- 🎯 Simple CommonJS setup - easy to deploy

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd Hopping
   ```

2. Install dependencies:
   ```bash
   npm run install:all
   ```
   Or manually:
   ```bash
   npm install --prefix backend
   npm install --prefix frontend
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   cp frontend/.env.local.example frontend/.env.local
   ```

### Running Locally

**Terminal 1 - Start the backend API:**
```bash
npm run dev:backend
```

The API will be available at `http://localhost:3001`

**Terminal 2 - Start the frontend dev server:**
```bash
npm run dev:frontend
```

The app will be available at `http://localhost:5173`

## 📁 Project Structure

```
Hopping/
├── backend/
│   ├── server.js          # Express server (main entry)
│   ├── helpers.js         # Utility functions
│   ├── package.json       # Backend dependencies
│   └── README.md
│
├── frontend/
│   ├── src/
│   │   ├── main.tsx       # React entry point
│   │   ├── App.tsx        # Root component
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom hooks
│   │   ├── services/      # API calls
│   │   ├── types/         # TypeScript types
│   │   └── utils/         # Helper functions
│   ├── public/            # Static assets
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── README.md
│
├── package.json           # Root package.json
├── .env.example          # Environment template
└── README.md             # This file
```

## 🛠️ Available Scripts

### Root Level
```bash
npm run install:all     # Install all dependencies
npm run dev:backend     # Start backend dev server
npm run dev:frontend    # Start frontend dev server
npm run build:frontend  # Build frontend for production
npm start               # Start production backend
```

### Backend Only
```bash
cd backend
npm run dev             # Start with --watch flag
npm start               # Run production
```

### Frontend Only
```bash
cd frontend
npm run dev             # Start dev server with HMR
npm run build           # Build for production
npm run preview         # Preview production build
```

## 📚 Tech Stack

**Backend:**
- Node.js + Express.js
- Plain JavaScript (CommonJS)
- Puppeteer for web scraping
- CORS enabled

**Frontend:**
- React 18
- TypeScript
- Vite
- Axios

## 🔧 Configuration

### Backend (.env)
```env
BACKEND_PORT=3001
NODE_ENV=development
```

### Frontend (.env.local)
```env
VITE_API_URL=http://localhost:3001
```

## 📖 API Documentation

The backend provides RESTful APIs at `http://localhost:3001/api`:

- `GET /health` - Server health check
- `POST /fetch-meta` - Extract metadata from URL (title, image, price)
- `GET /items` - Get all items (placeholder for future DB)
- `POST /items` - Create new item
- `GET /boards` - Get all boards (placeholder for future DB)
- `POST /boards` - Create new board

## 🚀 Deployment (Like PlantPartner)

```bash
# Install dependencies
npm install --prefix backend

# Start with PM2
pm2 start backend/server.js --name hopping-api

# View logs
pm2 logs hopping-api

# Stop
pm2 stop hopping-api

# Restart
pm2 restart hopping-api
```

## 🤝 Contributing

Feel free to fork and submit pull requests for improvements!

## 📝 License

MIT" 
