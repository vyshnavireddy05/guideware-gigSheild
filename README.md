# GigShield Deployment

This repository contains three services:
- `frontend` — React + Vite app
- `backend` — Spring Boot API
- `ml-service` — Flask risk service

## Recommended deployment: Render

Render can host all three independently and provide live URLs.

### 1. Create a Render account
Go to https://render.com and sign up.

### 2. Connect your GitHub repo
- Add `vyshnavireddy05/guideware-gigSheild` to Render.
- Use the `main` branch.

### 3. Add services
Use the included `render.yaml` or create these services manually.

#### Frontend service
- Type: `Static Site`
- Name: `gigshield-frontend`
- Build Command: `cd frontend && npm install && npm run build`
- Publish Directory: `frontend/dist`

#### Backend service
- Type: `Web Service`
- Name: `gigshield-backend`
- Build Command: `cd backend && mvn -f pom.xml package -DskipTests`
- Start Command: `java -jar backend/target/gigshield-backend-1.0.0.jar`
- Environment variables:
  - `DATABASE_URL` = your MySQL database URL
  - `WEATHER_API_KEY` = openweathermap API key
  - `ML_SERVICE_URL` = backend URL for the ML service (set after ML deploy)
  - `CORS_ALLOWED_ORIGINS` = your frontend URL
  - `PORT` = `8080`

#### ML service
- Type: `Web Service`
- Name: `gigshield-ml-service`
- Build Command: `pip install -r ml-service/requirements.txt`
- Start Command: `gunicorn app:app --bind 0.0.0.0:$PORT`
- Environment variables:
  - `PORT`

### 4. Configure the ML service URL
After the ML service is deployed, copy its URL and set backend env:
- `ML_SERVICE_URL=https://<your-ml-service>.onrender.com`

### 5. Configure frontend API URL
Set your frontend environment variable with backend URL:
- `VITE_API_BASE_URL=https://<your-backend>.onrender.com`

### 6. Deploy and test
- Deploy the ML service first.
- Deploy the backend second.
- Deploy the frontend last.

## Alternative: Railway

Railway also works:
- Add the repo as a project.
- Create a MySQL plugin for the backend.
- Set the same environment variables.
- Use the backend URL in the frontend's `VITE_API_BASE_URL`.

## Important
- `render.yaml` is included for automatic Render setup.
- `backend/Dockerfile` and `ml-service/Dockerfile` are included for Docker-based deployment.
- The ML service now reads `PORT` from the environment for cloud deployment.
