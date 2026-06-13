<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# 🏆 2026 World Cup Predictor (Gemini AI Powered)

An advanced web application that utilizes double Poisson regression models combined with Gemini AI (powered by Google GenAI SDK) to analyze, simulate, and predict match strategic outcomes for the 2026 World Cup.

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)

### Step 1: Install Dependencies
Clone this repository to your local machine, open your terminal in the project directory, and run:
```bash
npm install
```

### Step 2: Configure Environment Variables
1. Copy the `.env.example` file to create a new `.env` file:
   ```bash
   cp .env.example .env
   ```
2. Open the `.env` file and set your Gemini API key:
   ```env
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   ```
   > 💡 **Note**: If you don't configure a `GEMINI_API_KEY`, the application will gracefully fall back to high-quality simulated tactical analysis reports.

### Step 3: Run the App
Start the development server with Vite middleware:
```bash
npm run dev
```
Open your browser and navigate to:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 📦 Production Build & Run Locally

Before deploying or running in production, build the static client files and compile the Express server:

1. **Build the project:**
   ```bash
   npm run build
   ```
   This will bundle frontend assets using Vite and backend code using `esbuild` into the `dist/` directory.

2. **Start the production server:**
   ```bash
   npm start
   ```
   The app will run in production mode on **[http://localhost:3000](http://localhost:3000)** (or the port defined by your environment).

---

## ☁️ Deployment Guide

Since this project has a Node.js/Express backend that handles API requests (calling Gemini API) and serves React static files, it must be deployed to a platform that supports Node.js hosting.

### Option 1: Deploy to Render (Recommended & Free Tier Available)
1. Sign up/Log in to [Render](https://render.com/).
2. Click **New** -> **Web Service**.
3. Connect your GitHub repository.
4. Configure the service settings:
   - **Name**: `worldcup-2026-predictor`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. Click **Advanced** and add the following **Environment Variables**:
   - `GEMINI_API_KEY`: *(Your Gemini API key)*
   - `NODE_ENV`: `production`
6. Click **Deploy Web Service**. Render will automatically build and serve your app.

### Option 2: Deploy to Railway
1. Sign up/Log in to [Railway](https://railway.app/).
2. Click **New Project** -> **Deploy from GitHub repo**.
3. Select your repository.
4. Railway will automatically detect the Node.js project.
5. Go to the project **Variables** tab and add:
   - `GEMINI_API_KEY`: *(Your Gemini API key)*
   - `NODE_ENV`: `production`
6. Under **Settings**, make sure the Start command is blank (it will automatically run `npm start` from `package.json`).
7. Railway will generate a public URL for your application.

### Option 3: Deploy to Zeabur / Heroku / Fly.io
The setup is identical for other Node.js PaaS platforms:
- Build command: `npm run build`
- Start command: `npm start`
- Environment variables: `GEMINI_API_KEY` (required for live Gemini analyses).
