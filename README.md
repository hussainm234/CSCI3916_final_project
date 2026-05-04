# CSCI3916_final_project

Project Name: Budget Expense Tracker with Multi-Currency Support

Team Members: Hossein Mohammadi, Mehar Sidhu

## Overview

Personal finance web app where users log expenses by category, set monthly budgets, and visualize spending. Expenses can be logged in any currency and are converted to the user's home currency using ExchangeRate-API. The repo contains a separate `server` (Express + MongoDB) and `client` (React) app.

Live demo (hosted):

- Backend: https://csci3916-final-project.onrender.com
- Frontend: https://csci3916-final-project-ihtf.onrender.com

## Prerequisites

- Node.js (v16+ recommended) and `npm` or `yarn`
- A MongoDB instance (local or cloud) and its connection URI
- An ExchangeRate-API key

## Environment variables

Create a `.env` file for the server ( in `server/`). Key variables used by the project:

- `MONGODB_URI` or `MONGO_URI` — MongoDB connection string
- `JWT_SECRET` — secret used to sign JWT tokens
- `EXCHANGE_RATE_API_KEY` — API key for ExchangeRate-API
- `PORT` — optional, default 5000

For the client, you can set:

- `REACT_APP_API_URL` — base API URL (defaults to `http://localhost:5000/api`)

## Run locally (development)

1. Install server deps and run server

```bash
cd server
npm install
npm run dev
```

The server exposes the API under `/api` (default `http://localhost:5000/api`). A health check is available at `/`.

2. Install client deps and run client

```bash
cd ../client
npm install
npm start
```

The React app will run on `http://localhost:3000` by default and talk to the server API.

## Run for production / build

1. Build the client

```bash
cd client
npm run build
```
