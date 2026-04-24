# E-commerce API

Backend de e-commerce construído com Python e FastAPI para portfólio. O projeto inclui autenticação JWT, gerenciamento de produtos, carrinho de compras, criação de pedidos, controle de estoque e integração com PostgreSQL.

## Destaques

- FastAPI com documentação automática em `/docs`
- Autenticação JWT com login e cadastro
- Controle de acesso com usuário administrador
- CRUD de produtos
- Carrinho por usuário com atualização de quantidades
- Checkout com baixa automática no estoque
- PostgreSQL com SQLAlchemy
- Docker Compose para subir a API e o banco
- Testes automatizados com pytest
- Pipeline de CI com GitHub Actions
- Blueprint de deploy no Render

## Estrutura

```text
app/
  api/
  core/
  models/
  schemas/
frontend/
tests/
```

## Tecnologias

- Python
- FastAPI
- SQLAlchemy
- PostgreSQL
- Pydantic Settings
- Passlib
- Python-JOSE
- Docker

## Como executar

1. Crie um ambiente virtual e instale as dependências:

```bash
pip install -r requirements.txt
```

2. Copie o arquivo de ambiente:

```bash
Copy-Item .env.example .env
```

3. Suba os serviços:

```bash
docker compose up --build
```

4. Acesse:

- API: `http://localhost:8000`
- Swagger: `http://localhost:8000/docs`
- Healthcheck: `http://localhost:8000/health`

## Frontend web

O projeto agora inclui uma interface em React dentro de `frontend/`, pronta para conectar na API.

### Rodando o frontend

1. Entre na pasta:

```bash
cd frontend
```

2. Copie o ambiente:

```bash
Copy-Item .env.example .env
```

3. Instale as dependências:

```bash
npm install
```

4. Rode o projeto:

```bash
npm run dev
```

5. Acesse:

- Frontend: `http://localhost:5173`

### O que essa interface demonstra

- cadastro e login
- catálogo de produtos
- carrinho com atualização de quantidade
- checkout
- visualização de pedidos
- área admin para cadastrar produtos

## Como testar

### Teste manual

Depois de subir o projeto com Docker, abra o Swagger em `http://localhost:8000/docs` e siga este fluxo:

1. Crie o primeiro usuário em `POST /api/v1/auth/register`
2. Faça login em `POST /api/v1/auth/login`
3. Clique em `Authorize` no Swagger e cole o token
4. Cadastre produtos como admin
5. Crie um segundo usuário
6. Adicione itens ao carrinho
7. Finalize em `POST /api/v1/orders/checkout`

### Teste automatizado

Se você tiver Python instalado localmente:

```bash
pip install -r requirements.txt
pytest
```

Os testes cobrem:

- healthcheck
- cadastro e login
- checkout com redução de estoque

## Deploy online

### Opção recomendada: Render

Esse repositório já inclui `render.yaml`, então você pode:

1. Subir o projeto no GitHub
2. Criar conta no [Render](https://render.com)
3. Escolher a opção de blueprint deploy
4. Selecionar o repositório
5. Deixar o Render criar a API e o PostgreSQL automaticamente

Depois disso, sua documentação vai ficar disponível em algo como:

- `https://seu-app.onrender.com/docs`
- `https://seu-app.onrender.com/health`

### Deploy do banco

O `render.yaml` já cria:

- um serviço web para a API
- um banco PostgreSQL gerenciado

### Deploy do frontend

Para o frontend, a opção mais simples é:

- `Vercel`
- `Netlify`

Defina a variável:

```env
VITE_API_BASE_URL=https://seu-backend.onrender.com
```

Se quiser usar GitHub Pages depois, também dá, mas Vercel e Netlify costumam ser mais simples para projetos React com Vite.

### Passo a passo recomendado

1. Publique este repositório no GitHub
2. Faça o deploy do backend no Render usando o `render.yaml`
3. Copie a URL pública do backend
4. No Vercel, importe a pasta `frontend/` como projeto
5. Configure a variável `VITE_API_BASE_URL` com a URL do backend do Render
6. Faça o deploy do frontend
7. Se quiser CORS mais restrito, troque `BACKEND_CORS_ORIGINS` no Render para algo como `["https://seu-frontend.vercel.app"]`

## CI no GitHub

O projeto inclui GitHub Actions em `.github/workflows/ci.yml`. Sempre que você fizer push ou abrir um pull request, os testes serão executados automaticamente.

## Fluxo de demonstração

1. Cadastre o primeiro usuário. Ele será criado como administrador para facilitar a apresentação do projeto.
2. Faça login e copie o token JWT no Swagger.
3. Crie alguns produtos.
4. Cadastre um segundo usuário comum.
5. Adicione itens ao carrinho.
6. Finalize o checkout e verifique a redução do estoque.

## Variáveis de ambiente

Veja o arquivo `.env.example` para a configuração completa. A variável principal é:

```env
DATABASE_URL=postgresql://postgres:postgres@db:5432/ecommerce_db
```

## Endpoints principais

### Auth

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`

### Produtos

- `GET /api/v1/products`
- `GET /api/v1/products/{product_id}`
- `POST /api/v1/products`
- `PUT /api/v1/products/{product_id}`
- `DELETE /api/v1/products/{product_id}`

### Carrinho

- `GET /api/v1/cart`
- `POST /api/v1/cart/items`
- `PUT /api/v1/cart/items/{product_id}`
- `DELETE /api/v1/cart/items/{product_id}`

### Pedidos

- `POST /api/v1/orders/checkout`
- `GET /api/v1/orders/mine`
- `GET /api/v1/orders/{order_id}`
- `GET /api/v1/orders`

## Ideias para evoluir

- Paginação e filtros avançados
- Upload de imagens de produtos
- Integração com gateway de pagamento
- Testes automatizados
- Alembic para migrations
- Deploy em Render, Railway ou AWS

## Valor para portfólio

Esse projeto mostra fundamentos muito valorizados em estágio e vagas júnior:

- modelagem de API REST
- autenticação e autorização
- regras de negócio reais
- integração com banco relacional
- organização de projeto backend
- uso de Docker e variáveis de ambiente
- testes automatizados e CI
- preparo para deploy em produção
