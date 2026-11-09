# Stage 1: Build React app
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# VITE_API_URL tidak dipakai langsung karena Nginx yang handle proxy,
# tapi bisa di-override lewat build arg kalau deploy ke CDN
ARG VITE_API_URL=""
RUN npm run build

# Stage 2: Serve dengan Nginx
FROM nginx:alpine

# Copy hasil build
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy konfigurasi Nginx custom
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
