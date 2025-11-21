# Pauta Cidadã

O **Pauta Cidadã** é uma plataforma de código aberto que utiliza Inteligência Artificial para traduzir documentos legislativos complexos em notícias acessíveis, conectando leis abstratas ao cotidiano das pessoas. Mais do que informar, a ferramenta empodera a sociedade através de um sistema de engajamento que mede a aprovação popular e, ao atingir relevância, amplifica automaticamente a voz da comunidade nas redes sociais, transformando dados técnicos em debate público real.

## 📋 Pré-requisitos

- [Docker](https://docs.docker.com/get-docker/) e [Docker Compose](https://docs.docker.com/compose/install/)
- [Node.js](https://nodejs.org/) (versão 24 ou superior)
- [npm](https://www.npmjs.com/) (geralmente instalado junto com o Node.js)

## 🚀 Como executar o projeto

### 1. Clone o repositório

```bash
git clone https://github.com/Pauta-Cidada/pauta-cidada
cd pauta-cidada
```

### 2. Configure as variáveis de ambiente

Copie o arquivo `.env.example` para `.env` e ajuste as variáveis conforme necessário:

```bash
cp .env.example .env
```

### 3. Garanta que está usando a versão correta do Node.js

Este projeto requer **Node.js versão 24**. Você pode verificar sua versão atual com:

```bash
node --version
```

Se você usa [nvm](https://github.com/nvm-sh/nvm), o projeto já possui um arquivo `.nvmrc` configurado. Basta executar:

```bash
nvm use
```

Isso automaticamente usará a versão 24 do Node.js. Se você não tiver essa versão instalada, o nvm pedirá para instalá-la:

```bash
nvm install 24
nvm use
```

### 4. Instale as dependências localmente

**É necessário instalar as dependências localmente antes de iniciar o Docker**, pois os `node_modules` locais são montados como volumes nos containers.

#### Backend (NestJS)

```bash
cd backend
npm install
cd ..
```

#### Frontend (React + Vite)

```bash
cd frontend
npm install
cd ..
```

### 5. Inicie os containers com Docker Compose

```bash
docker compose up --build
```

Ou para executar em segundo plano:

```bash
docker compose up -d --build
```

### 6. Acesse a aplicação

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000
- **Banco de dados PostgreSQL:** localhost:5432

## 🛠️ Comandos úteis

### Parar os containers

```bash
docker compose down
```

### Ver logs dos containers

```bash
# Todos os containers
docker compose logs -f

# Container específico
docker compose logs -f frontend
docker compose logs -f backend
docker compose logs -f database
```

### Reiniciar um container específico

```bash
docker compose restart frontend
docker compose restart backend
docker compose restart database
```

### Reconstruir os containers

```bash
docker compose up --build
```

### Remover containers, volumes e imagens

```bash
docker compose down -v --rmi all
```

## 📝 Notas importantes

- Os `node_modules` são compartilhados entre o host e os containers através de volumes Docker
- Se adicionar novas dependências, instale-as localmente primeiro e depois reinicie os containers

## 📄 Licença

Este projeto está sob a licença especificada no arquivo [LICENSE](LICENSE).
