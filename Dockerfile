FROM node:18-alpine AS node-build
WORKDIR /app/frontend

COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install --silent

COPY frontend/ ./
RUN npm run build

FROM python:3.10-slim
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends build-essential && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r ./backend/requirements.txt

COPY backend ./backend
COPY --from=node-build /app/frontend/build ./backend/static
COPY --from=node-build /app/frontend/build/index.html ./backend/templates/index.html

WORKDIR /app/backend
EXPOSE 5000
CMD ["python", "app.py"]
