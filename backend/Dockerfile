FROM node:20-alpine

WORKDIR /app

# Install dependencies dulu (cached layer)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy semua source
COPY . .

# Buat folder uploads agar volume mount bekerja dengan baik
RUN mkdir -p uploads

EXPOSE 5000

CMD ["node", "server.js"]
