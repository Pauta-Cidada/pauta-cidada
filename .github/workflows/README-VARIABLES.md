# Configuração de Variáveis do Repositório

## VITE_API_URL

A variável `VITE_API_URL` é necessária para o build do frontend. Ela define a URL base da API que o frontend irá consumir.

### Como configurar no GitHub:

1. **Acesse as configurações do repositório**

   - Vá para o repositório no GitHub
   - Clique em **Settings** (Configurações)

2. **Navegue até Secrets and Variables**

   - No menu lateral esquerdo, clique em **Secrets and variables**
   - Selecione **Actions**

3. **Adicione a variável**
   - Clique na aba **Variables** (não Secrets)
   - Clique em **New repository variable**
   - Preencha:
     - **Name**: `VITE_API_URL`
     - **Value**: A URL da sua API (exemplo: `https://api.pauta-cidada.com` ou `https://pauta-cidada-backend.onrender.com`)
   - Clique em **Add variable**

### Exemplo de valores:

- **Produção**: `https://api.pauta-cidada.com`
- **Staging**: `https://staging-api.pauta-cidada.com`
- **Desenvolvimento local**: `http://localhost:8000`

### Como funciona:

1. Durante o workflow do GitHub Actions, a variável `VITE_API_URL` é lida de `vars.VITE_API_URL`
2. Ela é passada como **build argument** para o Docker
3. O Dockerfile recebe o argumento e o converte em variável de ambiente
4. Durante o `npm run build`, o Vite substitui `import.meta.env.VITE_API_URL` pelo valor literal
5. O código JavaScript final já terá a URL da API embutida

### ⚠️ Importante:

- Esta é uma **variável pública** (não um secret), pois o valor final ficará visível no código JavaScript do frontend
- Se você mudar a URL da API, precisará fazer um novo build do frontend
- Para ambientes diferentes (staging, produção), você pode criar variáveis específicas ou usar branches diferentes
