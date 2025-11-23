# Estágio de desenvolvimento
FROM node:24-alpine AS dev
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev"]

# Estágio 1: Build (para produção)
FROM node:24-alpine AS builder
WORKDIR /app

# Recebe a variável como build argument
ARG VITE_API_URL
# Converte para variável de ambiente para o Vite acessar
ENV VITE_API_URL=${VITE_API_URL}

COPY package*.json ./
RUN npm install
COPY . . 
RUN npm run build  

# Estágio 2: Servir (produção)
FROM node:24-alpine
WORKDIR /app
RUN npm install -g serve # Instala um servidor HTTP simples
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"] 