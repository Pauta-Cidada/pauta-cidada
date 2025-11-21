# 🚀 Guia de Deploy - Pauta Cidadã no Portainer (Swarm Mode)

## 📋 Pré-requisitos

1. Docker instalado localmente
2. Acesso ao servidor com Portainer
3. Traefik já configurado no Portainer (✅ já está)
4. Rede `traefik_public` criada (✅ já está)

## 🔨 Passo 1: Build e Push da Imagem do Frontend

Como o Swarm não suporta `build` diretamente, você precisa fazer o build da imagem localmente e enviá-la para um registry (Docker Hub ou registry privado).

### Opção A: Usando Docker Hub (Recomendado)

```bash
# 1. Faça login no Docker Hub
docker login

# 2. Build da imagem do frontend
cd /home/asisto/Documentos/pauta-cidada/frontend
docker build -t SEU_USUARIO_DOCKERHUB/pautacidada-frontend:latest .

# 3. Push para o Docker Hub
docker push SEU_USUARIO_DOCKERHUB/pautacidada-frontend:latest
```

### Opção B: Usando Registry Privado

```bash
# 1. Build da imagem
cd /home/asisto/Documentos/pauta-cidada/frontend
docker build -t SEU_REGISTRY/pautacidada-frontend:latest .

# 2. Push para o registry privado
docker push SEU_REGISTRY/pautacidada-frontend:latest
```

## 📝 Passo 2: Atualizar o docker-compose.swarm.yml

Após fazer o build e push, edite o arquivo `docker-compose.swarm.yml` e substitua:

```yaml
image: pautacidada/frontend:latest
```

Por:

```yaml
image: SEU_USUARIO_DOCKERHUB/pautacidada-frontend:latest
```

## 🌐 Passo 3: Deploy no Portainer

1. Acesse o Portainer
2. Vá em **Stacks** → **Add Stack**
3. Dê um nome: `pauta-cidada`
4. Cole o conteúdo do arquivo `docker-compose.swarm.yml`
5. Se necessário, adicione variáveis de ambiente na seção **Environment variables**
6. Clique em **Deploy the stack**

## ✅ Verificação

Após o deploy:

1. O Traefik deve detectar automaticamente o serviço
2. Aguarde alguns segundos para o certificado SSL ser gerado
3. Acesse `https://pautacidada.com.br`
4. O site deve carregar com HTTPS ativo

## 🔍 Troubleshooting

### Verificar logs do serviço

No Portainer, vá em **Stacks** → **pauta-cidada** → clique no serviço → **Logs**

### Verificar se o Traefik detectou o serviço

Se você tiver o dashboard do Traefik habilitado, verifique se o router `pautacidada_frontend` aparece lá.

### Certificado SSL não gerado

- Aguarde até 2 minutos
- Verifique se o DNS está apontando corretamente para o servidor
- Verifique os logs do Traefik

## 📦 Próximos Passos (Backend e Database)

Quando quiser adicionar o backend e database, vamos:

1. Criar imagens para esses serviços
2. Criar uma rede overlay interna para comunicação entre serviços
3. Adicionar os serviços ao `docker-compose.swarm.yml`
4. Configurar volumes persistentes para o PostgreSQL

---

## 🎯 Diferenças Principais: Swarm vs Compose Standalone

| Recurso          | Compose Standalone | Swarm Mode                      |
| ---------------- | ------------------ | ------------------------------- |
| `build`          | ✅ Suportado       | ❌ Não suportado (usar imagens) |
| `container_name` | ✅ Suportado       | ❌ Deprecated                   |
| `restart`        | ✅ Suportado       | ❌ Usar `deploy.restart_policy` |
| Redes            | `bridge` driver    | `overlay` driver                |
| Escalabilidade   | Manual             | `deploy.replicas`               |
| Recursos         | Não limitado       | `deploy.resources`              |
