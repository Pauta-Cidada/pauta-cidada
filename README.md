# Pauta Cidadã

O **Pauta Cidadã** é uma plataforma de código aberto que utiliza Inteligência Artificial para traduzir documentos legislativos complexos em notícias acessíveis, conectando leis abstratas ao cotidiano das pessoas. Mais do que informar, a ferramenta empodera a sociedade através de um sistema de engajamento que mede a aprovação popular e, ao atingir relevância, amplifica automaticamente a voz da comunidade nas redes sociais, transformando dados técnicos em debate público real.

**🌐 Projeto em produção:** [https://pautacidada.com.br](https://pautacidada.com.br)  
**🐦 Acompanhe no X:** [@PautaCidada](https://x.com/PautaCidada)

Este projeto foi desenvolvido durante o [Hackathon Devs de Impacto](https://devsdeimpacto.imasters.com.br/).

## 👥 Equipe

- [Giancarlo Verdum](https://github.com/gianverdum)
- [Rhenan Dias](https://github.com/rhenandias)
- [Raul Santos](https://github.com/Raul26-tech)

## 🤝 Como Contribuir

Este é um projeto de código aberto! Se você quer contribuir, visite nosso repositório:
[https://github.com/Pauta-Cidada](https://github.com/Pauta-Cidada)

## 📋 Pré-requisitos

### Para executar com Docker (recomendado):
- [Docker](https://docs.docker.com/get-docker/) e [Docker Compose](https://docs.docker.com/compose/install/)

### Para desenvolvimento local:
- **Frontend:**
  - [Node.js](https://nodejs.org/) (versão 24 ou superior)
  - [npm](https://www.npmjs.com/) (geralmente instalado junto com o Node.js)

- **Backend Python (FastAPI):**
  - [Python](https://www.python.org/) (versão 3.13 ou superior)
  - [uv](https://github.com/astral-sh/uv) (gerenciador de pacotes Python)

### Serviços externos necessários:
- Conta no [Supabase](https://supabase.com/) (PostgreSQL + Storage)
- Chave da API [OpenAI](https://platform.openai.com/) (GPT-4o-mini)
- Credenciais do [Google Cloud](https://cloud.google.com/) (BigQuery)

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

**Importante - Credenciais Google Cloud:**

Se você tem um arquivo `credentials.json` do Google Cloud, use o script helper para convertê-lo:

```bash
./scripts/convert-credentials.sh backend-python/credentials.json
```

O script gerará a variável `GOOGLE_APPLICATION_CREDENTIALS_JSON` formatada corretamente. Copie e cole no seu `.env`.

**Alternativa manual:**
```bash
# Converter credentials.json para uma linha
cat backend-python/credentials.json | jq -c '.'
# Cole o resultado na variável GOOGLE_APPLICATION_CREDENTIALS_JSON no .env
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

### 🐳 Deploy no Portainer

Para deploy em produção via Portainer, algumas configurações podem precisar de ajuste:

**1. Conexão com Supabase:**
Se tiver problemas de conectividade (erro "Network is unreachable"), use o **Connection Pooler** do Supabase:

```env
# Ao invés de db.your-project.supabase.co:5432
# Use o pooler na porta 6543:
DATABASE_URL=postgresql+asyncpg://postgres:senha@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

O endereço do pooler está em: **Supabase Dashboard → Settings → Database → Connection Pooler**

**2. IPv6:**
O `docker-compose.yml` está configurado sem IPv6 para melhor compatibilidade com Portainer. Se o seu servidor Portainer suporta IPv6 e você precisa dele, edite:

```yaml
networks:
  pauta-cidada-network:
    enable_ipv6: true  # Altere para true
```

**3. Variáveis de Ambiente:**
Use `GOOGLE_APPLICATION_CREDENTIALS_JSON` ao invés de montar arquivo `credentials.json`

## 📄 Licença

Este projeto é open source e está sob a licença especificada no arquivo [LICENSE](LICENSE).

---

**Desenvolvido com ❤️ pela equipe "Git Push Se Deus Quiser" durante o Hackathon Devs de Impacto**
