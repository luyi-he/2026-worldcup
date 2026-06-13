<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# 🏆 2026 World Cup Predictor

A pure frontend, zero-config web application that utilizes double Poisson regression models and simulated expert reviews to analyze, simulate, and predict match strategic outcomes for the 2026 World Cup.

> ⚡ **Zero Backend, Zero API Keys**: The entire prediction and strategic analysis engine runs entirely in the user's browser. No API keys, database, or backend server are required. Clone and deploy instantly!

---

## 🚀 Local Development (How to Open)

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)

### Step 1: Install Dependencies
Open your terminal in the project directory and run:
```bash
npm install
```

### Step 2: Start Development Server
Run the local Vite development server:
```bash
npm run dev
```
Open your browser and navigate to:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 📦 How to Build and Preview Locally

To compile and bundle the React code into optimized, static HTML/JS/CSS files:

1. **Build the project:**
   ```bash
   npm run build
   ```
   This compiles the typescript and bundles frontend assets using Vite into the `dist/` directory.

2. **Preview the production build locally:**
   ```bash
   npm run preview
   ```
   This serves the static `dist/` folder on **[http://localhost:3000](http://localhost:3000)** so you can test the production build locally.

---

## ☁️ Deployment Guide

Since this is a **pure static web application**, you can host it for free on any static hosting platform. No backend server or environment variables are required!

### Option 1: Deploy to Vercel (Recommended & Easiest)
1. Sign up/Log in to [Vercel](https://vercel.com/).
2. Click **Add New** -> **Project**.
3. Import your GitHub repository.
4. Vercel will automatically detect the **Vite** project.
5. Keep default settings:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Click **Deploy**. Your site will be live in seconds!

### Option 2: Deploy to Netlify
1. Log in to [Netlify](https://www.netlify.com/).
2. Click **Add new site** -> **Import an existing project** -> Choose **GitHub**.
3. Select your repository.
4. Configure settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. Click **Deploy site**.

### Option 3: Deploy to GitHub Pages
To publish the static site directly to your GitHub Pages:
1. Install `gh-pages` helper utility:
   ```bash
   npm install -D gh-pages
   ```
2. Add the following scripts to your `package.json`:
   ```json
   "predeploy": "npm run build",
   "deploy": "gh-pages -d dist"
   ```
3. Set the `base` configuration in `vite.config.ts` to your repository name:
   ```typescript
   base: '/2026-worldcup/'
   ```
4. Run:
   ```bash
   npm run deploy
   ```
