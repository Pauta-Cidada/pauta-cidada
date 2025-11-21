# Estágio 1: Build
FROM node:24-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . . 
RUN npm run build  

# Estágio 2: Servir
FROM node:24-alpine
WORKDIR /app
RUN npm install -g serve # Instala um servidor HTTP simples
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"] 